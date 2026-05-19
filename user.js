// // user.js
// import { auth, db } from './firebase.js';
// import { doc, getDoc, collection, query, where, onSnapshot, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// const urlParams = new URLSearchParams(window.location.search);
// const targetUserId = urlParams.get('id');
// let targetUserData = null; // Save their profile globally

// document.addEventListener('userDataLoaded', () => {
//     if (!targetUserId) return window.location.replace("index.html");
//     if (targetUserId === auth.currentUser.uid) return window.location.replace("profile.html");
    
//     setupTabs();
//     loadTargetProfile(targetUserId);
//     loadTargetPosts(targetUserId);
//     loadTargetNetwork(targetUserId);
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

// function setupTabs() {
//     document.querySelectorAll('.tab-item').forEach((tab, index) => {
//         tab.addEventListener('click', () => {
//             document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
//             document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.remove('active'));
//             tab.classList.add('active');
//             if(index === 0) document.getElementById('tab-pitches').classList.add('active');
//             if(index === 1) document.getElementById('tab-architecture').classList.add('active');
//             if(index === 2) document.getElementById('tab-repositories').classList.add('active');
//             if(index === 3) document.getElementById('tab-stack').classList.add('active');
//             if(index === 4) document.getElementById('tab-network').classList.add('active');
//         });
//     });
// }

// function loadTargetProfile(uid) {
//     onSnapshot(doc(db, "users", uid), (userDoc) => {
//         if (userDoc.exists()) {
//             targetUserData = userDoc.data();
//             const data = targetUserData;
            
//             const initials = data.fullname ? data.fullname.substring(0, 2).toUpperCase() : 'NA';
//             const followers = data.followers || [];
//             const isFollowing = followers.includes(auth.currentUser.uid);
            
//             const profileAvatar = document.querySelector('.profile-avatar');
//             if (data.avatarClass && data.avatarClass.includes('url(')) {
//                 profileAvatar.style.background = data.avatarClass;
//                 profileAvatar.style.backgroundSize = 'cover';
//                 profileAvatar.style.backgroundPosition = 'center';
//                 profileAvatar.innerText = '';
//             } else {
//                 profileAvatar.className = `profile-avatar ${data.avatarClass || 'bg-primary'}`;
//                 profileAvatar.style.background = '';
//                 profileAvatar.innerText = initials;
//             }

//             document.querySelector('.name-stats h2').innerText = `${data.fullname} (@${data.username})`;
//             document.querySelector('.user-stats').innerHTML = `<i class="ph-bold ph-users-three"></i> ${followers.length} Backers`;
            
//             document.getElementById('dev-bio').innerText = data.bio || "This developer hasn't added a bio yet.";
//             const ghBtn = document.getElementById('dev-github-btn');
//             if (data.github) {
//                 ghBtn.style.display = 'flex';
//                 ghBtn.onclick = () => window.open(`https://github.com/${data.github.replace('github.com/', '').replace('https://', '')}`, '_blank');
//             } else { ghBtn.style.display = 'none'; }

//             if (data.coverStyle) {
//                 document.querySelector('.cover-banner').style.background = data.coverStyle;
//                 document.querySelector('.cover-banner').style.backgroundSize = 'cover';
//                 document.querySelector('.cover-banner').style.backgroundPosition = 'center';
//             }

//             const followBtn = document.getElementById('follow-btn');
//             if (followBtn) {
//                 followBtn.innerHTML = isFollowing ? `<i class="ri-user-unfollow-line"></i> Unfollow` : `<i class="ri-user-add-line"></i> Follow Nerd`;
//                 followBtn.className = isFollowing ? 'btn-action btn-outline' : 'btn-action btn-solid';
                
//                 const newFollowBtn = followBtn.cloneNode(true);
//                 followBtn.parentNode.replaceChild(newFollowBtn, followBtn);
//                 newFollowBtn.addEventListener('click', async () => {
//                     newFollowBtn.disabled = true;
//                     if (isFollowing) await updateDoc(doc(db, "users", uid), { followers: arrayRemove(auth.currentUser.uid) });
//                     else await updateDoc(doc(db, "users", uid), { followers: arrayUnion(auth.currentUser.uid) });
//                 });
//             }
            
