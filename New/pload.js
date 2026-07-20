




// // pload.js
// import { auth, db } from './firebase.js';
// import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
// import { doc, onSnapshot, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// window.currentUserData = null;
// window.isDataLoaded = false; 

// onAuthStateChanged(auth, async (user) => {
//     const isAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html');
//     if (user) {
//         if (isAuthPage) window.location.replace("home.html");
        
//         onSnapshot(doc(db, "users", user.uid), (userDoc) => {
//             if (userDoc.exists()) {
//                 window.currentUserData = userDoc.data();
                
//                 // 🔥 THE THEME FIX: Sync Firebase preferences to Local Storage instantly
//                 if (window.currentUserData.theme) localStorage.setItem('na_theme', window.currentUserData.theme);
//                 if (window.currentUserData.accentColor) localStorage.setItem('na_accent', window.currentUserData.accentColor);
//                 if (window.currentUserData.accentHover) localStorage.setItem('na_accent_hover', window.currentUserData.accentHover);
                
//                 // Force the DOM to apply the colors we just downloaded
//                 if (window.applyThemeToDOM) window.applyThemeToDOM();

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

//     if (!window.navbarListenersAttached) {
//         const container = document.getElementById('nav-user-container');
//         const dropdown = document.getElementById('nav-dropdown');
        
//         if (container && dropdown) {
//             container.addEventListener('click', (e) => { 
//                 dropdown.classList.toggle('show'); 
//                 e.stopPropagation(); 
//             });
//             document.addEventListener('click', (e) => {
//                 if (!container.contains(e.target)) dropdown.classList.remove('show');
//             });
//         }

//         const logoutBtn = document.getElementById('logout-btn');
//         if (logoutBtn) {
//             logoutBtn.addEventListener('click', async (e) => {
//                 e.preventDefault();
                
//                 // 🔥 THE FIX: Wipe local storage on logout to restore Default Colors
//                 localStorage.removeItem('na_theme');
//                 localStorage.removeItem('na_accent');
//                 localStorage.removeItem('na_accent_hover');
//                 if (window.applyThemeToDOM) window.applyThemeToDOM(); // Reverts to style.css defaults
                
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

//         dropdownMenu.innerHTML = `<div style="padding: 15px; text-align: center; color: var(--text-muted);"><i class="fa-solid fa-circle-notch fa-spin"></i> Searching Arena...</div>`;
//         // dropdownMenu.innerHTML = `<div style="padding: 15px; text-align: center; color: var(--text-muted);"><i class="ri-loader-4-line ri-spin"></i> Searching Arena...</div>`;
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

//         // --- 1. SAFE USER SEARCH ---
//         const usersSnap = await getDocs(collection(db, "users"));
//         let userMatches = [];
        
//         usersSnap.forEach(doc => {
//             const u = doc.data();
//             // ENHANCEMENT: Null-safe fallbacks prevent the script from crashing
//             const fname = (u.fullname || '').toLowerCase();
//             const uname = (u.username || '').toLowerCase();
            
//             if (fname.includes(query) || uname.includes(query)) {
//                 u.uid = u.uid || doc.id; // Guarantee an ID exists for the routing
//                 userMatches.push(u);
//             }
//         });

//         if (userMatches.length > 0) {
//             resultsHTML += `<div class="live-search-group-title">Nerds</div>`;
//             userMatches.slice(0, 3).forEach(u => {
//                 matchCount++;
                
//                 // ENHANCEMENT: Fallbacks for UI rendering
//                 const safeName = u.fullname || 'Unknown Nerd';
//                 const safeUsername = u.username || 'unknown';
//                 const initials = safeName.substring(0, 2).toUpperCase();
                
//                 let avatar = u.avatarClass?.includes('url(') 
//                     ? `style="background:${u.avatarClass}; background-size:cover;"` 
//                     : `class="avatar-text ${u.avatarClass || 'bg-blue'}"`;
//                 let content = u.avatarClass?.includes('url(') ? '' : initials;
                
//                 resultsHTML += `
//                     <div class="live-search-item" onclick="window.location.href='user.html?id=${u.uid}'">
//                         <div ${avatar}>${content}</div>
//                         <div class="live-search-info">
//                             <strong>${safeName}</strong>
//                             <span>@${safeUsername}</span>
//                         </div>
//                     </div>`;
//             });
//         }

//         // --- 2. SAFE POST SEARCH ---
//         const postsSnap = await getDocs(collection(db, "posts"));
//         let postMatches = [];
        
//         postsSnap.forEach(doc => {
//             const p = doc.data(); 
//             p.id = doc.id;
            
