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













// // post.js
// import { db, auth } from './firebase.js';
// import { doc, getDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// // Cache for downloaded user profiles so we don't spam Firebase
// export const userCache = {};

// // ============================================================================
// // PART 1: THE GLOBAL POST ENGINE (Exported for app.js, profile.js, user.js)
// // ============================================================================

// export function formatContent(text) {
//     let safe = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
//     safe = safe.replace(/```([\s\S]*?)```/g, '<div class="code-block"><pre><code>$1</code></pre></div>');
//     safe = safe.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
//     safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
//     const urlRegex = /(https?:\/\/[^\s]+)/g;
//     safe = safe.replace(urlRegex, '<a href="$1" target="_blank" class="rich-link">$1</a>');
//     return safe.replace(/\n/g, '<br>');
// }

// export function createPostHTML(post, postId, currentUserId) {
//     const isLiked = post.likedBy && post.likedBy.includes(currentUserId);
//     const isMyPost = post.authorId === currentUserId;
//     const commentsList = post.comments || [];
//     let commentsHTML = commentsList.map(c => `<div class="comment-item"><strong>${c.author}:</strong> ${c.text}</div>`).join('');

//     const dropdownHTML = `
//         <div class="post-options-container">
//             <button class="btn-more toggle-menu-btn" data-id="${postId}"><i class="ri-more-fill"></i></button>
//             <div class="post-dropdown-menu" id="menu-${postId}">
//                 <a class="share-post-btn" data-id="${postId}"><i class="ri-share-forward-line"></i> Share Idea</a>
//                 ${isMyPost 
//                     ? `<a class="delete-post-btn text-danger" data-id="${postId}"><i class="ri-delete-bin-line"></i> Delete Post</a>`
//                     : `<a class="report-post-btn" onclick="alert('Post reported to moderators.')"><i class="ri-flag-line"></i> Report Post</a>`
//                 }
//             </div>
//         </div>
//     `;

//     return `
//         <div class="card post animate-fade-in" data-author="${post.authorId}" data-postid="${postId}">
//             <div class="post-header">
//                 <div class="post-author" style="cursor:pointer;" onclick="window.location.href = '${isMyPost ? 'profile.html' : 'user.html?id=' + post.authorId}'">
//                     <div class="avatar-text" id="dyn-avatar-${postId}"></div>
//                     <div class="author-info">
//                         <strong id="dyn-name-${postId}">Loading...</strong> 
//                         <span class="badge badge-idea">${isMyPost ? '💡 My Pitch' : '💡 Dev'}</span>
//                     </div>
//                 </div>
//                 ${dropdownHTML}
//             </div>
//             <div class="post-content"><p>${formatContent(post.content)}</p></div>
//             <div class="post-footer">
//                 <div class="likes ${isLiked ? '' : 'unliked'}" data-id="${postId}" data-liked="${isLiked}">
//                     <i class="${isLiked ? 'ph-fill' : 'ph'} ph-rocket"></i> Upvote <span>${post.likedBy ? post.likedBy.length : 0}</span>
//                 </div>
//                 <div class="comments-shares toggle-comments-btn" data-id="${postId}">
//                     <span><i class="ri-chat-3-line"></i> Discuss <span>${commentsList.length}</span></span>
//                 </div>
//             </div>
            
//             <div class="comments-section" id="comments-${postId}" style="display:none; margin-top:15px; border-top:1px dashed var(--border-color); padding-top:15px;">
//                 <div class="comments-list">${commentsHTML}</div>
//                 <div class="comment-input-wrapper" style="display:flex; gap:10px; margin-top:10px;">
//                     <input type="text" id="comment-input-${postId}" placeholder="Suggest an idea..." style="flex:1; padding:8px 15px; border-radius:20px; border:1px solid var(--border-color);">
//                     <button class="submit-comment-btn" data-id="${postId}" style="background:var(--primary-color); color:white; border-radius:20px; padding:0 20px; border:none; cursor:pointer;">Send</button>
//                 </div>
//             </div>
//         </div>
//     `;
// }

// export async function renderDynamicAuthor(authorId, postId) {
//     const nameEl = document.getElementById(`dyn-name-${postId}`);
//     const avatarEl = document.getElementById(`dyn-avatar-${postId}`);
//     if (!nameEl || !avatarEl) return;

//     let userData = null;
    
//     if (window.currentUserData && authorId === window.currentUserData.uid) {
//         userData = window.currentUserData;
//     } else if (userCache[authorId]) {
//         userData = userCache[authorId];
//     } else {
//         const docSnap = await getDoc(doc(db, "users", authorId));
//         if (docSnap.exists()) {
//             userData = docSnap.data();
//             userCache[authorId] = userData;
//         }
//     }

//     if (userData) {
//         nameEl.innerText = userData.fullname;
//         if (userData.avatarClass && userData.avatarClass.includes('url(')) {
//             avatarEl.style.background = userData.avatarClass;
//             avatarEl.style.backgroundSize = 'cover';
//             avatarEl.style.backgroundPosition = 'center';
//             avatarEl.className = 'avatar-text';
//             avatarEl.innerText = '';
//         } else {
//             avatarEl.className = `avatar-text ${userData.avatarClass || 'bg-primary'}`;
//             avatarEl.style.background = '';
//             avatarEl.innerText = userData.fullname.substring(0, 2).toUpperCase();
//         }
//     } else {
//         nameEl.innerText = "Unknown Dev";
//     }
// }

// export function initGlobalPostListeners() {
//     if (window.postEngineListenersAttached) return;
//     window.postEngineListenersAttached = true;

//     document.addEventListener('click', async (e) => {
//         // Dropdowns
//         if (e.target.closest('.toggle-menu-btn')) {
//             e.stopPropagation();
//             const btn = e.target.closest('.toggle-menu-btn');
//             const id = btn.getAttribute('data-id');
//             const menu = document.getElementById(`menu-${id}`);
//             document.querySelectorAll('.post-dropdown-menu').forEach(m => { if (m !== menu) m.classList.remove('show'); });
//             menu.classList.toggle('show');
//             return;
//         }
//         if (!e.target.closest('.post-options-container')) {
//             document.querySelectorAll('.post-dropdown-menu').forEach(m => m.classList.remove('show'));
//         }

//         // Likes
//         if (e.target.closest('.likes')) {
//             const btn = e.target.closest('.likes');
//             const id = btn.getAttribute('data-id');
//             const isLiked = btn.getAttribute('data-liked') === 'true';
            
//             if (isLiked) await updateDoc(doc(db, "posts", id), { likedBy: arrayRemove(auth.currentUser.uid) });
//             else await updateDoc(doc(db, "posts", id), { likedBy: arrayUnion(auth.currentUser.uid) });
//             return;
//         }

//         // Toggle Comments
//         if (e.target.closest('.toggle-comments-btn')) {
//             const btn = e.target.closest('.toggle-comments-btn');
//             const id = btn.getAttribute('data-id');
//             const section = document.getElementById(`comments-${id}`);
//             section.style.display = section.style.display === 'none' ? 'block' : 'none';
//             return;
//         }

//         // Submit Comment
//         if (e.target.closest('.submit-comment-btn')) {
//             const btn = e.target.closest('.submit-comment-btn');
//             const id = btn.getAttribute('data-id');
//             const input = document.getElementById(`comment-input-${id}`);
//             if(!input.value.trim()) return;

//             btn.innerText = '...'; 
//             await updateDoc(doc(db, "posts", id), { 
//                 comments: arrayUnion({ author: window.currentUserData.fullname, text: input.value.trim(), uid: auth.currentUser.uid }) 
//             });
//             input.value = '';
//             btn.innerText = 'Send';
//             return;
//         }

//         // Share Post (FIXED URL)
//         if (e.target.closest('.share-post-btn')) {
//             e.stopPropagation();
//             const btn = e.target.closest('.share-post-btn');
//             const id = btn.getAttribute('data-id');
//             const shareUrl = `${window.location.origin}/nerdarena.com/post.html?id=${id}`;
            
//             try {
//                 if (navigator.share) {
//                     await navigator.share({ title: 'Nerd Arena Pitch', url: shareUrl });
//                 } else {
//                     await navigator.clipboard.writeText(shareUrl); 
//                     alert("Link copied to clipboard!"); 
//                 }
//             } catch (err) {}
            
//             document.querySelectorAll('.post-dropdown-menu').forEach(m => m.classList.remove('show'));
//             return;
//         }

//         // Delete Post
//         if (e.target.closest('.delete-post-btn')) {
//             const btn = e.target.closest('.delete-post-btn');
//             if(confirm("Are you sure you want to delete this pitch?")) {
//                 await deleteDoc(doc(db, "posts", btn.getAttribute('data-id')));
//                 if(window.location.pathname.includes('post.html')) window.location.href = "index.html";
//             }
//             return;
//         }
//     });
// }

// // ============================================================================
// // PART 2: SINGLE POST PAGE LOGIC (Only runs if on post.html)
// // ============================================================================

// document.addEventListener('userDataLoaded', () => {
//     const container = document.getElementById('single-post-container');
    
//     // IF WE ARE NOT ON POST.HTML, EXIT EARLY! 
//     if (!container) return; 

//     const urlParams = new URLSearchParams(window.location.search);
//     const targetPostId = urlParams.get('id');

//     if (!targetPostId) {
//         container.innerHTML = "<p style='text-align:center;'>Invalid post link.</p>";
//         return;
//     }

//     initGlobalPostListeners(); // Attach standard listeners
    
//     // Use onSnapshot to instantly update likes/comments without reloading
//     onSnapshot(doc(db, "posts", targetPostId), (docSnap) => {
//         if (!docSnap.exists()) {
//             container.innerHTML = "<p style='text-align:center; color:var(--text-muted); padding:40px;'>This pitch was deleted or does not exist.</p>";
//             return;
//         }

//         const post = docSnap.data();
//         // Generate the HTML using the engine
//         container.innerHTML = createPostHTML(post, targetPostId, auth.currentUser.uid);
        
//         // Resolve the author profile
//         renderDynamicAuthor(post.authorId, targetPostId);
        
//         // Force comments section open on single post view
//         const commentSection = document.getElementById(`comments-${targetPostId}`);
//         if(commentSection) commentSection.style.display = 'block';
//     });
// });





























// // post.js
// import { db, auth } from './firebase.js';
// import { doc, getDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, onSnapshot, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// // Cache for downloaded user profiles
// export const userCache = {};

// // ============================================================================
// // PART 1: THE GLOBAL POST ENGINE (Formatting & HTML Generation)
// // ============================================================================

// export function formatContent(text) {
//     let safe = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
//     safe = safe.replace(/```([\s\S]*?)```/g, '<div class="code-block"><pre><code>$1</code></pre></div>');
//     safe = safe.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
//     safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
//     const urlRegex = /(https?:\/\/[^\s]+)/g;
//     safe = safe.replace(urlRegex, '<a href="$1" target="_blank" class="rich-link">$1</a>');
//     return safe.replace(/\n/g, '<br>');
// }