//             // Re-render posts with fresh data if they exist
//             document.querySelectorAll(`[data-author="${uid}"]`).forEach(postEl => {
//                 renderDynamicAuthor(targetUserData, postEl.getAttribute('data-postid'));
//             });
//         }
//     });
// }

// function loadTargetNetwork(uid) {
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

// function loadTargetPosts(uid) {
//     const feedContainer = document.getElementById('target-posts-container');
//     onSnapshot(query(collection(db, "posts"), where("authorId", "==", uid)), (snapshot) => {
//         feedContainer.innerHTML = ''; 
//         let postsArray = [];
//         snapshot.forEach(docSnap => postsArray.push({ id: docSnap.id, ...docSnap.data() }));
//         postsArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

//         if (postsArray.length === 0) {
//             feedContainer.innerHTML = `<p style="text-align:center; color:var(--text-muted); margin-top:20px; padding: 30px;">No architectures pitched yet.</p>`;
//             return;
//         }

//         postsArray.forEach((post) => {
//             const postId = post.id;
//             const isLikedByMe = post.likedBy && post.likedBy.includes(auth.currentUser.uid);
//             const commentsList = post.comments || [];
//             let commentsHTML = commentsList.map(c => `<div class="comment-item"><strong>${c.author}:</strong> ${c.text}</div>`).join('');

//             const dropdownHTML = `
//                 <div class="post-options-container">
//                     <button class="btn-more toggle-menu-btn" data-id="${postId}"><i class="ri-more-fill"></i></button>
//                     <div class="post-dropdown-menu" id="menu-${postId}">
//                         <a class="share-post-btn" data-id="${postId}"><i class="ri-share-forward-line"></i> Share Idea</a>
//                         <a class="report-post-btn text-danger" onclick="alert('Post reported to moderators.')"><i class="ri-flag-line"></i> Report Post</a>
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
//                         <div class="author-info"><strong id="dyn-name-${postId}">Loading...</strong></div>
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
//             if (targetUserData) renderDynamicAuthor(targetUserData, postId);
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





















// user.js
import { auth, db } from './firebase.js';
import { doc, collection, query, where, onSnapshot, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// IMPORT THE MASTER POST ENGINE
import { createPostHTML, renderDynamicAuthor, initGlobalPostListeners } from './post.js'; 

const urlParams = new URLSearchParams(window.location.search);
const targetUserId = urlParams.get('id');
let targetUserData = null; // Save their profile globally

document.addEventListener('userDataLoaded', () => {
    if (!targetUserId) return window.location.replace("index.html");
    if (targetUserId === auth.currentUser.uid) return window.location.replace("profile.html");
    
    setupTabs();
    initGlobalPostListeners(); // Activate post clicking logic globally
    loadTargetProfile(targetUserId);
    loadTargetPosts(targetUserId);
    loadTargetNetwork(targetUserId);
});

function setupTabs() {
    document.querySelectorAll('.tab-item').forEach((tab, index) => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            if(index === 0) document.getElementById('tab-pitches').classList.add('active');
            if(index === 1) document.getElementById('tab-architecture').classList.add('active');
            if(index === 2) document.getElementById('tab-repositories').classList.add('active');
            if(index === 3) document.getElementById('tab-stack').classList.add('active');
            if(index === 4) document.getElementById('tab-network').classList.add('active');
        });
    });
}

