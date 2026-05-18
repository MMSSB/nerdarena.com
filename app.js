// app.js
import { auth, db } from './firebase.js';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

document.addEventListener('userDataLoaded', () => {
    updateCreatePostUI(window.currentUserData);
    setupMarkdownButtons();
    loadFeed();
});

function updateCreatePostUI(user) {
    const createBoxAvatar = document.querySelector('.create-post .avatar-text');
    if (createBoxAvatar) {
        if (user.avatarClass && user.avatarClass.includes('url(')) {
            createBoxAvatar.style.background = user.avatarClass;
            createBoxAvatar.style.backgroundSize = 'cover';
            createBoxAvatar.innerText = '';
        } else {
            createBoxAvatar.className = `avatar-text ${user.avatarClass || 'bg-primary'}`;
            createBoxAvatar.innerText = user.fullname.substring(0, 2).toUpperCase();
        }
    }
}

// FORMATTING ENGINE (Links, Bold, Code)
function formatContent(text) {
    let safe = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    // 1. Code Blocks
    safe = safe.replace(/```([\s\S]*?)```/g, '<div class="code-block"><pre><code>$1</code></pre></div>');
    // 2. Inline Code
    safe = safe.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    // 3. Bold Text
    safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // 4. Clickable Web Links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    safe = safe.replace(urlRegex, '<a href="$1" target="_blank" class="rich-link">$1</a>');
    
    return safe.replace(/\n/g, '<br>');
}

// INJECT MARKDOWN BUTTONS
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
const postTextarea = document.querySelector('.create-post textarea');

if (btnPost && postTextarea) {
    btnPost.addEventListener('click', async () => {
        const content = postTextarea.value.trim();
        if (!content) return;
        btnPost.disabled = true; btnPost.innerText = "posting...";
        try {
            await addDoc(collection(db, "posts"), {
                authorId: window.currentUserData.uid,
                authorName: window.currentUserData.fullname,
                authorAvatarClass: window.currentUserData.avatarClass || 'bg-primary',
                content: content, likedBy: [], comments: [],
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
            allPosts.push({ id: postId, ...post }); // Save for trending calc
            
            const isLiked = post.likedBy && post.likedBy.includes(auth.currentUser.uid);
            const isMyPost = post.authorId === auth.currentUser.uid;
            const commentsList = post.comments || [];
            let commentsHTML = commentsList.map(c => `<div class="comment-item"><strong>${c.author}:</strong> ${c.text}</div>`).join('');

            const el = document.createElement('div');
            el.className = 'card post animate-fade-in';
            
            // 3-DOTS MENU HTML
            const dropdownHTML = `
                <div class="post-options-container">
                    <button class="btn-more toggle-menu-btn" data-id="${postId}"><i class="ri-more-fill"></i></button>
                    <div class="post-dropdown-menu" id="menu-${postId}">
                        <a onclick="sharePost('${postId}')"><i class="ri-share-forward-line"></i> Share Idea</a>
                        ${isMyPost 
                            ? `<a class="delete-post-btn text-danger" data-id="${postId}"><i class="ri-delete-bin-line"></i> Delete Post</a>`
                            : `<a class="report-post-btn" onclick="alert('Post reported to moderators.')"><i class="ri-flag-line"></i> Report Post</a>`
                        }
                    </div>
                </div>
            `;

            el.innerHTML = `
                <div class="post-header">
                    <div class="post-author" style="cursor:pointer;" onclick="goToProfile('${post.authorId}')">
                        <div class="avatar-text post-avatar-target"></div>
                        <div class="author-info"><strong>${post.authorName}</strong> <span class="badge badge-idea">💡 Dev</span></div>
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
                
                <div class="comments-section" id="comments-${postId}">
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
            
            feedContainer.appendChild(el);
        });
        
        attachListeners();
        calculateSmartTrends(allPosts, trendingList);
    });
}

// SMART TRENDING ALGORITHM (Hacker News Gravity Model)
function calculateSmartTrends(posts, widgetContainer) {
    if (!widgetContainer) return;
    widgetContainer.innerHTML = '';
    
    // Score = (Likes + Comments*2) / (Hours Elapsed + 2)^1.5
    const now = new Date();
    
    const trendingPosts = posts.map(post => {
        const postDate = new Date(post.timestamp);
        const hoursElapsed = Math.max(0.1, (now - postDate) / (1000 * 60 * 60));
        const likes = post.likedBy ? post.likedBy.length : 0;
        const comments = post.comments ? post.comments.length : 0;
        
        const score = (likes + (comments * 2)) / Math.pow(hoursElapsed + 2, 1.5);
        return { ...post, trendScore: score, likes: likes };
    });

    // Sort by highest score
    const topTrends = trendingPosts.sort((a, b) => b.trendScore - a.trendScore).slice(0, 3);
    
    if (topTrends.length === 0) {
        widgetContainer.innerHTML = '<li><span style="color:var(--text-muted);font-size:0.85rem;">No trending ideas yet.</span></li>';
        return;
    }

    topTrends.forEach(trend => {
        widgetContainer.innerHTML += `
            <li onclick="alert('Scroll down feed to view this post!')">
                <div class="trend-info">
                    <strong>${trend.content.substring(0, 35)}...</strong>
                    <span><i class="ph-fill ph-rocket"></i> ${trend.likes} • Smart Rank</span>
                </div>
            </li>
        `;
    });
}

function attachListeners() {
    // Dropdown Toggle
    document.querySelectorAll('.toggle-menu-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = e.currentTarget.getAttribute('data-id');
            const menu = document.getElementById(`menu-${id}`);
            // Close all others
            document.querySelectorAll('.post-dropdown-menu').forEach(m => { if(m !== menu) m.classList.remove('show')});
            menu.classList.toggle('show');
        });
    });

    // Close dropdowns on outside click
    document.addEventListener('click', () => {
        document.querySelectorAll('.post-dropdown-menu').forEach(m => m.classList.remove('show'));
    });

    // Likes & Deletes
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

    // Comments Listeners
    document.querySelectorAll('.toggle-comments-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.getElementById(`comments-${e.currentTarget.getAttribute('data-id')}`).classList.toggle('active');
        });
    });

    document.querySelectorAll('.submit-comment-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const input = document.getElementById(`comment-input-${id}`);
            if(!input.value.trim()) return;
            await updateDoc(doc(db, "posts", id), {
                comments: arrayUnion({ author: window.currentUserData.fullname, text: input.value.trim(), uid: auth.currentUser.uid })
            });
            input.value = '';
        });
    });
}

window.goToProfile = function(userId) {
    if (auth.currentUser && auth.currentUser.uid === userId) window.location.href = 'profile.html';
    else window.location.href = `user.html?id=${userId}`;
}