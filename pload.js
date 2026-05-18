// // pload.js
// import { auth, db } from './firebase.js';
// import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
// import { doc, onSnapshot, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// window.currentUserData = null;
// window.isDataLoaded = false; 

// onAuthStateChanged(auth, async (user) => {
//     const isAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html');
//     if (user) {
//         if (isAuthPage) window.location.replace("index.html");
        
//         onSnapshot(doc(db, "users", user.uid), (userDoc) => {
//             if (userDoc.exists()) {
//                 window.currentUserData = userDoc.data();
//                 setupNavbar(window.currentUserData);
                
//                 if (!window.isDataLoaded) {
//                     window.isDataLoaded = true;
//                     setupGlobalSearch(); // Initialize Live Search
//                     document.dispatchEvent(new Event('userDataLoaded')); 
//                 } else {
//                     document.dispatchEvent(new Event('userProfileUpdated')); 
//                 }
//             }
//         });
//     } else {
//         if (!isAuthPage) window.location.replace("login.html");
//     }
// });

// function setupNavbar(userData) {
//     // 1. DYNAMICALLY UPDATE AVATAR UI (Runs every time data changes)
//     const navAvatar = document.getElementById('nav-avatar');
//     if (navAvatar) {
//         const initials = userData.fullname ? userData.fullname.substring(0, 2).toUpperCase() : 'NA';
//         const avatarVal = userData.avatarClass || 'bg-primary';
//         if (avatarVal.includes('url(')) {
//             navAvatar.className = 'avatar-text'; 
//             navAvatar.style.background = avatarVal;
//             navAvatar.style.backgroundSize = 'cover'; 
//             navAvatar.style.backgroundPosition = 'center'; 
//             navAvatar.innerText = ''; 
//         } else {
//             navAvatar.className = `avatar-text ${avatarVal}`; 
//             navAvatar.style.background = ''; 
//             navAvatar.innerText = initials;
//         }
//     }

//     // 2. ATTACH LISTENERS ONLY ONCE (Fixes the broken dropdown bug!)
//     if (!window.navbarListenersAttached) {
//         const container = document.getElementById('nav-user-container');
//         const dropdown = document.getElementById('nav-dropdown');
        
//         if (container && dropdown) {
//             container.addEventListener('click', (e) => { 
//                 dropdown.classList.toggle('show'); 
//                 e.stopPropagation(); 
//             });
//             document.addEventListener('click', (e) => {
//                 // Close dropdown if clicking outside of it
//                 if (!container.contains(e.target)) {
//                     dropdown.classList.remove('show');
//                 }
//             });
//         }

//         const logoutBtn = document.getElementById('logout-btn');
//         if (logoutBtn) {
//             logoutBtn.addEventListener('click', async (e) => {
//                 e.preventDefault();
//                 await signOut(auth); 
//                 window.location.replace("login.html");
//             });
//         }
        
//         window.navbarListenersAttached = true;
//     }
// }

// // --- GLOBAL LIVE SEARCH ENGINE ---
// function setupGlobalSearch() {
//     const searchContainer = document.querySelector('.search-container');
//     const searchInput = searchContainer?.querySelector('input');
//     const mobileSearchBtn = document.querySelector('.icon-btn.show-mobile-only');
//     const header = document.querySelector('.top-header');

//     if (!searchContainer || !searchInput) return;

//     const closeBtn = document.createElement('button');
//     closeBtn.className = 'mobile-search-close';
//     closeBtn.innerHTML = '<i class="ri-arrow-left-line"></i>';
//     searchContainer.insertBefore(closeBtn, searchInput);

//     mobileSearchBtn?.addEventListener('click', () => {
//         header.classList.add('mobile-search-active');
//         searchInput.focus();
//     });

//     closeBtn.addEventListener('click', () => {
//         header.classList.remove('mobile-search-active');
//         searchInput.value = '';
//         dropdownMenu.classList.remove('show');
//     });

