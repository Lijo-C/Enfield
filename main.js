// main.js

// --- 0. BACK BUTTON FIX ---
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

// --- 4. ADVANCED FILTERING (30-YEAR GROUPS + SEARCH) ---
const bikeCards = document.querySelectorAll('.bike-card');
const decadeContainer = document.getElementById('decade-filters');
const yearContainer = document.getElementById('year-filters');
const searchInput = document.getElementById('searchInput');

if (bikeCards.length > 0 && decadeContainer) {
    
    // A. EXTRACT AND GROUP DATA
    const eraMap = new Map(); // Stores Era String -> [Years]

    bikeCards.forEach(card => {
        let yearRaw = card.getAttribute('data-year').toString();
        let year = parseInt(yearRaw.match(/\d{4}/)[0]); 
        
        let eraLabel = "";
        
        // LOGIC: Grouping 30 Years
        if (year < 1910) {
            eraLabel = "1890s-1900s";
        } else {
            // 1910, 1940, 1970...
            let startYear = 1910 + Math.floor((year - 1910) / 30) * 30;
            let endYear = startYear + 29;
            eraLabel = `${startYear}-${endYear}`;
        }

        if (!eraMap.has(eraLabel)) {
            eraMap.set(eraLabel, new Set());
        }
        eraMap.get(eraLabel).add(year);
        
        // Store data on card
        card.dataset.era = eraLabel;
        card.dataset.cleanYear = year;
        card.dataset.searchText = card.innerText.toLowerCase();
    });

    // Sort Eras (Manual sort to keep order right)
    const sortedEras = Array.from(eraMap.keys()).sort((a, b) => {
        let numA = parseInt(a.match(/\d{4}/)[0]);
        let numB = parseInt(b.match(/\d{4}/)[0]);
        return numA - numB;
    });

    // B. BUILD ERA BUTTONS
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.textContent = 'All Time';
    allBtn.onclick = () => resetFilter(allBtn);
    decadeContainer.appendChild(allBtn);

    sortedEras.forEach(era => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = era;
        btn.onclick = () => filterByEra(era, btn);
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
        if(searchInput) searchInput.value = ''; 
        filterGrid(() => true); 
    }

    function filterByEra(era, clickedBtn) {
        setActiveBtn(decadeContainer, clickedBtn);
        if(searchInput) searchInput.value = ''; 
        
        // Show cards in this era
        filterGrid(card => card.dataset.era === era);

        // Build Sub-Year Buttons
        yearContainer.innerHTML = ''; 
        const yearsInEra = Array.from(eraMap.get(era)).sort();

        if (yearsInEra.length > 0) {
            const allEraBtn = document.createElement('button');
            allEraBtn.className = 'filter-btn active';
            allEraBtn.textContent = `All ${era}`;
            
            allEraBtn.onclick = () => {
                setActiveBtn(yearContainer, allEraBtn);
                filterGrid(card => card.dataset.era === era);
            };
            yearContainer.appendChild(allEraBtn);

            yearsInEra.forEach(year => {
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
            const allEraBtns = decadeContainer.querySelectorAll('.filter-btn');
            allEraBtns.forEach(b => b.classList.remove('active')); // Deactivate era buttons
            
            filterGrid(card => {
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