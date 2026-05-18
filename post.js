// post.js
import { auth, db } from './firebase.js';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Extract Post ID from URL: post.html?id=XYZ
const urlParams = new URLSearchParams(window.location.search);
const targetPostId = urlParams.get('id');

document.addEventListener('userDataLoaded', () => {
    if (!targetPostId) {
        document.getElementById('single-post-container').innerHTML = "<p style='text-align:center;'>Invalid post link.</p>";
        return;
    }
    loadSinglePost(targetPostId);
});

// Formatting Engine (Copied from app.js)
function formatContent(text) {
    let safe = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    safe = safe.replace(/```([\s\S]*?)```/g, '<div class="code-block"><pre><code>$1</code></pre></div>');
    safe = safe.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    safe = safe.replace(urlRegex, '<a href="$1" target="_blank" class="rich-link">$1</a>');
    return safe.replace(/\n/g, '<br>');
}

async function loadSinglePost(postId) {
    const container = document.getElementById('single-post-container');
    const postRef = doc(db, "posts", postId);

    try {
        const docSnap = await getDoc(postRef);
        if (!docSnap.exists()) {
            container.innerHTML = "<p style='text-align:center; color:var(--text-muted);'>This pitch was deleted or does not exist.</p>";
            return;
        }

        const post = docSnap.data();
        const isLiked = post.likedBy && post.likedBy.includes(auth.currentUser.uid);
        const isMyPost = post.authorId === auth.currentUser.uid;
        const commentsList = post.comments || [];
        let commentsHTML = commentsList.map(c => `<div class="comment-item"><strong>${c.author}:</strong> ${c.text}</div>`).join('');

        const dropdownHTML = `
            <div class="post-options-container">
                <button class="btn-more toggle-menu-btn" data-id="${postId}"><i class="ri-more-fill"></i></button>
                <div class="post-dropdown-menu" id="menu-${postId}">
                    <a onclick="sharePost('${postId}')"><i class="ri-share-forward-line"></i> Share Idea</a>
                    ${isMyPost 
                        ? `<a class="delete-post-btn text-danger" data-id="${postId}"><i class="ri-delete-bin-line"></i> Delete Pitch</a>`
                        : `<a class="report-post-btn" onclick="alert('Post reported to moderators.')"><i class="ri-flag-line"></i> Report Post</a>`
                    }
                </div>
            </div>
        `;

        const el = document.createElement('div');
        el.className = 'card post animate-fade-in';
        el.innerHTML = `
            <div class="post-header">
                <div class="post-author" style="cursor:pointer;" onclick="goToProfile('${post.authorId}')">
                    <div class="avatar-text post-avatar-target"></div>
                    <div class="author-info"><strong>${post.authorName}</strong> <span class="badge badge-idea">💡 Dev</span></div>
                </div>
                ${dropdownHTML}
            </div>
            <div class="post-content" style="font-size: 1.1rem; line-height: 1.7;"><p>${formatContent(post.content)}</p></div>
            <div class="post-footer">
                <div class="likes ${isLiked ? '' : 'unliked'}" data-id="${postId}" data-liked="${isLiked}">
                    <i class="${isLiked ? 'ph-fill' : 'ph'} ph-rocket"></i> Upvote <span>${post.likedBy ? post.likedBy.length : 0}</span>
                </div>
                <div class="comments-shares toggle-comments-btn" data-id="${postId}">
                    <span><i class="ri-chat-3-line"></i> Discuss <span>${commentsList.length}</span></span>
                </div>
            </div>
            
            <div class="comments-section active" id="comments-${postId}">
                <div class="comments-list">${commentsHTML}</div>
                <div class="comment-input-wrapper">
                    <input type="text" id="comment-input-${postId}" placeholder="Suggest an idea...">
                    <button class="submit-comment-btn" data-id="${postId}">Send</button>
                </div>
            </div>
        `;

        const targetAvatar = el.querySelector('.post-avatar-target');
        if (post.authorAvatarClass && post.authorAvatarClass.includes('url(')) {
            targetAvatar.style.background = post.authorAvatarClass;
            targetAvatar.style.backgroundSize = 'cover';
        } else {
            targetAvatar.className = `avatar-text ${post.authorAvatarClass || 'bg-blue'}`;
            targetAvatar.innerText = post.authorName.substring(0, 2).toUpperCase();
        }

        container.innerHTML = '';
        container.appendChild(el);
        attachListeners();

    } catch (error) {
        console.error("Error fetching post:", error);
        container.innerHTML = "<p>Error loading pitch.</p>";
    }
}

function attachListeners() {
    // 3-Dots Menu
    document.querySelectorAll('.toggle-menu-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = e.currentTarget.getAttribute('data-id');
            document.getElementById(`menu-${id}`).classList.toggle('show');
        });
    });
    document.addEventListener('click', () => {
        document.querySelectorAll('.post-dropdown-menu').forEach(m => m.classList.remove('show'));
    });

    // Likes
    document.querySelectorAll('.likes').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const isLiked = e.currentTarget.getAttribute('data-liked') === 'true';
            if (isLiked) await updateDoc(doc(db, "posts", id), { likedBy: arrayRemove(auth.currentUser.uid) });
            else await updateDoc(doc(db, "posts", id), { likedBy: arrayUnion(auth.currentUser.uid) });
            loadSinglePost(id); // Reload to update numbers
        });
    });

    // Comments
    document.querySelectorAll('.submit-comment-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const input = document.getElementById(`comment-input-${id}`);
            if(!input.value.trim()) return;
            await updateDoc(doc(db, "posts", id), {
                comments: arrayUnion({ author: window.currentUserData.fullname, text: input.value.trim(), uid: auth.currentUser.uid })
            });
            input.value = '';
            loadSinglePost(id); // Reload to show comment
        });
    });

    // Delete
    document.querySelectorAll('.delete-post-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if(confirm("Delete this pitch?")) {
                await deleteDoc(doc(db, "posts", e.currentTarget.getAttribute('data-id')));
                window.location.href = "index.html"; // Send them home after deletion
            }
        });
    });
}

window.goToProfile = function(userId) {
    if (auth.currentUser && auth.currentUser.uid === userId) window.location.href = 'profile.html';
    else window.location.href = `user.html?id=${userId}`;
}