//     const dropdownMenu = document.createElement('div');
//     dropdownMenu.className = 'live-search-dropdown';
//     searchContainer.appendChild(dropdownMenu);

//     let searchTimeout;

//     searchInput.addEventListener('input', (e) => {
//         const query = e.target.value.trim().toLowerCase();
//         clearTimeout(searchTimeout);
//         if (query.length < 2) { dropdownMenu.classList.remove('show'); return; }

//         dropdownMenu.innerHTML = `<div style="padding: 15px; text-align: center; color: var(--text-muted);"><i class="ri-loader-4-line ri-spin"></i> Searching Arena...</div>`;
//         dropdownMenu.classList.add('show');
//         searchTimeout = setTimeout(() => performLiveSearch(query, dropdownMenu), 400);
//     });

//     searchInput.addEventListener('keypress', (e) => {
//         if (e.key === 'Enter' && searchInput.value.trim() !== '') {
//             window.location.href = `search.html?q=${encodeURIComponent(searchInput.value.trim())}`;
//         }
//     });

//     document.addEventListener('click', (e) => {
//         if (!searchContainer.contains(e.target)) dropdownMenu.classList.remove('show');
//     });
// }

// async function performLiveSearch(query, dropdown) {
//     try {
//         let resultsHTML = '';
//         let matchCount = 0;

//         const usersSnap = await getDocs(collection(db, "users"));
//         let userMatches = [];
//         usersSnap.forEach(doc => {
//             const u = doc.data();
//             if (u.fullname.toLowerCase().includes(query) || u.username.toLowerCase().includes(query)) userMatches.push(u);
//         });

//         if (userMatches.length > 0) {
//             resultsHTML += `<div class="live-search-group-title">Nerds</div>`;
//             userMatches.slice(0, 3).forEach(u => {
//                 matchCount++;
//                 let avatar = u.avatarClass?.includes('url(') ? `style="background:${u.avatarClass}; background-size:cover;"` : `class="avatar-text ${u.avatarClass || 'bg-blue'}"`;
//                 let content = u.avatarClass?.includes('url(') ? '' : u.fullname.substring(0,2).toUpperCase();
//                 resultsHTML += `
//                     <div class="live-search-item" onclick="window.location.href='user.html?id=${u.uid}'">
//                         <div ${avatar}>${content}</div>
//                         <div class="live-search-info"><strong>${u.fullname}</strong><span>@${u.username}</span></div>
//                     </div>`;
//             });
//         }

//         const postsSnap = await getDocs(collection(db, "posts"));
//         let postMatches = [];
//         postsSnap.forEach(doc => {
//             const p = doc.data(); p.id = doc.id;
//             if (p.content.toLowerCase().includes(query) || p.authorName.toLowerCase().includes(query)) postMatches.push(p);
//         });

//         if (postMatches.length > 0) {
//             resultsHTML += `<div class="live-search-group-title">Pitches</div>`;
//             postMatches.slice(0, 3).forEach(p => {
//                 matchCount++;
//                 resultsHTML += `
//                     <div class="live-search-item" onclick="window.location.href='post.html?id=${p.id}'">
//                         <div class="avatar-text" style="background:var(--bg-color); color:var(--text-muted);"><i class="ri-terminal-box-line"></i></div>
//                         <div class="live-search-info"><strong>${p.content.substring(0, 30)}...</strong><span>by ${p.authorName}</span></div>
//                     </div>`;
//             });
//         }

//         if (matchCount === 0) {
//             dropdown.innerHTML = `<div style="padding: 15px; text-align: center; color: var(--text-muted);">No results found.</div>`;
//         } else {
//             resultsHTML += `<div class="live-search-footer" onclick="window.location.href='search.html?q=${encodeURIComponent(query)}'">See all results for "${query}" <i class="ri-arrow-right-line"></i></div>`;
//             dropdown.innerHTML = resultsHTML;
//         }
//     } catch (error) { 
//         dropdown.innerHTML = `<div style="padding: 15px; text-align: center; color: #dc2626;">Search failed.</div>`; 
//     }
// }
























