// // post.js
// import { auth, db } from './firebase.js';
// import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// // Extract Post ID from URL: post.html?id=XYZ
// const urlParams = new URLSearchParams(window.location.search);
// const targetPostId = urlParams.get('id');

// document.addEventListener('userDataLoaded', () => {
//     if (!targetPostId) {
//         document.getElementById('single-post-container').innerHTML = "<p style='text-align:center;'>Invalid post link.</p>";
//         return;
//     }
//     loadSinglePost(targetPostId);
// });

// // Formatting Engine (Copied from app.js)
// function formatContent(text) {
//     let safe = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
//     safe = safe.replace(/```([\s\S]*?)```/g, '<div class="code-block"><pre><code>$1</code></pre></div>');
//     safe = safe.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
//     safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
//     const urlRegex = /(https?:\/\/[^\s]+)/g;
//     safe = safe.replace(urlRegex, '<a href="$1" target="_blank" class="rich-link">$1</a>');
//     return safe.replace(/\n/g, '<br>');
// }

// async function loadSinglePost(postId) {
//     const container = document.getElementById('single-post-container');
//     const postRef = doc(db, "posts", postId);

//     try {
//         const docSnap = await getDoc(postRef);
//         if (!docSnap.exists()) {
//             container.innerHTML = "<p style='text-align:center; color:var(--text-muted);'>This pitch was deleted or does not exist.</p>";
//             return;
//         }

//         const post = docSnap.data();
//         const isLiked = post.likedBy && post.likedBy.includes(auth.currentUser.uid);
//         const isMyPost = post.authorId === auth.currentUser.uid;
//         const commentsList = post.comments || [];
//         let commentsHTML = commentsList.map(c => `<div class="comment-item"><strong>${c.author}:</strong> ${c.text}</div>`).join('');

//         const dropdownHTML = `
//             <div class="post-options-container">
//                 <button class="btn-more toggle-menu-btn" data-id="${postId}"><i class="ri-more-fill"></i></button>
//                 <div class="post-dropdown-menu" id="menu-${postId}">
//                     <a onclick="sharePost('${postId}')"><i class="ri-share-forward-line"></i> Share Idea</a>
//                     ${isMyPost 
//                         ? `<a class="delete-post-btn text-danger" data-id="${postId}"><i class="ri-delete-bin-line"></i> Delete Pitch</a>`
//                         : `<a class="report-post-btn" onclick="alert('Post reported to moderators.')"><i class="ri-flag-line"></i> Report Post</a>`
//                     }
//                 </div>
//             </div>
//         `;

//         const el = document.createElement('div');
//         el.className = 'card post animate-fade-in';
//         el.innerHTML = `
//             <div class="post-header">
//                 <div class="post-author" style="cursor:pointer;" onclick="goToProfile('${post.authorId}')">
//                     <div class="avatar-text post-avatar-target"></div>
//                     <div class="author-info"><strong>${post.authorName}</strong> <span class="badge badge-idea">💡 Dev</span></div>
//                 </div>
//                 ${dropdownHTML}
//             </div>
//             <div class="post-content" style="font-size: 1.1rem; line-height: 1.7;"><p>${formatContent(post.content)}</p></div>
//             <div class="post-footer">
//                 <div class="likes ${isLiked ? '' : 'unliked'}" data-id="${postId}" data-liked="${isLiked}">
//                     <i class="${isLiked ? 'ph-fill' : 'ph'} ph-rocket"></i> Upvote <span>${post.likedBy ? post.likedBy.length : 0}</span>
//                 </div>
//                 <div class="comments-shares toggle-comments-btn" data-id="${postId}">
//                     <span><i class="ri-chat-3-line"></i> Discuss <span>${commentsList.length}</span></span>
//                 </div>
//             </div>
            
//             <div class="comments-section active" id="comments-${postId}">
//                 <div class="comments-list">${commentsHTML}</div>
//                 <div class="comment-input-wrapper">
//                     <input type="text" id="comment-input-${postId}" placeholder="Suggest an idea...">
//                     <button class="submit-comment-btn" data-id="${postId}">Send</button>
//                 </div>
//             </div>
//         `;

