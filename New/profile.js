// // profile.js
// import { auth, db } from './firebase.js';
// import { doc, getDoc, collection, addDoc, query, where, onSnapshot, updateDoc, deleteDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// document.addEventListener('userDataLoaded', () => {
//     updateCreatePostUI();
//     setupMarkdownButtons();
//     loadMyPosts(auth.currentUser.uid);
//     loadMyNetwork(auth.currentUser.uid);
// });

// // Update posts when profile changes instantly
// document.addEventListener('userProfileUpdated', () => {
//     updateCreatePostUI();
//     const myPosts = document.querySelectorAll(`[data-author="${auth.currentUser.uid}"]`);
//     myPosts.forEach(postEl => {
//         const postId = postEl.getAttribute('data-postid');
//         renderDynamicAuthor(window.currentUserData, postId);
//     });
// });

// function formatContent(text) {
//     let safe = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
//     safe = safe.replace(/```([\s\S]*?)```/g, '<div class="code-block"><pre><code>$1</code></pre></div>');
//     safe = safe.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
//     safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
//     const urlRegex = /(https?:\/\/[^\s]+)/g;
//     safe = safe.replace(urlRegex, '<a href="$1" target="_blank" class="rich-link">$1</a>');
//     return safe.replace(/\n/g, '<br>');
// }

// function setupMarkdownButtons() {
//     document.querySelectorAll('.action-icons span').forEach(icon => {
//         icon.addEventListener('click', (e) => {
//             const title = e.currentTarget.getAttribute('title');
//             const textarea = document.querySelector('.create-post textarea');
//             if (!textarea) return;
//             if (title.includes("Code")) textarea.value += "\n```\n// Paste your code here\n```\n";
//             if (title.includes("Format")) textarea.value += "**Bold Text**";
//             textarea.focus();
//         });
//     });
// }

// function updateCreatePostUI() {
//     const user = window.currentUserData;
//     const createBoxAvatar = document.querySelector('#tab-pitches .avatar-text');
    
//     if (createBoxAvatar && user) {
//         if (user.avatarClass && user.avatarClass.includes('url(')) {
//             createBoxAvatar.style.background = user.avatarClass;
//             createBoxAvatar.style.backgroundSize = 'cover';
//             createBoxAvatar.style.backgroundPosition = 'center';
//             createBoxAvatar.innerText = '';
//         } else {
//             createBoxAvatar.className = `avatar-text ${user.avatarClass || 'bg-primary'}`;
//             createBoxAvatar.style.background = '';
//             createBoxAvatar.innerText = user.fullname.substring(0, 2).toUpperCase();
//         }
//     }

//     if (user) {
//         const profileAvatar = document.querySelector('.profile-avatar');
//         if (profileAvatar) {
//             if (user.avatarClass && user.avatarClass.includes('url(')) {
//                 profileAvatar.style.background = user.avatarClass;
//                 profileAvatar.style.backgroundSize = 'cover';
//                 profileAvatar.style.backgroundPosition = 'center';
//                 profileAvatar.innerText = '';
//             } else {
//                 profileAvatar.className = `profile-avatar ${user.avatarClass || 'bg-primary'}`;
//                 profileAvatar.style.background = '';
//                 profileAvatar.innerText = user.fullname.substring(0, 2).toUpperCase();
//             }
//         }
//         const nameH2 = document.querySelector('.name-stats h2');
//         if (nameH2) nameH2.innerText = user.fullname;
//         const coverBanner = document.querySelector('.cover-banner');
//         if (coverBanner && user.coverStyle) {
//             coverBanner.style.background = user.coverStyle;
//             coverBanner.style.backgroundSize = 'cover';
//             coverBanner.style.backgroundPosition = 'center';
//         }
//     }
// }

// const btnPost = document.querySelector('#tab-pitches .btn-post');
// if (btnPost) {
//     btnPost.addEventListener('click', async () => {
//         const postTextarea = document.querySelector('#tab-pitches textarea');
//         const content = postTextarea.value.trim();
//         if (!content || !window.currentUserData) return;
//         btnPost.disabled = true; btnPost.innerText = "Posting...";
//         try {
//             await addDoc(collection(db, "posts"), {
//                 authorId: window.currentUserData.uid,
//                 content: content, likedBy: [], comments: [],
//                 timestamp: new Date().toISOString()
//             });
//             postTextarea.value = ''; 
//         } catch (e) { console.error(e); } 
//         finally { btnPost.disabled = false; btnPost.innerText = "Post Idea"; }
//     });
// }

