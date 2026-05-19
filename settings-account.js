import { auth, db } from './firebase.js';
import { doc, updateDoc, collection, query, where, getDocs, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { avatarImages, coverImages } from './pimage.js';
import { convertToDirectDriveLink } from './gdrive.js';

let tempSelectedAvatar = null;
let tempSelectedCover = null;
let currentTextBgColor = "#6366f1";

document.addEventListener('userDataLoaded', () => {
    refreshUIAndGrids();
    setupTextAvatarCreator();
});

// Real-time UI refresh trigger (Driven entirely by Firebase onSnapshot now)
document.addEventListener('userProfileUpdated', () => {
    refreshUIAndGrids();
});

function refreshUIAndGrids() {
    const user = window.currentUserData;
    if (!user) return;
    
    document.getElementById('display-fullname').innerText = user.fullname || "Unknown User";
    document.getElementById('display-username').innerText = `@${user.username}`;
    document.getElementById('display-email').innerText = user.email;
    document.getElementById('display-bio').innerText = user.bio || "No bio added yet.";
    document.getElementById('display-github').innerText = user.github ? `github.com/${user.github}` : "Not linked";
    
    document.getElementById('input-fullname').value = user.fullname || "";
    document.getElementById('input-username').value = user.username || "";
    document.getElementById('input-bio').value = user.bio || "";
    document.getElementById('input-github').value = user.github || "";

    const initials = user.fullname ? user.fullname.substring(0, 2).toUpperCase() : "NA";
    
    // Setup Profile Image Visuals
    if (user.avatarClass) {
        document.getElementById('avatar-display').style.background = user.avatarClass;
        document.getElementById('avatar-display').style.backgroundSize = 'cover';
        document.getElementById('avatar-display').style.backgroundPosition = 'center';

        if (user.avatarClass.includes('url(')) {
            document.getElementById('avatar-initials').innerText = "";
        } else {
            document.getElementById('avatar-initials').innerText = initials;
        }
    } else {
        document.getElementById('avatar-initials').innerText = initials;
    }
    
    // Setup Cover Image Visuals
    if (user.coverStyle) {
        document.getElementById('cover-display').style.background = user.coverStyle;
        document.getElementById('cover-display').style.backgroundSize = 'cover';
        document.getElementById('cover-display').style.backgroundPosition = 'center';
    }

    // THE FIX: Clean up any past duplicates using Sets
    const myAvatars = user.savedAvatars ? [...new Set(user.savedAvatars)] : [];
    const myCovers = user.savedCovers ? [...new Set(user.savedCovers)] : [];

    renderGrid('avatar-grid-lib', avatarImages, user.avatarClass, (val) => tempSelectedAvatar = val, 'avatar', false);
    renderGrid('avatar-grid-saved', myAvatars, user.avatarClass, (val) => tempSelectedAvatar = val, 'avatar', true);
    
    renderGrid('cover-grid-lib', coverImages, user.coverStyle, (val) => tempSelectedCover = val, 'cover', false);
    renderGrid('cover-grid-saved', myCovers, user.coverStyle, (val) => tempSelectedCover = val, 'cover', true);
}

function renderGrid(containerId, imageArray, currentValue, callback, type, isSavedTab) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = ''; 

    if (imageArray.length === 0 && isSavedTab) {
        container.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem; grid-column:1/-1; padding:20px 0;">No saved items found.</p>`;
        return;
    }

    imageArray.forEach((imgStyle) => {
        const div = document.createElement('div');
        div.className = 'grid-img-item';
        div.style.background = imgStyle;
        div.style.backgroundSize = 'cover';
        div.style.backgroundPosition = 'center';
        
        if (imgStyle === currentValue) {
            div.classList.add('selected');
            callback(imgStyle);
        }

        div.addEventListener('click', () => {
            document.querySelectorAll(`#modal-${type} .grid-img-item`).forEach(child => child.classList.remove('selected'));
            div.classList.add('selected');
            callback(imgStyle);
        });

        if (isSavedTab) {
            const deleteBtn = document.createElement('div');
            deleteBtn.className = 'delete-img-btn';
            deleteBtn.innerHTML = '<i class="ri-close-line"></i>';
            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if(confirm("Permanently erase this element?")) await deleteCustomImage(type, imgStyle);
            });
            div.appendChild(deleteBtn);
        }
        container.appendChild(div);
    });
}
// 3. Manage Greetings (SAVES TO FIREBASE)
function initGreetingSettings() {
    const greetingToggle = document.getElementById('toggle-greeting');
    const nameToggle = document.getElementById('toggle-greeting-name');
    const styleSelect = document.getElementById('greeting-style-select'); // NEW
    
    if (!greetingToggle || !nameToggle || !styleSelect || !window.currentUserData) return;

    // Load initial visual states from Firebase data
    if (window.currentUserData.greetingEnabled === false) greetingToggle.classList.remove('active');
    if (window.currentUserData.greetingShowName === false) nameToggle.classList.remove('active');
    if (window.currentUserData.greetingStyle) styleSelect.value = window.currentUserData.greetingStyle;

    // Handle Enable/Disable click
    greetingToggle.addEventListener('click', async () => {
        greetingToggle.classList.toggle('active');
        if (auth.currentUser) {
            try { await updateDoc(doc(db, "users", auth.currentUser.uid), { greetingEnabled: greetingToggle.classList.contains('active') }); }
            catch(e) { console.error(e); }
        }
    });

    // Handle Name Show/Hide click
    nameToggle.addEventListener('click', async () => {
        nameToggle.classList.toggle('active');
        if (auth.currentUser) {
            try { await updateDoc(doc(db, "users", auth.currentUser.uid), { greetingShowName: nameToggle.classList.contains('active') }); }
            catch(e) { console.error(e); }
        }
    });
    
    // Handle Dropdown Change for Greeting Style
    styleSelect.addEventListener('change', async (e) => {
        if (auth.currentUser) {
            try { await updateDoc(doc(db, "users", auth.currentUser.uid), { greetingStyle: e.target.value }); }
            catch(e) { console.error(e); }
        }
    });
}
function setupTextAvatarCreator() {
    updateTextPreview();

    document.getElementById('bg-color-presets')?.addEventListener('click', (e) => {
        if(e.target.classList.contains('color-swatch')) {
            document.querySelectorAll('#bg-color-presets .color-swatch').forEach(s => s.classList.remove('selected'));
            e.target.classList.add('selected');
            currentTextBgColor = e.target.getAttribute('data-color');
            document.getElementById('custom-bg-color').value = currentTextBgColor;
            updateTextPreview();
        }
    });

    document.getElementById('custom-bg-color')?.addEventListener('input', (e) => {
        document.querySelectorAll('#bg-color-presets .color-swatch').forEach(s => s.classList.remove('selected'));
        currentTextBgColor = e.target.value;
        updateTextPreview();
    });

    document.getElementById('apply-text-avatar-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        const initials = window.currentUserData.fullname ? window.currentUserData.fullname.substring(0, 2).toUpperCase() : 'NA';
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${currentTextBgColor}"/><text x="50%" y="54%" font-family="-apple-system, sans-serif" font-size="42" font-weight="800" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
        tempSelectedAvatar = `url('data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}')`;
        
        document.querySelectorAll(`#modal-avatar .grid-img-item`).forEach(child => child.classList.remove('selected'));
        const btn = document.getElementById('apply-text-avatar-btn');
        btn.innerText = "Applied to Selection Buffers!";
        btn.style.background = "#10b981";
        setTimeout(() => { btn.innerText = "Select this Style"; btn.style.background = "var(--text-main)"; }, 2000);
    });
}