// pload.js
import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, onSnapshot, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

window.currentUserData = null;
window.isDataLoaded = false; 

onAuthStateChanged(auth, async (user) => {
    const isAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html');
    if (user) {
        if (isAuthPage) window.location.replace("index.html");
        
        onSnapshot(doc(db, "users", user.uid), (userDoc) => {
            if (userDoc.exists()) {
                window.currentUserData = userDoc.data();
                
                // 🔥 THE THEME FIX: Sync Firebase preferences to Local Storage instantly
                if (window.currentUserData.theme) localStorage.setItem('na_theme', window.currentUserData.theme);
                if (window.currentUserData.accentColor) localStorage.setItem('na_accent', window.currentUserData.accentColor);
                if (window.currentUserData.accentHover) localStorage.setItem('na_accent_hover', window.currentUserData.accentHover);
                
                // Force the DOM to apply the colors we just downloaded
                if (window.applyThemeToDOM) window.applyThemeToDOM();

                setupNavbar(window.currentUserData);
                
                if (!window.isDataLoaded) {
                    window.isDataLoaded = true;
                    setupGlobalSearch(); // Initialize Live Search
                    document.dispatchEvent(new Event('userDataLoaded')); 
                } else {
                    document.dispatchEvent(new Event('userProfileUpdated')); 
                }
            }
        });
    } else {
        if (!isAuthPage) window.location.replace("login.html");
    }
});

function setupNavbar(userData) {
    const navAvatar = document.getElementById('nav-avatar');
    if (navAvatar) {
        const initials = userData.fullname ? userData.fullname.substring(0, 2).toUpperCase() : 'NA';
        const avatarVal = userData.avatarClass || 'bg-primary';
        if (avatarVal.includes('url(')) {
            navAvatar.className = 'avatar-text'; 
            navAvatar.style.background = avatarVal;
            navAvatar.style.backgroundSize = 'cover'; 
            navAvatar.style.backgroundPosition = 'center'; 
            navAvatar.innerText = ''; 
        } else {
            navAvatar.className = `avatar-text ${avatarVal}`; 
            navAvatar.style.background = ''; 
            navAvatar.innerText = initials;
        }
    }

    if (!window.navbarListenersAttached) {
        const container = document.getElementById('nav-user-container');
        const dropdown = document.getElementById('nav-dropdown');
        
        if (container && dropdown) {
            container.addEventListener('click', (e) => { 
                dropdown.classList.toggle('show'); 
                e.stopPropagation(); 
            });
            document.addEventListener('click', (e) => {
                if (!container.contains(e.target)) dropdown.classList.remove('show');
            });
        }

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                
                // 🔥 THE FIX: Wipe local storage on logout to restore Default Colors
                localStorage.removeItem('na_theme');
                localStorage.removeItem('na_accent');
                localStorage.removeItem('na_accent_hover');
                if (window.applyThemeToDOM) window.applyThemeToDOM(); // Reverts to style.css defaults
                
                await signOut(auth); 
                window.location.replace("login.html");
            });
        }
        
        window.navbarListenersAttached = true;
    }
}