// document.querySelectorAll('.tab-item').forEach((tab, index) => {
//     tab.addEventListener('click', () => {
//         document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
//         document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.remove('active'));
//         tab.classList.add('active');
//         if(index === 0) document.getElementById('tab-pitches').classList.add('active');
//         if(index === 1) document.getElementById('tab-architecture').classList.add('active');
//         if(index === 4) document.getElementById('tab-network').classList.add('active');
//     });
// });

// function loadMyNetwork(uid) {
//     const networkContainer = document.getElementById('network-container');
//     onSnapshot(query(collection(db, "users")), (snapshot) => {
//         networkContainer.innerHTML = '';
//         let hasFollowers = false;
//         snapshot.forEach((docSnap) => {
//             const user = docSnap.data();
//             if (user.uid !== uid && user.followers && user.followers.includes(uid)) {
//                 hasFollowers = true;
//                 const card = document.createElement('div');
//                 card.className = 'network-card';
//                 card.onclick = () => window.location.href = `user.html?id=${user.uid}`;
//                 let avatarHTML = user.avatarClass?.includes('url(') 
//                     ? `<div class="avatar-text" style="background:${user.avatarClass}; background-size:cover; background-position:center;"></div>`
//                     : `<div class="avatar-text ${user.avatarClass || 'bg-blue'}">${user.fullname.substring(0,2).toUpperCase()}</div>`;
//                 card.innerHTML = `${avatarHTML}<div><strong style="display:block; font-size:0.95rem; color:var(--text-main);">${user.fullname}</strong><span style="font-size:0.8rem; color:var(--text-muted);">@${user.username}</span></div>`;
//                 networkContainer.appendChild(card);
//             }
//         });
//         if (!hasFollowers) networkContainer.innerHTML = '<p style="color:var(--text-muted); grid-column:1/-1;">No backers yet.</p>';
//     });
// }

// function loadMyPosts(uid) {
//     const feedContainer = document.getElementById('my-posts-container');
//     onSnapshot(query(collection(db, "posts"), where("authorId", "==", uid)), (snapshot) => {
//         feedContainer.innerHTML = '';
//         let postsArray = [];
//         snapshot.forEach(docSnap => postsArray.push({ id: docSnap.id, ...docSnap.data() }));
//         postsArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); 

//         postsArray.forEach((post) => {
//             const postId = post.id;
//             const isLikedByMe = post.likedBy && post.likedBy.includes(uid);
//             const commentsList = post.comments || [];
//             let commentsHTML = commentsList.map(c => `<div class="comment-item"><strong>${c.author}:</strong> ${c.text}</div>`).join('');
            
//             const dropdownHTML = `
//                 <div class="post-options-container">
//                     <button class="btn-more toggle-menu-btn" data-id="${postId}"><i class="ri-more-fill"></i></button>
//                     <div class="post-dropdown-menu" id="menu-${postId}">
//                         <a class="share-post-btn" data-id="${postId}"><i class="ri-share-forward-line"></i> Share Idea</a>
//                         <a class="delete-post-btn text-danger" data-id="${postId}"><i class="ri-delete-bin-line"></i> Delete Pitch</a>
//                     </div>
//                 </div>
//             `;

//             const postElement = document.createElement('div');
//             postElement.className = 'card post animate-fade-in';
//             postElement.setAttribute('data-author', post.authorId);
//             postElement.setAttribute('data-postid', postId);
            
//             postElement.innerHTML = `
//                 <div class="post-header">
//                     <div class="post-author">
//                         <div class="avatar-text" id="dyn-avatar-${postId}"></div>
//                         <div class="author-info"><strong id="dyn-name-${postId}">Loading...</strong> <span class="badge badge-idea">💡 My Pitch</span></div>
//                     </div>
//                     ${dropdownHTML}
//                 </div>
//                 <div class="post-content"><p>${formatContent(post.content)}</p></div>
//                 <div class="post-footer">
//                     <div class="likes ${isLikedByMe ? '' : 'unliked'}" data-id="${postId}" data-liked="${isLikedByMe}">
//                         <i class="${isLikedByMe ? 'ph-fill' : 'ph'} ph-rocket"></i> Upvote <span>${post.likedBy ? post.likedBy.length : 0}</span>
//                     </div>
//                     <div class="comments-shares toggle-comments-btn" data-id="${postId}">
//                         <span><i class="ri-chat-3-line"></i> Discuss <span>${commentsList.length}</span></span>
//                     </div>
//                 </div>
                