function updateTextPreview() {
    const initials = window.currentUserData.fullname ? window.currentUserData.fullname.substring(0, 2).toUpperCase() : 'NA';
    const preview = document.getElementById('text-avatar-preview');
    if (preview) {
        preview.innerText = initials;
        preview.style.backgroundColor = currentTextBgColor;
    }
}

// THE FIX: Do not manually mutate window.currentUserData. Let Firebase real-time listeners handle it.
async function saveCustomLinkToFirebase(type, urlInputId) {
    const input = document.getElementById(urlInputId);
    if(!input.value.trim()) return;
    const formattedUrl = `url('${input.value.trim()}')`;
    const field = type === 'avatar' ? 'savedAvatars' : 'savedCovers';

    try {
        await updateDoc(doc(db, "users", auth.currentUser.uid), { [field]: arrayUnion(formattedUrl) });
        input.value = ''; 
        document.querySelector(`#modal-${type} .tab-btn:nth-child(2)`).click(); 
    } catch (err) { alert("Data pipeline exception tracking image links."); }
}

// THE FIX: Let Firebase real-time listeners handle deleting
async function deleteCustomImage(type, formattedUrl) {
    const field = type === 'avatar' ? 'savedAvatars' : 'savedCovers';
    try {
        await updateDoc(doc(db, "users", auth.currentUser.uid), { [field]: arrayRemove(formattedUrl) });
    } catch (err) { console.error(err); }
}

