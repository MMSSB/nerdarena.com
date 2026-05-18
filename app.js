document.addEventListener('DOMContentLoaded', () => {
    // 1. Setup Dynamic Mobile Navigation
    const navButtons = document.querySelectorAll('.bottom-nav .nav-item[data-target]');
    const appViews = document.querySelectorAll('.app-view');

    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Prevent default action
            e.preventDefault();

            // Get target view ID
            const targetViewId = button.getAttribute('data-target');
            if (!targetViewId) return;

            // Remove active class from all buttons
            document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => {
                btn.classList.remove('active');
            });

            // Add active class to clicked button
            button.classList.add('active');

            // Hide all views
            appViews.forEach(view => {
                view.classList.remove('active-view');
            });

            // Show target view
            const targetView = document.getElementById(targetViewId);
            if (targetView) {
                targetView.classList.add('active-view');
                // Scroll to top when switching views
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });

    // 2. Auto-Resize Textarea (Dynamic Input flexibility)
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto'; // Reset height
            this.style.height = (this.scrollHeight) + 'px'; // Set to scroll height
        });
    });
});