//                 <div class="comments-section" id="comments-${postId}" style="display:none; margin-top:15px; border-top:1px dashed var(--border-color); padding-top:15px;">
//                     <div class="comments-list">${commentsHTML}</div>
//                     <div class="comment-input-wrapper" style="display:flex; gap:10px; margin-top:10px;">
//                         <input type="text" id="comment-input-${postId}" placeholder="Suggest an idea..." style="flex:1; padding:8px 15px; border-radius:20px; border:1px solid var(--border-color);">
//                         <button class="submit-comment-btn" data-id="${postId}" style="background:var(--primary-color); color:white; border-radius:20px; padding:0 20px; border:none; cursor:pointer;">Send</button>
//                     </div>
//                 </div>
//             `;

//             feedContainer.appendChild(postElement);
//             renderDynamicAuthor(window.currentUserData, postId);
//         });

//         attachPostListeners();
//     });
// }

// function renderDynamicAuthor(userData, postId) {
//     const nameEl = document.getElementById(`dyn-name-${postId}`);
//     const avatarEl = document.getElementById(`dyn-avatar-${postId}`);
//     if (!nameEl || !avatarEl || !userData) return;

//     nameEl.innerText = userData.fullname;
//     if (userData.avatarClass && userData.avatarClass.includes('url(')) {
//         avatarEl.style.background = userData.avatarClass;
//         avatarEl.style.backgroundSize = 'cover';
//         avatarEl.style.backgroundPosition = 'center';
//         avatarEl.className = 'avatar-text';
//         avatarEl.innerText = '';
//     } else {
//         avatarEl.className = `avatar-text ${userData.avatarClass || 'bg-primary'}`;
//         avatarEl.style.background = '';
//         avatarEl.innerText = userData.fullname.substring(0, 2).toUpperCase();
//     }
// }

// function attachPostListeners() {
//     document.querySelectorAll('.toggle-menu-btn').forEach(btn => {
//         btn.addEventListener('click', (e) => {
//             e.stopPropagation();
//             const id = e.currentTarget.getAttribute('data-id');
//             const menu = document.getElementById(`menu-${id}`);
//             document.querySelectorAll('.post-dropdown-menu').forEach(m => { if(m !== menu) m.classList.remove('show')});
//             menu.classList.toggle('show');
//         });
//     });

//     document.addEventListener('click', () => document.querySelectorAll('.post-dropdown-menu').forEach(m => m.classList.remove('show')));

//     document.querySelectorAll('.share-post-btn').forEach(btn => {
//         btn.addEventListener('click', async (e) => {
//             e.stopPropagation();
//             const id = e.currentTarget.getAttribute('data-id');
//             const shareUrl = `${window.location.origin}/post.html?id=${id}`;
//             try {
//                 if (navigator.share) await navigator.share({ title: 'Nerd Arena Pitch', url: shareUrl });
//                 else { await navigator.clipboard.writeText(shareUrl); alert("Link copied to clipboard!"); }
//             } catch (err) {}
//             document.querySelectorAll('.post-dropdown-menu').forEach(m => m.classList.remove('show'));
//         });
//     });

//     document.querySelectorAll('.likes').forEach(btn => {
//         btn.addEventListener('click', async (e) => {
//             const id = e.currentTarget.getAttribute('data-id');
//             const isLiked = e.currentTarget.getAttribute('data-liked') === 'true';
//             if (isLiked) await updateDoc(doc(db, "posts", id), { likedBy: arrayRemove(auth.currentUser.uid) });
//             else await updateDoc(doc(db, "posts", id), { likedBy: arrayUnion(auth.currentUser.uid) });
//         });
//     });

//     document.querySelectorAll('.delete-post-btn').forEach(btn => {
//         btn.addEventListener('click', async (e) => {
//             if(confirm("Delete this pitch?")) await deleteDoc(doc(db, "posts", e.currentTarget.getAttribute('data-id')));
//         });
//     });