// export function createPostHTML(post, postId, currentUserId) {
//     const isLiked = post.likedBy && post.likedBy.includes(currentUserId);
//     const isMyPost = post.authorId === currentUserId;
//     const commentsList = post.comments || [];
//     let commentsHTML = commentsList.map(c => `<div class="comment-item"><strong>${c.author}:</strong> ${c.text}</div>`).join('');

//     const dropdownHTML = `
//         <div class="post-options-container">
//             <button class="btn-more toggle-menu-btn" data-id="${postId}"><i class="ri-more-fill"></i></button>
//             <div class="post-dropdown-menu" id="menu-${postId}">
//                 <a class="share-post-btn" data-id="${postId}"><i class="ri-share-forward-line"></i> Share Idea</a>
//                 ${isMyPost 
//                     ? `<a class="delete-post-btn text-danger" data-id="${postId}"><i class="ri-delete-bin-line"></i> Delete Post</a>`
//                     : `<a class="report-post-btn" onclick="alert('Post reported to moderators.')"><i class="ri-flag-line"></i> Report Post</a>`
//                 }
//             </div>
//         </div>
//     `;

//     return `
//         <div class="card post animate-fade-in" data-author="${post.authorId}" data-postid="${postId}">
//             <div class="post-header">
//                 <div class="post-author" style="cursor:pointer;" onclick="window.location.href = '${isMyPost ? 'profile.html' : 'user.html?id=' + post.authorId}'">
//                     <div class="avatar-text" id="dyn-avatar-${postId}"></div>
//                     <div class="author-info">
//                         <strong id="dyn-name-${postId}">Loading...</strong> 
//                         <span class="badge badge-idea">${isMyPost ? '💡 My Pitch' : '💡 Dev'}</span>
//                     </div>
//                 </div>
//                 ${dropdownHTML}
//             </div>
//             <div class="post-content"><p>${formatContent(post.content)}</p></div>
//             <div class="post-footer">
//                 <div class="likes ${isLiked ? '' : 'unliked'}" data-id="${postId}" data-liked="${isLiked}">
//                     <i class="${isLiked ? 'ph-fill' : 'ph'} ph-rocket"></i> Upvote <span>${post.likedBy ? post.likedBy.length : 0}</span>
//                 </div>
//                 <div class="comments-shares toggle-comments-btn" data-id="${postId}">
//                     <span><i class="ri-chat-3-line"></i> Discuss <span>${commentsList.length}</span></span>
//                 </div>
//             </div>
            
//             <div class="comments-section" id="comments-${postId}" style="display:none; margin-top:15px; border-top:1px dashed var(--border-color); padding-top:15px;">
//                 <div class="comments-list">${commentsHTML}</div>
//                 <div class="comment-input-wrapper" style="display:flex; gap:10px; margin-top:10px;">
//                     <input type="text" id="comment-input-${postId}" placeholder="Suggest an idea..." style="flex:1; padding:8px 15px; border-radius:20px; border:1px solid var(--border-color);">
//                     <button class="submit-comment-btn" data-id="${postId}" style="background:var(--primary-color); color:white; border-radius:20px; padding:0 20px; border:none; cursor:pointer;">Send</button>
//                 </div>
//             </div>
//         </div>
//     `;
// }

// export async function renderDynamicAuthor(authorId, postId) {
//     const nameEl = document.getElementById(`dyn-name-${postId}`);
//     const avatarEl = document.getElementById(`dyn-avatar-${postId}`);
//     if (!nameEl || !avatarEl) return;

//     let userData = null;
    
//     if (window.currentUserData && authorId === window.currentUserData.uid) {
//         userData = window.currentUserData;
//     } else if (userCache[authorId]) {
//         userData = userCache[authorId];
//     } else {
//         const docSnap = await getDoc(doc(db, "users", authorId));
//         if (docSnap.exists()) {
//             userData = docSnap.data();
//             userCache[authorId] = userData;
//         }
//     }

//     if (userData) {
//         nameEl.innerText = userData.fullname;
//         if (userData.avatarClass && userData.avatarClass.includes('url(')) {
//             avatarEl.style.background = userData.avatarClass;
//             avatarEl.style.backgroundSize = 'cover';
//             avatarEl.style.backgroundPosition = 'center';
//             avatarEl.className = 'avatar-text';
//             avatarEl.innerText = '';
//         } else {
//             avatarEl.className = `avatar-text ${userData.avatarClass || 'bg-primary'}`;
//             avatarEl.style.background = '';
//             avatarEl.innerText = userData.fullname.substring(0, 2).toUpperCase();
//         }
//     } else {
//         nameEl.innerText = "Unknown Dev";
//     }
// }

// // ============================================================================
// // PART 2: THE MODAL SYSTEM (Injection & Drag Logic)
// // ============================================================================

// function injectModalHTML() {
//     if(document.getElementById('global-post-modal')) return; // Prevent duplicates
//     const modalHTML = `
//     <div class="post-modal-overlay" id="global-post-modal">
//         <div class="post-modal">
//             <div class="modal-drag-handle"></div>
//             <div class="post-modal-header">
//                 <div class="avatar-text bg-primary modal-user-avatar">...</div>
//                 <i class="ri-close-line close-post-modal" id="close-modal-btn"></i>
//             </div>
//             <textarea id="modal-post-textarea" placeholder="Post your idea, architecture, or project roadmap..."></textarea>
//             <div class="post-actions" style="margin-top: auto;">
//                 <div class="action-icons">
//                     <span title="Add Code Snippet"><i class="ph ph-code-block"></i></span> 
//                     <span title="Format Markdown"><i class="ph ph-text-b"></i></span> 
//                 </div>
//                 <button class="btn-post" id="modal-submit-post">Post Idea</button>
//             </div>
//         </div>
//     </div>`;
    
//     document.body.insertAdjacentHTML('beforeend', modalHTML);
//     setupModalDragLogic();
// }

// function openModal() {
//     let overlay = document.getElementById('global-post-modal');
//     if(!overlay) {
//         injectModalHTML();
//         overlay = document.getElementById('global-post-modal');
//     }
    
//     overlay.classList.add('active');
    
//     if(window.currentUserData) {
//         const avatar = overlay.querySelector('.modal-user-avatar');
//         if (window.currentUserData.avatarClass?.includes('url(')) {
//             avatar.style.background = window.currentUserData.avatarClass;
//             avatar.style.backgroundSize = 'cover';
//             avatar.innerText = '';
//         } else {
//             avatar.className = `avatar-text ${window.currentUserData.avatarClass || 'bg-primary'} modal-user-avatar`;
//             avatar.innerText = window.currentUserData.fullname.substring(0,2).toUpperCase();
//         }
//     }
    
//     setTimeout(() => {
//         document.getElementById('modal-post-textarea').focus();
//     }, 300);
// }

// function closeModal() {
//     const overlay = document.getElementById('global-post-modal');
//     if(overlay) {
//         overlay.classList.remove('active');
//         overlay.querySelector('.post-modal').style.transform = ''; 
//         document.getElementById('modal-post-textarea').value = ''; 
//     }
// }

// function setupModalDragLogic() {
//     const overlay = document.getElementById('global-post-modal');
//     const modal = overlay.querySelector('.post-modal');
//     const handle = overlay.querySelector('.modal-drag-handle');
    
//     let startY = 0, currentY = 0, isDragging = false;

//     handle.addEventListener('touchstart', (e) => {
//         startY = e.touches[0].clientY;
//         isDragging = true;
//         modal.classList.add('dragging');
//     }, {passive: true});

//     document.addEventListener('touchmove', (e) => {
//         if (!isDragging) return;
//         currentY = e.touches[0].clientY;
//         const deltaY = currentY - startY;
//         if (deltaY > 0) {
//             e.preventDefault(); 
//             modal.style.transform = `translateY(${deltaY}px)`;
//         }
//     }, { passive: false });

//     document.addEventListener('touchend', (e) => {
//         if (!isDragging) return;
//         isDragging = false;
//         modal.classList.remove('dragging');
//         if (currentY - startY > 120) closeModal();
//         else modal.style.transform = '';
//     });
// }

// // ============================================================================
// // PART 3: GLOBAL INTERACTION LISTENERS (Includes Modal & Pages)
// // ============================================================================

// export function initGlobalPostListeners() {
//     if (window.postEngineListenersAttached) return;
//     window.postEngineListenersAttached = true;

//     // Inject modal so it's ready anywhere `initGlobalPostListeners()` is called
//     injectModalHTML();

//     document.addEventListener('click', async (e) => {
        
//         // --- 1. ROUTING: MODAL vs PAGE CREATION ---
        
//         if (e.target.closest('#post-modal')) {
//             e.preventDefault();
//             openModal();
//             return;
//         }
        
//         if (e.target.closest('#post-norm')) {
//             e.preventDefault();
//             window.location.href = 'create-post.html';
//             return;
//         }

//         // --- 2. MODAL CONTROLS ---
        
//         if (e.target.id === 'close-modal-btn' || e.target.id === 'global-post-modal') {
//             closeModal();
//             return;
//         }

//         if (e.target.id === 'modal-submit-post') {
//             const btnPost = e.target;
//             const postTextarea = document.getElementById('modal-post-textarea');
//             const content = postTextarea.value.trim();
            
//             if (!content || !window.currentUserData) return;
            
//             btnPost.disabled = true; 
//             btnPost.innerText = "Posting...";
            
//             try {
//                 await addDoc(collection(db, "posts"), {
//                     authorId: window.currentUserData.uid,
//                     content: content, 
//                     likedBy: [], 
//                     comments: [],
//                     timestamp: new Date().toISOString()
//                 });
//                 closeModal(); // Closes seamlessly upon success
//             } catch (error) { 
//                 console.error(error); 
//             } finally { 
//                 btnPost.disabled = false; 
//                 btnPost.innerText = "Post Idea"; 
//             }
//             return;
//         }
// // --- 4. MARKDOWN FORMATTING BUTTONS ---
//         const actionIcon = e.target.closest('.action-icons span');
//         if (actionIcon) {
//             const title = actionIcon.getAttribute('title');
            
//             // Determine which textarea is currently active on the screen
//             let textarea = document.getElementById('modal-post-textarea');
            
//             // If the modal isn't active, check for the standalone page textarea
//             if (!textarea || !textarea.closest('.post-modal-overlay.active')) {
//                 textarea = document.getElementById('standalone-post-textarea');
//             }
//             // Finally, fall back to the inline feed textarea if neither exist
//             if (!textarea) {
//                 textarea = document.querySelector('.create-post textarea');
//             }

//             if (!textarea) return;

