// app.js
import { auth, db } from './firebase.js';
import { collection, addDoc, query, orderBy, onSnapshot, doc, getDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const userCache = {}; // Cache to make the feed load lightning fast

document.addEventListener('userDataLoaded', () => {
    updateCreatePostUI();
    setupMarkdownButtons();
    loadFeed();
});

// INSTANT DYNAMIC UPDATE: When pload.js detects a profile change, update all my posts!
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
    const createBoxAvatar = document.querySelector('.create-post .avatar-text');
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
}

function formatContent(text) {
    let safe = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    safe = safe.replace(/```([\s\S]*?)```/g, '<div class="code-block"><pre><code>$1</code></pre></div>');
    safe = safe.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    safe = safe.replace(urlRegex, '<a href="$1" target="_blank" class="rich-link">$1</a>');
    return safe.replace(/\n/g, '<br>');
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

const btnPost = document.querySelector('.btn-post');
if (btnPost) {
    btnPost.addEventListener('click', async () => {
        const postTextarea = document.querySelector('.create-post textarea');
        const content = postTextarea.value.trim();
        if (!content) return;
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

function loadFeed() {
    const feedContainer = document.querySelector('.main-feed');
    const createPostBox = document.querySelector('.create-post');
    const trendingList = document.querySelector('.trending-list');
    
    onSnapshot(query(collection(db, "posts"), orderBy("timestamp", "desc")), (snapshot) => {
        feedContainer.innerHTML = '';
        if (createPostBox) feedContainer.appendChild(createPostBox);
        
        let allPosts = [];

        snapshot.forEach((docSnap) => {
            const post = docSnap.data();
            const postId = docSnap.id;
            allPosts.push({ id: postId, ...post }); 
            
            const isLiked = post.likedBy && post.likedBy.includes(auth.currentUser.uid);
            const isMyPost = post.authorId === auth.currentUser.uid;
            const commentsList = post.comments || [];
            let commentsHTML = commentsList.map(c => `<div class="comment-item"><strong>${c.author}:</strong> ${c.text}</div>`).join('');

            const el = document.createElement('div');
            el.className = 'card post animate-fade-in';
            // Tag element for instant dynamic updates
            el.setAttribute('data-author', post.authorId);
            el.setAttribute('data-postid', postId);
            
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

            // Note the dyn-avatar and dyn-name IDs!
            el.innerHTML = `
                <div class="post-header">
                    <div class="post-author" style="cursor:pointer;" onclick="goToProfile('${post.authorId}')">
                        <div class="avatar-text" id="dyn-avatar-${postId}"></div>
                        <div class="author-info"><strong id="dyn-name-${postId}">Loading...</strong> <span class="badge badge-idea">💡 Dev</span></div>
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
            `;
            
            feedContainer.appendChild(el);

            // Dynamically load the user's current image and name
            renderDynamicAuthor(post.authorId, postId);
        });
        
        attachListeners();
        calculateSmartTrends(allPosts, trendingList);
    });
}

// DYNAMIC AUTHOR RESOLVER ENGINE
async function renderDynamicAuthor(authorId, postId) {
    const nameEl = document.getElementById(`dyn-name-${postId}`);
    const avatarEl = document.getElementById(`dyn-avatar-${postId}`);
    if (!nameEl || !avatarEl) return;

    let userData = null;
    
    // Pull from pload.js if it's YOU (Zero Latency)
    if (window.currentUserData && authorId === window.currentUserData.uid) {
        userData = window.currentUserData;
    } else if (userCache[authorId]) {
        userData = userCache[authorId];
    } else {
        // Fetch from Firebase and Cache
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

function calculateSmartTrends(posts, widgetContainer) {
    if (!widgetContainer) return;
    widgetContainer.innerHTML = '';
    const now = new Date();
    const trendingPosts = posts.map(post => {
        const postDate = new Date(post.timestamp);
        const hoursElapsed = Math.max(0.1, (now - postDate) / (1000 * 60 * 60));
        const likes = post.likedBy ? post.likedBy.length : 0;
        const comments = post.comments ? post.comments.length : 0;
        return { ...post, trendScore: (likes + (comments * 2)) / Math.pow(hoursElapsed + 2, 1.5), likes: likes };
    });

    const topTrends = trendingPosts.sort((a, b) => b.trendScore - a.trendScore).slice(0, 3);
    if (topTrends.length === 0) {
        widgetContainer.innerHTML = '<li><span style="color:var(--text-muted);font-size:0.85rem;">No trending ideas yet.</span></li>'; return;
    }
    topTrends.forEach(trend => {
        widgetContainer.innerHTML += `<li onclick="window.location.href='post.html?id=${trend.id}'"><div class="trend-info"><strong>${trend.content.substring(0, 35)}...</strong><span><i class="ph-fill ph-rocket"></i> ${trend.likes} • Smart Rank</span></div></li>`;
    });
}

function attachListeners() {
    document.querySelectorAll('.toggle-menu-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = e.currentTarget.getAttribute('data-id');
            const menu = document.getElementById(`menu-${id}`);
            document.querySelectorAll('.post-dropdown-menu').forEach(m => { if(m !== menu) m.classList.remove('show')});
            menu.classList.toggle('show');
        });
    });

    document.addEventListener('click', () => document.querySelectorAll('.post-dropdown-menu').forEach(m => m.classList.remove('show')));

    document.querySelectorAll('.share-post-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = e.currentTarget.getAttribute('data-id');
            const shareUrl = `${window.location.origin}/post.html?id=${id}`;
            try {
                if (navigator.share) await navigator.share({ title: 'Nerd Arena Pitch', url: shareUrl });
                else { await navigator.clipboard.writeText(shareUrl); alert("Link copied to clipboard!"); }
            } catch (err) {}
            document.querySelectorAll('.post-dropdown-menu').forEach(m => m.classList.remove('show'));
        });
    });

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
            if(confirm("Delete Post?")) await deleteDoc(doc(db, "posts", e.currentTarget.getAttribute('data-id')));
        });
    });

    document.querySelectorAll('.toggle-comments-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = document.getElementById(`comments-${e.currentTarget.getAttribute('data-id')}`);
            section.style.display = section.style.display === 'none' ? 'block' : 'none';
        });
    });

    document.querySelectorAll('.submit-comment-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const input = document.getElementById(`comment-input-${id}`);
            if(!input.value.trim()) return;
            await updateDoc(doc(db, "posts", id), { comments: arrayUnion({ author: window.currentUserData.fullname, text: input.value.trim(), uid: auth.currentUser.uid }) });
            input.value = '';
        });
    });
}
window.goToProfile = function(userId) {
    if (auth.currentUser && auth.currentUser.uid === userId) window.location.href = 'profile.html';
    else window.location.href = `user.html?id=${userId}`;
}