//     document.querySelectorAll('.toggle-comments-btn').forEach(btn => {
//         btn.addEventListener('click', (e) => {
//             const section = document.getElementById(`comments-${e.currentTarget.getAttribute('data-id')}`);
//             section.style.display = section.style.display === 'none' ? 'block' : 'none';
//         });
//     });

//     document.querySelectorAll('.submit-comment-btn').forEach(btn => {
//         btn.addEventListener('click', async (e) => {
//             const id = e.currentTarget.getAttribute('data-id');
//             const input = document.getElementById(`comment-input-${id}`);
//             if(!input.value.trim()) return;
//             await updateDoc(doc(db, "posts", id), { comments: arrayUnion({ author: window.currentUserData.fullname, text: input.value.trim(), uid: auth.currentUser.uid }) });
//             input.value = '';
//         });
//     });
// }

















// // profile.js
// import { auth, db } from './firebase.js';
// import { doc, collection, addDoc, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
// import { fetchAndRenderRepos } from './github.js';

// // IMPORT THE MASTER POST ENGINE
// import { createPostHTML, renderDynamicAuthor, initGlobalPostListeners } from './post.js'; 

// document.addEventListener('userDataLoaded', () => {
//     updateCreatePostUI();
//     setupMarkdownButtons();
//     initGlobalPostListeners(); // Activate post clicking logic globally
//     loadMyPosts(auth.currentUser.uid);
//     loadMyNetwork(auth.currentUser.uid);
// });

// // Update posts when profile changes instantly
// document.addEventListener('userProfileUpdated', () => {
//     updateCreatePostUI();
//     const myPosts = document.querySelectorAll(`[data-author="${auth.currentUser.uid}"]`);
//     myPosts.forEach(postEl => {
//         const postId = postEl.getAttribute('data-postid');
//         renderDynamicAuthor(auth.currentUser.uid, postId);
//     });
// });

// function updateCreatePostUI() {
//     const user = window.currentUserData;
//     const createBoxAvatar = document.querySelector('#tab-pitches .avatar-text');
    
//     if (createBoxAvatar && user) {
//         if (user.avatarClass && user.avatarClass.includes('url(')) {
//             createBoxAvatar.style.background = user.avatarClass;
//             createBoxAvatar.style.backgroundSize = 'cover';
//             createBoxAvatar.style.backgroundPosition = 'center';
//             createBoxAvatar.innerText = '';
//         } else {
//             createBoxAvatar.className = `avatar-text ${user.avatarClass || 'bg-primary'}`;
//             createBoxAvatar.style.background = '';
//             createBoxAvatar.innerText = user.fullname.substring(0, 2).toUpperCase();
//         }
//     }

//     if (user) {
//         const profileAvatar = document.querySelector('.profile-avatar');
//         if (profileAvatar) {
//             if (user.avatarClass && user.avatarClass.includes('url(')) {
//                 profileAvatar.style.background = user.avatarClass;
//                 profileAvatar.style.backgroundSize = 'cover';
//                 profileAvatar.style.backgroundPosition = 'center';
//                 profileAvatar.innerText = '';
//             } else {
//                 profileAvatar.className = `profile-avatar ${user.avatarClass || 'bg-primary'}`;
//                 profileAvatar.style.background = '';
//                 profileAvatar.innerText = user.fullname.substring(0, 2).toUpperCase();
//             }
//         }
//         const nameH2 = document.querySelector('.name-stats h2');
//         if (nameH2) nameH2.innerText = user.fullname;
//         const coverBanner = document.querySelector('.cover-banner');
//         if (coverBanner && user.coverStyle) {
//             coverBanner.style.background = user.coverStyle;
//             coverBanner.style.backgroundSize = 'cover';
//             coverBanner.style.backgroundPosition = 'center';
//         }
//     }
// }

// function setupMarkdownButtons() {
//     document.querySelectorAll('.action-icons span').forEach(icon => {
//         icon.addEventListener('click', (e) => {
//             const title = e.currentTarget.getAttribute('title');
//             const textarea = document.querySelector('.create-post textarea');
//             if (!textarea) return;
//             if (title.includes("Code")) textarea.value += "\n```\n// Paste your code here\n```\n";
//             if (title.includes("Format")) textarea.value += "**Bold Text**";
//             textarea.focus();
//         });
//     });
// }

