// import { auth, db } from './firebase.js';
// import { doc, updateDoc, collection, query, where, getDocs, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
// import { avatarImages, coverImages } from './pimage.js';

// let tempSelectedAvatar = null;
// let tempSelectedCover = null;
// let currentTextBgColor = "#6366f1";

// // 1. POPULATE DATA ENGINE
// document.addEventListener('userDataLoaded', () => {
//     refreshUIAndGrids();
//     setupTextAvatarCreator();
// });

// function refreshUIAndGrids() {
//     const user = window.currentUserData;
    
//     // Text nodes population
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
//     document.getElementById('avatar-initials').innerText = initials;
    
//     if (user.avatarClass) {
//         document.getElementById('avatar-display').style.background = user.avatarClass;
//         document.getElementById('avatar-display').style.backgroundSize = 'cover';
//         document.getElementById('avatar-display').style.backgroundPosition = 'center';
//     }
    
//     if (user.coverStyle) {
//         document.getElementById('cover-display').style.background = user.coverStyle;
//         document.getElementById('cover-display').style.backgroundSize = 'cover';
//         document.getElementById('cover-display').style.backgroundPosition = 'center';
//     }

//     const myAvatars = user.savedAvatars || [];
//     const myCovers = user.savedCovers || [];

//     // Distinct rendering parameters mapping to tab structures
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

// // 2. TEXT VECTOR GENERATION PIPELINE
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
//         const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${currentTextBgColor}"/><text x="50%" y="50%" font-family="Arial, sans-serif" font-size="45" font-weight="bold" fill="#ffffff" text-anchor="middle" dy=".35em">${initials}</text></svg>`;
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

// // 3. PERSIST CUSTOM DATA STRUCTURES TO FIREBASE
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
//     } catch (err) { alert("Data pipeline exception recording stream mapping."); }
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

// // 4. ACTION INTERACTION SCHEDULERS
// document.getElementById('save-avatar-btn').addEventListener('click', async (e) => {
//     e.preventDefault();
//     if (!tempSelectedAvatar) return closeModal('modal-avatar');
//     try {
//         await updateDoc(doc(db, "users", auth.currentUser.uid), { avatarClass: tempSelectedAvatar });
//         window.currentUserData.avatarClass = tempSelectedAvatar;
//         refreshUIAndGrids();
//         document.getElementById('nav-avatar').style.background = tempSelectedAvatar;
//         closeModal('modal-avatar');
//     } catch (err) { alert("Transaction state error parsing schema variations."); } 
// });

// document.getElementById('save-cover-btn').addEventListener('click', async (e) => {
//     e.preventDefault();
//     if (!tempSelectedCover) return closeModal('modal-cover');
//     try {
//         await updateDoc(doc(db, "users", auth.currentUser.uid), { coverStyle: tempSelectedCover });
//         window.currentUserData.coverStyle = tempSelectedCover;
//         refreshUIAndGrids();
//         closeModal('modal-cover');
//     } catch (err) { alert("Transaction state error writing metadata elements."); }
// });

// document.getElementById('form-info').addEventListener('submit', async (e) => {
//     e.preventDefault();
//     const btn = document.querySelector('#form-info button');
//     const msg = document.getElementById('msg-info');
    
//     const newFullname = document.getElementById('input-fullname').value.trim();
//     const newUsername = document.getElementById('input-username').value.toLowerCase().replace(/\s+/g, '');
//     const newBio = document.getElementById('input-bio').value.trim();
//     const newGithub = document.getElementById('input-github').value.trim();
    
//     btn.disabled = true; btn.innerText = "Saving profile metadata layers..."; msg.style.display = "none";

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
//         document.getElementById('nav-avatar').innerText = newFullname.substring(0, 2).toUpperCase();
//         closeModal('modal-info');
//     } catch (err) {
//         msg.style.display = "block"; msg.style.color = "#dc2626"; 
//         msg.innerText = err.message === "username-taken" ? "Username token identifier collision! Taken." : "Processing error structural commit update.";
//     } finally {
//         btn.disabled = false; btn.innerText = "Save Information";
//     }
// });