// DIRECT LINK LISTENERS
document.getElementById('add-avatar-btn')?.addEventListener('click', () => saveCustomLinkToFirebase('avatar', 'avatar-url-input'));
document.getElementById('add-cover-btn')?.addEventListener('click', () => saveCustomLinkToFirebase('cover', 'cover-url-input'));

// GOOGLE DRIVE LISTENERS
document.getElementById('process-avatar-gdrive-btn')?.addEventListener('click', async () => {
    const inputElement = document.getElementById('avatar-gdrive-input');
    const directUrl = convertToDirectDriveLink(inputElement.value.trim());
    if (!directUrl) return alert("Invalid Google Drive sharing link format.");
    
    try {
        await updateDoc(doc(db, "users", auth.currentUser.uid), { savedAvatars: arrayUnion(`url('${directUrl}')`) });
        inputElement.value = '';
        document.querySelector("#modal-avatar .tab-btn:nth-child(2)").click();
    } catch (err) { console.error("Drive write error:", err); }
});

document.getElementById('process-cover-gdrive-btn')?.addEventListener('click', async () => {
    const inputElement = document.getElementById('cover-gdrive-input');
    const directUrl = convertToDirectDriveLink(inputElement.value.trim());
    if (!directUrl) return alert("Invalid Google Drive sharing link format.");
    
    try {
        await updateDoc(doc(db, "users", auth.currentUser.uid), { savedCovers: arrayUnion(`url('${directUrl}')`) });
        inputElement.value = '';
        document.querySelector("#modal-cover .tab-btn:nth-child(2)").click();
    } catch (err) { console.error("Drive write error:", err); }
});

// =======================================================
// FIREBASE MASS SYNC ENGINE (Updates old posts)
// =======================================================
async function syncPostsAuthorData(newAvatar, newName) {
    try {
        const q = query(collection(db, "posts"), where("authorId", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const batchPromises = [];
        querySnapshot.forEach((postDoc) => {
            let updatePayload = {};
            if (newAvatar) updatePayload.authorAvatarClass = newAvatar;
            if (newName) updatePayload.authorName = newName;
            
            if (Object.keys(updatePayload).length > 0) {
                batchPromises.push(updateDoc(doc(db, "posts", postDoc.id), updatePayload));
            }
        });
        
        await Promise.all(batchPromises); 
    } catch (e) {
        console.error("Error syncing posts:", e);
    }
}

// ACTION BUTTON SCHEDULERS
document.getElementById('save-avatar-btn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!tempSelectedAvatar) return closeModal('modal-avatar');
    
    const btn = e.currentTarget;
    btn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> Syncing Profile & Posts...`;
    btn.disabled = true;

    try {
        await updateDoc(doc(db, "users", auth.currentUser.uid), { avatarClass: tempSelectedAvatar });
        await syncPostsAuthorData(tempSelectedAvatar, null); // Sync feed!
        closeModal('modal-avatar');
    } catch (err) { 
        alert("Transaction mapping failure processing canvas array updates."); 
    } finally {
        btn.innerHTML = `Set as Avatar`;
        btn.disabled = false;
    }
});

document.getElementById('save-cover-btn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!tempSelectedCover) return closeModal('modal-cover');
    
    const btn = e.currentTarget;
    btn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> Saving...`;
    btn.disabled = true;

    try {
        await updateDoc(doc(db, "users", auth.currentUser.uid), { coverStyle: tempSelectedCover });
        closeModal('modal-cover');
    } catch (err) { 
        alert("Transaction state failure writing configuration components."); 
    } finally {
        btn.innerHTML = `Set as Cover`;
        btn.disabled = false;
    }
});

document.getElementById('form-info')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.querySelector('#form-info button');
    const msg = document.getElementById('msg-info');
    
    const newFullname = document.getElementById('input-fullname').value.trim();
    const newUsername = document.getElementById('input-username').value.toLowerCase().replace(/\s+/g, '');
    const newBio = document.getElementById('input-bio').value.trim();
    const newGithub = document.getElementById('input-github').value.trim();
    
    btn.disabled = true; btn.innerText = "Syncing Profile & Posts..."; msg.style.display = "none";

    try {
        let updateData = { fullname: newFullname, bio: newBio, github: newGithub };
        if (newUsername !== window.currentUserData.username) {
            const snapshot = await getDocs(query(collection(db, "users"), where("username", "==", newUsername)));
            if (!snapshot.empty) throw new Error("username-taken");
            updateData.username = newUsername;
        }

        await updateDoc(doc(db, "users", auth.currentUser.uid), updateData);
        await syncPostsAuthorData(null, newFullname); // Sync feed!
        closeModal('modal-info');
    } catch (err) {
        msg.style.display = "block"; msg.style.color = "#dc2626"; 
        msg.innerText = err.message === "username-taken" ? "Username taken! Choose another identifier." : "Structural commit update database parsing collision.";
    } finally {
        btn.disabled = false; btn.innerText = "Save Information";
    }
});







