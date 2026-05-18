// auth.js
import { auth, db } from './firebase.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, setDoc, getDoc, getDocs, updateDoc, collection, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Global Lock: Prevents the page from redirecting while we are saving to Firestore
window.isAuthenticating = false;

// ==========================================
// 1. PAGE LOAD CHECK & RECENT LOGIN UI
// ==========================================
onAuthStateChanged(auth, (user) => {
    // If we are actively processing a form, DO NOT redirect yet. Let the form finish its tasks.
    if (window.isAuthenticating) return;

    const isAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html');
    if (user && isAuthPage) {
        window.location.replace("index.html");
    }
});

// Display "Recent Login" from Local Storage
document.addEventListener('DOMContentLoaded', () => {
    const recentLoginContainer = document.getElementById('recent-login-container');
    if (recentLoginContainer) {
        const lastLoginData = localStorage.getItem('na_last_login');
        
        if (lastLoginData) {
            const user = JSON.parse(lastLoginData);
            const avatarDiv = document.getElementById('recent-login-avatar');
            
            // Format the Avatar
            if (user.avatarClass && user.avatarClass.includes('url(')) {
                avatarDiv.className = 'avatar-text';
                avatarDiv.style.background = user.avatarClass;
                avatarDiv.style.backgroundSize = 'cover';
                avatarDiv.style.backgroundPosition = 'center';
                avatarDiv.innerText = '';
            } else {
                avatarDiv.className = `avatar-text ${user.avatarClass || 'bg-primary'}`;
                avatarDiv.innerText = user.fullname ? user.fullname.substring(0, 2).toUpperCase() : 'NA';
            }

            // Set the Name and Show the Card
            document.getElementById('recent-login-name').innerText = user.fullname || user.username;
            recentLoginContainer.style.display = 'block';

            // Auto-fill form when the card is clicked
            document.getElementById('recent-login-card').addEventListener('click', () => {
                document.getElementById('login-identifier').value = user.username || user.email;
                document.getElementById('login-password').focus(); // Focus password automatically
            });
        }
    }
});

// ==========================================
// 2. SIGNUP (FIXED DATABASE SAVE)
// ==========================================
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Lock the redirect listener
        window.isAuthenticating = true; 
        
        const fullname = document.getElementById('fullname').value.trim();
        const username = document.getElementById('username').value.toLowerCase().replace(/\s+/g, ''); 
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('signup-error');
        const submitBtn = signupForm.querySelector('.btn-auth');

        submitBtn.innerText = "Building Workspace...";
        submitBtn.disabled = true;
        errorMsg.style.display = "none";

        try {
            // STEP 1: Check username availability
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("username", "==", username));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                throw new Error("username-taken"); 
            }

            // STEP 2: Create Auth Account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // STEP 3: Save to Firestore WITH default arrays to prevent crashes
            const userData = {
                uid: user.uid,
                fullname: fullname,
                username: username,
                email: email,
                avatarClass: 'bg-primary',
                coverStyle: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                followers: [],
                savedAvatars: [],
                savedCovers: [],
                createdAt: new Date().toISOString()
            };

            await setDoc(doc(db, "users", user.uid), userData);

            // STEP 4: Save to Local Storage so "Recent Login" works next time
            localStorage.setItem('na_last_login', JSON.stringify(userData));

            // STEP 5: Safe to redirect now
            window.location.href = "index.html";

        } catch (error) {
            console.error("Signup Error:", error);
            errorMsg.style.display = "block";
            
            if (error.message === "username-taken") {
                errorMsg.innerText = "This username is already taken. Please choose another.";
            } else {
                errorMsg.innerText = getFriendlyErrorMessage(error.code);
            }
            
            submitBtn.innerText = "Sign up";
            submitBtn.disabled = false;
            window.isAuthenticating = false; // Unlock on error
        }
    });
}

// ==========================================
// 3. SMART LOGIN 
// ==========================================
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        window.isAuthenticating = true; // Lock the redirect listener
        
        let loginIdentifier = document.getElementById('login-identifier').value.toLowerCase().replace(/\s+/g, '');
        const password = document.getElementById('login-password').value;
        const errorMsg = document.getElementById('login-error');
        const submitBtn = loginForm.querySelector('.btn-auth');

        submitBtn.innerText = "Authenticating...";
        submitBtn.disabled = true;
        errorMsg.style.display = "none";

        try {
            let emailToLogin = loginIdentifier;

            // Username Login Check
            if (!loginIdentifier.includes('@')) {
                const usersRef = collection(db, "users");
                const q = query(usersRef, where("username", "==", loginIdentifier));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const userData = querySnapshot.docs[0].data();
                    emailToLogin = userData.email;
                } else {
                    throw new Error("user-not-found");
                }
            }

            // Login
            const userCredential = await signInWithEmailAndPassword(auth, emailToLogin, password);
            
            // Fetch their full profile to save in LocalStorage for "Recent Login"
            const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
            if (userDoc.exists()) {
                localStorage.setItem('na_last_login', JSON.stringify(userDoc.data()));
            }

            // Safe to Redirect
            window.location.href = "index.html";

        } catch (error) {
            console.error("Login Error:", error);
            errorMsg.style.display = "block";
            
            if (error.message === "user-not-found") {
                errorMsg.innerText = "We couldn't find an account with that username.";
            } else {
                errorMsg.innerText = getFriendlyErrorMessage(error.code);
            }
            
            submitBtn.innerText = "Log in";
            submitBtn.disabled = false;
            window.isAuthenticating = false; // Unlock on error
        }
    });
}

// ==========================================
// 4. ERRORS
// ==========================================
function getFriendlyErrorMessage(errorCode) {
    switch(errorCode) {
        case 'auth/email-already-in-use': return "This email is already registered. Try logging in.";
        case 'auth/invalid-email': return "Please enter a valid email address.";
        case 'auth/weak-password': return "Password must be at least 6 characters.";
        case 'auth/invalid-credential': return "Incorrect username/email or password.";
        case 'auth/user-not-found': return "No user found with this email.";
        case 'auth/wrong-password': return "Incorrect password.";
        case 'auth/too-many-requests': return "Too many failed attempts. Try again later.";
        default: return "An error occurred. Check your connection.";
    }
}