//         const targetAvatar = el.querySelector('.post-avatar-target');
//         if (post.authorAvatarClass && post.authorAvatarClass.includes('url(')) {
//             targetAvatar.style.background = post.authorAvatarClass;
//             targetAvatar.style.backgroundSize = 'cover';
//         } else {
//             targetAvatar.className = `avatar-text ${post.authorAvatarClass || 'bg-blue'}`;
//             targetAvatar.innerText = post.authorName.substring(0, 2).toUpperCase();
//         }

//         container.innerHTML = '';
//         container.appendChild(el);
//         attachListeners();

//     } catch (error) {
//         console.error("Error fetching post:", error);
//         container.innerHTML = "<p>Error loading pitch.</p>";
//     }
// }

// function attachListeners() {
//     // 3-Dots Menu
//     document.querySelectorAll('.toggle-menu-btn').forEach(btn => {
//         btn.addEventListener('click', (e) => {
//             e.stopPropagation();
//             const id = e.currentTarget.getAttribute('data-id');
//             document.getElementById(`menu-${id}`).classList.toggle('show');
//         });
//     });
//     document.addEventListener('click', () => {
//         document.querySelectorAll('.post-dropdown-menu').forEach(m => m.classList.remove('show'));
//     });

//     // Likes
//     document.querySelectorAll('.likes').forEach(btn => {
//         btn.addEventListener('click', async (e) => {
//             const id = e.currentTarget.getAttribute('data-id');
//             const isLiked = e.currentTarget.getAttribute('data-liked') === 'true';
//             if (isLiked) await updateDoc(doc(db, "posts", id), { likedBy: arrayRemove(auth.currentUser.uid) });
//             else await updateDoc(doc(db, "posts", id), { likedBy: arrayUnion(auth.currentUser.uid) });
//             loadSinglePost(id); // Reload to update numbers
//         });
//     });

//     // Comments
//     document.querySelectorAll('.submit-comment-btn').forEach(btn => {
//         btn.addEventListener('click', async (e) => {
//             const id = e.currentTarget.getAttribute('data-id');
//             const input = document.getElementById(`comment-input-${id}`);
//             if(!input.value.trim()) return;
//             await updateDoc(doc(db, "posts", id), {
//                 comments: arrayUnion({ author: window.currentUserData.fullname, text: input.value.trim(), uid: auth.currentUser.uid })
//             });
//             input.value = '';
//             loadSinglePost(id); // Reload to show comment
//         });
//     });

//     // Delete
//     document.querySelectorAll('.delete-post-btn').forEach(btn => {
//         btn.addEventListener('click', async (e) => {
//             if(confirm("Delete this pitch?")) {
//                 await deleteDoc(doc(db, "posts", e.currentTarget.getAttribute('data-id')));
//                 window.location.href = "index.html"; // Send them home after deletion
//             }
//         });
//     });
// }

// window.goToProfile = function(userId) {
//     if (auth.currentUser && auth.currentUser.uid === userId) window.location.href = 'profile.html';
//     else window.location.href = `user.html?id=${userId}`;
// }