//             // Inject the Markdown
//             if (title && title.includes("Code")) {
//                 textarea.value += "\n```\n// Paste your code here\n```\n";
//             }
//             if (title && title.includes("Format")) {
//                 textarea.value += "**Bold Text**";
//             }
            
//             textarea.focus();
//             return;
//         }

//         // --- 5. STANDALONE PAGE SUBMIT BUTTON ---
//         if (e.target.id === 'standalone-submit-post') {
//             const btnPost = e.target;
//             const postTextarea = document.getElementById('standalone-post-textarea');
//             const content = postTextarea.value.trim();
            
//             if (!content || !window.currentUserData) return;
            
//             btnPost.disabled = true; 
//             btnPost.innerText = "Posting...";
            
//             try {
//                 await addDoc(collection(db, "posts"), {
//                     authorId: window.currentUserData.uid,
//                     content: content, 
//                     likedBy: [], 
//                     comments: [],
//                     timestamp: new Date().toISOString()
//                 });
//                 window.location.href = 'index.html'; // Send back to feed after posting
//             } catch (error) { 
//                 console.error(error); 
//             } finally { 
//                 btnPost.disabled = false; 
//                 btnPost.innerText = "Post Idea"; 
//             }
//             return;
//         }
//         // --- 3. STANDARD FEED POST INTERACTIONS ---

//         // Dropdowns
//         if (e.target.closest('.toggle-menu-btn')) {
//             e.stopPropagation();
//             const btn = e.target.closest('.toggle-menu-btn');
//             const id = btn.getAttribute('data-id');
//             const menu = document.getElementById(`menu-${id}`);
//             document.querySelectorAll('.post-dropdown-menu').forEach(m => { if (m !== menu) m.classList.remove('show'); });
//             menu.classList.toggle('show');
//             return;
//         }
//         if (!e.target.closest('.post-options-container')) {
//             document.querySelectorAll('.post-dropdown-menu').forEach(m => m.classList.remove('show'));
//         }

//         // Likes
//         if (e.target.closest('.likes')) {
//             const btn = e.target.closest('.likes');
//             const id = btn.getAttribute('data-id');
//             const isLiked = btn.getAttribute('data-liked') === 'true';
            
//             if (isLiked) await updateDoc(doc(db, "posts", id), { likedBy: arrayRemove(auth.currentUser.uid) });
//             else await updateDoc(doc(db, "posts", id), { likedBy: arrayUnion(auth.currentUser.uid) });
//             return;
//         }

//         // Toggle Comments
//         if (e.target.closest('.toggle-comments-btn')) {
//             const btn = e.target.closest('.toggle-comments-btn');
//             const id = btn.getAttribute('data-id');
//             const section = document.getElementById(`comments-${id}`);
//             section.style.display = section.style.display === 'none' ? 'block' : 'none';
//             return;
//         }

//         // Submit Comment
//         if (e.target.closest('.submit-comment-btn')) {
//             const btn = e.target.closest('.submit-comment-btn');
//             const id = btn.getAttribute('data-id');
//             const input = document.getElementById(`comment-input-${id}`);
//             if(!input.value.trim()) return;

//             btn.innerText = '...'; 
//             await updateDoc(doc(db, "posts", id), { 
//                 comments: arrayUnion({ author: window.currentUserData.fullname, text: input.value.trim(), uid: auth.currentUser.uid }) 
//             });
//             input.value = '';
//             btn.innerText = 'Send';
//             return;
//         }

//         // Share Post
//         if (e.target.closest('.share-post-btn')) {
//             e.stopPropagation();
//             const btn = e.target.closest('.share-post-btn');
//             const id = btn.getAttribute('data-id');
//             const shareUrl = `${window.location.origin}/nerdarena.com/post.html?id=${id}`;
            
//             try {
//                 if (navigator.share) {
//                     await navigator.share({ title: 'Nerd Arena Pitch', url: shareUrl });
//                 } else {
//                     await navigator.clipboard.writeText(shareUrl); 
//                     alert("Link copied to clipboard!"); 
//                 }
//             } catch (err) {}
            
//             document.querySelectorAll('.post-dropdown-menu').forEach(m => m.classList.remove('show'));
//             return;
//         }

//         // Delete Post
//         if (e.target.closest('.delete-post-btn')) {
//             const btn = e.target.closest('.delete-post-btn');
//             if(confirm("Are you sure you want to delete this pitch?")) {
//                 await deleteDoc(doc(db, "posts", btn.getAttribute('data-id')));
//                 if(window.location.pathname.includes('post.html')) window.location.href = "index.html";
//             }
//             return;
//         }
//     });
// }

// // ============================================================================
// // PART 4: SINGLE POST PAGE LOGIC (Runs automatically if on post.html)
// // ============================================================================

// document.addEventListener('userDataLoaded', () => {
//     const container = document.getElementById('single-post-container');
//     if (!container) return; 

//     const urlParams = new URLSearchParams(window.location.search);
//     const targetPostId = urlParams.get('id');

//     if (!targetPostId) {
//         container.innerHTML = "<p style='text-align:center;'>Invalid post link.</p>";
//         return;
//     }

//     initGlobalPostListeners(); 
    
//     onSnapshot(doc(db, "posts", targetPostId), (docSnap) => {
//         if (!docSnap.exists()) {
//             container.innerHTML = "<p style='text-align:center; color:var(--text-muted); padding:40px;'>This pitch was deleted or does not exist.</p>";
//             return;
//         }

//         const post = docSnap.data();
//         container.innerHTML = createPostHTML(post, targetPostId, auth.currentUser.uid);
//         renderDynamicAuthor(post.authorId, targetPostId);
        
//         const commentSection = document.getElementById(`comments-${targetPostId}`);
//         if(commentSection) commentSection.style.display = 'block';
//     });
// });
































// // post.js
// import { db, auth } from './firebase.js';
// import { doc, getDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, onSnapshot, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// // Cache for downloaded user profiles
// export const userCache = {};

// // ============================================================================
// // PART 1: THE GLOBAL POST ENGINE (Formatting & HTML Generation)
// // ============================================================================

// export function formatContent(text) {
//     let safe = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
//     safe = safe.replace(/```([\s\S]*?)```/g, '<div class="code-block"><pre><code>$1</code></pre></div>');
//     safe = safe.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
//     safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
//     const urlRegex = /(https?:\/\/[^\s]+)/g;
//     safe = safe.replace(urlRegex, '<a href="$1" target="_blank" class="rich-link">$1</a>');
//     return safe.replace(/\n/g, '<br>');
// }

// // Helper to format timestamps nicely
// function formatTime(isoString) {
//     if(!isoString) return '';
//     const d = new Date(isoString);
//     return d.toLocaleDateString() + ' at ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
// }

// // Helper to generate the Avatar HTML string
// function getAvatarHTML(avatarClass, name) {
//     if (avatarClass && avatarClass.includes('url(')) {
//         return `<div class="avatar-text" style="background:${avatarClass}; background-size:cover; background-position:center; width: 35px; height: 35px; min-width: 35px;"></div>`;
//     } else {
//         return `<div class="avatar-text ${avatarClass || 'bg-primary'}" style="width: 35px; height: 35px; min-width: 35px; font-size: 0.8rem;">${name.substring(0, 2).toUpperCase()}</div>`;
//     }
// }

// export function createPostHTML(post, postId, currentUserId) {
//     const isLiked = post.likedBy && post.likedBy.includes(currentUserId);
//     const isMyPost = post.authorId === currentUserId;
//     const commentsList = post.comments || [];
    
//     // Build Comments HTML
//     let commentsHTML = commentsList.map(c => {
//         const isMyComment = c.uid === currentUserId;
//         const timeStr = c.timestamp ? formatTime(c.timestamp) : 'Just now';
//         const avatar = getAvatarHTML(c.avatarClass, c.author);
//         const editedTag = c.edited ? '<span style="font-size: 0.7rem; color: var(--text-muted); margin-left: 5px;">(edited)</span>' : '';

//         return `
//         <div class="comment-item" style="display: flex; gap: 10px; margin-bottom: 15px; align-items: flex-start; background: transparent; padding: 0;">
//             ${avatar}
//             <div style="flex: 1;">
//                 <div style="background: var(--bg-color); padding: 10px 15px; border-radius: 0 12px 12px 12px; border: 1px solid var(--border-color);">
//                     <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
//                         <strong style="font-size: 0.9rem; color: var(--text-main);">${c.author}</strong>
//                         <span style="font-size: 0.75rem; color: var(--text-muted);">${timeStr}</span>
//                     </div>
//                     <p style="margin: 0; font-size: 0.95rem; color: var(--text-main); line-height: 1.4;">
//                         ${c.text.replace(/</g, "&lt;").replace(/>/g, "&gt;")} ${editedTag}
//                     </p>
//                 </div>
//                 ${isMyComment ? `
//                 <div style="margin-top: 6px; margin-left: 5px; font-size: 0.8rem; display: flex; gap: 15px; font-weight: 600;">
//                     <span class="edit-comment-btn" data-postid="${postId}" data-commentid="${c.id}" data-text="${c.text.replace(/"/g, '&quot;')}" style="color: var(--text-muted); cursor: pointer; transition: 0.2s;">Edit</span>
//                     <span class="delete-comment-btn" data-postid="${postId}" data-commentid="${c.id}" style="color: var(--text-muted); cursor: pointer; transition: 0.2s;">Delete</span>
//                 </div>
//                 ` : ''}
//             </div>
//         </div>`;
//     }).join('');

//     const dropdownHTML = `
//         <div class="post-options-container">
//             <button class="btn-more toggle-menu-btn" data-id="${postId}"><i class="ri-more-fill"></i></button>
//             <div class="post-dropdown-menu" id="menu-${postId}">
//                 <a class="share-post-btn" data-id="${postId}"><i class="ri-share-forward-line"></i> Share Idea</a>
//                 ${isMyPost 
//                     ? `<a class="delete-post-btn text-danger" data-id="${postId}"><i class="ri-delete-bin-line"></i> Delete Post</a>`
//                     : `<a class="report-post-btn" onclick="alert('Post reported to moderators.')"><i class="ri-flag-line"></i> Report Post</a>`
//                 }
//             </div>
//         </div>
//     `;