//             // ENHANCEMENT: Null-safe checks for post data
//             const contentText = (p.content || '').toLowerCase();
//             const authorName = (p.authorName || '').toLowerCase();
            
//             if (contentText.includes(query) || authorName.includes(query)) {
//                 postMatches.push(p);
//             }
//         });

//         if (postMatches.length > 0) {
//             resultsHTML += `<div class="live-search-group-title">Posts</div>`;
//             postMatches.slice(0, 3).forEach(p => {
//                 matchCount++;
                
//                 // ENHANCEMENT: Clean text truncation
//                 const safeContent = p.content || '';
//                 const previewText = safeContent.substring(0, 35) + (safeContent.length > 35 ? '...' : '');
//                 const safeAuthor = p.authorName || 'Anonymous';

//                 resultsHTML += `
//                     <div class="live-search-item" onclick="window.location.href='post.html?id=${p.id}'">
//                         <div class="avatar-text" style="background:var(--bg-color); color:var(--text-muted);">
//                             <i class="ri-terminal-box-line"></i>
//                         </div>
//                         <div class="live-search-info">
//                             <strong>${previewText}</strong>
//                             <span>by ${safeAuthor}</span>
//                         </div>
//                     </div>`;
//             });
//         }

//         // --- 3. RENDER RESULTS ---
//         if (matchCount === 0) {
//             dropdown.innerHTML = `<div style="padding: 15px; text-align: center; color: var(--text-muted);">No records found in the Arena.</div>`;
//         } else {
//             resultsHTML += `
//                 <div class="live-search-footer" onclick="window.location.href='search.html?q=${encodeURIComponent(query)}'">
//                     See all results for "${query}" <i class="ri-arrow-right-line"></i>
//                 </div>`;
//             dropdown.innerHTML = resultsHTML;
//         }

//     } catch (error) { 
//         // ENHANCEMENT: Log the actual error to the console so it isn't swallowed
//         console.error("Live Search Error:", error);
//         dropdown.innerHTML = `<div style="padding: 15px; text-align: center; color: #dc2626;">Search failed. Check console for details.</div>`; 
//     }
// }






















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
                
                if (window.currentUserData.theme) localStorage.setItem('na_theme', window.currentUserData.theme);
                if (window.currentUserData.accentColor) localStorage.setItem('na_accent', window.currentUserData.accentColor);
                if (window.currentUserData.accentHover) localStorage.setItem('na_accent_hover', window.currentUserData.accentHover);
                if (window.applyThemeToDOM) window.applyThemeToDOM();

                setupNavbar(window.currentUserData, true);
                
                if (!window.isDataLoaded) {
                    window.isDataLoaded = true;
                    setupGlobalSearch(); 
                    document.dispatchEvent(new Event('userDataLoaded')); 
                } else {
                    document.dispatchEvent(new Event('userProfileUpdated')); 
                }
            }
        });
    } else {
        window.currentUserData = null;
        if (window.applyThemeToDOM) window.applyThemeToDOM();
        
        setupNavbar(null, false);
        
        if (!window.isDataLoaded) {
             window.isDataLoaded = true;
             setupGlobalSearch();
        }
    }
});
function setupNavbar(userData, isLoggedIn) {
    const navAvatar = document.getElementById('nav-avatar');
    const navDropdown = document.getElementById('nav-dropdown');
    
    if (navAvatar && navDropdown) {
        if (isLoggedIn && userData) {
            const initials = userData.fullname ? userData.fullname.substring(0, 2).toUpperCase() : 'NA';
            const avatarVal = userData.avatarClass || 'bg-primary';
            
            // Generate Avatar HTML string for re-use in the dropdown
            let avatarHTML = '';
            if (avatarVal.includes('url(')) {
                navAvatar.className = 'avatar-text'; 
                navAvatar.style.backgroundImage = avatarVal; // FIXED: Using backgroundImage
                navAvatar.style.backgroundSize = 'cover'; 
                navAvatar.style.backgroundPosition = 'center'; 
                navAvatar.innerText = ''; 
                avatarHTML = `<div class="avatar-text" style="background-image: ${avatarVal}; background-size: cover; background-position: center; margin: 0 auto 10px;"></div>`;
            } else {
                navAvatar.className = `avatar-text ${avatarVal}`; 
                navAvatar.style.backgroundImage = ''; 
                navAvatar.innerText = initials;
                avatarHTML = `<div class="avatar-text ${avatarVal}" style="margin: 0 auto 10px;">${initials}</div>`;
            }

            // Injected Avatar into Dropdown
            navDropdown.innerHTML = `
                <div class="dropdown-header" style="padding: 20px 15px 15px; text-align: center;">
                    ${avatarHTML}
                    <strong style="display: block;">${userData.fullname || 'Nerd'}</strong>
                    <span style="font-size: 0.85rem; color: var(--text-muted);">@${userData.username || 'user'}</span>
                </div>
                <div class="dropdown-divider"></div>
                <a href="profile.html"><i class="ri-user-line"></i> My Profile</a>
                <a href="settings.html"><i class="ri-settings-4-line"></i> Settings</a>
                <div class="dropdown-divider"></div>
                <a href="#" id="logout-btn" class="text-danger"><i class="ri-logout-box-r-line"></i> Log Out</a>
            `;
            
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    localStorage.removeItem('na_theme');
                    localStorage.removeItem('na_accent');
                    await signOut(auth); 
                    window.location.replace("login.html");
                });
            }
        } else {
            navAvatar.className = 'avatar-text bg-primary';
            navAvatar.innerHTML = '<i class="ri-user-line"></i>';
            navAvatar.style.backgroundImage = '';
            
            navDropdown.innerHTML = `
                <div class="dropdown-header" style="padding: 15px; text-align: center;">
                    <strong style="display: block;">Welcome to the Arena</strong>
                    <span style="font-size: 0.85rem; color: var(--text-muted);">Join the community</span>
                </div>
                <div class="dropdown-divider"></div>
                <a href="login.html"><i class="ri-login-box-line"></i> Log In</a>
                <a href="signup.html"><i class="ri-user-add-line"></i> Create Account</a>
                <div class="dropdown-divider"></div>
                <a href="about.html"><i class="ri-information-line"></i> About Nerd Arena</a>
            `;
        }
    }

    if (!window.navbarListenersAttached) {
        const container = document.getElementById('nav-user-container');
        if (container && navDropdown) {
            container.addEventListener('click', (e) => { 
                navDropdown.classList.toggle('show'); 
                e.stopPropagation(); 
            });
            document.addEventListener('click', (e) => {
                if (!container.contains(e.target)) navDropdown.classList.remove('show');
            });
        }
        window.navbarListenersAttached = true;
    }
}
// function setupNavbar(userData, isLoggedIn) {
//     const navAvatar = document.getElementById('nav-avatar');
//     const navDropdown = document.getElementById('nav-dropdown');
    
