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









// app-settings.js
import { auth, db } from './firebase.js';
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    initThemeSettings();
    initAccentSettings();
});

// 1. Manage Dark/Light/System Theme
function initThemeSettings() {
    const themeCards = document.querySelectorAll('.theme-card');
    const savedTheme = localStorage.getItem('na_theme') || 'system';

    themeCards.forEach(card => {
        // Highlight active visually
        if (card.getAttribute('data-theme-val') === savedTheme) card.classList.add('active');
        else card.classList.remove('active');

        // Listen for user click
        card.addEventListener('click', async () => {
            themeCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            const selectedTheme = card.getAttribute('data-theme-val');
            
            // Instantly apply locally
            localStorage.setItem('na_theme', selectedTheme);
            if (window.applyThemeToDOM) window.applyThemeToDOM();

            // 🔥 Persist to Firebase
            if (auth.currentUser) {
                try { 
                    await updateDoc(doc(db, "users", auth.currentUser.uid), { theme: selectedTheme }); 
                } catch(e) { console.error("Error saving theme to cloud:", e); }
            }
        });
    });
}

// 2. Manage Accent Color
function initAccentSettings() {
    const accentSwatches = document.querySelectorAll('.accent-swatch');
    const savedAccent = localStorage.getItem('na_accent') || '#6366f1'; 

    accentSwatches.forEach(swatch => {
        // Highlight active visually
        if (swatch.getAttribute('data-color') === savedAccent) swatch.classList.add('active');
        else swatch.classList.remove('active');

        // Listen for user click
        swatch.addEventListener('click', async () => {
            accentSwatches.forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');

            const color = swatch.getAttribute('data-color');
            const hover = swatch.getAttribute('data-hover');

            // Instantly apply locally
            localStorage.setItem('na_accent', color);
            localStorage.setItem('na_accent_hover', hover);
            if (window.applyThemeToDOM) window.applyThemeToDOM();

            // 🔥 Persist to Firebase
            if (auth.currentUser) {
                try { 
                    await updateDoc(doc(db, "users", auth.currentUser.uid), { 
                        accentColor: color, 
                        accentHover: hover 
                    }); 
                } catch(e) { console.error("Error saving accent color to cloud:", e); }
            }
        });
    });
}