// const btnPost = document.querySelector('#tab-pitches .btn-post');
// if (btnPost) {
//     btnPost.addEventListener('click', async () => {
//         const postTextarea = document.querySelector('#tab-pitches textarea');
//         const content = postTextarea.value.trim();
//         if (!content || !window.currentUserData) return;
        
//         btnPost.disabled = true; btnPost.innerText = "Posting...";
//         try {
//             await addDoc(collection(db, "posts"), {
//                 authorId: window.currentUserData.uid,
//                 content: content, 
//                 likedBy: [], 
//                 comments: [],
//                 timestamp: new Date().toISOString()
//             });
//             postTextarea.value = ''; 
//         } catch (e) { console.error(e); } 
//         finally { btnPost.disabled = false; btnPost.innerText = "Post Idea"; }
//     });
// }

// // // Tab Switching Logic
// // // document.querySelectorAll('.tab-item').forEach((tab, index) => {
// // //     tab.addEventListener('click', () => {
// //     // Add this logic to your existing Tab Switching Event Listener:
// // document.querySelectorAll('.tab-item').forEach((tab, index) => {
// //     tab.addEventListener('click', () => {
// //         document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
// //         document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.remove('active'));
// //         tab.classList.add('active');
// //         if(index === 0) document.getElementById('tab-pitches').classList.add('active');
// //         if(index === 2) document.getElementById('tab-architecture').classList.add('active');
// //         if(index === 1) document.getElementById('tab-network').classList.add('active');
// //                 // NEW: Trigger GitHub Fetch when clicking "Repositories" tab (index 3 in your profile.html tabs)
// //         if(index === 3) {
// //             const githubUser = window.currentUserData.github; // Make sure this matches your Firestore key
// //             const hiddenRepos = window.currentUserData.hiddenRepos || [];
// //             fetchAndRenderRepos(githubUser, 'tab-repositories', true, hiddenRepos);
// //         }
// //     });
// // });
// // //     });
// // // });
// // At the top with other imports

// // Inside the tab event listener (replace or update the existing one)
// document.querySelectorAll('.tab-item').forEach((tab, index) => {
//     tab.addEventListener('click', () => {
//         document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
//         document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.remove('active'));
//         tab.classList.add('active');
        
//         if (index === 0) document.getElementById('tab-pitches').classList.add('active');
//         if (index === 1) document.getElementById('tab-network').classList.add('active');
//         if (index === 2) document.getElementById('tab-architecture').classList.add('active');
//         if (index === 3) { // Repositories tab
//             document.getElementById('tab-repositories').classList.add('active');
//             const githubUser = window.currentUserData?.github;
//             const hiddenRepos = window.currentUserData?.hiddenRepos || [];
//             fetchAndRenderRepos(githubUser, 'repos-container', true, hiddenRepos, () => {
//                 // Re-fetch after toggle to refresh UI
//                 fetchAndRenderRepos(githubUser, 'repos-container', true, window.currentUserData?.hiddenRepos || [], () => {});
//             });
//         }
//         if (index === 4) document.getElementById('tab-stack').classList.add('active');
//     });
// });

// function loadMyNetwork(uid) {
//     const networkContainer = document.getElementById('network-container');
//     onSnapshot(query(collection(db, "users")), (snapshot) => {
//         networkContainer.innerHTML = '';
//         let hasFollowers = false;
//         snapshot.forEach((docSnap) => {
//             const user = docSnap.data();
//             if (user.uid !== uid && user.followers && user.followers.includes(uid)) {
//                 hasFollowers = true;
//                 const card = document.createElement('div');
//                 card.className = 'network-card';
//                 card.onclick = () => window.location.href = `user.html?id=${user.uid}`;
//                 let avatarHTML = user.avatarClass?.includes('url(') 
//                     ? `<div class="avatar-text" style="background:${user.avatarClass}; background-size:cover; background-position:center;"></div>`
//                     : `<div class="avatar-text ${user.avatarClass || 'bg-blue'}">${user.fullname.substring(0,2).toUpperCase()}</div>`;
//                 card.innerHTML = `${avatarHTML}<div><strong style="display:block; font-size:0.95rem; color:var(--text-main);">${user.fullname}</strong><span style="font-size:0.8rem; color:var(--text-muted);">@${user.username}</span></div>`;
//                 networkContainer.appendChild(card);
//             }
//         });
//         if (!hasFollowers) networkContainer.innerHTML = '<p style="color:var(--text-muted); grid-column:1/-1;">No backers yet.</p>';
//     });
// }