// post.js
import { db, auth } from './firebase.js';
import { doc, getDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Cache for downloaded user profiles so we don't spam Firebase
export const userCache = {};

// ============================================================================
// PART 1: THE GLOBAL POST ENGINE (Exported for app.js, profile.js, user.js)
// ============================================================================

export function formatContent(text) {
    let safe = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    safe = safe.replace(/```([\s\S]*?)```/g, '<div class="code-block"><pre><code>$1</code></pre></div>');
    safe = safe.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    safe = safe.replace(urlRegex, '<a href="$1" target="_blank" class="rich-link">$1</a>');
    return safe.replace(/\n/g, '<br>');
}

export function createPostHTML(post, postId, currentUserId) {
    const isLiked = post.likedBy && post.likedBy.includes(currentUserId);
    const isMyPost = post.authorId === currentUserId;
    const commentsList = post.comments || [];
    let commentsHTML = commentsList.map(c => `<div class="comment-item"><strong>${c.author}:</strong> ${c.text}</div>`).join('');

    const dropdownHTML = `
        <div class="post-options-container">
            <button class="btn-more toggle-menu-btn" data-id="${postId}"><i class="ri-more-fill"></i></button>
            <div class="post-dropdown-menu" id="menu-${postId}">
                <a class="share-post-btn" data-id="${postId}"><i class="ri-share-forward-line"></i> Share Idea</a>
                ${isMyPost 
                    ? `<a class="delete-post-btn text-danger" data-id="${postId}"><i class="ri-delete-bin-line"></i> Delete Post</a>`
                    : `<a class="report-post-btn" onclick="alert('Post reported to moderators.')"><i class="ri-flag-line"></i> Report Post</a>`
                }
            </div>
        </div>
    `;

    return `
        <div class="card post animate-fade-in" data-author="${post.authorId}" data-postid="${postId}">
            <div class="post-header">
                <div class="post-author" style="cursor:pointer;" onclick="window.location.href = '${isMyPost ? 'profile.html' : 'user.html?id=' + post.authorId}'">
                    <div class="avatar-text" id="dyn-avatar-${postId}"></div>
                    <div class="author-info">
                        <strong id="dyn-name-${postId}">Loading...</strong> 
                        <span class="badge badge-idea">${isMyPost ? '💡 My Pitch' : '💡 Dev'}</span>
                    </div>
                </div>
                ${dropdownHTML}
            </div>
            <div class="post-content"><p>${formatContent(post.content)}</p></div>
            <div class="post-footer">
                <div class="likes ${isLiked ? '' : 'unliked'}" data-id="${postId}" data-liked="${isLiked}">
                    <i class="${isLiked ? 'ph-fill' : 'ph'} ph-rocket"></i> Upvote <span>${post.likedBy ? post.likedBy.length : 0}</span>
                </div>
                <div class="comments-shares toggle-comments-btn" data-id="${postId}">
                    <span><i class="ri-chat-3-line"></i> Discuss <span>${commentsList.length}</span></span>
                </div>
            </div>
            
            <div class="comments-section" id="comments-${postId}" style="display:none; margin-top:15px; border-top:1px dashed var(--border-color); padding-top:15px;">
                <div class="comments-list">${commentsHTML}</div>
                <div class="comment-input-wrapper" style="display:flex; gap:10px; margin-top:10px;">
                    <input type="text" id="comment-input-${postId}" placeholder="Suggest an idea..." style="flex:1; padding:8px 15px; border-radius:20px; border:1px solid var(--border-color);">
                    <button class="submit-comment-btn" data-id="${postId}" style="background:var(--primary-color); color:white; border-radius:20px; padding:0 20px; border:none; cursor:pointer;">Send</button>
                </div>
            </div>
        </div>
    `;
}

export async function renderDynamicAuthor(authorId, postId) {
    const nameEl = document.getElementById(`dyn-name-${postId}`);
    const avatarEl = document.getElementById(`dyn-avatar-${postId}`);
    if (!nameEl || !avatarEl) return;

    let userData = null;
    
    if (window.currentUserData && authorId === window.currentUserData.uid) {
        userData = window.currentUserData;
    } else if (userCache[authorId]) {
        userData = userCache[authorId];
    } else {
        const docSnap = await getDoc(doc(db, "users", authorId));
        if (docSnap.exists()) {
            userData = docSnap.data();
            userCache[authorId] = userData;
        }
    }

    if (userData) {
        nameEl.innerText = userData.fullname;
        if (userData.avatarClass && userData.avatarClass.includes('url(')) {
            avatarEl.style.background = userData.avatarClass;
            avatarEl.style.backgroundSize = 'cover';
            avatarEl.style.backgroundPosition = 'center';
            avatarEl.className = 'avatar-text';
            avatarEl.innerText = '';
        } else {
            avatarEl.className = `avatar-text ${userData.avatarClass || 'bg-primary'}`;
            avatarEl.style.background = '';
            avatarEl.innerText = userData.fullname.substring(0, 2).toUpperCase();
        }
    } else {
        nameEl.innerText = "Unknown Dev";
    }
}

export function initGlobalPostListeners() {
    if (window.postEngineListenersAttached) return;
    window.postEngineListenersAttached = true;

    document.addEventListener('click', async (e) => {
        // Dropdowns
        if (e.target.closest('.toggle-menu-btn')) {
            e.stopPropagation();
            const btn = e.target.closest('.toggle-menu-btn');
            const id = btn.getAttribute('data-id');
            const menu = document.getElementById(`menu-${id}`);
            document.querySelectorAll('.post-dropdown-menu').forEach(m => { if (m !== menu) m.classList.remove('show'); });
            menu.classList.toggle('show');
            return;
        }
        if (!e.target.closest('.post-options-container')) {
            document.querySelectorAll('.post-dropdown-menu').forEach(m => m.classList.remove('show'));
        }

        // Likes
        if (e.target.closest('.likes')) {
            const btn = e.target.closest('.likes');
            const id = btn.getAttribute('data-id');
            const isLiked = btn.getAttribute('data-liked') === 'true';
            
            if (isLiked) await updateDoc(doc(db, "posts", id), { likedBy: arrayRemove(auth.currentUser.uid) });
            else await updateDoc(doc(db, "posts", id), { likedBy: arrayUnion(auth.currentUser.uid) });
            return;
        }

        // Toggle Comments
        if (e.target.closest('.toggle-comments-btn')) {
            const btn = e.target.closest('.toggle-comments-btn');
            const id = btn.getAttribute('data-id');
            const section = document.getElementById(`comments-${id}`);
            section.style.display = section.style.display === 'none' ? 'block' : 'none';
            return;
        }

        // Submit Comment
        if (e.target.closest('.submit-comment-btn')) {
            const btn = e.target.closest('.submit-comment-btn');
            const id = btn.getAttribute('data-id');
            const input = document.getElementById(`comment-input-${id}`);
            if(!input.value.trim()) return;

            btn.innerText = '...'; 
            await updateDoc(doc(db, "posts", id), { 
                comments: arrayUnion({ author: window.currentUserData.fullname, text: input.value.trim(), uid: auth.currentUser.uid }) 
            });
            input.value = '';
            btn.innerText = 'Send';
            return;
        }

        // Share Post (FIXED URL)
        if (e.target.closest('.share-post-btn')) {
            e.stopPropagation();
            const btn = e.target.closest('.share-post-btn');
            const id = btn.getAttribute('data-id');
            const shareUrl = `${window.location.origin}/nerdarena.com/post.html?id=${id}`;
            
            try {
                if (navigator.share) {
                    await navigator.share({ title: 'Nerd Arena Pitch', url: shareUrl });
                } else {
                    await navigator.clipboard.writeText(shareUrl); 
                    alert("Link copied to clipboard!"); 
                }
            } catch (err) {}
            
            document.querySelectorAll('.post-dropdown-menu').forEach(m => m.classList.remove('show'));
            return;
        }

        // Delete Post
        if (e.target.closest('.delete-post-btn')) {
            const btn = e.target.closest('.delete-post-btn');
            if(confirm("Are you sure you want to delete this pitch?")) {
                await deleteDoc(doc(db, "posts", btn.getAttribute('data-id')));
                if(window.location.pathname.includes('post.html')) window.location.href = "index.html";
            }
            return;
        }
    });
}

// ============================================================================
// PART 2: SINGLE POST PAGE LOGIC (Only runs if on post.html)
// ============================================================================

document.addEventListener('userDataLoaded', () => {
    const container = document.getElementById('single-post-container');
    
    // IF WE ARE NOT ON POST.HTML, EXIT EARLY! 
    if (!container) return; 

    const urlParams = new URLSearchParams(window.location.search);
    const targetPostId = urlParams.get('id');

    if (!targetPostId) {
        container.innerHTML = "<p style='text-align:center;'>Invalid post link.</p>";
        return;
    }

    initGlobalPostListeners(); // Attach standard listeners
    
    // Use onSnapshot to instantly update likes/comments without reloading
    onSnapshot(doc(db, "posts", targetPostId), (docSnap) => {
        if (!docSnap.exists()) {
            container.innerHTML = "<p style='text-align:center; color:var(--text-muted); padding:40px;'>This pitch was deleted or does not exist.</p>";
            return;
        }

        const post = docSnap.data();
        // Generate the HTML using the engine
        container.innerHTML = createPostHTML(post, targetPostId, auth.currentUser.uid);
        
        // Resolve the author profile
        renderDynamicAuthor(post.authorId, targetPostId);
        
        // Force comments section open on single post view
        const commentSection = document.getElementById(`comments-${targetPostId}`);
        if(commentSection) commentSection.style.display = 'block';
    });
});