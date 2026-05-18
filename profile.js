import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, updateDoc, deleteDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
    if (user) {
        loadMyProfile(user.uid);
        loadMyPosts(user.uid);
        loadMyNetwork(user.uid); // Load followers!
        
        document.getElementById('logout-btn')?.addEventListener('click', async () => {
            await signOut(auth);
            window.location.replace("login.html");
        });
    } else {
        window.location.replace("login.html");
    }
});

// --- PROFILE TABS LOGIC ---
document.querySelectorAll('.tab-item').forEach((tab, index) => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        
        // Map tabs to content divs
        if(index === 0) document.getElementById('tab-pitches').classList.add('active');
        if(index === 1) document.getElementById('tab-architecture').classList.add('active');
        if(index === 4) document.getElementById('tab-network').classList.add('active');
    });
});

async function loadMyProfile(uid) {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
        const data = userDoc.data();
        const profileAvatar = document.querySelector('.profile-avatar');
        
        if (data.avatarClass && data.avatarClass.includes('url(')) {
            profileAvatar.style.background = data.avatarClass;
            profileAvatar.style.backgroundSize = 'cover';
            profileAvatar.innerText = '';
        } else {
            profileAvatar.className = `profile-avatar ${data.avatarClass || 'bg-primary'}`;
            profileAvatar.innerText = data.fullname.substring(0, 2).toUpperCase();
        }

        document.querySelector('.name-stats h2').innerText = data.fullname;
        document.querySelector('.user-stats').innerHTML = `<i class="ph-bold ph-users-three"></i> ${data.followers ? data.followers.length : 0} Backers`;
        
        if (data.coverStyle) {
            document.querySelector('.cover-banner').style.background = data.coverStyle;
            document.querySelector('.cover-banner').style.backgroundSize = 'cover';
        }
    }
}

// --- LOAD NETWORK (FOLLOWERS) ---
function loadMyNetwork(uid) {
    const networkContainer = document.getElementById('network-container');
    // Find users where YOU are in their following list, or for this app, just list all users for now as a demo
    const q = query(collection(db, "users")); 
    
    onSnapshot(q, (snapshot) => {
        networkContainer.innerHTML = '';
        let hasFollowers = false;

        snapshot.forEach((docSnap) => {
            const user = docSnap.data();
            // Check if their followers array includes MY uid
            if (user.uid !== uid && user.followers && user.followers.includes(uid)) {
                hasFollowers = true;
                const card = document.createElement('div');
                card.className = 'network-card';
                card.onclick = () => window.location.href = `user.html?id=${user.uid}`;
                
                let avatarHTML = user.avatarClass?.includes('url(') 
                    ? `<div class="avatar-text" style="background:${user.avatarClass}; background-size:cover;"></div>`
                    : `<div class="avatar-text ${user.avatarClass || 'bg-blue'}">${user.fullname.substring(0,2).toUpperCase()}</div>`;

                card.innerHTML = `
                    ${avatarHTML}
                    <div>
                        <strong style="display:block; font-size:0.95rem; color:var(--text-main);">${user.fullname}</strong>
                        <span style="font-size:0.8rem; color:var(--text-muted);">@${user.username}</span>
                    </div>
                `;
                networkContainer.appendChild(card);
            }
        });

        if (!hasFollowers) networkContainer.innerHTML = '<p style="color:var(--text-muted); grid-column:1/-1;">No backers yet. Keep pitching ideas!</p>';
    });
}

function loadMyPosts(uid) {
    const feedContainer = document.getElementById('my-posts-container');
    const q = query(collection(db, "posts"), where("authorId", "==", uid), orderBy("timestamp", "desc"));

    onSnapshot(q, (snapshot) => {
        feedContainer.innerHTML = '';

        snapshot.forEach((docSnap) => {
            const post = docSnap.data();
            const postId = docSnap.id;
            const isLikedByMe = post.likedBy && post.likedBy.includes(uid);
            const commentsList = post.comments || [];
            
            const postElement = document.createElement('div');
            postElement.className = 'card post animate-fade-in';
            
            // Build comments HTML
            let commentsHTML = commentsList.map(c => `<div class="comment-item"><strong>${c.author}:</strong> ${c.text}</div>`).join('');

            postElement.innerHTML = `
                <div class="post-header">
                    <div class="post-author">
                        <div class="avatar-text ${window.currentUserData.avatarClass || 'bg-primary'}">${window.currentUserData.fullname.substring(0,2).toUpperCase()}</div>
                        <div class="author-info"><strong>${post.authorName}</strong> <span class="badge badge-idea">💡 My Pitch</span></div>
                    </div>
                    <button class="btn-more delete-post-btn" data-id="${postId}"><i class="ri-delete-bin-line" style="color:red;"></i></button>
                </div>
                <div class="post-content"><p>${post.content}</p></div>
                <div class="post-footer">
                    <div class="likes ${isLikedByMe ? '' : 'unliked'}" data-id="${postId}" data-liked="${isLikedByMe}">
                        <i class="${isLikedByMe ? 'ph-fill' : 'ph'} ph-rocket"></i> Upvote <span>${post.likedBy ? post.likedBy.length : 0}</span>
                    </div>
                    <div class="comments-shares toggle-comments-btn" data-id="${postId}">
                        <span><i class="ri-chat-3-line"></i> Discuss <span>${commentsList.length}</span></span>
                    </div>
                </div>
                
                <div class="comments-section" id="comments-${postId}">
                    <div class="comments-list">${commentsHTML}</div>
                    <div class="comment-input-wrapper">
                        <input type="text" id="comment-input-${postId}" placeholder="Suggest an idea...">
                        <button class="submit-comment-btn" data-id="${postId}">Send</button>
                    </div>
                </div>
            `;
            
            feedContainer.appendChild(postElement);
        });

        attachPostListeners();
    });
}

function attachPostListeners() {
    // Likes
    document.querySelectorAll('.likes').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const isLiked = e.currentTarget.getAttribute('data-liked') === 'true';
            if (isLiked) await updateDoc(doc(db, "posts", id), { likedBy: arrayRemove(auth.currentUser.uid) });
            else await updateDoc(doc(db, "posts", id), { likedBy: arrayUnion(auth.currentUser.uid) });
        });
    });

    // Delete
    document.querySelectorAll('.delete-post-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if(confirm("Delete this pitch?")) await deleteDoc(doc(db, "posts", e.currentTarget.getAttribute('data-id')));
        });
    });

    // Toggle Comments
    document.querySelectorAll('.toggle-comments-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            document.getElementById(`comments-${id}`).classList.toggle('active');
        });
    });

    // Submit Comment
    document.querySelectorAll('.submit-comment-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const input = document.getElementById(`comment-input-${id}`);
            if(!input.value.trim()) return;
            
            await updateDoc(doc(db, "posts", id), {
                comments: arrayUnion({
                    author: window.currentUserData.fullname,
                    text: input.value.trim(),
                    uid: auth.currentUser.uid
                })
            });
            input.value = '';
        });
    });
}