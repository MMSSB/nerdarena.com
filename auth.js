// auth.js
import { auth, db } from './firebase.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, setDoc, getDocs, updateDoc, collection, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ==========================================
// 1. PAGE LOAD CHECK
// ==========================================
// Only redirect if they load the page and are ALREADY logged in.
onAuthStateChanged(auth, (user) => {
    const isAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html');
    if (user && isAuthPage) {
        window.location.replace("index.html");
    }
});

// ==========================================
// 2. SIGNUP (One Collection Method)
// ==========================================
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fullname = document.getElementById('fullname').value.trim();
        const username = document.getElementById('username').value.toLowerCase().replace(/\s+/g, ''); 
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('signup-error');
        const submitBtn = signupForm.querySelector('.btn-auth');

        submitBtn.innerText = "Processing...";
        submitBtn.disabled = true;
        errorMsg.style.display = "none";

        try {
            // STEP 1: Search the 'users' collection to see if this username is taken
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("username", "==", username));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                throw new Error("username-taken"); // It found a match!
            }

            // STEP 2: Create Auth Account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // STEP 3: Save everything to ONE document in the 'users' collection
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                fullname: fullname,
                username: username, // Saved right here!
                email: email,
                followersCount: 0,
                shippedProjectsCount: 0,
                createdAt: new Date().toISOString()
            });

            // STEP 4: Manually redirect ONLY when database save is 100% finished
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
        }
    });
}

// ==========================================
// 3. SMART LOGIN (Search 'users' for username)
// ==========================================
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let loginIdentifier = document.getElementById('login-identifier').value.toLowerCase().replace(/\s+/g, '');
        const password = document.getElementById('login-password').value;
        const errorMsg = document.getElementById('login-error');
        const submitBtn = loginForm.querySelector('.btn-auth');

        submitBtn.innerText = "Authenticating...";
        submitBtn.disabled = true;
        errorMsg.style.display = "none";

        try {
            let emailToLogin = loginIdentifier;

            // If it's a username (no '@' symbol), search the 'users' collection for it
            if (!loginIdentifier.includes('@')) {
                const usersRef = collection(db, "users");
                const q = query(usersRef, where("username", "==", loginIdentifier));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    // We found the user! Grab their email from the document.
                    const userData = querySnapshot.docs[0].data();
                    emailToLogin = userData.email;
                } else {
                    throw new Error("user-not-found");
                }
            }

            // Login with the found email
            await signInWithEmailAndPassword(auth, emailToLogin, password);
            
            // Redirect after successful login
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
        }
    });
}

// ==========================================
// 4. CHANGE USERNAME (Now incredibly easy)
// ==========================================
export async function changeMyUsername(newUsernameInput) {
    const user = auth.currentUser;
    if (!user) throw new Error("Not logged in");

    const newUsername = newUsernameInput.toLowerCase().replace(/\s+/g, '');

    try {
        // 1. Check if anyone else has it
        const q = query(collection(db, "users"), where("username", "==", newUsername));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) throw new Error("username-taken");

        // 2. Just update the single document!
        await updateDoc(doc(db, "users", user.uid), {
            username: newUsername
        });

        return { success: true };
    } catch (error) {
        throw error;
    }
}

// ==========================================
// 5. ERRORS
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