// // settings-account.js
// import { auth, db } from './firebase.js';
// import { doc, updateDoc, collection, query, where, getDocs, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
// import { avatarImages, coverImages } from './pimage.js';

// let tempSelectedAvatar = null;
// let tempSelectedCover = null;
// let currentTextBgColor = "#6366f1";

// // 1. POPULATE DATA ENGINE ON USER LOAD
// document.addEventListener('userDataLoaded', () => {
//     refreshUIAndGrids();
//     setupTextAvatarCreator();
// });

// function refreshUIAndGrids() {
//     const user = window.currentUserData;
    
//     // Populate text nodes fields
//     document.getElementById('display-fullname').innerText = user.fullname || "Unknown User";
//     document.getElementById('display-username').innerText = `@${user.username}`;
//     document.getElementById('display-email').innerText = user.email;
//     document.getElementById('display-bio').innerText = user.bio || "No bio added yet.";
//     document.getElementById('display-github').innerText = user.github ? `github.com/${user.github}` : "Not linked";
    
//     document.getElementById('input-fullname').value = user.fullname || "";
//     document.getElementById('input-username').value = user.username || "";
//     document.getElementById('input-bio').value = user.bio || "";
//     document.getElementById('input-github').value = user.github || "";

//     const initials = user.fullname ? user.fullname.substring(0, 2).toUpperCase() : "NA";
    
//     // Apply Avatar Layer Properties & Prevent Doubled Text
//     if (user.avatarClass) {
//         document.getElementById('avatar-display').style.background = user.avatarClass;
//         document.getElementById('avatar-display').style.backgroundSize = 'cover';
//         document.getElementById('avatar-display').style.backgroundPosition = 'center';

//         // FIX: If it's a custom image link or SVG text canvas, clear the inner HTML text completely
//         if (user.avatarClass.includes('url(')) {
//             document.getElementById('avatar-initials').innerText = "";
//         } else {
//             document.getElementById('avatar-initials').innerText = initials;
//         }
//     } else {
//         document.getElementById('avatar-initials').innerText = initials;
//     }
    
//     // Apply Cover Layer Style Properties
//     if (user.coverStyle) {
//         document.getElementById('cover-display').style.background = user.coverStyle;
//         document.getElementById('cover-display').style.backgroundSize = 'cover';
//         document.getElementById('cover-display').style.backgroundPosition = 'center';
//     }

//     const myAvatars = user.savedAvatars || [];
//     const myCovers = user.savedCovers || [];

//     // Render the grid elements maps
//     renderGrid('avatar-grid-lib', avatarImages, user.avatarClass, (val) => tempSelectedAvatar = val, 'avatar', false);
//     renderGrid('avatar-grid-saved', myAvatars, user.avatarClass, (val) => tempSelectedAvatar = val, 'avatar', true);
    
//     renderGrid('cover-grid-lib', coverImages, user.coverStyle, (val) => tempSelectedCover = val, 'cover', false);
//     renderGrid('cover-grid-saved', myCovers, user.coverStyle, (val) => tempSelectedCover = val, 'cover', true);
// }