//     return `
//         <div class="card post animate-fade-in" data-author="${post.authorId}" data-postid="${postId}">
//             <div class="post-header">
//                 <div class="post-author" style="cursor:pointer;" onclick="window.location.href = '${isMyPost ? 'profile.html' : 'user.html?id=' + post.authorId}'">
//                     <div class="avatar-text" id="dyn-avatar-${postId}"></div>
//                     <div class="author-info">
//                         <strong id="dyn-name-${postId}">Loading...</strong> 
//                         <span class="badge badge-idea">${isMyPost ? '💡 My Pitch' : '💡 Dev'}</span>
//                     </div>
//                 </div>
//                 ${dropdownHTML}
//             </div>
//             <div class="post-content"><p>${formatContent(post.content)}</p></div>
//             <div class="post-footer">
//                 <div class="likes ${isLiked ? '' : 'unliked'}" data-id="${postId}" data-liked="${isLiked}">
//                     <i class="${isLiked ? 'ph-fill' : 'ph'} ph-rocket"></i> Upvote <span>${post.likedBy ? post.likedBy.length : 0}</span>
//                 </div>
//                 <div class="comments-shares toggle-comments-btn" data-id="${postId}">
//                     <span><i class="ri-chat-3-line"></i> Discuss <span>${commentsList.length}</span></span>
//                 </div>
//             </div>
            
//             <div class="comments-section" id="comments-${postId}" style="display:none; margin-top:15px; border-top:1px dashed var(--border-color); padding-top:15px;">
//                 <div class="comments-list">${commentsHTML}</div>
//                 <div class="comment-input-wrapper" style="display:flex; gap:10px; margin-top:15px; align-items: center;">
//                     ${getAvatarHTML(window.currentUserData?.avatarClass, window.currentUserData?.fullname || 'U')}
//                     <input type="text" id="comment-input-${postId}" placeholder="Write a comment..." style="flex:1; padding:10px 15px; border-radius:20px; border:1px solid var(--border-color); background: var(--bg-color); outline: none;">
//                     <button class="submit-comment-btn" data-id="${postId}" style="background:var(--primary-color); color:white; border-radius:20px; padding:10px 20px; border:none; cursor:pointer; font-weight: 600;"><i class="ri-send-plane-fill"></i></button>
//                 </div>
//             </div>
//         </div>
//     `;
// }

// export async function renderDynamicAuthor(authorId, postId) {
//     const nameEl = document.getElementById(`dyn-name-${postId}`);
//     const avatarEl = document.getElementById(`dyn-avatar-${postId}`);
//     if (!nameEl || !avatarEl) return;

//     let userData = null;
    
//     if (window.currentUserData && authorId === window.currentUserData.uid) {
//         userData = window.currentUserData;
//     } else if (userCache[authorId]) {
//         userData = userCache[authorId];
//     } else {
//         const docSnap = await getDoc(doc(db, "users", authorId));
//         if (docSnap.exists()) {
//             userData = docSnap.data();
//             userCache[authorId] = userData;
//         }
//     }

//     if (userData) {
//         nameEl.innerText = userData.fullname;
//         if (userData.avatarClass && userData.avatarClass.includes('url(')) {
//             avatarEl.style.background = userData.avatarClass;
//             avatarEl.style.backgroundSize = 'cover';
//             avatarEl.style.backgroundPosition = 'center';
//             avatarEl.className = 'avatar-text';
//             avatarEl.innerText = '';
//         } else {
//             avatarEl.className = `avatar-text ${userData.avatarClass || 'bg-primary'}`;
//             avatarEl.style.background = '';
//             avatarEl.innerText = userData.fullname.substring(0, 2).toUpperCase();
//         }
//     } else {
//         nameEl.innerText = "Unknown Dev";
//     }
// }

// // ============================================================================
// // PART 2: THE MODAL SYSTEM (Injection & Drag Logic)
// // ============================================================================

// function injectModalHTML() {
//     if(document.getElementById('global-post-modal')) return; 
//     const modalHTML = `
//     <div class="post-modal-overlay" id="global-post-modal">
//         <div class="post-modal">
//             <div class="modal-drag-handle"></div>
//             <div class="post-modal-header">
//                 <div class="avatar-text bg-primary modal-user-avatar">...</div>
//                 <i class="ri-close-line close-post-modal" id="close-modal-btn"></i>
//             </div>
//             <textarea id="modal-post-textarea" placeholder="Post your idea, architecture, or project roadmap..."></textarea>
//             <div class="post-actions" style="margin-top: auto;">
//                 <div class="action-icons">
//                     <span title="Add Code Snippet" class="markdown-btn"><i class="ph ph-code-block"></i></span> 
//                     <span title="Format Markdown" class="markdown-btn"><i class="ph ph-text-b"></i></span> 
//                 </div>
//                 <button class="btn-post" id="modal-submit-post">Post Idea</button>
//             </div>
//         </div>
//     </div>`;
    
//     document.body.insertAdjacentHTML('beforeend', modalHTML);
//     setupModalDragLogic();
// }

// function openModal() {
//     let overlay = document.getElementById('global-post-modal');
//     if(!overlay) {
//         injectModalHTML();
//         overlay = document.getElementById('global-post-modal');
//     }
    
//     overlay.classList.add('active');
    
//     if(window.currentUserData) {
//         const avatar = overlay.querySelector('.modal-user-avatar');
//         if (window.currentUserData.avatarClass?.includes('url(')) {
//             avatar.style.background = window.currentUserData.avatarClass;
//             avatar.style.backgroundSize = 'cover';
//             avatar.innerText = '';
//         } else {
//             avatar.className = `avatar-text ${window.currentUserData.avatarClass || 'bg-primary'} modal-user-avatar`;
//             avatar.innerText = window.currentUserData.fullname.substring(0,2).toUpperCase();
//         }
//     }
    
//     setTimeout(() => {
//         document.getElementById('modal-post-textarea').focus();
//     }, 300);
// }

// function closeModal() {
//     const overlay = document.getElementById('global-post-modal');
//     if(overlay) {
//         overlay.classList.remove('active');
//         overlay.querySelector('.post-modal').style.transform = ''; 
//         document.getElementById('modal-post-textarea').value = ''; 
//     }
// }

// function setupModalDragLogic() {
//     const overlay = document.getElementById('global-post-modal');
//     const modal = overlay.querySelector('.post-modal');
//     const handle = overlay.querySelector('.modal-drag-handle');
    
//     let startY = 0, currentY = 0, isDragging = false;

//     handle.addEventListener('touchstart', (e) => {
//         startY = e.touches[0].clientY;
//         isDragging = true;
//         modal.classList.add('dragging');
//     }, {passive: true});

//     document.addEventListener('touchmove', (e) => {
//         if (!isDragging) return;
//         currentY = e.touches[0].clientY;
//         const deltaY = currentY - startY;
//         if (deltaY > 0) {
//             e.preventDefault(); 
//             modal.style.transform = `translateY(${deltaY}px)`;
//         }
//     }, { passive: false });

//     document.addEventListener('touchend', (e) => {
//         if (!isDragging) return;
//         isDragging = false;
//         modal.classList.remove('dragging');
//         if (currentY - startY > 120) closeModal();
//         else modal.style.transform = '';
//     });
// }

// // ============================================================================
// // PART 3: GLOBAL INTERACTION LISTENERS (Includes Modal & Pages)
// // ============================================================================

// export function initGlobalPostListeners() {
//     if (window.postEngineListenersAttached) return;
//     window.postEngineListenersAttached = true;

//     injectModalHTML();

//     document.addEventListener('click', async (e) => {
        
//         // --- ROUTING: MODAL vs PAGE CREATION ---
//         if (e.target.closest('#post-modal')) {
//             e.preventDefault(); openModal(); return;
//         }
//         if (e.target.closest('#post-norm')) {
//             e.preventDefault(); window.location.href = 'create-post.html'; return;
//         }

//         // --- MODAL CONTROLS ---
//         if (e.target.id === 'close-modal-btn' || e.target.id === 'global-post-modal') {
//             closeModal(); return;
//         }

//         if (e.target.id === 'modal-submit-post') {
//             const btnPost = e.target;
//             const postTextarea = document.getElementById('modal-post-textarea');
//             const content = postTextarea.value.trim();
//             if (!content || !window.currentUserData) return;
            
//             btnPost.disabled = true; btnPost.innerText = "Posting...";
//             try {
//                 await addDoc(collection(db, "posts"), {
//                     authorId: window.currentUserData.uid,
//                     content: content, likedBy: [], comments: [],
//                     timestamp: new Date().toISOString()
//                 });
//                 closeModal(); 
//             } catch (error) { console.error(error); } 
//             finally { btnPost.disabled = false; btnPost.innerText = "Post Idea"; }
//             return;
//         }

//         // --- MARKDOWN FORMATTING BUTTONS ---
//         const actionIcon = e.target.closest('.markdown-btn');
//         if (actionIcon) {
//             const title = actionIcon.getAttribute('title');
//             let textarea = document.getElementById('modal-post-textarea');
//             if (!textarea || !textarea.closest('.post-modal-overlay.active')) {
//                 textarea = document.getElementById('standalone-post-textarea');
//             }
//             if (!textarea) {
//                 textarea = document.querySelector('.create-post textarea');
//             }
//             if (!textarea) return;

//             let injection = '';
//             if (title && title.includes("Code")) injection = "\n```\n// Paste your code here\n```\n";
//             if (title && title.includes("Format")) injection = "**Bold Text**";
            
//             const start = textarea.selectionStart;
//             const end = textarea.selectionEnd;
//             const val = textarea.value;
//             textarea.value = val.substring(0, start) + injection + val.substring(end);
//             textarea.selectionStart = textarea.selectionEnd = start + injection.length;
//             textarea.focus();
//             textarea.dispatchEvent(new Event('input')); // Trigger input events if needed
//             return;
//         }

//         // --- STANDALONE PAGE SUBMIT BUTTON ---
//         if (e.target.id === 'standalone-submit-post') {
//             const btnPost = e.target;
//             const postTextarea = document.getElementById('standalone-post-textarea');
//             const content = postTextarea.value.trim();
//             if (!content || !window.currentUserData) return;
            
//             btnPost.disabled = true; btnPost.innerText = "Posting...";
//             try {
//                 await addDoc(collection(db, "posts"), {
//                     authorId: window.currentUserData.uid,
//                     content: content, likedBy: [], comments: [],
//                     timestamp: new Date().toISOString()
//                 });
//                 window.location.href = 'index.html'; 
//             } catch (error) { console.error(error); } 
//             finally { btnPost.disabled = false; btnPost.innerText = "Post Idea"; }
//             return;
//         }

//         // --- STANDARD FEED POST INTERACTIONS ---

//         // Dropdowns
//         if (e.target.closest('.toggle-menu-btn')) {
//             e.stopPropagation();
//             const btn = e.target.closest('.toggle-menu-btn');
//             const id = btn.getAttribute('data-id');
//             const menu = document.getElementById(`menu-${id}`);
//             document.querySelectorAll('.post-dropdown-menu').forEach(m => { if (m !== menu) m.classList.remove('show'); });
//             menu.classList.toggle('show');
//             return;
//         }
//         if (!e.target.closest('.post-options-container')) {
//             document.querySelectorAll('.post-dropdown-menu').forEach(m => m.classList.remove('show'));
//         }

