// app.js
import { auth, db } from './firebase.js';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

document.addEventListener('userDataLoaded', () => {
    updateCreatePostUI(window.currentUserData);
    loadFeed();
});

function updateCreatePostUI(user) {
    const createBoxAvatar = document.querySelector('.create-post .avatar-text');
    if (createBoxAvatar) {
        const initials = user.fullname ? user.fullname.substring(0, 2).toUpperCase() : 'NA';
        const avatarVal = user.avatarClass || 'bg-primary';

        if (avatarVal.includes('url(')) {
            createBoxAvatar.className = 'avatar-text';
            createBoxAvatar.style.background = avatarVal;
            createBoxAvatar.style.backgroundSize = 'cover';
            createBoxAvatar.style.backgroundPosition = 'center';
            createBoxAvatar.innerText = '';
        } else {
            createBoxAvatar.className = `avatar-text ${avatarVal}`;
            createBoxAvatar.style.background = '';
            createBoxAvatar.innerText = initials;
        }
    }
}

function formatContent(text) {
    let safe = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    safe = safe.replace(/```([\s\S]*?)```/g, '<div class="code-block"><pre><code>$1</code></pre></div>');
    safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    safe = safe.replace(/(^|[^\"])(https?:\/\/[^\s]+)/g, '$1<a href="$2" target="_blank" style="color:var(--primary-color);">$2</a>');
    return safe.replace(/\n/g, '<br>');
}

const btnPost = document.querySelector('.btn-post');
const postTextarea = document.querySelector('.create-post textarea');

if (btnPost && postTextarea) {
    btnPost.addEventListener('click', async () => {
        const content = postTextarea.value.trim();
        if (!content || !window.currentUserData) return;
        btnPost.disabled = true; btnPost.innerText = "Pitching...";
        try {
            await addDoc(collection(db, "posts"), {
                authorId: window.currentUserData.uid,
                authorName: window.currentUserData.fullname,
                authorUsername: window.currentUserData.username,
                authorAvatarClass: window.currentUserData.avatarClass || 'bg-primary',
                content: content, likedBy: [], commentsCount: 0,
                timestamp: new Date().toISOString()
            });
            postTextarea.value = ''; 
        } catch (e) { console.error(e); } 
        finally { btnPost.disabled = false; btnPost.innerText = "Pitch Idea"; }
    });
}

function loadFeed() {
    const feedContainer = document.querySelector('.main-feed');
    const createPostBox = document.querySelector('.create-post');
    
    onSnapshot(query(collection(db, "posts"), orderBy("timestamp", "desc")), (snapshot) => {
        feedContainer.innerHTML = '';
        if (createPostBox) feedContainer.appendChild(createPostBox);
        
        snapshot.forEach((docSnap) => {
            const post = docSnap.data();
            const isLiked = post.likedBy && post.likedBy.includes(auth.currentUser.uid);
            const isMyPost = post.authorId === auth.currentUser.uid;
            const initials = post.authorName ? post.authorName.substring(0, 2).toUpperCase() : 'NA';
            
            const el = document.createElement('div');
            el.className = 'card post animate-fade-in';
            el.innerHTML = `
                <div class="post-header">
                    <div class="post-author" style="cursor:pointer;" onclick="goToProfile('${post.authorId}')">
                        <div class="avatar-text post-avatar-target"></div>
                        <div class="author-info"><strong>${post.authorName}</strong> <span class="badge badge-idea">💡 Dev</span></div>
                    </div>
                    ${isMyPost ? `<button class="btn-more delete-post-btn" data-id="${docSnap.id}"><i class="ri-delete-bin-line" style="color:#ef4444;"></i></button>` : ''}
                </div>
                <div class="post-content"><p>${formatContent(post.content)}</p></div>
                <div class="post-footer">
                    <div class="likes ${isLiked ? '' : 'unliked'}" data-id="${docSnap.id}" data-liked="${isLiked}">
                        <i class="${isLiked ? 'ph-fill' : 'ph'} ph-rocket"></i> Upvote <span>${post.likedBy ? post.likedBy.length : 0}</span>
                    </div>
                </div>
            `;
            
            // Dynamic check before inserting to prevent structural desync crashes
            const targetAvatar = el.querySelector('.post-avatar-target');
            const avatarVal = post.authorAvatarClass || 'bg-blue';
            if (avatarVal.includes('url(')) {
                targetAvatar.style.background = avatarVal;
                targetAvatar.style.backgroundSize = 'cover';
                targetAvatar.style.backgroundPosition = 'center';
            } else {
                targetAvatar.className = `avatar-text ${avatarVal}`;
                targetAvatar.innerText = initials;
            }
            
            feedContainer.appendChild(el);
        });
        attachListeners();
    });
}

function attachListeners() {
    document.querySelectorAll('.likes').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const isLiked = e.currentTarget.getAttribute('data-liked') === 'true';
            if (isLiked) await updateDoc(doc(db, "posts", id), { likedBy: arrayRemove(auth.currentUser.uid) });
            else await updateDoc(doc(db, "posts", id), { likedBy: arrayUnion(auth.currentUser.uid) });
        });
    });
    document.querySelectorAll('.delete-post-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if(confirm("Delete pitch?")) await deleteDoc(doc(db, "posts", e.currentTarget.getAttribute('data-id')));
        });
    });
}

window.goToProfile = function(userId) {
    if (auth.currentUser && auth.currentUser.uid === userId) window.location.href = 'profile.html';
    else window.location.href = `user.html?id=${userId}`;
}