function loadTargetProfile(uid) {
    onSnapshot(doc(db, "users", uid), (userDoc) => {
        if (userDoc.exists()) {
            targetUserData = userDoc.data();
            const data = targetUserData;
            
            const initials = data.fullname ? data.fullname.substring(0, 2).toUpperCase() : 'NA';
            const followers = data.followers || [];
            const isFollowing = followers.includes(auth.currentUser.uid);
            
            const profileAvatar = document.querySelector('.profile-avatar');
            if (data.avatarClass && data.avatarClass.includes('url(')) {
                profileAvatar.style.background = data.avatarClass;
                profileAvatar.style.backgroundSize = 'cover';
                profileAvatar.style.backgroundPosition = 'center';
                profileAvatar.innerText = '';
            } else {
                profileAvatar.className = `profile-avatar ${data.avatarClass || 'bg-primary'}`;
                profileAvatar.style.background = '';
                profileAvatar.innerText = initials;
            }

            document.querySelector('.name-stats h2').innerText = `${data.fullname} (@${data.username})`;
            document.querySelector('.user-stats').innerHTML = `<i class="ph-bold ph-users-three"></i> ${followers.length} Backers`;
            
            document.getElementById('dev-bio').innerText = data.bio || "This developer hasn't added a bio yet.";
            
            const ghBtn = document.getElementById('dev-github-btn');
            if (data.github) {
                ghBtn.style.display = 'flex';
                ghBtn.onclick = () => window.open(`https://github.com/${data.github.replace('github.com/', '').replace('https://', '')}`, '_blank');
            } else { 
                ghBtn.style.display = 'none'; 
            }

            if (data.coverStyle) {
                document.querySelector('.cover-banner').style.background = data.coverStyle;
                document.querySelector('.cover-banner').style.backgroundSize = 'cover';
                document.querySelector('.cover-banner').style.backgroundPosition = 'center';
            }

            // Follow Button Logic
            const followBtn = document.getElementById('follow-btn');
            if (followBtn) {
                followBtn.innerHTML = isFollowing ? `<i class="ri-user-unfollow-line"></i> Unfollow` : `<i class="ri-user-add-line"></i> Follow Nerd`;
                followBtn.className = isFollowing ? 'btn-action btn-outline' : 'btn-action btn-solid';
                
                // Clone trick to remove old event listeners before adding new one
                const newFollowBtn = followBtn.cloneNode(true);
                followBtn.parentNode.replaceChild(newFollowBtn, followBtn);
                
                newFollowBtn.addEventListener('click', async () => {
                    newFollowBtn.disabled = true;
                    if (isFollowing) {
                        await updateDoc(doc(db, "users", uid), { followers: arrayRemove(auth.currentUser.uid) });
                    } else {
                        await updateDoc(doc(db, "users", uid), { followers: arrayUnion(auth.currentUser.uid) });
                    }
                });
            }
            
            // Re-render posts with fresh data if they updated their profile while we look at it
            document.querySelectorAll(`[data-author="${uid}"]`).forEach(postEl => {
                renderDynamicAuthor(uid, postEl.getAttribute('data-postid'));
            });
        }
    });
}

function loadTargetNetwork(uid) {
    const networkContainer = document.getElementById('network-container');
    onSnapshot(query(collection(db, "users")), (snapshot) => {
        networkContainer.innerHTML = '';
        let hasFollowers = false;
        snapshot.forEach((docSnap) => {
            const user = docSnap.data();
            if (user.uid !== uid && user.followers && user.followers.includes(uid)) {
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
        if (!hasFollowers) networkContainer.innerHTML = '<p style="color:var(--text-muted); grid-column:1/-1;">No backers yet.</p>';
    });
}

function loadTargetPosts(uid) {
    const feedContainer = document.getElementById('target-posts-container');
    
    onSnapshot(query(collection(db, "posts"), where("authorId", "==", uid)), (snapshot) => {
        feedContainer.innerHTML = ''; 
        let postsArray = [];
        snapshot.forEach(docSnap => postsArray.push({ id: docSnap.id, ...docSnap.data() }));
        postsArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (postsArray.length === 0) {
            feedContainer.innerHTML = `<p style="text-align:center; color:var(--text-muted); margin-top:20px; padding: 30px;">No architectures pitched yet.</p>`;
            return;
        }

        postsArray.forEach((post) => {
            const postId = post.id;
            
            // 1. GENERATE HTML VIA ENGINE
            feedContainer.insertAdjacentHTML('beforeend', createPostHTML(post, postId, auth.currentUser.uid));
            
            // 2. RESOLVE AUTHOR AVATAR VIA ENGINE
            renderDynamicAuthor(post.authorId, postId);
        });
    });
}