// theme.js - Loads instantly to prevent color flashing
(function() {
    const savedTheme = localStorage.getItem('na_theme') || 'system';
    const savedAccent = localStorage.getItem('na_accent');
    const savedHover = localStorage.getItem('na_accent_hover');

    // 1. Apply Theme
    function applyTheme(theme) {
        if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }
    
    applyTheme(savedTheme);

    // 2. Apply Custom Accent Color
    if (savedAccent) {
        document.documentElement.style.setProperty('--primary-color', savedAccent);
        if (savedHover) {
            document.documentElement.style.setProperty('--primary-hover', savedHover);
        }
    }

    // 3. Listen for OS theme changes if 'system' is selected
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (localStorage.getItem('na_theme') === 'system') {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
})();