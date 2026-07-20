// // app-settings.js

// document.addEventListener('DOMContentLoaded', () => {
//     initThemeSettings();
//     initAccentSettings();
// });

// // 1. Manage Dark/Light/System Theme
// function initThemeSettings() {
//     const themeCards = document.querySelectorAll('.theme-card');
//     const savedTheme = localStorage.getItem('na_theme') || 'system';

//     // Highlight the currently saved option
//     themeCards.forEach(card => {
//         if (card.getAttribute('data-theme-val') === savedTheme) {
//             card.classList.add('active');
//         } else {
//             card.classList.remove('active');
//         }

//         // Click listener
//         card.addEventListener('click', () => {
//             // Update UI
//             themeCards.forEach(c => c.classList.remove('active'));
//             card.classList.add('active');

//             const selectedTheme = card.getAttribute('data-theme-val');
            
//             // Save to browser
//             localStorage.setItem('na_theme', selectedTheme);

//             // Apply instantly
//             if (selectedTheme === 'dark' || (selectedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
//                 document.documentElement.setAttribute('data-theme', 'dark');
//             } else {
//                 document.documentElement.setAttribute('data-theme', 'light');
//             }
//         });
//     });
// }

// // 2. Manage Accent Color
// function initAccentSettings() {
//     const accentSwatches = document.querySelectorAll('.accent-swatch');
//     const savedAccent = localStorage.getItem('na_accent') || '#6366f1'; // Default Indigo

//     // Highlight the currently saved color
//     accentSwatches.forEach(swatch => {
//         if (swatch.getAttribute('data-color') === savedAccent) {
//             swatch.classList.add('active');
//         } else {
//             swatch.classList.remove('active');
//         }

//         // Click listener
//         swatch.addEventListener('click', () => {
//             // Update UI
//             accentSwatches.forEach(s => s.classList.remove('active'));
//             swatch.classList.add('active');

//             const color = swatch.getAttribute('data-color');
//             const hover = swatch.getAttribute('data-hover');

//             // Save to browser
//             localStorage.setItem('na_accent', color);
//             localStorage.setItem('na_accent_hover', hover);

//             // Apply instantly using CSS variable overrides
//             document.documentElement.style.setProperty('--primary-color', color);
//             document.documentElement.style.setProperty('--primary-hover', hover);
//         });
//     });
// }









// // app-settings.js
// import { auth, db } from './firebase.js';
// import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// document.addEventListener('DOMContentLoaded', () => {
//     initThemeSettings();
//     initAccentSettings();
// });

// // 1. Manage Dark/Light/System Theme
// function initThemeSettings() {
//     const themeCards = document.querySelectorAll('.theme-card');
//     const savedTheme = localStorage.getItem('na_theme') || 'system';

//     themeCards.forEach(card => {
//         // Highlight active visually
//         if (card.getAttribute('data-theme-val') === savedTheme) card.classList.add('active');
//         else card.classList.remove('active');

//         // Listen for user click
//         card.addEventListener('click', async () => {
//             themeCards.forEach(c => c.classList.remove('active'));
//             card.classList.add('active');

//             const selectedTheme = card.getAttribute('data-theme-val');
            
//             // Instantly apply locally
//             localStorage.setItem('na_theme', selectedTheme);
//             if (window.applyThemeToDOM) window.applyThemeToDOM();

//             // 🔥 Persist to Firebase
//             if (auth.currentUser) {
//                 try { 
//                     await updateDoc(doc(db, "users", auth.currentUser.uid), { theme: selectedTheme }); 
//                 } catch(e) { console.error("Error saving theme to cloud:", e); }
//             }
//         });
//     });
// }

// // 2. Manage Accent Color
// function initAccentSettings() {
//     const accentSwatches = document.querySelectorAll('.accent-swatch');
//     const savedAccent = localStorage.getItem('na_accent') || '#6366f1'; 

//     accentSwatches.forEach(swatch => {
//         // Highlight active visually
//         if (swatch.getAttribute('data-color') === savedAccent) swatch.classList.add('active');
//         else swatch.classList.remove('active');

//         // Listen for user click
//         swatch.addEventListener('click', async () => {
//             accentSwatches.forEach(s => s.classList.remove('active'));
//             swatch.classList.add('active');

//             const color = swatch.getAttribute('data-color');
//             const hover = swatch.getAttribute('data-hover');

