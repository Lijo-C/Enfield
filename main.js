// main.js

// --- 0. BACK BUTTON FIX (BF CACHE) ---
window.addEventListener('pageshow', (event) => {
    document.body.classList.remove('fade-out');
    const cursorFollower = document.querySelector('.cursor-follower');
    if (cursorFollower) cursorFollower.classList.remove('is-hovering');
});

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
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank' || e.ctrlKey || e.metaKey || link.hasAttribute('data-fancybox')) {
            return;
        }
        e.preventDefault();
        cursorFollower.classList.remove('is-hovering');
        document.body.classList.add('fade-out');
        setTimeout(() => { window.location.href = href; }, 300);
    });
});

// --- 3. SCROLL TO TOP LOGIC ---
const scrollTopBtn = document.getElementById('scrollTopButton');
if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) { scrollTopBtn.classList.add('is-visible'); } 
        else { scrollTopBtn.classList.remove('is-visible'); }
    });
    scrollTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// --- 4. ADVANCED FILTERING (DATE + SEARCH) ---
const bikeCards = document.querySelectorAll('.bike-card');
const decadeContainer = document.getElementById('decade-filters');
const yearContainer = document.getElementById('year-filters');
const searchInput = document.getElementById('searchInput');

if (bikeCards.length > 0 && decadeContainer) {
    
    // A. EXTRACT DATA
    const yearsMap = new Map(); 

    bikeCards.forEach(card => {
        let yearRaw = card.getAttribute('data-year').toString();
        let year = parseInt(yearRaw.match(/\d{4}/)[0]); 
        let decade = Math.floor(year / 10) * 10; 
        if (decade < 1910) { decade = 1900; }

        if (!yearsMap.has(decade)) { yearsMap.set(decade, new Set()); }
        yearsMap.get(decade).add(year);
        
        card.dataset.cleanDecade = decade;
        card.dataset.cleanYear = year;
        
        // Store search text (Name + Category + Engine)
        card.dataset.searchText = card.innerText.toLowerCase();
    });

    const sortedDecades = Array.from(yearsMap.keys()).sort((a, b) => a - b);

    // B. BUILD DECADE BUTTONS
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.textContent = 'All Time';
    allBtn.onclick = () => resetFilter(allBtn);
    decadeContainer.appendChild(allBtn);

    sortedDecades.forEach(decade => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        if (decade === 1900) { btn.textContent = "1890s-1900s"; } 
        else { btn.textContent = `${decade}s`; }
        btn.onclick = () => filterByDecade(decade, btn);
        decadeContainer.appendChild(btn);
    });

    // C. FILTER FUNCTIONS
    function filterGrid(matchFunction) {
        bikeCards.forEach(card => {
            if (matchFunction(card)) {
                card.classList.remove('is-gone');
                setTimeout(() => card.classList.remove('is-hidden'), 10);
            } else {
                card.classList.add('is-hidden');
                setTimeout(() => card.classList.add('is-gone'), 300);
            }
        });
    }

    function resetFilter(clickedBtn) {
        if (clickedBtn) setActiveBtn(decadeContainer, clickedBtn);
        yearContainer.classList.remove('is-active'); 
        yearContainer.innerHTML = ''; 
        searchInput.value = ''; // Clear search on reset
        filterGrid(() => true); 
    }

    function filterByDecade(decade, clickedBtn) {
        setActiveBtn(decadeContainer, clickedBtn);
        searchInput.value = ''; // Clear search when clicking buttons
        filterGrid(card => parseInt(card.dataset.cleanDecade) === decade);

        yearContainer.innerHTML = ''; 
        const yearsInDecade = Array.from(yearsMap.get(decade)).sort();

        if (yearsInDecade.length > 0) {
            const allDecadeBtn = document.createElement('button');
            allDecadeBtn.className = 'filter-btn active';
            if (decade === 1900) { allDecadeBtn.textContent = "All 1890s-1900s"; } 
            else { allDecadeBtn.textContent = `All ${decade}s`; }
            
            allDecadeBtn.onclick = () => {
                setActiveBtn(yearContainer, allDecadeBtn);
                filterGrid(card => parseInt(card.dataset.cleanDecade) === decade);
            };
            yearContainer.appendChild(allDecadeBtn);

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
            yearContainer.classList.add('is-active'); 
        }
    }

    // D. SEARCH LOGIC
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            
            // Reset button states visually (optional)
            const allDecadeBtns = decadeContainer.querySelectorAll('.filter-btn');
            allDecadeBtns.forEach(b => b.classList.remove('active'));
            
            filterGrid(card => {
                // Simple logic: Does the card text contain the search term?
                return card.dataset.searchText.includes(term);
            });
        });
    }

    function setActiveBtn(container, activeBtn) {
        const current = container.querySelector('.active');
        if (current) current.classList.remove('active');
        activeBtn.classList.add('active');
    }
}