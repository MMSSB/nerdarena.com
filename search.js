// // search.js
// import { auth, db } from './firebase.js';
// import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// const urlParams = new URLSearchParams(window.location.search);
// const queryParam = urlParams.get('q') ? urlParams.get('q').toLowerCase() : '';

// document.addEventListener('userDataLoaded', () => {
//     const display = document.getElementById('search-query-display');
//     const pageInput = document.getElementById('page-search-input');
    
//     // Wire up the new On-Page Search Bar
//     if (pageInput) {
//         if (urlParams.get('q')) pageInput.value = urlParams.get('q'); // Auto-fill the bar
        
//         const executeSearch = () => {
//             const val = pageInput.value.trim();
//             if (val) window.location.href = `search.html?q=${encodeURIComponent(val)}`;
//         };
        
//         document.getElementById('page-search-btn').addEventListener('click', executeSearch);
//         pageInput.addEventListener('keypress', (e) => {
//             if (e.key === 'Enter') executeSearch();
//         });
//     }

//     if (queryParam) {
//         display.innerText = `"${urlParams.get('q')}"`;
//         performAdvancedSearch(queryParam);
//     } else {
//         display.innerText = "Everything";
//         document.getElementById('search-results-posts').innerHTML = "<p style='text-align:center; padding:20px; color:var(--text-muted);'>Type something in the search bar above.</p>";
//         document.getElementById('people-grid-container').innerHTML = "";
//     }
// });

// // Rich Text Formatter
// function formatContent(text) {
//     let safe = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
//     safe = safe.replace(/```([\s\S]*?)```/g, '<div class="code-block"><pre><code>$1</code></pre></div>');
//     safe = safe.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
//     safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
//     return safe.replace(/\n/g, '<br>');
// }

// async function performAdvancedSearch(searchTerm) {
//     const postsContainer = document.getElementById('search-results-posts');
//     const peopleContainer = document.getElementById('people-grid-container');

//     try {
//         // 1. ADVANCED USER SEARCH
//         const usersSnap = await getDocs(collection(db, "users"));
//         peopleContainer.innerHTML = '';
//         let foundUsers = 0;

//         usersSnap.forEach(doc => {
//             const user = doc.data();
//             const searchableText = `${user.fullname} ${user.username} ${user.bio || ''}`.toLowerCase();
            
//             if (searchableText.includes(searchTerm)) {
//                 foundUsers++;
//                 const card = document.createElement('div');
//                 card.className = 'network-card animate-fade-in';
//                 card.onclick = () => window.location.href = `user.html?id=${user.uid}`;
                
//                 let avatarHTML = user.avatarClass?.includes('url(') 
//                     ? `<div class="avatar-text" style="background:${user.avatarClass}; background-size:cover; background-position:center;"></div>`
//                     : `<div class="avatar-text ${user.avatarClass || 'bg-blue'}">${user.fullname.substring(0,2).toUpperCase()}</div>`;

//                 card.innerHTML = `
//                     ${avatarHTML}
//                     <div style="flex: 1; overflow: hidden;">
//                         <strong style="display:block; font-size:1rem; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${user.fullname}</strong>
//                         <span style="font-size:0.8rem; color:var(--text-muted);">@${user.username}</span>
//                         ${user.bio ? `<p style="font-size:0.85rem; color:var(--text-main); margin-top:5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${user.bio}</p>` : ''}
//                     </div>
//                 `;
//                 peopleContainer.appendChild(card);
//             }
//         });
//         if (foundUsers === 0) peopleContainer.innerHTML = "<div style='grid-column: 1/-1; text-align:center; padding: 30px; color: var(--text-muted);'>No developers found.</div>";

//         // 2. ADVANCED POST SEARCH
//         const postsSnap = await getDocs(collection(db, "posts"));
//         postsContainer.innerHTML = '';
//         let foundPosts = 0;

//         let matchedPosts = [];
//         postsSnap.forEach(docSnap => {
//             const post = docSnap.data();
//             post.id = docSnap.id;
//             if (post.content.toLowerCase().includes(searchTerm) || post.authorName.toLowerCase().includes(searchTerm)) {
//                 matchedPosts.push(post);
//             }
//         });

//         matchedPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

//         matchedPosts.forEach(post => {
//             foundPosts++;
//             const el = document.createElement('div');
//             el.className = 'card post animate-fade-in';
//             el.style.cursor = "pointer";
//             el.onclick = () => window.location.href = `post.html?id=${post.id}`; 
            
//             el.innerHTML = `
//                 <div class="post-header" style="margin-bottom: 5px;">
//                     <div class="post-author">
//                         <div class="author-info">
//                             <strong>${post.authorName}</strong> 
//                             <span style="color:var(--text-muted); font-size:0.8rem;">• Match in Pitch</span>
//                         </div>
//                     </div>
//                 </div>
//                 <div class="post-content" style="font-size: 1rem; color: var(--text-muted);"><p>${formatContent(post.content)}</p></div>
//             `;
//             postsContainer.appendChild(el);
//         });

//         if (foundPosts === 0) postsContainer.innerHTML = "<div style='text-align:center; padding: 40px; color: var(--text-muted);'>No pitches or ideas found.</div>";

//     } catch (error) {
//         console.error("Search error:", error);
//         postsContainer.innerHTML = "<p style='color:red; text-align:center;'>Error executing search engine.</p>";
//     }
// }









// search.js
import { auth, db } from './firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const queryParam = urlParams.get('q') ? urlParams.get('q').toLowerCase() : '';