//             // Instantly apply locally
//             localStorage.setItem('na_accent', color);
//             localStorage.setItem('na_accent_hover', hover);
//             if (window.applyThemeToDOM) window.applyThemeToDOM();

//             // 🔥 Persist to Firebase
//             if (auth.currentUser) {
//                 try { 
//                     await updateDoc(doc(db, "users", auth.currentUser.uid), { 
//                         accentColor: color, 
//                         accentHover: hover 
//                     }); 
//                 } catch(e) { console.error("Error saving accent color to cloud:", e); }
//             }
//         });
//     });
// }







// settings.js
import { auth, db } from './firebase.js';
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    initThemeSettings();
    initAccentSettings();
    
    // Wait for user data to load to set the toggle states correctly
    document.addEventListener('userDataLoaded', initGreetingSettings);
    
    // Wire up the new logout button in settings list
    document.getElementById('settings-logout-btn')?.addEventListener('click', async () => {
        localStorage.removeItem('na_theme');
        localStorage.removeItem('na_accent');
        localStorage.removeItem('na_accent_hover');
        await signOut(auth);
        window.location.replace("login.html");
    });
});

// 1. Manage Dark/Light/System Theme (LOCAL SAVING ONLY)
function initThemeSettings() {
    const themeCards = document.querySelectorAll('.theme-card');
    const savedTheme = localStorage.getItem('na_theme') || 'system';

    themeCards.forEach(card => {
        if (card.getAttribute('data-theme-val') === savedTheme) card.classList.add('active');
        else card.classList.remove('active');

        card.addEventListener('click', async () => {
            themeCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            const selectedTheme = card.getAttribute('data-theme-val');
            
            // Instantly apply locally ONLY. (Removed Firebase sync as requested)
            localStorage.setItem('na_theme', selectedTheme);
            if (window.applyThemeToDOM) window.applyThemeToDOM();
        });
    });
}

// 2. Manage Accent Color (SAVES TO FIREBASE)
function initAccentSettings() {
    const accentSwatches = document.querySelectorAll('.accent-swatch');
    const customPicker = document.getElementById('custom-accent-color');
    const savedAccent = localStorage.getItem('na_accent') || '#6366f1'; 
    let isCustom = true;

    accentSwatches.forEach(swatch => {
        if (swatch.getAttribute('data-color') === savedAccent) {
            swatch.classList.add('active');
            isCustom = false;
        }

        swatch.addEventListener('click', async () => {
            accentSwatches.forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
            saveColor(swatch.getAttribute('data-color'), swatch.getAttribute('data-hover'));
        });
    });

    if (customPicker) {
        if (isCustom) customPicker.value = savedAccent; 
        
        customPicker.addEventListener('input', (e) => {
            accentSwatches.forEach(s => s.classList.remove('active')); 
            const hex = e.target.value;
            const hoverHex = shadeColor(hex, -15); // Darken by 15% for hover state
            saveColor(hex, hoverHex);
        });
    }

    async function saveColor(color, hover) {
        localStorage.setItem('na_accent', color);
        localStorage.setItem('na_accent_hover', hover);
        if (window.applyThemeToDOM) window.applyThemeToDOM();

        if (auth.currentUser) {
            try { 
                await updateDoc(doc(db, "users", auth.currentUser.uid), { accentColor: color, accentHover: hover }); 
            } catch(e) { console.error(e); }
        }
    }
}

// 3. Manage Greetings (SAVES TO FIREBASE)
function initGreetingSettings() {
    const greetingToggle = document.getElementById('toggle-greeting');
    const nameToggle = document.getElementById('toggle-greeting-name');
    if (!greetingToggle || !nameToggle || !window.currentUserData) return;

    // Set initial visual states based on Firebase data (default to true)
    if (window.currentUserData.greetingEnabled === false) greetingToggle.classList.remove('active');
    if (window.currentUserData.greetingShowName === false) nameToggle.classList.remove('active');

    // Handle clicks and sync to Firebase
    greetingToggle.addEventListener('click', async () => {
        greetingToggle.classList.toggle('active');
        const isActive = greetingToggle.classList.contains('active');
        
        if (auth.currentUser) {
            try { await updateDoc(doc(db, "users", auth.currentUser.uid), { greetingEnabled: isActive }); }
            catch(e) { console.error(e); }
        }
    });

    nameToggle.addEventListener('click', async () => {
        nameToggle.classList.toggle('active');
        const isActive = nameToggle.classList.contains('active');
        
        if (auth.currentUser) {
            try { await updateDoc(doc(db, "users", auth.currentUser.uid), { greetingShowName: isActive }); }
            catch(e) { console.error(e); }
        }
    });
}

