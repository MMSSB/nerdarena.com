// // theme.js - Loads instantly to prevent color flashing
// (function() {
//     const savedTheme = localStorage.getItem('na_theme') || 'system';
//     const savedAccent = localStorage.getItem('na_accent');
//     const savedHover = localStorage.getItem('na_accent_hover');

//     // 1. Apply Theme
//     function applyTheme(theme) {
//         if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
//             document.documentElement.setAttribute('data-theme', 'dark');
//         } else {
//             document.documentElement.setAttribute('data-theme', 'light');
//         }
//     }
    
//     applyTheme(savedTheme);

//     // 2. Apply Custom Accent Color
//     if (savedAccent) {
//         document.documentElement.style.setProperty('--primary-color', savedAccent);
//         if (savedHover) {
//             document.documentElement.style.setProperty('--primary-hover', savedHover);
//         }
//     }

//     // 3. Listen for OS theme changes if 'system' is selected
//     window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
//         if (localStorage.getItem('na_theme') === 'system') {
//             document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
//         }
//     });
// })();










// theme.js - Loads instantly to prevent color flashing
(function() {
    // Expose this globally so Firebase (pload.js) can trigger it after downloading data
    window.applyThemeToDOM = function() {
        const savedTheme = localStorage.getItem('na_theme') || 'system';
        const savedAccent = localStorage.getItem('na_accent');
        const savedHover = localStorage.getItem('na_accent_hover');

        // 1. Apply Light/Dark Theme
        if (savedTheme === 'dark' || (savedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }

        // 2. Apply Custom Accent Color or fallback to Default
        if (savedAccent && savedHover) {
            document.documentElement.style.setProperty('--primary-color', savedAccent);
            document.documentElement.style.setProperty('--primary-hover', savedHover);
        } else {
            // Remove overrides so style.css defaults take over (used when logged out)
            document.documentElement.style.removeProperty('--primary-color');
            document.documentElement.style.removeProperty('--primary-hover');
        }
    };

    // Execute instantly on page load
    window.applyThemeToDOM();

    // Listen for OS theme changes if 'system' is selected
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (localStorage.getItem('na_theme') === 'system' || !localStorage.getItem('na_theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
})();