//         // Likes
//         if (e.target.closest('.likes')) {
//             const btn = e.target.closest('.likes');
//             const id = btn.getAttribute('data-id');
//             const isLiked = btn.getAttribute('data-liked') === 'true';
            
//             if (isLiked) await updateDoc(doc(db, "posts", id), { likedBy: arrayRemove(auth.currentUser.uid) });
//             else await updateDoc(doc(db, "posts", id), { likedBy: arrayUnion(auth.currentUser.uid) });
//             return;
//         }

//         // Toggle Comments
//         if (e.target.closest('.toggle-comments-btn')) {
//             const btn = e.target.closest('.toggle-comments-btn');
//             const id = btn.getAttribute('data-id');
//             const section = document.getElementById(`comments-${id}`);
//             section.style.display = section.style.display === 'none' ? 'block' : 'none';
//             return;
//         }

//         // Delete Comment
//         if (e.target.closest('.delete-comment-btn')) {
//             const btn = e.target.closest('.delete-comment-btn');
//             const postId = btn.getAttribute('data-postid');
//             const commentId = btn.getAttribute('data-commentid');

//             if(confirm("Are you sure you want to delete this comment?")) {
//                 const postRef = doc(db, "posts", postId);
//                 const postSnap = await getDoc(postRef);
//                 if(postSnap.exists()) {
//                     const postData = postSnap.data();
//                     const updatedComments = postData.comments.filter(c => c.id !== commentId);
//                     await updateDoc(postRef, { comments: updatedComments });
//                 }
//             }
//             return;
//         }

//         // Edit Comment
//         if (e.target.closest('.edit-comment-btn')) {
//             const btn = e.target.closest('.edit-comment-btn');
//             const postId = btn.getAttribute('data-postid');
//             const commentId = btn.getAttribute('data-commentid');
//             const oldText = btn.getAttribute('data-text');

//             const newText = prompt("Edit your comment:", oldText);
//             if(newText !== null && newText.trim() !== "" && newText.trim() !== oldText) {
//                 const postRef = doc(db, "posts", postId);
//                 const postSnap = await getDoc(postRef);
//                 if(postSnap.exists()) {
//                     const postData = postSnap.data();
//                     const updatedComments = postData.comments.map(c => {
//                         if(c.id === commentId) {
//                             return { ...c, text: newText.trim(), edited: true };
//                         }
//                         return c;
//                     });
//                     await updateDoc(postRef, { comments: updatedComments });
//                 }
//             }
//             return;
//         }

//         // Submit Comment
//         if (e.target.closest('.submit-comment-btn')) {
//             const btn = e.target.closest('.submit-comment-btn');
//             const id = btn.getAttribute('data-id');
//             const input = document.getElementById(`comment-input-${id}`);
//             if(!input.value.trim()) return;

//             btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i>'; 
            
//             const newComment = {
//                 id: Date.now().toString() + Math.random().toString(36).substr(2, 5), // Generate unique ID
//                 author: window.currentUserData.fullname,
//                 text: input.value.trim(),
//                 uid: auth.currentUser.uid,
//                 avatarClass: window.currentUserData.avatarClass || '',
//                 timestamp: new Date().toISOString()
//             };

//             await updateDoc(doc(db, "posts", id), { 
//                 comments: arrayUnion(newComment) 
//             });
//             input.value = '';
//             btn.innerHTML = '<i class="ri-send-plane-fill"></i>';
//             return;
//         }

//         // Share Post
//         if (e.target.closest('.share-post-btn')) {
//             e.stopPropagation();
//             const btn = e.target.closest('.share-post-btn');
//             const id = btn.getAttribute('data-id');
//             const shareUrl = `${window.location.origin}/post.html?id=${id}`;
            
//             try {
//                 if (navigator.share) {
//                     await navigator.share({ title: 'Nerd Arena Pitch', url: shareUrl });
//                 } else {
//                     await navigator.clipboard.writeText(shareUrl); 
//                     alert("Link copied to clipboard!"); 
//                 }
//             } catch (err) {}
            
//             document.querySelectorAll('.post-dropdown-menu').forEach(m => m.classList.remove('show'));
//             return;
//         }

//         // Delete Post
//         if (e.target.closest('.delete-post-btn')) {
//             const btn = e.target.closest('.delete-post-btn');
//             if(confirm("Are you sure you want to delete this pitch?")) {
//                 await deleteDoc(doc(db, "posts", btn.getAttribute('data-id')));
//                 if(window.location.pathname.includes('post.html')) window.location.href = "index.html";
//             }
//             return;
//         }
//     });
    
//     // Allow submitting comment with Enter key
//     document.addEventListener('keypress', (e) => {
//         if (e.key === 'Enter' && e.target.id.startsWith('comment-input-')) {
//             e.preventDefault();
//             const postId = e.target.id.replace('comment-input-', '');
//             document.querySelector(`.submit-comment-btn[data-id="${postId}"]`).click();
//         }
//     });
// }

// // ============================================================================
// // PART 4: SINGLE POST PAGE LOGIC (Runs automatically if on post.html)
// // ============================================================================

// document.addEventListener('userDataLoaded', () => {
//     const container = document.getElementById('single-post-container');
//     if (!container) return; 

//     const urlParams = new URLSearchParams(window.location.search);
//     const targetPostId = urlParams.get('id');

//     if (!targetPostId) {
//         container.innerHTML = "<p style='text-align:center;'>Invalid post link.</p>";
//         return;
//     }

//     initGlobalPostListeners(); 
    
//     onSnapshot(doc(db, "posts", targetPostId), (docSnap) => {
//         if (!docSnap.exists()) {
//             container.innerHTML = "<p style='text-align:center; color:var(--text-muted); padding:40px;'>This pitch was deleted or does not exist.</p>";
//             return;
//         }

//         const post = docSnap.data();
//         container.innerHTML = createPostHTML(post, targetPostId, auth.currentUser.uid);
//         renderDynamicAuthor(post.authorId, targetPostId);
        
//         const commentSection = document.getElementById(`comments-${targetPostId}`);
//         if(commentSection) commentSection.style.display = 'block';
//     });
// });





















// post.js - Pure Javascript Social Engine with Modern UI
import { db, auth } from './firebase.js';
import { doc, getDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, onSnapshot, collection, addDoc, deleteField } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

export const userCache = {};

// Global variables for Link Preview State
window.currentLinkPreview = null;
window.rejectedLinkPreviews = []; // Remembers links you closed so they don't auto-reload

// ============================================================================
// PART 1: CUSTOM UI, STYLES & LINK PREVIEW ENGINE
// ============================================================================

function injectPostStyles() {
    if (document.getElementById('post-dynamic-styles')) return;
    const style = document.createElement('style');
    style.id = 'post-dynamic-styles';
    style.innerHTML = `
        /* --- Facebook-style Link Previews --- */
        .fb-link-card {
            display: block; border: 1px solid var(--border-color); border-radius: 12px;
            overflow: hidden; margin-top: 15px; text-decoration: none; background: var(--bg-color);
            transition: 0.2s; box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }
        .fb-link-card:hover { border-color: var(--primary-color); box-shadow: 0 8px 20px rgba(0,0,0,0.06); transform: translateY(-2px); }
        .fb-link-img {
            width: 100%; height: 220px; object-fit: cover; background: #e5e7eb;
            border-bottom: 1px solid var(--border-color); display: block;
        }
        .fb-link-info { padding: 12px 16px; }
        .fb-link-domain { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; display: block; font-weight: 700; }
        .fb-link-title { font-size: 1.05rem; color: var(--text-main); font-weight: 700; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .fb-link-desc { font-size: 0.9rem; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; }
        
        /* Live Preview Draft Box */
        .live-preview-box { position: relative; margin-top: 10px; display: none; animation: fadeInUp 0.3s ease; }
        .live-preview-box.active { display: block; }
        .remove-preview-btn {
            position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.6); color: white;
            width: 28px; height: 28px; border-radius: 50%; display: flex; justify-content: center; align-items: center;
            cursor: pointer; z-index: 10; transition: 0.2s; border: none; font-size: 1.2rem;
        }
        .remove-preview-btn:hover { background: #dc2626; transform: scale(1.1); }
        .preview-loading { padding: 20px; text-align: center; color: var(--text-muted); font-size: 0.9rem; font-weight: 600; border: 1px dashed var(--border-color); border-radius: 12px; margin-top: 10px; }
    `;
    document.head.appendChild(style);
}

// Fetch OpenGraph data for the link
async function fetchLinkPreview(url, previewContainer) {
    if (window.currentLinkPreview && window.currentLinkPreview.url === url) return; 
    
    previewContainer.innerHTML = `<div class="preview-loading"><i class="ri-loader-4-line ri-spin"></i> Generating Link Preview...</div>`;
    previewContainer.classList.add('active');

    try {
        const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        
        if (data.status === 'success') {
            const domain = new URL(url).hostname.replace('www.', '');
            window.currentLinkPreview = {
                url: url,
                title: data.data.title || domain,
                description: data.data.description || '',
                image: data.data.image?.url || `https://s2.googleusercontent.com/s2/favicons?domain=${domain}&sz=256`,
                domain: domain
            };

            previewContainer.innerHTML = `
                <button class="remove-preview-btn" onclick="window.clearLivePreview(this)"><i class="ri-close-line"></i></button>
                <div class="fb-link-card" style="margin-top: 0;">
                    <img src="${window.currentLinkPreview.image}" class="fb-link-img" onerror="this.src='https://s2.googleusercontent.com/s2/favicons?domain=${domain}&sz=256'; this.style.objectFit='contain'; this.style.padding='20px';">
                    <div class="fb-link-info">
                        <span class="fb-link-domain">${window.currentLinkPreview.domain}</span>
                        <div class="fb-link-title">${window.currentLinkPreview.title}</div>
                        <div class="fb-link-desc">${window.currentLinkPreview.description}</div>
                    </div>
                </div>
            `;
        } else {
            previewContainer.classList.remove('active');
            window.currentLinkPreview = null;
        }
    } catch (error) {
        previewContainer.classList.remove('active');
        window.currentLinkPreview = null;
    }
}

// Global function to remove the live preview while drafting
window.clearLivePreview = function(btnElement) {
    if (window.currentLinkPreview) {
        // Remember that the user closed this link so we don't auto-fetch it while they type
        if (!window.rejectedLinkPreviews.includes(window.currentLinkPreview.url)) {
            window.rejectedLinkPreviews.push(window.currentLinkPreview.url);
        }
    }
    
    window.currentLinkPreview = null;
    const container = btnElement.closest('.live-preview-box');
    if (container) {
        container.innerHTML = '';
        container.classList.remove('active');
    }
};

function formatDateTime(isoString) {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    const timeStr = date.toLocaleTimeString(undefined, timeOptions);
    if (isToday) return `Today at ${timeStr}`;
    return `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at ${timeStr}`;
}

