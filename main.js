// main.js

// --- 1. CURSOR & HOVER LOGIC ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorFollower = document.querySelector('.cursor-follower');
const allLinks = document.querySelectorAll('a, button, .bike-card');

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;
    cursorDot.style.transform = `translate(${posX}px, ${posY}px)`;
    cursorFollower.style.transform = `translate(${posX}px, ${posY}px)`;
});

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
    if (link.tagName !== 'A') return;
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank' || e.ctrlKey || e.metaKey) {
            return;
        }
        e.preventDefault();
        cursorFollower.classList.remove('is-hovering');
        document.body.classList.add('fade-out');
        setTimeout(() => {
            window.location.href = href;
        }, 300);
    });
});

// --- 3. SCROLL TO TOP LOGIC ---
const scrollTopBtn = document.getElementById('scrollTopButton');
if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('is-visible');
        } else {
            scrollTopBtn.classList.remove('is-visible');
        }
    });
    scrollTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}


// --- 4. NEW: ADVANCED DATE FILTERING SYSTEM ---
const bikeCards = document.querySelectorAll('.bike-card');
const decadeContainer = document.getElementById('decade-filters');
const yearContainer = document.getElementById('year-filters');

if (bikeCards.length > 0 && decadeContainer) {
    
    // A. EXTRACT DATA
    const yearsMap = new Map(); // Stores Decade -> [Years]

    bikeCards.forEach(card => {
        // Clean the year string (handle "1920-1922" by taking just 1920)
        let yearRaw = card.getAttribute('data-year').toString();
        let year = parseInt(yearRaw.match(/\d{4}/)[0]); 
        let decade = Math.floor(year / 10) * 10; // e.g., 1924 -> 1920

        if (!yearsMap.has(decade)) {
            yearsMap.set(decade, new Set());
        }
        yearsMap.get(decade).add(year);
        
        // Store clean decade/year on card for filtering
        card.dataset.cleanDecade = decade;
        card.dataset.cleanYear = year;
    });

    // Sort Decades
    const sortedDecades = Array.from(yearsMap.keys()).sort((a, b) => a - b);

    // B. BUILD DECADE BUTTONS
    // Create "Show All"
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.textContent = 'All Time';
    allBtn.onclick = () => resetFilter(allBtn);
    decadeContainer.appendChild(allBtn);

    // Create specific decades
    sortedDecades.forEach(decade => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = `${decade}s`;
        btn.onclick = () => filterByDecade(decade, btn);
        decadeContainer.appendChild(btn);
    });

    // C. FILTER FUNCTIONS
    function filterGrid(matchFunction) {
        bikeCards.forEach(card => {
            if (matchFunction(card)) {
                // Show
                card.classList.remove('is-gone');
                setTimeout(() => card.classList.remove('is-hidden'), 10);
            } else {
                // Hide
                card.classList.add('is-hidden');
                setTimeout(() => card.classList.add('is-gone'), 300);
            }
        });
    }

    function resetFilter(clickedBtn) {
        setActiveBtn(decadeContainer, clickedBtn);
        yearContainer.classList.remove('is-active'); // Hide sub-row
        yearContainer.innerHTML = ''; // Clear sub-row
        filterGrid(() => true); // Show all
    }

    function filterByDecade(decade, clickedBtn) {
        setActiveBtn(decadeContainer, clickedBtn);
        
        // 1. Filter Grid immediately to show full decade
        filterGrid(card => parseInt(card.dataset.cleanDecade) === decade);

        // 2. Build Sub-Year Buttons
        yearContainer.innerHTML = ''; // Clear old
        const yearsInDecade = Array.from(yearsMap.get(decade)).sort();

        // Only show sub-row if there's more than 1 year to filter by
        if (yearsInDecade.length > 0) {
            
            // "All 1920s" button
            const allDecadeBtn = document.createElement('button');
            allDecadeBtn.className = 'filter-btn active';
            allDecadeBtn.textContent = `All ${decade}s`;
            allDecadeBtn.onclick = () => {
                setActiveBtn(yearContainer, allDecadeBtn);
                filterGrid(card => parseInt(card.dataset.cleanDecade) === decade);
            };
            yearContainer.appendChild(allDecadeBtn);

            // Specific years
            yearsInDecade.forEach(year => {
                const yBtn = document.createElement('button');
                yBtn.className = 'filter-btn';
                yBtn.textContent = year;
                yBtn.onclick = () => {
                    setActiveBtn(yearContainer, yBtn);
                    filterGrid(card => parseInt(card.dataset.cleanYear) === year);
                };
                yearContainer.appendChild(yBtn);
            });

            yearContainer.classList.add('is-active'); // Slide down
        }
    }

    function setActiveBtn(container, activeBtn) {
        const current = container.querySelector('.active');
        if (current) current.classList.remove('active');
        activeBtn.classList.add('active');
    }
}