// Helper to darken/lighten a hex color purely in JS
function shadeColor(color, percent) {
    let R = parseInt(color.substring(1,3),16);
    let G = parseInt(color.substring(3,5),16);
    let B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255; R = (R<0)?0:R;
    G = (G<255)?G:255; G = (G<0)?0:G;
    B = (B<255)?B:255; B = (B<0)?0:B;

    let RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    let GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    let BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
}








// // settings.js
// import { auth, db } from './firebase.js';
// import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
// import { signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// document.addEventListener('DOMContentLoaded', () => {
//     initThemeSettings();
//     initAccentSettings();
    
//     // Wire up the new logout button in settings list
//     document.getElementById('settings-logout-btn')?.addEventListener('click', async () => {
//         localStorage.removeItem('na_theme');
//         localStorage.removeItem('na_accent');
//         localStorage.removeItem('na_accent_hover');
//         await signOut(auth);
//         window.location.replace("login.html");
//     });
// });

// function initThemeSettings() {
//     const themeCards = document.querySelectorAll('.theme-card');
//     const savedTheme = localStorage.getItem('na_theme') || 'system';

//     themeCards.forEach(card => {
//         if (card.getAttribute('data-theme-val') === savedTheme) card.classList.add('active');
//         else card.classList.remove('active');

//         card.addEventListener('click', async () => {
//             themeCards.forEach(c => c.classList.remove('active'));
//             card.classList.add('active');

//             const selectedTheme = card.getAttribute('data-theme-val');
//             localStorage.setItem('na_theme', selectedTheme);
//             if (window.applyThemeToDOM) window.applyThemeToDOM();

//             if (auth.currentUser) {
//                 try { await updateDoc(doc(db, "users", auth.currentUser.uid), { theme: selectedTheme }); } 
//                 catch(e) { console.error(e); }
//             }
//         });
//     });
// }

// function initAccentSettings() {
//     const accentSwatches = document.querySelectorAll('.accent-swatch');
//     const customPicker = document.getElementById('custom-accent-color');
//     const savedAccent = localStorage.getItem('na_accent') || '#6366f1'; 
//     let isCustom = true;

//     // Standard preset click handler
//     accentSwatches.forEach(swatch => {
//         if (swatch.getAttribute('data-color') === savedAccent) {
//             swatch.classList.add('active');
//             isCustom = false;
//         }

//         swatch.addEventListener('click', async () => {
//             accentSwatches.forEach(s => s.classList.remove('active'));
//             swatch.classList.add('active');
//             saveColor(swatch.getAttribute('data-color'), swatch.getAttribute('data-hover'));
//         });
//     });

//     // Custom Color Picker logic
//     if (customPicker) {
//         if (isCustom) customPicker.value = savedAccent; // Load saved custom color
        
//         customPicker.addEventListener('input', (e) => {
//             accentSwatches.forEach(s => s.classList.remove('active')); // Deselect presets
//             const hex = e.target.value;
//             const hoverHex = shadeColor(hex, -15); // Darken by 15% for hover state
//             saveColor(hex, hoverHex);
//         });
//     }

//     async function saveColor(color, hover) {
//         localStorage.setItem('na_accent', color);
//         localStorage.setItem('na_accent_hover', hover);
//         if (window.applyThemeToDOM) window.applyThemeToDOM();

//         if (auth.currentUser) {
//             try { 
//                 await updateDoc(doc(db, "users", auth.currentUser.uid), { accentColor: color, accentHover: hover }); 
//             } catch(e) { console.error(e); }
//         }
//     }
// }

// // Helper to darken/lighten a hex color purely in JS
// function shadeColor(color, percent) {
//     let R = parseInt(color.substring(1,3),16);
//     let G = parseInt(color.substring(3,5),16);
//     let B = parseInt(color.substring(5,7),16);

//     R = parseInt(R * (100 + percent) / 100);
//     G = parseInt(G * (100 + percent) / 100);
//     B = parseInt(B * (100 + percent) / 100);

//     R = (R<255)?R:255; R = (R<0)?0:R;
//     G = (G<255)?G:255; G = (G<0)?0:G;
//     B = (B<255)?B:255; B = (B<0)?0:B;

//     let RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
//     let GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
//     let BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

//     return "#"+RR+GG+BB;
// }