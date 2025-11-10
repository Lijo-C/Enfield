// main.js

// --- 1. CURSOR & HOVER LOGIC ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorFollower = document.querySelector('.cursor-follower');
const allLinks = document.querySelectorAll('a, button, .bike-card'); // Elements that trigger hover

// Update cursor position
window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    // Use transform for smoother animation on both
    cursorDot.style.transform = `translate(${posX}px, ${posY}px)`;
    cursorFollower.style.transform = `translate(${posX}px, ${posY}px)`;
});

// Add hover effect
allLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
        cursorFollower.classList.add('is-hovering');
    });
    link.addEventListener('mouseleave', () => {
        cursorFollower.classList.remove('is-hovering');
    });
});


// --- 2. PAGE TRANSITION LOGIC ---
allLinks.forEach(link => {
    // We only want this for actual <a> tags
    if (link.tagName !== 'A') return;

    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');

        if (
            !href ||                     
            href.startsWith('#') ||      
            href.startsWith('mailto:') || 
            href.startsWith('tel:') ||   
            link.target === '_blank' ||  
            e.ctrlKey || e.metaKey       
        ) {
            return; // Don't do the transition
        }

        e.preventDefault(); 
        
        // Remove hover effect during transition
        cursorFollower.classList.remove('is-hovering');
        document.body.classList.add('fade-out'); 

        setTimeout(() => {
            window.location.href = href;
        }, 300); 
    });
});


// --- 3. NEW: CATEGORY FILTERING LOGIC ---
const filterNav = document.querySelector('.filter-nav');
const filterButtons = document.querySelectorAll('.filter-btn');
const bikeCards = document.querySelectorAll('.bike-card');

if (filterNav) {
    filterNav.addEventListener('click', (e) => {
        // Only run if a button was clicked
        if (!e.target.matches('.filter-btn')) return;

        const clickedBtn = e.target;
        const filterCategory = clickedBtn.dataset.category;

        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        clickedBtn.classList.add('active');

        // Show/hide cards
        bikeCards.forEach(card => {
            const cardCategory = card.dataset.category;

            if (filterCategory === 'all' || cardCategory === filterCategory) {
                // Show card
                card.classList.remove('is-hidden');
            } else {
                // Hide card
                card.classList.add('is-hidden');
            }
        });
    });
}