// Reusable Modals
function showCustomConfirm(message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'post-modal-overlay active';
    overlay.style.zIndex = '999999';
    overlay.innerHTML = `<div class="post-modal" style="max-width: 400px; text-align: center; padding: 30px;"><i class="ri-error-warning-line text-danger" style="font-size: 3rem; margin-bottom: 15px;"></i><h3 style="color: var(--text-main); margin-bottom: 10px;">Are you sure?</h3><p style="color: var(--text-muted); margin-bottom: 25px;">${message}</p><div style="display: flex; gap: 15px; justify-content: center;"><button id="cancel-btn" style="flex: 1; padding: 12px; border-radius: 12px; background: transparent; border: 2px solid var(--border-color); color: var(--text-main); font-weight: 600; cursor: pointer;">Cancel</button><button id="confirm-btn" style="flex: 1; padding: 12px; border-radius: 12px; background: #dc2626; color: white; border: none; font-weight: 600; cursor: pointer;">Yes, Delete</button></div></div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#cancel-btn').onclick = () => overlay.remove();
    overlay.querySelector('#confirm-btn').onclick = () => { onConfirm(); overlay.remove(); };
}

function showCustomPrompt(message, defaultValue, onSave) {
    const overlay = document.createElement('div');
    overlay.className = 'post-modal-overlay active';
    overlay.style.zIndex = '999999';
    overlay.innerHTML = `<div class="post-modal" style="max-width: 500px; padding: 25px;"><h3 style="color: var(--text-main); margin-bottom: 15px;">${message}</h3><textarea id="prompt-input" style="width: 100%; min-height: 100px; padding: 15px; border-radius: 12px; border: 1px solid var(--border-color); background: var(--bg-color); color: var(--text-main); font-family: inherit; font-size: 1rem; resize: none; margin-bottom: 20px; outline: none;"></textarea><div style="display: flex; gap: 15px; justify-content: flex-end;"><button id="cancel-btn" style="padding: 10px 20px; border-radius: 12px; background: transparent; border: 2px solid var(--border-color); color: var(--text-main); font-weight: 600; cursor: pointer;">Cancel</button><button id="save-btn" style="padding: 10px 20px; border-radius: 12px; background: var(--primary-color); color: white; border: none; font-weight: 600; cursor: pointer;">Save Changes</button></div></div>`;
    document.body.appendChild(overlay);
    const input = overlay.querySelector('#prompt-input');
    input.value = defaultValue; input.focus();
    overlay.querySelector('#cancel-btn').onclick = () => overlay.remove();
    overlay.querySelector('#save-btn').onclick = () => { onSave(input.value); overlay.remove(); };
}

// ============================================================================
// PART 2: THE GLOBAL POST ENGINE
// ============================================================================

export function formatContent(text, ignoreUrls = false) {
    if (!text) return "";
    let safe = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    safe = safe.replace(/```([\s\S]*?)```/g, '<div class="code-block"><pre><code>$1</code></pre></div>');
    safe = safe.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Always format inline URLs unless we are generating a standalone Rich Card from an API
    if (!ignoreUrls) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        safe = safe.replace(urlRegex, (url) => {
            return `<a href="${url}" target="_blank" class="rich-link" style="color: var(--primary-color); text-decoration: underline;">${url}</a>`;
        });
    }
    return safe.replace(/\n/g, '<br>');
}

export function createPostHTML(post, postId, currentUserId) {
    const isLiked = post.likedBy && post.likedBy.includes(currentUserId);
    const isMyPost = post.authorId === currentUserId;
    const commentsList = post.comments || [];
    const timeStr = formatDateTime(post.timestamp);
    const editedTag = post.edited ? '<span style="font-size: 0.75rem; color: var(--text-muted);">(edited)</span>' : '';
    
    let commentsHTML = commentsList.map(c => createCommentHTML(c, postId, currentUserId)).join('');

    // --- RENDER FACEBOOK STYLE PREVIEW CARD IF DATA EXISTS ---
    let previewCardHTML = '';
    // Format text, leaving URLs intact in the text block
    let contentText = formatContent(post.content, false);

    if (post.linkPreview) {
        previewCardHTML = `
            <a href="${post.linkPreview.url}" target="_blank" class="fb-link-card">
                <img src="${post.linkPreview.image}" class="fb-link-img" onerror="this.src='https://s2.googleusercontent.com/s2/favicons?domain=${post.linkPreview.domain}&sz=256'; this.style.objectFit='contain'; this.style.padding='20px';">
                <div class="fb-link-info">
                    <span class="fb-link-domain">${post.linkPreview.domain}</span>
                    <div class="fb-link-title">${post.linkPreview.title}</div>
                    <div class="fb-link-desc">${post.linkPreview.description}</div>
                </div>
            </a>
        `;
    }

    const dropdownHTML = `
        <div class="post-options-container">
            <button class="btn-more toggle-menu-btn" data-id="${postId}"><i class="ri-more-fill"></i></button>
            <div class="post-dropdown-menu" id="menu-${postId}">
                <a class="share-post-btn" data-id="${postId}"><i class="ri-share-forward-line"></i> Share</a>
                ${isMyPost ? `
                    <a class="edit-post-btn" data-id="${postId}"><i class="ri-edit-line"></i> Edit Post</a>
                    <a class="delete-post-btn text-danger" data-id="${postId}"><i class="ri-delete-bin-line"></i> Delete Post</a>`
                : `<a class="report-post-btn" onclick="alert('Post reported.')"><i class="ri-flag-line"></i> Report</a>`
                }
            </div>
        </div>
    `;

    return `
        <div class="card post animate-fade-in" data-author="${post.authorId}" data-postid="${postId}">
            <div class="post-header">
                <div class="post-author" style="cursor:pointer;" onclick="window.location.href = '${isMyPost ? 'profile.html' : 'user.html?id=' + post.authorId}'">
                    <div class="avatar-text pload-item" id="dyn-avatar-${postId}"></div>
                    <div class="author-info">
                        <div>
                            <strong class="pload-item" id="dyn-name-${postId}" style="display:inline-block; min-width: 100px;">Loading...</strong> 
                            <span class="badge badge-idea">${isMyPost ? '💡 My Pitch' : '💡 Dev'}</span>
                        </div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                            ${timeStr} ${editedTag}
                        </div>
                    </div>
                </div>
                ${dropdownHTML}
            </div>
            
            <div class="post-content">
                <p>${contentText}</p>
                ${previewCardHTML}
            </div>
            
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
                    <div class="avatar-text my-avatar pload-item" style="width: 35px; height: 35px; min-width: 35px; font-size: 0.8rem;"></div>
                    <input type="text" id="comment-input-${postId}" placeholder="Suggest an idea..." style="flex:1; padding:10px 15px; border-radius:20px; border:1px solid var(--border-color);">
                    <button class="submit-comment-btn" data-id="${postId}" style="background:var(--primary-color); color:white; border-radius:20px; padding:0 15px; border:none; cursor:pointer;"><i class="ri-send-plane-fill"></i></button>
                </div>
            </div>
        </div>
    `;
}

function createCommentHTML(c, postId, currentUserId) {
    const isMyComment = c.uid === currentUserId;
    const editedTag = c.edited ? '<span style="font-size: 0.7rem; color: var(--text-muted); margin-left: 5px;">(edited)</span>' : '';
    const timeStr = formatDateTime(c.timestamp);
    const commId = c.id || 'old_' + Math.random().toString(36).substr(2, 5);
    const authorId = c.authorId || c.uid || '';

    return `
        <div class="comment-item modern-bubble" style="display: flex; gap: 10px; margin-bottom: 15px; align-items: start;">
            <div class="avatar-text comment-avatar pload-item" id="dyn-avatar-comm-${commId}" style="width: 35px; height: 35px; min-width: 35px;"></div>
            <div style="flex: 1;">
                <div style="background: var(--bg-color); padding: 10px 15px; border-radius: 0 12px 12px 12px; border: 1px solid var(--border-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                        <strong class="pload-item dyn-comment-name" data-authorid="${authorId}" data-commid="${commId}" id="dyn-name-comm-${commId}" style="font-size: 0.9rem; color: var(--text-main); display: inline-block; min-width: 80px;">Loading...</strong>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">${timeStr}</span>
                    </div>
                    <p id="comment-text-${commId}" style="margin: 0; font-size: 0.95rem; color: var(--text-main); line-height: 1.4;">${c.text.replace(/</g, "&lt;").replace(/>/g, "&gt;")} ${editedTag}</p>
                </div>
                ${isMyComment ? `
                <div style="margin-top: 6px; margin-left: 5px; font-size: 0.8rem; display: flex; gap: 12px; font-weight: 600;">
                    <span class="edit-comment-btn" data-postid="${postId}" data-commentid="${commId}" style="color: var(--text-muted); cursor: pointer; transition: 0.2s;">Edit</span>
                    <span class="delete-comment-btn" data-postid="${postId}" data-commentid="${commId}" style="color: var(--text-muted); cursor: pointer; transition: 0.2s;">Delete</span>
                </div>
                ` : ''}
            </div>
        </div>`;
}

export async function renderDynamicAuthor(authorId, postId, commId = null) {
    const target = commId ? `comm-${commId}` : postId;
    const nameEl = document.getElementById(`dyn-name-${target}`);
    const avatarEl = document.getElementById(`dyn-avatar-${target}`);
    
    if (!commId) {
        setTimeout(() => {
            const postCard = document.querySelector(`.card.post[data-postid="${postId}"]`);
            if (postCard) {
                postCard.querySelectorAll('.dyn-comment-name').forEach(el => {
                    const cAuthorId = el.getAttribute('data-authorid');
                    const cId = el.getAttribute('data-commid');
                    if (cAuthorId && cId) renderDynamicAuthor(cAuthorId, postId, cId); 
                });
            }
        }, 50);
    }

    if (!nameEl || !avatarEl) return;
    if (!authorId) {
        nameEl.innerText = "Unknown Dev"; nameEl.classList.remove('pload-item');
        avatarEl.className = 'avatar-text bg-primary'; avatarEl.style.background = '';
        avatarEl.innerText = '?'; avatarEl.classList.remove('pload-item');
        return;
    }

    let userData = null;
    if (window.currentUserData && authorId === window.currentUserData.uid) {
        userData = window.currentUserData;
        document.querySelectorAll('.my-avatar').forEach(el => {
            if (userData.avatarClass?.includes('url(')) {
                el.style.background = userData.avatarClass; el.style.backgroundSize = 'cover'; el.innerText = '';
            } else {
                el.className = `avatar-text my-avatar ${userData.avatarClass || 'bg-primary'}`;
                el.innerText = userData.fullname.substring(0, 2).toUpperCase();
            }
            el.classList.remove('pload-item');
        });
    } else if (userCache[authorId]) {
        userData = userCache[authorId];
    } else {
        try {
            const docSnap = await getDoc(doc(db, "users", authorId));
            if (docSnap.exists()) { userData = docSnap.data(); userCache[authorId] = userData; }
        } catch(e) {}
    }

    if (userData) {
        nameEl.innerText = userData.fullname || 'Dev User'; nameEl.classList.remove('pload-item');
        if (userData.avatarClass && userData.avatarClass.includes('url(')) {
            avatarEl.style.background = userData.avatarClass; avatarEl.style.backgroundSize = 'cover';
            avatarEl.style.backgroundPosition = 'center'; avatarEl.innerText = '';
        } else {
            avatarEl.className = `avatar-text ${userData.avatarClass || 'bg-primary'}`; avatarEl.style.background = '';
            avatarEl.innerText = (userData.fullname || 'U').substring(0, 2).toUpperCase();
        }
        avatarEl.classList.remove('pload-item');
    } else {
        nameEl.innerText = "Deleted User"; nameEl.classList.remove('pload-item');
        avatarEl.className = 'avatar-text bg-primary'; avatarEl.style.background = '';
        avatarEl.innerText = 'U'; avatarEl.classList.remove('pload-item');
    }
}

// ============================================================================
// PART 3: THE MODAL SYSTEM
// ============================================================================

function injectModalHTML() {
    if(document.getElementById('global-post-modal')) return; 
    const modalHTML = `
    <div class="post-modal-overlay" id="global-post-modal">
        <div class="post-modal">
            <div class="modal-drag-handle"></div>
            <div class="post-modal-header">
                <div class="avatar-text bg-primary modal-user-avatar">...</div>
                <i class="ri-close-line close-post-modal" id="close-modal-btn"></i>
            </div>
            
            <textarea id="modal-post-textarea" placeholder="What do you want to build? Post ideas, architecture, links..."></textarea>
            
            <div id="modal-link-preview" class="live-preview-box"></div>
            
            <div class="post-actions" style="margin-top: 15px;">
                <div class="action-icons">
                    <span title="Load Link Preview" class="preview-trigger-btn markdown-btn"><i class="ph ph-link"></i></span> 
                    <span title="Add Code Snippet" class="markdown-btn"><i class="ph ph-code-block"></i></span> 
                    <span title="Format Markdown" class="markdown-btn"><i class="ph ph-text-b"></i></span> 
                </div>
                <button class="btn-post" id="modal-submit-post">Post Idea</button>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setupModalDragLogic();
}

