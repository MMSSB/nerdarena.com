import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, updateDoc, deleteDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
    if (user) {
        loadMyProfile(user.uid);
        loadMyPosts(user.uid);
        
        // Attach Logout Logic
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                await signOut(auth);
                window.location.replace("login.html");
            });
        }
    } else {
        window.location.replace("login.html");
    }
});

async function loadMyProfile(uid) {
    
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
        const data = userDoc.data();
        const initials = data.fullname ? data.fullname.substring(0, 2).toUpperCase() : 'NA';
        const followerCount = data.followers ? data.followers.length : 0;
        
        document.querySelector('.profile-avatar').innerText = initials;
        document.querySelector('.name-stats h2').innerText = data.fullname;
        document.querySelector('.user-stats').innerHTML = `<i class="ph-bold ph-users-three"></i> ${followerCount} Backers`;
    if (data.coverStyle) {
    const cover = document.querySelector('.cover-banner');
    cover.style.background = data.coverStyle;
    cover.style.backgroundSize = 'cover';
    cover.style.backgroundPosition = 'center';
}
    }
    
}

function loadMyPosts(uid) {
    const feedContainer = document.querySelector('.profile-feed');
    const createPostBox = document.querySelector('.create-post');
    const q = query(collection(db, "posts"), where("authorId", "==", uid), orderBy("timestamp", "desc"));

    // Real-time listener for your own profile
    onSnapshot(q, (snapshot) => {
        feedContainer.innerHTML = '';
        if (createPostBox) feedContainer.appendChild(createPostBox);

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
                        <div class="avatar-text bg-primary">${initials}</div>
                        <div class="author-info">
                            <strong>${post.authorName}</strong> 
                            <span class="badge badge-idea">💡 My Pitch</span>
                        </div>
                    </div>
                    <button class="btn-more delete-post-btn" data-id="${postId}"><i class="ri-delete-bin-line" style="color:red;"></i></button>
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

        // Re-attach listeners inside profile view
        document.querySelectorAll('.likes').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const postId = e.currentTarget.getAttribute('data-id');
                const isLiked = e.currentTarget.getAttribute('data-liked') === 'true';
                const postRef = doc(db, "posts", postId);
                if (isLiked) await updateDoc(postRef, { likedBy: arrayRemove(auth.currentUser.uid) });
                else await updateDoc(postRef, { likedBy: arrayUnion(auth.currentUser.uid) });
            });
        });

        document.querySelectorAll('.delete-post-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if(confirm("Delete this pitch?")) {
                    await deleteDoc(doc(db, "posts", e.currentTarget.getAttribute('data-id')));
                }
            });
        });
    });
}