// function renderGrid(containerId, imageArray, currentValue, callback, type, isSavedTab) {
//     const container = document.getElementById(containerId);
//     container.innerHTML = ''; 

//     if (imageArray.length === 0 && isSavedTab) {
//         container.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem; grid-column:1/-1; padding:20px 0;">No history matches found.</p>`;
//         return;
//     }

//     imageArray.forEach((imgStyle) => {
//         const div = document.createElement('div');
//         div.className = 'grid-img-item';
//         div.style.background = imgStyle;
//         div.style.backgroundSize = 'cover';
//         div.style.backgroundPosition = 'center';
        
//         if (imgStyle === currentValue) {
//             div.classList.add('selected');
//             callback(imgStyle);
//         }

//         div.addEventListener('click', () => {
//             document.querySelectorAll(`#modal-${type} .grid-img-item`).forEach(child => child.classList.remove('selected'));
//             div.classList.add('selected');
//             callback(imgStyle);
//         });

//         if (isSavedTab) {
//             const deleteBtn = document.createElement('div');
//             deleteBtn.className = 'delete-img-btn';
//             deleteBtn.innerHTML = '<i class="ri-close-line"></i>';
//             deleteBtn.addEventListener('click', async (e) => {
//                 e.stopPropagation();
//                 if(confirm("Permanently erase this element?")) await deleteCustomImage(type, imgStyle);
//             });
//             div.appendChild(deleteBtn);
//         }
//         container.appendChild(div);
//     });
// }

// // 2. TEXT VECTOR GENERATION PIPELINE (SVG Canvas Creator)
// function setupTextAvatarCreator() {
//     updateTextPreview();

//     document.getElementById('bg-color-presets').addEventListener('click', (e) => {
//         if(e.target.classList.contains('color-swatch')) {
//             document.querySelectorAll('#bg-color-presets .color-swatch').forEach(s => s.classList.remove('selected'));
//             e.target.classList.add('selected');
//             currentTextBgColor = e.target.getAttribute('data-color');
//             document.getElementById('custom-bg-color').value = currentTextBgColor;
//             updateTextPreview();
//         }
//     });

//     document.getElementById('custom-bg-color').addEventListener('input', (e) => {
//         document.querySelectorAll('#bg-color-presets .color-swatch').forEach(s => s.classList.remove('selected'));
//         currentTextBgColor = e.target.value;
//         updateTextPreview();
//     });

//     document.getElementById('apply-text-avatar-btn').addEventListener('click', (e) => {
//         e.preventDefault();
//         const initials = window.currentUserData.fullname ? window.currentUserData.fullname.substring(0, 2).toUpperCase() : 'NA';
//         // Build crisp vector coordinates schema 
//         const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${currentTextBgColor}"/><text x="50%" y="54%" font-family="-apple-system, sans-serif" font-size="42" font-weight="800" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
//         tempSelectedAvatar = `url('data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}')`;
        
//         document.querySelectorAll(`#modal-avatar .grid-img-item`).forEach(child => child.classList.remove('selected'));
//         const btn = document.getElementById('apply-text-avatar-btn');
//         btn.innerText = "Applied to Selection Buffers!";
//         btn.style.background = "#10b981";
//         setTimeout(() => { btn.innerText = "Select this Style"; btn.style.background = "var(--text-main)"; }, 2000);
//     });
// }

// function updateTextPreview() {
//     const initials = window.currentUserData.fullname ? window.currentUserData.fullname.substring(0, 2).toUpperCase() : 'NA';
//     const preview = document.getElementById('text-avatar-preview');
//     preview.innerText = initials;
//     preview.style.backgroundColor = currentTextBgColor;
// }

// // 3. PERSIST CUSTOM DATA LINKS TO STORAGE MATRIX
// async function saveCustomLinkToFirebase(type, urlInputId) {
//     const input = document.getElementById(urlInputId);
//     if(!input.value.trim()) return;
//     const formattedUrl = `url('${input.value.trim()}')`;
//     const field = type === 'avatar' ? 'savedAvatars' : 'savedCovers';