// function loadMyPosts(uid) {
//     const feedContainer = document.getElementById('my-posts-container');
    
//     onSnapshot(query(collection(db, "posts"), where("authorId", "==", uid)), (snapshot) => {
//         feedContainer.innerHTML = '';
//         let postsArray = [];
//         snapshot.forEach(docSnap => postsArray.push({ id: docSnap.id, ...docSnap.data() }));
//         postsArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); 

//         if (postsArray.length === 0) {
//             feedContainer.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:30px;">You haven't pitched any ideas yet.</p>`;
//             return;
//         }

//         postsArray.forEach((post) => {
//             const postId = post.id;
            
//             // 1. GENERATE HTML VIA ENGINE
//             feedContainer.insertAdjacentHTML('beforeend', createPostHTML(post, postId, auth.currentUser.uid));
            
//             // 2. RESOLVE AUTHOR AVATAR VIA ENGINE
//             renderDynamicAuthor(post.authorId, postId);
//         });
//     });
// }

































// profile.js
import { auth, db } from './firebase.js';
import { doc, getDoc, collection, addDoc, query, where, onSnapshot, updateDoc, deleteDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { fetchAndRenderRepos } from './github.js';
import { createPostHTML, renderDynamicAuthor, initGlobalPostListeners } from './post.js';

document.addEventListener('userDataLoaded', () => {
    updateCreatePostUI();
    setupMarkdownButtons();
    initGlobalPostListeners();
    loadMyPosts(auth.currentUser.uid);
    loadMyNetwork(auth.currentUser.uid);
});

document.addEventListener('userProfileUpdated', () => {
    updateCreatePostUI();
    const myPosts = document.querySelectorAll(`[data-author="${auth.currentUser.uid}"]`);
    myPosts.forEach(postEl => {
        const postId = postEl.getAttribute('data-postid');
        renderDynamicAuthor(auth.currentUser.uid, postId);
    });
});

function updateCreatePostUI() {
    const user = window.currentUserData;
    const createBoxAvatar = document.querySelector('#tab-pitches .avatar-text');
    
    if (createBoxAvatar && user) {
        if (user.avatarClass && user.avatarClass.includes('url(')) {
            createBoxAvatar.style.background = user.avatarClass;
            createBoxAvatar.style.backgroundSize = 'cover';
            createBoxAvatar.style.backgroundPosition = 'center';
            createBoxAvatar.innerText = '';
        } else {
            createBoxAvatar.className = `avatar-text ${user.avatarClass || 'bg-primary'}`;
            createBoxAvatar.style.background = '';
            createBoxAvatar.innerText = user.fullname.substring(0, 2).toUpperCase();
        }
    }

    if (user) {
        const profileAvatar = document.querySelector('.profile-avatar');
        if (profileAvatar) {
            if (user.avatarClass && user.avatarClass.includes('url(')) {
                profileAvatar.style.background = user.avatarClass;
                profileAvatar.style.backgroundSize = 'cover';
                profileAvatar.style.backgroundPosition = 'center';
                profileAvatar.innerText = '';
            } else {
                profileAvatar.className = `profile-avatar ${user.avatarClass || 'bg-primary'}`;
                profileAvatar.style.background = '';
                profileAvatar.innerText = user.fullname.substring(0, 2).toUpperCase();
            }
        }
        
        // --- THE FIX: Added Username & Followers Stats Injection ---
        const nameH2 = document.querySelector('.name-stats h2');
        if (nameH2) nameH2.innerText = `${user.fullname} (@${user.username})`;
        
        const userStats = document.querySelector('.user-stats');
        if (userStats) {
            const followersCount = user.followers ? user.followers.length : 0;
            userStats.innerHTML = `<i class="ph-bold ph-users-three"></i> ${followersCount} Backers`;
        }
        // -----------------------------------------------------------

        const coverBanner = document.querySelector('.cover-banner');
        if (coverBanner && user.coverStyle) {
            coverBanner.style.background = user.coverStyle;
            coverBanner.style.backgroundSize = 'cover';
            coverBanner.style.backgroundPosition = 'center';
        }
    }
}

function setupMarkdownButtons() {
    document.querySelectorAll('.action-icons span').forEach(icon => {
        icon.addEventListener('click', (e) => {
            const title = e.currentTarget.getAttribute('title');
            const textarea = document.querySelector('.create-post textarea');
            if (!textarea) return;
            if (title.includes("Code")) textarea.value += "\n```\n// Paste your code here\n```\n";
            if (title.includes("Format")) textarea.value += "**Bold Text**";
            textarea.focus();
        });
    });
}

const btnPost = document.querySelector('#tab-pitches .btn-post');
if (btnPost) {
    btnPost.addEventListener('click', async () => {
        const postTextarea = document.querySelector('#tab-pitches textarea');
        const content = postTextarea.value.trim();
        if (!content || !window.currentUserData) return;
        
        btnPost.disabled = true; btnPost.innerText = "Posting...";
        try {
            await addDoc(collection(db, "posts"), {
                authorId: window.currentUserData.uid,
                content: content, 
                likedBy: [], 
                comments: [],
                timestamp: new Date().toISOString()
            });
            postTextarea.value = ''; 
        } catch (e) { console.error(e); } 
        finally { btnPost.disabled = false; btnPost.innerText = "Post Idea"; }
    });
}

// ----- TAB SWITCHING -----
document.querySelectorAll('.tab-item').forEach((tab, index) => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        
        if (index === 0) document.getElementById('tab-pitches').classList.add('active');
        if (index === 1) document.getElementById('tab-network').classList.add('active');
        if (index === 3) document.getElementById('tab-architecture').classList.add('active');
        if (index === 2) {
            document.getElementById('tab-repositories').classList.add('active');
            const githubUser = window.currentUserData?.github;
            const hiddenRepos = window.currentUserData?.hiddenRepos || [];
            
            fetchAndRenderRepos(githubUser, 'repos-container', true, hiddenRepos);
        }
        if (index === 4) document.getElementById('tab-stack').classList.add('active');
    });
});