function openModal() {
    let overlay = document.getElementById('global-post-modal');
    if(!overlay) { injectModalHTML(); overlay = document.getElementById('global-post-modal'); }
    overlay.classList.add('active');
    
    if(window.currentUserData) {
        const avatar = overlay.querySelector('.modal-user-avatar');
        if (window.currentUserData.avatarClass?.includes('url(')) {
            avatar.style.background = window.currentUserData.avatarClass;
            avatar.style.backgroundSize = 'cover'; avatar.innerText = '';
        } else {
            avatar.className = `avatar-text ${window.currentUserData.avatarClass || 'bg-primary'} modal-user-avatar`;
            avatar.innerText = window.currentUserData.fullname.substring(0,2).toUpperCase();
        }
    }
    setTimeout(() => document.getElementById('modal-post-textarea').focus(), 300);
}

function closeModal() {
    const overlay = document.getElementById('global-post-modal');
    if(overlay) {
        overlay.classList.remove('active');
        overlay.querySelector('.post-modal').style.transform = ''; 
        document.getElementById('modal-post-textarea').value = ''; 
        window.clearLivePreview(document.getElementById('modal-link-preview'));
    }
}

function setupModalDragLogic() {
    const overlay = document.getElementById('global-post-modal');
    const modal = overlay.querySelector('.post-modal');
    const handle = overlay.querySelector('.modal-drag-handle');
    let startY = 0, currentY = 0, isDragging = false;

    handle.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; isDragging = true; modal.classList.add('dragging'); }, {passive: true});
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return; currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;
        if (deltaY > 0) { e.preventDefault(); modal.style.transform = `translateY(${deltaY}px)`; }
    }, { passive: false });
    document.addEventListener('touchend', (e) => {
        if (!isDragging) return; isDragging = false; modal.classList.remove('dragging');
        if (currentY - startY > 120) closeModal(); else modal.style.transform = '';
    });
}

// ============================================================================
// PART 4: GLOBAL INTERACTION LISTENERS 
// ============================================================================