// settings-account.js
import { auth, db } from './firebase.js';
import { doc, updateDoc, collection, query, where, getDocs, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { avatarImages, coverImages } from './pimage.js';

let tempSelectedAvatar = null;
let tempSelectedCover = null;
let currentTextBgColor = "#6366f1";

// 1. POPULATE DATA ENGINE ON USER LOAD
document.addEventListener('userDataLoaded', () => {
    refreshUIAndGrids();
    setupTextAvatarCreator();
});

function refreshUIAndGrids() {
    const user = window.currentUserData;
    
    // Populate text nodes fields
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
    
    // Apply Avatar Layer Properties & Prevent Doubled Text
    if (user.avatarClass) {
        document.getElementById('avatar-display').style.background = user.avatarClass;
        document.getElementById('avatar-display').style.backgroundSize = 'cover';
        document.getElementById('avatar-display').style.backgroundPosition = 'center';

        // FIX: If it's a custom image link or SVG text canvas, clear the inner HTML text completely
        if (user.avatarClass.includes('url(')) {
            document.getElementById('avatar-initials').innerText = "";
        } else {
            document.getElementById('avatar-initials').innerText = initials;
        }
    } else {
        document.getElementById('avatar-initials').innerText = initials;
    }
    
    // Apply Cover Layer Style Properties
    if (user.coverStyle) {
        document.getElementById('cover-display').style.background = user.coverStyle;
        document.getElementById('cover-display').style.backgroundSize = 'cover';
        document.getElementById('cover-display').style.backgroundPosition = 'center';
    }

    const myAvatars = user.savedAvatars || [];
    const myCovers = user.savedCovers || [];

    // Render the grid elements maps
    renderGrid('avatar-grid-lib', avatarImages, user.avatarClass, (val) => tempSelectedAvatar = val, 'avatar', false);
    renderGrid('avatar-grid-saved', myAvatars, user.avatarClass, (val) => tempSelectedAvatar = val, 'avatar', true);
    
    renderGrid('cover-grid-lib', coverImages, user.coverStyle, (val) => tempSelectedCover = val, 'cover', false);
    renderGrid('cover-grid-saved', myCovers, user.coverStyle, (val) => tempSelectedCover = val, 'cover', true);
}

function renderGrid(containerId, imageArray, currentValue, callback, type, isSavedTab) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; 

    if (imageArray.length === 0 && isSavedTab) {
        container.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem; grid-column:1/-1; padding:20px 0;">No history matches found.</p>`;
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

// 2. TEXT VECTOR GENERATION PIPELINE (SVG Canvas Creator)
function setupTextAvatarCreator() {
    updateTextPreview();

    document.getElementById('bg-color-presets').addEventListener('click', (e) => {
        if(e.target.classList.contains('color-swatch')) {
            document.querySelectorAll('#bg-color-presets .color-swatch').forEach(s => s.classList.remove('selected'));
            e.target.classList.add('selected');
            currentTextBgColor = e.target.getAttribute('data-color');
            document.getElementById('custom-bg-color').value = currentTextBgColor;
            updateTextPreview();
        }
    });

    document.getElementById('custom-bg-color').addEventListener('input', (e) => {
        document.querySelectorAll('#bg-color-presets .color-swatch').forEach(s => s.classList.remove('selected'));
        currentTextBgColor = e.target.value;
        updateTextPreview();
    });

    document.getElementById('apply-text-avatar-btn').addEventListener('click', (e) => {
        e.preventDefault();
        const initials = window.currentUserData.fullname ? window.currentUserData.fullname.substring(0, 2).toUpperCase() : 'NA';
        // Build crisp vector coordinates schema 
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
    preview.innerText = initials;
    preview.style.backgroundColor = currentTextBgColor;
}

// 3. PERSIST CUSTOM DATA LINKS TO STORAGE MATRIX
async function saveCustomLinkToFirebase(type, urlInputId) {
    const input = document.getElementById(urlInputId);
    if(!input.value.trim()) return;
    const formattedUrl = `url('${input.value.trim()}')`;
    const field = type === 'avatar' ? 'savedAvatars' : 'savedCovers';

    try {
        await updateDoc(doc(db, "users", auth.currentUser.uid), { [field]: arrayUnion(formattedUrl) });
        if(!window.currentUserData[field]) window.currentUserData[field] = [];
        window.currentUserData[field].push(formattedUrl);
        input.value = ''; refreshUIAndGrids();
        document.querySelector(`#modal-${type} .tab-btn:nth-child(2)`).click(); 
    } catch (err) { alert("Data pipeline exception tracking image links."); }
}

async function deleteCustomImage(type, formattedUrl) {
    const field = type === 'avatar' ? 'savedAvatars' : 'savedCovers';
    try {
        await updateDoc(doc(db, "users", auth.currentUser.uid), { [field]: arrayRemove(formattedUrl) });
        window.currentUserData[field] = window.currentUserData[field].filter(url => url !== formattedUrl);
        refreshUIAndGrids();
    } catch (err) { console.error(err); }
}

document.getElementById('add-avatar-btn').addEventListener('click', () => saveCustomLinkToFirebase('avatar', 'avatar-url-input'));
document.getElementById('add-cover-btn').addEventListener('click', () => saveCustomLinkToFirebase('cover', 'cover-url-input'));

// 4. ACTION INTERACTION MATRIX WORKFLOW WRITERS
document.getElementById('save-avatar-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    if (!tempSelectedAvatar) return closeModal('modal-avatar');
    try {
        await updateDoc(doc(db, "users", auth.currentUser.uid), { avatarClass: tempSelectedAvatar });
        window.currentUserData.avatarClass = tempSelectedAvatar;
        
        refreshUIAndGrids();
        
        // Push instant updates to top navbar template layers
        document.getElementById('nav-avatar').style.background = tempSelectedAvatar;
        document.getElementById('nav-avatar').style.backgroundSize = 'cover';
        if (tempSelectedAvatar.includes('url(')) {
            document.getElementById('nav-avatar').innerText = "";
        }
        
        closeModal('modal-avatar');
    } catch (err) { alert("Transaction mapping failure processing canvas array updates."); } 
});

document.getElementById('save-cover-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    if (!tempSelectedCover) return closeModal('modal-cover');
    try {
        await updateDoc(doc(db, "users", auth.currentUser.uid), { coverStyle: tempSelectedCover });
        window.currentUserData.coverStyle = tempSelectedCover;
        refreshUIAndGrids();
        closeModal('modal-cover');
    } catch (err) { alert("Transaction state failure writing configuration components."); }
});

document.getElementById('form-info').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.querySelector('#form-info button');
    const msg = document.getElementById('msg-info');
    
    const newFullname = document.getElementById('input-fullname').value.trim();
    const newUsername = document.getElementById('input-username').value.toLowerCase().replace(/\s+/g, '');
    const newBio = document.getElementById('input-bio').value.trim();
    const newGithub = document.getElementById('input-github').value.trim();
    
    btn.disabled = true; btn.innerText = "Saving profile metadata updates..."; msg.style.display = "none";

    try {
        let updateData = { fullname: newFullname, bio: newBio, github: newGithub };
        if (newUsername !== window.currentUserData.username) {
            const snapshot = await getDocs(query(collection(db, "users"), where("username", "==", newUsername)));
            if (!snapshot.empty) throw new Error("username-taken");
            updateData.username = newUsername;
        }

        await updateDoc(doc(db, "users", auth.currentUser.uid), updateData);
        window.currentUserData = { ...window.currentUserData, ...updateData }; 
        
        refreshUIAndGrids();
        
        // Force synchronous updates across header layout instances
        if (!window.currentUserData.avatarClass || !window.currentUserData.avatarClass.includes('url(')) {
            document.getElementById('nav-avatar').innerText = newFullname.substring(0, 2).toUpperCase();
        }
        
        closeModal('modal-info');
    } catch (err) {
        msg.style.display = "block"; msg.style.color = "#dc2626"; 
        msg.innerText = err.message === "username-taken" ? "Username taken! Choose another identifier." : "Structural commit update database parsing collision.";
    } finally {
        btn.disabled = false; btn.innerText = "Save Information";
    }
});