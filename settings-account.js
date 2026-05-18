// settings-account.js
import { auth, db } from './firebase.js';
import { doc, updateDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { avatarImages, coverImages } from './pimage.js';

let tempSelectedAvatar = null;
let tempSelectedCover = null;

// 1. POPULATE UI ON LOAD
document.addEventListener('userDataLoaded', () => {
    const user = window.currentUserData;
    
    // Populate Profile Display
    document.getElementById('display-fullname').innerText = user.fullname || "Unknown User";
    document.getElementById('display-username').innerText = `@${user.username}`;
    document.getElementById('display-email').innerText = user.email;
    document.getElementById('display-bio').innerText = user.bio || "No bio added yet.";
    document.getElementById('display-github').innerText = user.github ? `github.com/${user.github}` : "Not linked";
    
    // Populate Modal Inputs
    document.getElementById('input-fullname').value = user.fullname || "";
    document.getElementById('input-username').value = user.username || "";
    document.getElementById('input-bio').value = user.bio || "";
    document.getElementById('input-github').value = user.github || "";

    // Set Visuals (Avatar)
    const initials = user.fullname ? user.fullname.substring(0, 2).toUpperCase() : "NA";
    document.getElementById('avatar-initials').innerText = initials;
    
    if (user.avatarClass) {
        document.getElementById('avatar-display').style.background = user.avatarClass;
        document.getElementById('avatar-display').style.backgroundSize = 'cover';
        document.getElementById('avatar-display').style.backgroundPosition = 'center';
    }
    
    // Set Visuals (Cover)
    if (user.coverStyle) {
        document.getElementById('cover-display').style.background = user.coverStyle;
        document.getElementById('cover-display').style.backgroundSize = 'cover';
        document.getElementById('cover-display').style.backgroundPosition = 'center';
    }

    // Render the Grids inside the Modals
    renderGrid('avatar-grid-container', avatarImages, user.avatarClass, (val) => tempSelectedAvatar = val);
    renderGrid('cover-grid-container', coverImages, user.coverStyle, (val) => tempSelectedCover = val);
});

// Helper for Grid Selection
function updateLibrarySelection(pickerId, valueToMatch) {
    document.querySelectorAll(`#${pickerId} .grid-img-item`).forEach(opt => {
        opt.classList.remove('selected');
        if(opt.getAttribute('data-style') === valueToMatch) {
            opt.classList.add('selected');
        }
    });
}

// 2. RENDER THE GRIDS
function renderGrid(containerId, imageArray, currentValue, callback) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; 

    imageArray.forEach((imgStyle) => {
        const div = document.createElement('div');
        div.className = 'grid-img-item';
        div.style.background = imgStyle;
        div.setAttribute('data-style', imgStyle);
        
        if (imgStyle === currentValue) {
            div.classList.add('selected');
            callback(imgStyle);
        }

        div.addEventListener('click', () => {
            Array.from(container.children).forEach(child => child.classList.remove('selected'));
            div.classList.add('selected');
            callback(imgStyle);
        });

        container.appendChild(div);
    });
}

// 3. SAVE MODAL BUTTONS (Instantly updates Firebase and UI)
document.getElementById('save-avatar-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    if (!tempSelectedAvatar) return closeModal('modal-avatar');
    
    const btn = e.currentTarget;
    btn.innerHTML = `<i class="ri-loader-4-line"></i> Saving...`;

    try {
        await updateDoc(doc(db, "users", auth.currentUser.uid), { avatarClass: tempSelectedAvatar });
        window.currentUserData.avatarClass = tempSelectedAvatar;
        
        // Update Previews
        document.getElementById('avatar-display').style.background = tempSelectedAvatar;
        document.getElementById('nav-avatar').style.background = tempSelectedAvatar;
        
        closeModal('modal-avatar');
    } catch (err) {
        alert("Failed to save avatar.");
    } finally {
        btn.innerHTML = `<i class="ri-check-line"></i> Save Avatar`;
    }
});

document.getElementById('save-cover-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    if (!tempSelectedCover) return closeModal('modal-cover');
    
    const btn = e.currentTarget;
    btn.innerHTML = `<i class="ri-loader-4-line"></i> Saving...`;

    try {
        await updateDoc(doc(db, "users", auth.currentUser.uid), { coverStyle: tempSelectedCover });
        window.currentUserData.coverStyle = tempSelectedCover;
        
        // Update Preview
        document.getElementById('cover-display').style.background = tempSelectedCover;
        document.getElementById('cover-display').style.backgroundSize = 'cover';
        document.getElementById('cover-display').style.backgroundPosition = 'center';
        
        closeModal('modal-cover');
    } catch (err) {
        alert("Failed to save cover.");
    } finally {
        btn.innerHTML = `<i class="ri-check-line"></i> Save Cover`;
    }
});

// 4. SAVE PROFILE INFO (From Info Modal)
document.getElementById('form-info').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.querySelector('#form-info button');
    const msg = document.getElementById('msg-info');
    
    const newFullname = document.getElementById('input-fullname').value.trim();
    const newUsername = document.getElementById('input-username').value.toLowerCase().replace(/\s+/g, '');
    const newBio = document.getElementById('input-bio').value.trim();
    const newGithub = document.getElementById('input-github').value.trim();
    
    btn.disabled = true; btn.innerText = "Saving..."; msg.style.display = "none";

    try {
        let updateData = { fullname: newFullname, bio: newBio, github: newGithub };

        // Check if username changed and is unique
        if (newUsername !== window.currentUserData.username) {
            const snapshot = await getDocs(query(collection(db, "users"), where("username", "==", newUsername)));
            if (!snapshot.empty) throw new Error("username-taken");
            updateData.username = newUsername;
        }

        await updateDoc(doc(db, "users", auth.currentUser.uid), updateData);
        window.currentUserData = { ...window.currentUserData, ...updateData }; 
        
        // Refresh the page displays instantly
        document.dispatchEvent(new Event('userDataLoaded'));
        closeModal('modal-info');

    } catch (err) {
        msg.style.display = "block";
        msg.style.color = "#dc2626"; 
        msg.innerText = err.message === "username-taken" ? "Username taken!" : "Error saving profile.";
    } finally {
        btn.disabled = false; btn.innerText = "Save Information";
    }
});