export function initGlobalPostListeners() {
    if (window.postEngineListenersAttached) return;
    window.postEngineListenersAttached = true;
    injectPostStyles(); 
    injectModalHTML();

    // Setup Live Preview listeners for standalone page if it exists
    const standaloneTextarea = document.getElementById('standalone-post-textarea');
    if (standaloneTextarea) {
        if (!document.getElementById('standalone-link-preview')) {
            standaloneTextarea.insertAdjacentHTML('afterend', '<div id="standalone-link-preview" class="live-preview-box"></div>');
        }
        const actionIcons = standaloneTextarea.closest('.card')?.querySelector('.action-icons');
        if (actionIcons && !actionIcons.querySelector('.preview-trigger-btn')) {
            actionIcons.insertAdjacentHTML('afterbegin', '<span title="Load Link Preview" class="preview-trigger-btn markdown-btn"><i class="ph ph-link"></i></span> ');
        }
    }

    // 1. SMART KEYBOARD SHORTCUTS (Ctrl+B)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
            const activeEl = document.activeElement;
            if (activeEl && activeEl.tagName === 'TEXTAREA') {
                e.preventDefault(); 
                const start = activeEl.selectionStart; const end = activeEl.selectionEnd;
                const val = activeEl.value; const selectedText = val.substring(start, end);
                let injection = ''; let newStart = 0; let newEnd = 0;
                
                if (selectedText.length > 0) {
                    injection = `**${selectedText}**`;
                    newStart = newEnd = start + injection.length;
                } else {
                    injection = "**bold**";
                    newStart = start + 2; newEnd = start + 6;
                }
                
                activeEl.value = val.substring(0, start) + injection + val.substring(end);
                activeEl.selectionStart = newStart; activeEl.selectionEnd = newEnd;
                activeEl.dispatchEvent(new Event('input'));
            }
        }
    });

    // 2. LIVE URL DETECTION LISTENER (Debounced)
    let typingTimer;
    document.addEventListener('input', (e) => {
        if (e.target.tagName === 'TEXTAREA' && (e.target.id === 'modal-post-textarea' || e.target.id === 'standalone-post-textarea')) {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => {
                const text = e.target.value;
                const urlRegex = /(https?:\/\/[^\s]+)/;
                const match = text.match(urlRegex);
                
                const previewContainer = e.target.id === 'modal-post-textarea' 
                    ? document.getElementById('modal-link-preview') 
                    : document.getElementById('standalone-link-preview');
                
                // Only auto-fetch if we found a URL, it's different from the current one, AND the user hasn't actively rejected it
                if (match && previewContainer && (!window.currentLinkPreview || window.currentLinkPreview.url !== match[0])) {
                    if (!window.rejectedLinkPreviews.includes(match[0])) {
                        fetchLinkPreview(match[0], previewContainer);
                    }
                } else if (!match && previewContainer && window.currentLinkPreview) {
                    window.clearLivePreview(previewContainer);
                }
            }, 800); // 800ms debounce
        }
    });

    document.addEventListener('click', async (e) => {
        const t = e.target;

        // Routing
        if (t.closest('#post-modal')) { e.preventDefault(); openModal(); return; }
        if (t.closest('#post-norm')) { e.preventDefault(); window.location.href = 'create-post.html'; return; }

        // Modal Controls
        if (t.id === 'close-modal-btn' || t.id === 'global-post-modal') { closeModal(); return; }

        // Modal Submit
        if (t.id === 'modal-submit-post') {
            const btnPost = t;
            const postTextarea = document.getElementById('modal-post-textarea');
            const content = postTextarea.value.trim();
            if (!content || !window.currentUserData) return;
            
            btnPost.disabled = true; btnPost.innerText = "Posting...";
            
            const payload = {
                authorId: window.currentUserData.uid,
                content: content, likedBy: [], comments: [],
                timestamp: new Date().toISOString()
            };
            
            // Attach link preview data explicitly
            if (window.currentLinkPreview) {
                payload.linkPreview = window.currentLinkPreview;
            }

            try {
                await addDoc(collection(db, "posts"), payload);
                closeModal(); 
            } catch (error) {} finally { btnPost.disabled = false; btnPost.innerText = "Post Idea"; }
            return;
        }

        // 3. SMART MARKDOWN & PREVIEW BUTTONS
        const actionIcon = t.closest('.markdown-btn');
        if (actionIcon) {
            const title = actionIcon.getAttribute('title');
            let textarea = document.getElementById('modal-post-textarea');
            if (!textarea || !textarea.closest('.post-modal-overlay.active')) textarea = document.getElementById('standalone-post-textarea');
            if (!textarea) textarea = document.querySelector('.create-post textarea');
            if (!textarea) return;

            // Manual Link Preview Trigger
            if (title && title.includes("Link")) {
                const urlRegex = /(https?:\/\/[^\s]+)/;
                const match = textarea.value.match(urlRegex);
                
                if (match) {
                    const previewContainer = textarea.id === 'modal-post-textarea' 
                        ? document.getElementById('modal-link-preview') 
                        : document.getElementById('standalone-link-preview');
                    if (previewContainer) {
                        // Un-reject the link so it can be loaded again
                        window.rejectedLinkPreviews = window.rejectedLinkPreviews.filter(u => u !== match[0]);
                        window.currentLinkPreview = null; 
                        fetchLinkPreview(match[0], previewContainer);
                    }
                } else {
                    alert("No valid URL found in your text.");
                }
                return;
            }

            const start = textarea.selectionStart; const end = textarea.selectionEnd;
            const val = textarea.value; const selectedText = val.substring(start, end);
            let injection = ''; let newStart = start; let newEnd = end;

            if (title && title.includes("Code")) {
                if (selectedText.length > 0) {
                    injection = `\n\`\`\`\n${selectedText}\n\`\`\`\n`;
                    newStart = newEnd = start + injection.length;
                } else {
                    injection = "\n```\n// Paste your code here\n```\n";
                    newStart = start + 5; newEnd = start + 27;
                }
            }
            if (title && title.includes("Format")) {
                if (selectedText.length > 0) {
                    injection = `**${selectedText}**`;
                    newStart = newEnd = start + injection.length;
                } else {
                    injection = "**bold**";
                    newStart = start + 2; newEnd = start + 6;
                }
            }
            
            textarea.value = val.substring(0, start) + injection + val.substring(end);
            textarea.selectionStart = newStart; textarea.selectionEnd = newEnd;
            textarea.focus(); textarea.dispatchEvent(new Event('input'));
            return;
        }

        // --- STANDALONE PAGE SUBMIT BUTTON (Handles Create AND Edit) ---
        if (t.id === 'standalone-submit-post') {
            const btnPost = t;
            const postTextarea = document.getElementById('standalone-post-textarea');
            const content = postTextarea.value.trim();
            const editId = btnPost.getAttribute('data-edit-id'); 
            
            if (!content || !window.currentUserData) return;
            
            btnPost.disabled = true; btnPost.innerText = editId ? "Saving..." : "Posting...";
            
            const payload = { content: content };
            if (!editId) {
                payload.authorId = window.currentUserData.uid;
                payload.likedBy = []; payload.comments = [];
                payload.timestamp = new Date().toISOString();
            } else {
                payload.edited = true;
                payload.lastEdited = new Date().toISOString();
            }

            // Explicitly handle Preview logic for Edit vs Create
            if (window.currentLinkPreview) {
                payload.linkPreview = window.currentLinkPreview;
            } else if (editId) {
                // If user X'd out the preview during an edit, wipe it from Firestore
                payload.linkPreview = deleteField();
            }

            try {
                if (editId) {
                    await updateDoc(doc(db, "posts", editId), payload);
                } else {
                    await addDoc(collection(db, "posts"), payload);
                }
                window.currentLinkPreview = null; 
                window.rejectedLinkPreviews = [];
                window.location.href = 'index.html'; 
            } catch (error) {} finally { btnPost.disabled = false; btnPost.innerText = editId ? "Save Changes" : "Post Idea"; }
            return;
        }

        // 3-Dots Dropdown
        if (t.closest('.toggle-menu-btn')) {
            e.stopPropagation();
            const id = t.closest('.toggle-menu-btn').getAttribute('data-id');
            const menu = document.getElementById(`menu-${id}`);
            document.querySelectorAll('.post-dropdown-menu').forEach(m => m !== menu && m.classList.remove('show'));
            menu.classList.toggle('show');
            return;
        }
        if (!t.closest('.post-options-container')) document.querySelectorAll('.post-dropdown-menu').forEach(m => m.classList.remove('show'));

        // Likes
        if (t.closest('.likes')) {
            const btn = t.closest('.likes');
            const id = btn.getAttribute('data-id');
            const isLiked = btn.getAttribute('data-liked') === 'true';
            const span = btn.querySelector('span');
            let newCount = parseInt(span.innerText);
            
            if(isLiked) {
                btn.classList.add('unliked'); btn.setAttribute('data-liked', 'false');
                btn.querySelector('i').className = 'ph ph-rocket'; newCount = Math.max(0, newCount - 1);
            } else {
                btn.classList.remove('unliked'); btn.setAttribute('data-liked', 'true');
                btn.querySelector('i').className = 'ph-fill ph-rocket'; newCount++;
            }
            span.innerText = newCount;

            try {
                if (isLiked) await updateDoc(doc(db, "posts", id), { likedBy: arrayRemove(auth.currentUser.uid) });
                else await updateDoc(doc(db, "posts", id), { likedBy: arrayUnion(auth.currentUser.uid) });
            } catch(e) {}
            return;
        }

        // Toggle Comments
        if (t.closest('.toggle-comments-btn')) {
            const id = t.closest('.toggle-comments-btn').getAttribute('data-id');
            const section = document.getElementById(`comments-${id}`);
            if(section) section.style.display = section.style.display === 'none' ? 'block' : 'none';
            return;
        }

        // Submit Comment
        if (t.closest('.submit-comment-btn')) {
            const btn = t.closest('.submit-comment-btn');
            const id = btn.getAttribute('data-id');
            const input = document.getElementById(`comment-input-${id}`);
            const text = input.value.trim();
            if(!text || !auth.currentUser) return;

            btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i>'; 
            const newCommId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
            await updateDoc(doc(db, "posts", id), { 
                comments: arrayUnion({ id: newCommId, authorId: auth.currentUser.uid, text: text, uid: auth.currentUser.uid, timestamp: new Date().toISOString() }) 
            });
            input.value = ''; btn.innerHTML = '<i class="ri-send-plane-fill"></i>';
            return;
        }

        // Edit Comment
        if (t.closest('.edit-comment-btn')) {
            const btn = t.closest('.edit-comment-btn');
            const postId = btn.getAttribute('data-postid');
            const commentId = btn.getAttribute('data-commentid');
            const textEl = document.getElementById(`comment-text-${commentId}`);
            if(!textEl) return;

            const cleanText = textEl.innerText.replace('(edited)', '').trim();
            showCustomPrompt("Edit your comment:", cleanText, async (newText) => {
                if (newText.trim() !== "" && newText.trim() !== cleanText) {
                    textEl.innerText = "Updating...";
                    const postRef = doc(db, "posts", postId);
                    const postSnap = await getDoc(postRef);
                    if(postSnap.exists()) {
                        const postData = postSnap.data();
                        const updatedComments = postData.comments.map(c => 
                            c.id === commentId ? { ...c, text: newText.trim(), edited: true } : c
                        );
                        await updateDoc(postRef, { comments: updatedComments });
                    }
                }
            });
            return;
        }

        // Delete Comment
        if (t.closest('.delete-comment-btn')) {
            const btn = t.closest('.delete-comment-btn');
            const postId = btn.getAttribute('data-postid');
            const commentId = btn.getAttribute('data-commentid');

            showCustomConfirm("This comment will be permanently deleted.", async () => {
                const commentEl = t.closest('.comment-item');
                if(commentEl) { commentEl.style.opacity = '0.5'; commentEl.style.pointerEvents = 'none'; }
                const postRef = doc(db, "posts", postId);
                const postSnap = await getDoc(postRef);
                if(postSnap.exists()) {
                    const postData = postSnap.data();
                    const updatedComments = postData.comments.filter(c => c.id !== commentId);
                    await updateDoc(postRef, { comments: updatedComments });
                }
            });
            return;
        }

        // Edit Post
        if (t.closest('.edit-post-btn')) {
            const postId = t.closest('.edit-post-btn').getAttribute('data-id');
            window.location.href = `create-post.html?edit=${postId}`;
            return;
        }

        // Delete Post
        if (t.closest('.delete-post-btn')) {
            const postId = t.closest('.delete-post-btn').getAttribute('data-id');
            showCustomConfirm("This pitch will be permanently deleted from the arena.", async () => {
                await deleteDoc(doc(db, "posts", postId));
                const postCard = t.closest('.card.post');
                if(postCard) { postCard.classList.add('animate-fade-out'); setTimeout(() => postCard.remove(), 400); }
                if(window.location.pathname.includes('post.html')) window.location.href = "index.html";
            });
            return;
        }

        // Share Post
        if (t.closest('.share-post-btn')) {
            e.stopPropagation();
            const id = t.closest('.share-post-btn').getAttribute('data-id');
            const shareUrl = `${window.location.origin}/post.html?id=${id}`;
            try {
                if (navigator.share) await navigator.share({ title: 'Nerd Arena Pitch', url: shareUrl });
                else { await navigator.clipboard.writeText(shareUrl); alert("Link copied!"); }
            } catch (err) {}
            document.querySelectorAll('.post-dropdown-menu').forEach(m => m.classList.remove('show'));
            return;
        }
    });

    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.id.startsWith('comment-input-')) {
            e.preventDefault();
            const postId = e.target.id.replace('comment-input-', '');
            const submitBtn = document.querySelector(`.submit-comment-btn[data-id="${postId}"]`);
            if(submitBtn) submitBtn.click();
        }
    });
}

// ============================================================================
// PART 5: PAGE-SPECIFIC INITIALIZATIONS
// ============================================================================

document.addEventListener('userDataLoaded', async () => {
    initGlobalPostListeners(); 
    const urlParams = new URLSearchParams(window.location.search);

    const editId = urlParams.get('edit');
    const standaloneTextarea = document.getElementById('standalone-post-textarea');
    const standaloneSubmit = document.getElementById('standalone-submit-post');
    const standalonePreviewBox = document.getElementById('standalone-link-preview');
    
    // EDIT MODE LOGIC
    if (editId && standaloneTextarea && standaloneSubmit) {
        standaloneSubmit.innerText = "Save Changes";
        standaloneSubmit.setAttribute('data-edit-id', editId);
        
        const headerTitle = document.querySelector('.fb-header h3');
        if (headerTitle) headerTitle.innerText = "Edit Pitch";

        try {
            const docSnap = await getDoc(doc(db, "posts", editId));
            if (docSnap.exists() && docSnap.data().authorId === window.currentUserData.uid) {
                const postData = docSnap.data();
                standaloneTextarea.value = postData.content;
                
                // Preload existing link preview
                if (postData.linkPreview && standalonePreviewBox) {
                    window.currentLinkPreview = postData.linkPreview;
                    standalonePreviewBox.innerHTML = `
                        <button class="remove-preview-btn" onclick="window.clearLivePreview(this)"><i class="ri-close-line"></i></button>
                        <div class="fb-link-card" style="margin-top: 0;">
                            <img src="${postData.linkPreview.image}" class="fb-link-img" onerror="this.src='https://s2.googleusercontent.com/s2/favicons?domain=${postData.linkPreview.domain}&sz=256'; this.style.objectFit='contain'; this.style.padding='20px';">
                            <div class="fb-link-info">
                                <span class="fb-link-domain">${postData.linkPreview.domain}</span>
                                <div class="fb-link-title">${postData.linkPreview.title}</div>
                                <div class="fb-link-desc">${postData.linkPreview.description}</div>
                            </div>
                        </div>
                    `;
                    standalonePreviewBox.classList.add('active');
                }

                standaloneTextarea.dispatchEvent(new Event('input')); 
            } else {
                alert("You are not authorized to edit this post.");
                window.location.href = "index.html";
            }
        } catch (e) { console.error(e); }
    }

    // SINGLE POST VIEW LOGIC
    const container = document.getElementById('single-post-container');
    const targetPostId = urlParams.get('id');

    if (container && targetPostId) {
        onSnapshot(doc(db, "posts", targetPostId), (docSnap) => {
            if (!docSnap.exists()) {
                container.innerHTML = "<p style='text-align:center; color:var(--text-muted); padding:40px;'>This pitch was deleted or does not exist.</p>";
                return;
            }
            const post = docSnap.data();
            container.innerHTML = createPostHTML(post, targetPostId, auth.currentUser.uid);
            renderDynamicAuthor(post.authorId, targetPostId);
            
            const commentSection = document.getElementById(`comments-${targetPostId}`);
            if(commentSection) commentSection.style.display = 'block';
        });
    } else if (container && !targetPostId) {
        container.innerHTML = "<p style='text-align:center;'>Invalid post link.</p>";
    }
});