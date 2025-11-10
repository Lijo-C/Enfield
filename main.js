// main.js

// --- 1. CUSTOM CURSOR LOGIC ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorFollower = document.querySelector('.cursor-follower');

window.addEventListener('mousemove', (e) => {
    // Get mouse X and Y position
    const posX = e.clientX;
    const posY = e.clientY;

    // Make the dot appear exactly at the cursor's position
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    // Make the follower "follow" the cursor
    cursorFollower.style.transform = `translate(${posX - 15}px, ${posY - 15}px)`;
});


// --- 2. NEW: PAGE TRANSITION LOGIC ---

// Find all links on the page
const allLinks = document.querySelectorAll('a');

allLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');

        // Check for common cases to IGNORE the transition
        if (
            !href ||                     // No href attribute
            href.startsWith('#') ||      // Anchor links
            href.startsWith('mailto:') || // Mail links
            href.startsWith('tel:') ||   // Tel links
            link.target === '_blank' ||  // Opens in new tab
            e.ctrlKey || e.metaKey       // User is intentionally opening in new tab
        ) {
            return; // Don't do the transition
        }

        // If it's a valid internal link, start transition
        e.preventDefault(); // Stop the browser from navigating immediately
        
        document.body.classList.add('fade-out'); // Apply the fade-out class

        // Wait for the animation to finish, then navigate
        setTimeout(() => {
            window.location.href = href;
        }, 300); // This MUST match the transition duration in style.css
    });
});