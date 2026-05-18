import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const targetUserId = urlParams.get('id');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        if (!targetUserId) return window.location.replace("index.html");
        if (targetUserId === user.uid) return window.location.replace("profile.html");
        
        loadTargetProfile(targetUserId);
        loadTargetPosts(targetUserId);
    } else {
        window.location.replace("login.html");
    }
});

function loadTargetProfile(uid) {
    // We use onSnapshot so the Follow count updates immediately when you click the button
    onSnapshot(doc(db, "users", uid), (userDoc) => {
        if (userDoc.exists()) {
            const data = userDoc.data();
            const initials = data.fullname ? data.fullname.substring(0, 2).toUpperCase() : 'NA';
            
            const followers = data.followers || [];
            const isFollowing = followers.includes(auth.currentUser.uid);
            
            document.querySelector('.profile-avatar').innerText = initials;
            document.querySelector('.name-stats h2').innerText = `${data.fullname} (@${data.username})`;
            document.querySelector('.user-stats').innerHTML = `<i class="ph-bold ph-users-three"></i> ${followers.length} Backers`;
if (data.coverStyle) {
    const cover = document.querySelector('.cover-banner');
    cover.style.background = data.coverStyle;
    cover.style.backgroundSize = 'cover';
    cover.style.backgroundPosition = 'center';
}
            // Setup Follow Button Logic
            const followBtn = document.getElementById('follow-btn');
            if (followBtn) {
                followBtn.innerHTML = isFollowing ? `<i class="ri-user-unfollow-line"></i> Unfollow` : `<i class="ri-user-add-line"></i> Follow Nerd`;
                followBtn.className = isFollowing ? 'btn-action btn-outline' : 'btn-action btn-solid';
                
                // Remove old event listeners by replacing the node (cleanest way in vanilla JS)
                const newFollowBtn = followBtn.cloneNode(true);
                followBtn.parentNode.replaceChild(newFollowBtn, followBtn);
                
                newFollowBtn.addEventListener('click', async () => {
                    newFollowBtn.disabled = true;
                    const userRef = doc(db, "users", uid);
                    if (isFollowing) {
                        await updateDoc(userRef, { followers: arrayRemove(auth.currentUser.uid) });
                    } else {
                        await updateDoc(userRef, { followers: arrayUnion(auth.currentUser.uid) });
                    }
                });
            }
        } else {
            document.querySelector('.name-stats h2').innerText = "Dev Not Found";
        }
    });
}

function loadTargetPosts(uid) {
    const feedContainer = document.querySelector('.profile-feed');
    const q = query(collection(db, "posts"), where("authorId", "==", uid), orderBy("timestamp", "desc"));

    onSnapshot(q, (snapshot) => {
        feedContainer.innerHTML = ''; 
        if (snapshot.empty) {
            feedContainer.innerHTML = `<p style="text-align:center; color:var(--text-muted); margin-top:20px;">No architectures pitched yet.</p>`;
            return;
        }

        snapshot.forEach((docSnap) => {
            const post = docSnap.data();
            const postId = docSnap.id;
            const initials = post.authorName ? post.authorName.substring(0, 2).toUpperCase() : 'NA';
            
            const isLikedByMe = post.likedBy && post.likedBy.includes(auth.currentUser.uid);
            const likeClass = isLikedByMe ? "" : "unliked";
            const likeIcon = isLikedByMe ? "ph-fill ph-rocket" : "ph ph-rocket";
            const likesCount = post.likedBy ? post.likedBy.length : 0;
            
            const safeText = post.content.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, '<br>');

            const postElement = document.createElement('div');
            postElement.className = 'card post animate-fade-in';
            postElement.innerHTML = `
                <div class="post-header">
                    <div class="post-author">
                        <div class="avatar-text bg-purple">${initials}</div>
                        <div class="author-info"><strong>${post.authorName}</strong></div>
                    </div>
                </div>
                <div class="post-content"><p>${safeText}</p></div>
                <div class="post-footer">
                    <div class="likes ${likeClass}" data-id="${postId}" data-liked="${isLikedByMe}">
                        <i class="${likeIcon}"></i> Upvote <span>${likesCount}</span>
                    </div>
                </div>
            `;
            feedContainer.appendChild(postElement);
        });

        // Upvote functionality when viewing other users
        document.querySelectorAll('.likes').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const postId = e.currentTarget.getAttribute('data-id');
                const isLiked = e.currentTarget.getAttribute('data-liked') === 'true';
                const postRef = doc(db, "posts", postId);
                if (isLiked) await updateDoc(postRef, { likedBy: arrayRemove(auth.currentUser.uid) });
                else await updateDoc(postRef, { likedBy: arrayUnion(auth.currentUser.uid) });
            });
        });
    });
}