//     if (navAvatar && navDropdown) {
//         if (isLoggedIn && userData) {
//             const initials = userData.fullname ? userData.fullname.substring(0, 2).toUpperCase() : 'NA';
//             const avatarVal = userData.avatarClass || 'bg-primary';
            
//             if (avatarVal.includes('url(')) {
//                 navAvatar.className = 'avatar-text'; 
//                 navAvatar.style.background = avatarVal;
//                 navAvatar.style.backgroundSize = 'cover'; 
//                 navAvatar.style.backgroundPosition = 'center'; 
//                 navAvatar.innerText = ''; 
//             } else {
//                 navAvatar.className = `avatar-text ${avatarVal}`; 
//                 navAvatar.style.background = ''; 
//                 navAvatar.innerText = initials;
//             }

//             navDropdown.innerHTML = `
//                 <div class="dropdown-header" style="padding: 15px; text-align: center;">
//                     <strong style="display: block;">${userData.fullname || 'Nerd'}</strong>
//                     <span style="font-size: 0.85rem; color: var(--text-muted);">@${userData.username || 'user'}</span>
//                 </div>
//                 <div class="dropdown-divider"></div>
//                 <a href="profile.html"><i class="ri-user-line"></i> My Profile</a>
//                 <a href="settings.html"><i class="ri-settings-4-line"></i> Settings</a>
//                 <div class="dropdown-divider"></div>
//                 <a href="#" id="logout-btn" class="text-danger"><i class="ri-logout-box-r-line"></i> Log Out</a>
//             `;
            
//             const logoutBtn = document.getElementById('logout-btn');
//             if (logoutBtn) {
//                 logoutBtn.addEventListener('click', async (e) => {
//                     e.preventDefault();
//                     localStorage.removeItem('na_theme');
//                     localStorage.removeItem('na_accent');
//                     localStorage.removeItem('na_accent_hover');
//                     await signOut(auth); 
//                     window.location.replace("login.html");
//                 });
//             }
//         } else {
//             navAvatar.className = 'avatar-text bg-primary';
//             navAvatar.innerHTML = '<i class="ri-user-line"></i>';
//             // navAvatar.innerHTML = '<i class="ri-user-smile-line"></i>';
//             navAvatar.style.background = '';
            
