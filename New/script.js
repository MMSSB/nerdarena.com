// Mobile Menu Toggle
function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('active');
}

// Lightbox Logic for Gallery
document.addEventListener("DOMContentLoaded", () => {
    const galleryItems = document.querySelectorAll('.gallery-item img');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    if (lightbox) {
        galleryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                lightboxImg.src = e.target.src;
                lightbox.classList.add('active');
            });
        });

        window.closeLightbox = function() {
            lightbox.classList.remove('active');
        }
    }
});





// Gallery Filter Logic
document.addEventListener("DOMContentLoaded", () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');
                
                const filterValue = btn.getAttribute('data-filter');
                
                galleryItems.forEach(item => {
                    if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                        item.style.display = 'block';
                        // Small animation reset
                        item.style.animation = 'none';
                        item.offsetHeight; /* trigger reflow */
                        item.style.animation = null; 
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }
});




// FAQ Accordion Logic
document.addEventListener("DOMContentLoaded", () => {
    // We already have DOMContentLoaded for the lightbox, but it's safe to add another 
    // or merge this logic inside your existing DOMContentLoaded block.
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Close any currently open accordion items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-question').classList.remove('active');
                }
            });
            
            // Toggle the clicked item
            item.classList.toggle('active');
            question.classList.toggle('active');
        });
    });
});