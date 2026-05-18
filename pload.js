// pload.js
import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Global User State
window.currentUserData = null;

onAuthStateChanged(auth, async (user) => {
    const isAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html');
    
    if (user) {
        if (isAuthPage) window.location.replace("index.html");
        
        // Fetch User Data for Navbar
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            window.currentUserData = userDoc.data();
            setupNavbar(window.currentUserData);
            
            // Dispatch event so other scripts know the data is ready
            document.dispatchEvent(new Event('userDataLoaded')); 
        }
    } else {
        if (!isAuthPage) window.location.replace("login.html");
    }
});

function setupNavbar(userData) {
    const navAvatar = document.getElementById('nav-avatar');
    if (navAvatar) {
        navAvatar.innerText = userData.fullname.substring(0, 2).toUpperCase();
        navAvatar.className = `avatar-text ${userData.avatarClass || 'bg-primary'}`;
    }

    // Dropdown Logic
    const container = document.getElementById('nav-user-container');
    const dropdown = document.getElementById('nav-dropdown');
    
    if (container && dropdown) {
        container.addEventListener('click', (e) => {
            dropdown.classList.toggle('show');
            e.stopPropagation();
        });
        document.addEventListener('click', () => dropdown.classList.remove('show'));
    }

    // Global Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await signOut(auth);
            window.location.replace("login.html");
        });
    }
}