function loadMyNetwork(uid) {
    const networkContainer = document.getElementById('network-container');
    if (!networkContainer) return;
    
    onSnapshot(query(collection(db, "users")), (snapshot) => {
        let myFollowers = [];
        
        snapshot.forEach(docSnap => {
            if (docSnap.data().uid === uid) {
                myFollowers = docSnap.data().followers || [];
            }
        });

        networkContainer.innerHTML = '';
        let hasFollowers = false;

        snapshot.forEach((docSnap) => {
            const user = docSnap.data();
            if (myFollowers.includes(user.uid)) {
                hasFollowers = true;
                const card = document.createElement('div');
                card.className = 'network-card';
                card.onclick = () => window.location.href = `user.html?id=${user.uid}`;
                let avatarHTML = user.avatarClass?.includes('url(') 
                    ? `<div class="avatar-text" style="background:${user.avatarClass}; background-size:cover; background-position:center;"></div>`
                    : `<div class="avatar-text ${user.avatarClass || 'bg-blue'}">${user.fullname.substring(0,2).toUpperCase()}</div>`;
                card.innerHTML = `${avatarHTML}<div><strong style="display:block; font-size:0.95rem; color:var(--text-main);">${user.fullname}</strong><span style="font-size:0.8rem; color:var(--text-muted);">@${user.username}</span></div>`;
                networkContainer.appendChild(card);
            }
        });
        
        if (!hasFollowers) networkContainer.innerHTML = '<p style="color:var(--text-muted); grid-column:1/-1;">No backers yet. Keep pitching!</p>';
    });
}

function loadMyPosts(uid) {
    const feedContainer = document.getElementById('my-posts-container');
    if (!feedContainer) return;
    
    onSnapshot(query(collection(db, "posts"), where("authorId", "==", uid)), (snapshot) => {
        feedContainer.innerHTML = '';
        let postsArray = [];
        snapshot.forEach(docSnap => postsArray.push({ id: docSnap.id, ...docSnap.data() }));
        postsArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); 

        if (postsArray.length === 0) {
            feedContainer.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:30px;">You haven't pitched any ideas yet.</p>`;
            return;
        }

        postsArray.forEach((post) => {
            const postId = post.id;
            feedContainer.insertAdjacentHTML('beforeend', createPostHTML(post, postId, auth.currentUser.uid));
            renderDynamicAuthor(post.authorId, postId);
        });
    });
}