//     try {
//         await updateDoc(doc(db, "users", auth.currentUser.uid), { [field]: arrayUnion(formattedUrl) });
//         if(!window.currentUserData[field]) window.currentUserData[field] = [];
//         window.currentUserData[field].push(formattedUrl);
//         input.value = ''; refreshUIAndGrids();
//         document.querySelector(`#modal-${type} .tab-btn:nth-child(2)`).click(); 
//     } catch (err) { alert("Data pipeline exception tracking image links."); }
// }

// async function deleteCustomImage(type, formattedUrl) {
//     const field = type === 'avatar' ? 'savedAvatars' : 'savedCovers';
//     try {
//         await updateDoc(doc(db, "users", auth.currentUser.uid), { [field]: arrayRemove(formattedUrl) });
//         window.currentUserData[field] = window.currentUserData[field].filter(url => url !== formattedUrl);
//         refreshUIAndGrids();
//     } catch (err) { console.error(err); }
// }

// document.getElementById('add-avatar-btn').addEventListener('click', () => saveCustomLinkToFirebase('avatar', 'avatar-url-input'));
// document.getElementById('add-cover-btn').addEventListener('click', () => saveCustomLinkToFirebase('cover', 'cover-url-input'));

// // 4. ACTION INTERACTION MATRIX WORKFLOW WRITERS
// document.getElementById('save-avatar-btn').addEventListener('click', async (e) => {
//     e.preventDefault();
//     if (!tempSelectedAvatar) return closeModal('modal-avatar');
//     try {
//         await updateDoc(doc(db, "users", auth.currentUser.uid), { avatarClass: tempSelectedAvatar });
//         window.currentUserData.avatarClass = tempSelectedAvatar;
        
//         refreshUIAndGrids();
        
//         // Push instant updates to top navbar template layers
//         document.getElementById('nav-avatar').style.background = tempSelectedAvatar;
//         document.getElementById('nav-avatar').style.backgroundSize = 'cover';
//         if (tempSelectedAvatar.includes('url(')) {
//             document.getElementById('nav-avatar').innerText = "";
//         }
        
//         closeModal('modal-avatar');
//     } catch (err) { alert("Transaction mapping failure processing canvas array updates."); } 
// });

// document.getElementById('save-cover-btn').addEventListener('click', async (e) => {
//     e.preventDefault();
//     if (!tempSelectedCover) return closeModal('modal-cover');
//     try {
//         await updateDoc(doc(db, "users", auth.currentUser.uid), { coverStyle: tempSelectedCover });
//         window.currentUserData.coverStyle = tempSelectedCover;
//         refreshUIAndGrids();
//         closeModal('modal-cover');
//     } catch (err) { alert("Transaction state failure writing configuration components."); }
// });

// document.getElementById('form-info').addEventListener('submit', async (e) => {
//     e.preventDefault();
//     const btn = document.querySelector('#form-info button');
//     const msg = document.getElementById('msg-info');
    
//     const newFullname = document.getElementById('input-fullname').value.trim();
//     const newUsername = document.getElementById('input-username').value.toLowerCase().replace(/\s+/g, '');
//     const newBio = document.getElementById('input-bio').value.trim();
//     const newGithub = document.getElementById('input-github').value.trim();
    
//     btn.disabled = true; btn.innerText = "Saving profile metadata updates..."; msg.style.display = "none";

//     try {
//         let updateData = { fullname: newFullname, bio: newBio, github: newGithub };
//         if (newUsername !== window.currentUserData.username) {
//             const snapshot = await getDocs(query(collection(db, "users"), where("username", "==", newUsername)));
//             if (!snapshot.empty) throw new Error("username-taken");
//             updateData.username = newUsername;
//         }

//         await updateDoc(doc(db, "users", auth.currentUser.uid), updateData);
//         window.currentUserData = { ...window.currentUserData, ...updateData }; 
        
//         refreshUIAndGrids();
        
//         // Force synchronous updates across header layout instances
//         if (!window.currentUserData.avatarClass || !window.currentUserData.avatarClass.includes('url(')) {
//             document.getElementById('nav-avatar').innerText = newFullname.substring(0, 2).toUpperCase();
//         }
        
//         closeModal('modal-info');
//     } catch (err) {
//         msg.style.display = "block"; msg.style.color = "#dc2626"; 
//         msg.innerText = err.message === "username-taken" ? "Username taken! Choose another identifier." : "Structural commit update database parsing collision.";
//     } finally {
//         btn.disabled = false; btn.innerText = "Save Information";
//     }
// });