//             navDropdown.innerHTML = `
//                 <div class="dropdown-header" style="padding: 15px; text-align: center;">
//                     <strong style="display: block;">Welcome to the Arena</strong>
//                     <span style="font-size: 0.85rem; color: var(--text-muted);">Join the community</span>
//                 </div>
//                 <div class="dropdown-divider"></div>
//                 <a href="login.html"><i class="ri-login-box-line"></i> Log In</a>
//                 <a href="signup.html"><i class="ri-user-add-line"></i> Create Account</a>
//                 <div class="dropdown-divider"></div>
//                 <a href="about.html"><i class="ri-information-line"></i> About Nerd Arena</a>
//             `;
//         }
//     }

//     if (!window.navbarListenersAttached) {
//         const container = document.getElementById('nav-user-container');
//         if (container && navDropdown) {
//             container.addEventListener('click', (e) => { 
//                 navDropdown.classList.toggle('show'); 
//                 e.stopPropagation(); 
//             });
//             document.addEventListener('click', (e) => {
//                 if (!container.contains(e.target)) navDropdown.classList.remove('show');
//             });
//         }
//         window.navbarListenersAttached = true;
//     }
// }

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

        dropdownMenu.innerHTML = `<div style="padding: 15px; text-align: center; color: var(--text-muted);"><i class="fa-solid fa-circle-notch fa-spin"></i> Searching Arena...</div>`;
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
            const fname = (u.fullname || '').toLowerCase();
            const uname = (u.username || '').toLowerCase();
            
            if (fname.includes(query) || uname.includes(query)) {
                u.uid = u.uid || doc.id; 
                userMatches.push(u);
            }
        });

        if (userMatches.length > 0) {
            resultsHTML += `<div class="live-search-group-title">Nerds</div>`;
            userMatches.slice(0, 3).forEach(u => {
                matchCount++;
                const safeName = u.fullname || 'Unknown Nerd';
                const safeUsername = u.username || 'unknown';
                const initials = safeName.substring(0, 2).toUpperCase();
                
                let avatar = u.avatarClass?.includes('url(') 
                    ? `style="background:${u.avatarClass}; background-size:cover;"` 
                    : `class="avatar-text ${u.avatarClass || 'bg-blue'}"`;
                let content = u.avatarClass?.includes('url(') ? '' : initials;
                
                resultsHTML += `
                    <div class="live-search-item" onclick="window.location.href='user.html?id=${u.uid}'">
                        <div ${avatar}>${content}</div>
                        <div class="live-search-info">
                            <strong>${safeName}</strong>
                            <span>@${safeUsername}</span>
                        </div>
                    </div>`;
            });
        }

        const postsSnap = await getDocs(collection(db, "posts"));
        let postMatches = [];
        
        postsSnap.forEach(doc => {
            const p = doc.data(); 
            p.id = doc.id;
            const contentText = (p.content || '').toLowerCase();
            const authorName = (p.authorName || '').toLowerCase();
            
            if (contentText.includes(query) || authorName.includes(query)) {
                postMatches.push(p);
            }
        });

        if (postMatches.length > 0) {
            resultsHTML += `<div class="live-search-group-title">Posts</div>`;
            postMatches.slice(0, 3).forEach(p => {
                matchCount++;
                const safeContent = p.content || '';
                const previewText = safeContent.substring(0, 35) + (safeContent.length > 35 ? '...' : '');
                const safeAuthor = p.authorName || 'Anonymous';

                resultsHTML += `
                    <div class="live-search-item" onclick="window.location.href='post.html?id=${p.id}'">
                        <div class="avatar-text" style="background:var(--bg-color); color:var(--text-muted);">
                            <i class="ri-terminal-box-line"></i>
                        </div>
                        <div class="live-search-info">
                            <strong>${previewText}</strong>
                            <span>by ${safeAuthor}</span>
                        </div>
                    </div>`;
            });
        }

        if (matchCount === 0) {
            dropdown.innerHTML = `<div style="padding: 15px; text-align: center; color: var(--text-muted);">No records found in the Arena.</div>`;
        } else {
            resultsHTML += `
                <div class="live-search-footer" onclick="window.location.href='search.html?q=${encodeURIComponent(query)}'">
                    See all results for "${query}" <i class="ri-arrow-right-line"></i>
                </div>`;
            dropdown.innerHTML = resultsHTML;
        }

    } catch (error) { 
        console.error("Live Search Error:", error);
        dropdown.innerHTML = `<div style="padding: 15px; text-align: center; color: #dc2626;">Search failed. Check console for details.</div>`; 
    }
}