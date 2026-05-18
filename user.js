// user.js
import { auth, db } from './firebase.js';
import { doc, collection, query, where, orderBy, onSnapshot, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const targetUserId = urlParams.get('id');

document.addEventListener('userDataLoaded', () => {
    if (!targetUserId) return window.location.replace("index.html");
    if (targetUserId === auth.currentUser.uid) return window.location.replace("profile.html");
    
    setupTabs();
    loadTargetProfile(targetUserId);
    loadTargetPosts(targetUserId);
    loadTargetNetwork(targetUserId);
});

// --- FORMATTING ENGINE ---
function formatContent(text) {
    let safe = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    safe = safe.replace(/```([\s\S]*?)```/g, '<div class="code-block"><pre><code>$1</code></pre></div>');
    safe = safe.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    safe = safe.replace(urlRegex, '<a href="$1" target="_blank" class="rich-link">$1</a>');
    return safe.replace(/\n/g, '<br>');
}

// --- PROFILE TABS LOGIC ---
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
            const data = userDoc.data();
            const initials = data.fullname ? data.fullname.substring(0, 2).toUpperCase() : 'NA';
            const followers = data.followers || [];
            const isFollowing = followers.includes(auth.currentUser.uid);
            
            // Render Target Avatar safely
            const profileAvatar = document.querySelector('.profile-avatar');
            const avatarVal = data.avatarClass || 'bg-primary';
            if (avatarVal.includes('url(')) {
                profileAvatar.className = 'profile-avatar';
                profileAvatar.style.background = avatarVal;
                profileAvatar.style.backgroundSize = 'cover';
                profileAvatar.style.backgroundPosition = 'center';
                profileAvatar.innerText = '';
            } else {
                profileAvatar.className = `profile-avatar ${avatarVal}`;
                profileAvatar.style.background = '';
                profileAvatar.innerText = initials;
            }

            // Render Info & Stats
            document.querySelector('.name-stats h2').innerText = `${data.fullname} (@${data.username})`;
            document.querySelector('.user-stats').innerHTML = `<i class="ph-bold ph-users-three"></i> ${followers.length} Backers`;
            
            // Render Bio & GitHub
            document.getElementById('dev-bio').innerText = data.bio || "This developer hasn't added a bio yet.";
            const ghBtn = document.getElementById('dev-github-btn');
            if (data.github) {
                ghBtn.style.display = 'flex';
                // Strip URL if user pasted the whole link, just keep the handle/domain
                ghBtn.onclick = () => window.open(`https://github.com/${data.github.replace('github.com/', '').replace('https://', '')}`, '_blank');
            } else {
                ghBtn.style.display = 'none';
            }

            // Render Target Cover
            if (data.coverStyle) {
                const cover = document.querySelector('.cover-banner');
                cover.style.background = data.coverStyle;
                cover.style.backgroundSize = 'cover';
                cover.style.backgroundPosition = 'center';
            }

            // Follow Button Logic
            const followBtn = document.getElementById('follow-btn');
            if (followBtn) {
                followBtn.innerHTML = isFollowing ? `<i class="ri-user-unfollow-line"></i> Unfollow` : `<i class="ri-user-add-line"></i> Follow Nerd`;
                followBtn.className = isFollowing ? 'btn-action btn-outline' : 'btn-action btn-solid';
                
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

// --- LOAD NETWORK (FOLLOWERS) ---
function loadTargetNetwork(uid) {
    const networkContainer = document.getElementById('network-container');
    const q = query(collection(db, "users")); 
    
    onSnapshot(q, (snapshot) => {
        networkContainer.innerHTML = '';
        let hasFollowers = false;

        snapshot.forEach((docSnap) => {
            const user = docSnap.data();
            // Show users who have this person's ID in their followers array
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

        if (!hasFollowers) networkContainer.innerHTML = '<p style="color:var(--text-muted); grid-column:1/-1;">No backers yet.</p>';
    });
}

function loadTargetPosts(uid) {
    const feedContainer = document.getElementById('target-posts-container');
    const q = query(collection(db, "posts"), where("authorId", "==", uid), orderBy("timestamp", "desc"));

    onSnapshot(q, (snapshot) => {
        feedContainer.innerHTML = ''; 
        if (snapshot.empty) {
            feedContainer.innerHTML = `<p style="text-align:center; color:var(--text-muted); margin-top:20px; padding: 30px;">No architectures pitched yet.</p>`;
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
            
            const commentsList = post.comments || [];
            let commentsHTML = commentsList.map(c => `<div class="comment-item"><strong>${c.author}:</strong> ${c.text}</div>`).join('');

            // 3-Dots Menu (Only Report & Share since it's someone else's profile)
            const dropdownHTML = `
                <div class="post-options-container">
                    <button class="btn-more toggle-menu-btn" data-id="${postId}"><i class="ri-more-fill"></i></button>
                    <div class="post-dropdown-menu" id="menu-${postId}">
                        <a onclick="sharePost('${postId}')"><i class="ri-share-forward-line"></i> Share Idea</a>
                        <a class="report-post-btn text-danger" onclick="alert('Post reported to moderators.')"><i class="ri-flag-line"></i> Report Post</a>
                    </div>
                </div>
            `;

            const postElement = document.createElement('div');
            postElement.className = 'card post animate-fade-in';
            postElement.innerHTML = `
                <div class="post-header">
                    <div class="post-author">
                        <div class="avatar-text target-post-avatar"></div>
                        <div class="author-info"><strong>${post.authorName}</strong></div>
                    </div>
                    ${dropdownHTML}
                </div>
                <div class="post-content" style="font-size: 1.05rem; line-height: 1.6;"><p>${formatContent(post.content)}</p></div>
                <div class="post-footer">
                    <div class="likes ${likeClass}" data-id="${postId}" data-liked="${isLikedByMe}">
                        <i class="${likeIcon}"></i> Upvote <span>${likesCount}</span>
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
            `;
            
            const targetAvatar = postElement.querySelector('.target-post-avatar');
            const avatarVal = post.authorAvatarClass || 'bg-purple';
            if (avatarVal.includes('url(')) {
                targetAvatar.style.background = avatarVal;
                targetAvatar.style.backgroundSize = 'cover';
                targetAvatar.style.backgroundPosition = 'center';
            } else {
                targetAvatar.className = `avatar-text ${avatarVal}`;
                targetAvatar.innerText = initials;
            }

            feedContainer.appendChild(postElement);
        });

        attachPostListeners();
    });
}

function attachPostListeners() {
    // 3-Dots Dropdown
    document.querySelectorAll('.toggle-menu-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = e.currentTarget.getAttribute('data-id');
            const menu = document.getElementById(`menu-${id}`);
            document.querySelectorAll('.post-dropdown-menu').forEach(m => { if(m !== menu) m.classList.remove('show')});
            menu.classList.toggle('show');
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
            const postRef = doc(db, "posts", id);
            if (isLiked) await updateDoc(postRef, { likedBy: arrayRemove(auth.currentUser.uid) });
            else await updateDoc(postRef, { likedBy: arrayUnion(auth.currentUser.uid) });
        });
    });

    // Comments Listeners
    document.querySelectorAll('.toggle-comments-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const section = document.getElementById(`comments-${id}`);
            section.style.display = section.style.display === 'none' ? 'block' : 'none';
        });
    });

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