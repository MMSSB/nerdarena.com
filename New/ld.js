// ld.js

// Core function to set and save the theme
function setTheme(theme) {
    if (theme === 'system') {
        // Remove saved preference to rely on OS settings
        localStorage.removeItem('na_ui_theme');
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
        // Save user's explicit preference
        localStorage.setItem('na_ui_theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    }
    
    // Auto-close the theme dropdown menu after making a selection
    const themeDropdown = document.getElementById('theme-dropdown');
    if (themeDropdown) {
        themeDropdown.classList.remove('show');
    }
}

// Initialization function to run on page load
function initTheme() {
    const savedTheme = localStorage.getItem('na_ui_theme');
    
    // Apply saved theme or default to system
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        // We do not call setTheme('system') directly here to avoid removing local storage prematurely, 
        // instead we just apply the logic manually for initialization.
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }
    
    // Listen for OS system theme changes in real-time
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only react to OS changes if the user hasn't explicitly set a preference
        if (!localStorage.getItem('na_ui_theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}

// Attach to the global window object so HTML onclick attributes can access it
window.setTheme = setTheme;

// Execute immediately when the script loads to prevent a white flash on dark mode
initTheme();