document.addEventListener('userDataLoaded', () => {
    const display = document.getElementById('search-query-display');
    const pageInput = document.getElementById('page-search-input');
    
    // Wire up the new On-Page Search Bar
    if (pageInput) {
        if (urlParams.get('q')) pageInput.value = urlParams.get('q'); // Auto-fill the bar
        
        const executeSearch = () => {
            const val = pageInput.value.trim();
            if (val) window.location.href = `search.html?q=${encodeURIComponent(val)}`;
        };
        
        document.getElementById('page-search-btn').addEventListener('click', executeSearch);
        pageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') executeSearch();
        });
    }

    if (queryParam) {
        display.innerText = `"${urlParams.get('q')}"`;
        performAdvancedSearch(queryParam);
    } else {
        display.innerText = "Everything";
        document.getElementById('search-results-posts').innerHTML = "<p style='text-align:center; padding:20px; color:var(--text-muted);'>Type something in the search bar above.</p>";
        document.getElementById('people-grid-container').innerHTML = "";
    }
});

// Rich Text Formatter
function formatContent(text) {
    // ENHANCEMENT: Prevent crash if post content is missing/undefined
    if (!text) return ''; 
    
    let safe = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    safe = safe.replace(/```([\s\S]*?)```/g, '<div class="code-block"><pre><code>$1</code></pre></div>');
    safe = safe.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return safe.replace(/\n/g, '<br>');
}

async function performAdvancedSearch(searchTerm) {
    const postsContainer = document.getElementById('search-results-posts');
    const peopleContainer = document.getElementById('people-grid-container');

    try {
        // 1. ADVANCED USER SEARCH
        const usersSnap = await getDocs(collection(db, "users"));
        peopleContainer.innerHTML = '';
        let foundUsers = 0;

        usersSnap.forEach(doc => {
            const user = doc.data();
            
            // ENHANCEMENT: Null-safe variables prevent crashing on incomplete profiles
            const safeName = user.fullname || 'Unknown Nerd';
            const safeUsername = user.username || 'unknown';
            const safeBio = user.bio || '';
            const uid = user.uid || doc.id;
            
            const searchableText = `${safeName} ${safeUsername} ${safeBio}`.toLowerCase();
            
            if (searchableText.includes(searchTerm)) {
                foundUsers++;
                const card = document.createElement('div');
                card.className = 'network-card animate-fade-in';
                card.onclick = () => window.location.href = `user.html?id=${uid}`;
                
                // Safe avatar rendering
                let avatarHTML = user.avatarClass?.includes('url(') 
                    ? `<div class="avatar-text" style="background:${user.avatarClass}; background-size:cover; background-position:center;"></div>`
                    : `<div class="avatar-text ${user.avatarClass || 'bg-blue'}">${safeName.substring(0,2).toUpperCase()}</div>`;

                card.innerHTML = `
                    ${avatarHTML}
                    <div style="flex: 1; overflow: hidden;">
                        <strong style="display:block; font-size:1rem; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${safeName}</strong>
                        <span style="font-size:0.8rem; color:var(--text-muted);">@${safeUsername}</span>
                        ${safeBio ? `<p style="font-size:0.85rem; color:var(--text-main); margin-top:5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${safeBio}</p>` : ''}
                    </div>
                `;
                peopleContainer.appendChild(card);
            }
        });
        if (foundUsers === 0) peopleContainer.innerHTML = "<div style='grid-column: 1/-1; text-align:center; padding: 30px; color: var(--text-muted);'>No developers found.</div>";

        // 2. ADVANCED POST SEARCH
        const postsSnap = await getDocs(collection(db, "posts"));
        postsContainer.innerHTML = '';
        let foundPosts = 0;

        let matchedPosts = [];
        postsSnap.forEach(docSnap => {
            const post = docSnap.data();
            post.id = docSnap.id;
            
            // ENHANCEMENT: Null-safe strings for searching content
            const safeContent = (post.content || '').toLowerCase();
            const safeAuthor = (post.authorName || '').toLowerCase();
            
            if (safeContent.includes(searchTerm) || safeAuthor.includes(searchTerm)) {
                matchedPosts.push(post);
            }
        });

        // ENHANCEMENT: Safely sort posts (handles missing timestamps gracefully)
        matchedPosts.sort((a, b) => {
            const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return timeB - timeA;
        });

        matchedPosts.forEach(post => {
            foundPosts++;
            const el = document.createElement('div');
            el.className = 'card post animate-fade-in';
            el.style.cursor = "pointer";
            el.onclick = () => window.location.href = `post.html?id=${post.id}`; 
            
            const displayAuthor = post.authorName || 'Anonymous';
            const displayContent = post.content || '';
            
            el.innerHTML = `
                <div class="post-header" style="margin-bottom: 5px;">
                    <div class="post-author">
                        <div class="author-info">
                            <strong>${displayAuthor}</strong> 
                            <span style="color:var(--text-muted); font-size:0.8rem;">• Match in Pitch</span>
                        </div>
                    </div>
                </div>
                <div class="post-content" style="font-size: 1rem; color: var(--text-muted);"><p>${formatContent(displayContent)}</p></div>
            `;
            postsContainer.appendChild(el);
        });

        if (foundPosts === 0) postsContainer.innerHTML = "<div style='text-align:center; padding: 40px; color: var(--text-muted);'>No pitches or ideas found.</div>";

    } catch (error) {
        console.error("Search error:", error);
        postsContainer.innerHTML = "<p style='color:red; text-align:center;'>Error executing search engine. Check console.</p>";
    }
}