// --- GLOBAL LIVE SEARCH ENGINE ---
function setupGlobalSearch() {
    const searchContainer = document.querySelector('.search-container');
    const searchInput = searchContainer?.querySelector('input');
    const mobileSearchBtn = document.querySelector('.icon-btn.show-mobile-only');
    const header = document.querySelector('.top-header');

    if (!searchContainer || !searchInput) return;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'mobile-search-close';
    closeBtn.innerHTML = '<i class="ri-arrow-left-line"></i>';
    searchContainer.insertBefore(closeBtn, searchInput);

    mobileSearchBtn?.addEventListener('click', () => {
        header.classList.add('mobile-search-active');
        searchInput.focus();
    });

    closeBtn.addEventListener('click', () => {
        header.classList.remove('mobile-search-active');
        searchInput.value = '';
        dropdownMenu.classList.remove('show');
    });

    const dropdownMenu = document.createElement('div');
    dropdownMenu.className = 'live-search-dropdown';
    searchContainer.appendChild(dropdownMenu);

    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        clearTimeout(searchTimeout);
        if (query.length < 2) { dropdownMenu.classList.remove('show'); return; }

        dropdownMenu.innerHTML = `<div style="padding: 15px; text-align: center; color: var(--text-muted);"><i class="ri-loader-4-line ri-spin"></i> Searching Arena...</div>`;
        dropdownMenu.classList.add('show');
        searchTimeout = setTimeout(() => performLiveSearch(query, dropdownMenu), 400);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim() !== '') {
            window.location.href = `search.html?q=${encodeURIComponent(searchInput.value.trim())}`;
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target)) dropdownMenu.classList.remove('show');
    });
}

async function performLiveSearch(query, dropdown) {
    try {
        let resultsHTML = '';
        let matchCount = 0;

        const usersSnap = await getDocs(collection(db, "users"));
        let userMatches = [];
        usersSnap.forEach(doc => {
            const u = doc.data();
            if (u.fullname.toLowerCase().includes(query) || u.username.toLowerCase().includes(query)) userMatches.push(u);
        });

        if (userMatches.length > 0) {
            resultsHTML += `<div class="live-search-group-title">Nerds</div>`;
            userMatches.slice(0, 3).forEach(u => {
                matchCount++;
                let avatar = u.avatarClass?.includes('url(') ? `style="background:${u.avatarClass}; background-size:cover;"` : `class="avatar-text ${u.avatarClass || 'bg-blue'}"`;
                let content = u.avatarClass?.includes('url(') ? '' : u.fullname.substring(0,2).toUpperCase();
                resultsHTML += `
                    <div class="live-search-item" onclick="window.location.href='user.html?id=${u.uid}'">
                        <div ${avatar}>${content}</div>
                        <div class="live-search-info"><strong>${u.fullname}</strong><span>@${u.username}</span></div>
                    </div>`;
            });
        }

        const postsSnap = await getDocs(collection(db, "posts"));
        let postMatches = [];
        postsSnap.forEach(doc => {
            const p = doc.data(); p.id = doc.id;
            if (p.content.toLowerCase().includes(query) || p.authorName.toLowerCase().includes(query)) postMatches.push(p);
        });

        if (postMatches.length > 0) {
            resultsHTML += `<div class="live-search-group-title">Pitches</div>`;
            postMatches.slice(0, 3).forEach(p => {
                matchCount++;
                resultsHTML += `
                    <div class="live-search-item" onclick="window.location.href='post.html?id=${p.id}'">
                        <div class="avatar-text" style="background:var(--bg-color); color:var(--text-muted);"><i class="ri-terminal-box-line"></i></div>
                        <div class="live-search-info"><strong>${p.content.substring(0, 30)}...</strong><span>by ${p.authorName}</span></div>
                    </div>`;
            });
        }

        if (matchCount === 0) {
            dropdown.innerHTML = `<div style="padding: 15px; text-align: center; color: var(--text-muted);">No results found.</div>`;
        } else {
            resultsHTML += `<div class="live-search-footer" onclick="window.location.href='search.html?q=${encodeURIComponent(query)}'">See all results for "${query}" <i class="ri-arrow-right-line"></i></div>`;
            dropdown.innerHTML = resultsHTML;
        }
    } catch (error) { 
        dropdown.innerHTML = `<div style="padding: 15px; text-align: center; color: #dc2626;">Search failed.</div>`; 
    }
}