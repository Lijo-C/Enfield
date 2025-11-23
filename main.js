// main.js

// --- 0. BACK BUTTON FIX ---
window.addEventListener('pageshow', (event) => {
    document.body.classList.remove('fade-out');
    const cursorFollower = document.querySelector('.cursor-follower');
    if (cursorFollower) cursorFollower.classList.remove('is-hovering');
});

// --- 1. CURSOR & HOVER ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorFollower = document.querySelector('.cursor-follower');
const allLinks = document.querySelectorAll('a, button, .bike-card, .filter-btn');

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;
    cursorDot.style.transform = `translate(${posX}px, ${posY}px)`;
    cursorFollower.style.transform = `translate(${posX}px, ${posY}px)`;
    
    const header = document.querySelector('header');
    if(header) {
        const moveX = (posX / window.innerWidth - 0.5) * 20; 
        const moveY = (posY / window.innerHeight - 0.5) * 20;
        header.style.setProperty('--move-x', `${moveX}px`);
        header.style.setProperty('--move-y', `${moveY}px`);
        header.style.setProperty('--move-x-rev', `${-moveX}px`);
        header.style.setProperty('--move-y-rev', `${-moveY}px`);
    }
});

allLinks.forEach(link => {
    link.addEventListener('mouseenter', () => { cursorFollower.classList.add('is-hovering'); });
    link.addEventListener('mouseleave', () => { cursorFollower.classList.remove('is-hovering'); link.style.transform = 'translate(0px, 0px)'; });
    if(link.classList.contains('filter-btn')) {
        link.addEventListener('mousemove', (e) => {
            const rect = link.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            link.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });
    }
});

// --- 2. PAGE TRANSITION ---
allLinks.forEach(link => {
    if (link.tagName !== 'A') return;
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (document.startViewTransition) {
            if (!href || href.startsWith('#') || href.startsWith('mailto:') || link.target === '_blank' || link.hasAttribute('data-fancybox')) return;
            return; 
        }
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || link.target === '_blank' || link.hasAttribute('data-fancybox')) return;
        e.preventDefault();
        cursorFollower.classList.remove('is-hovering');
        document.body.classList.add('fade-out');
        setTimeout(() => { window.location.href = href; }, 300);
    });
});

// --- 3. SCROLL TO TOP & TIMELINE (UPDATED) ---
const scrollTopBtn = document.getElementById('scrollTopButton');
const timelineProgress = document.getElementById('timelineProgress');
const timelineTooltip = document.getElementById('timelineTooltip');

window.addEventListener('scroll', () => {
    if (scrollTopBtn) {
        if (window.scrollY > 300) scrollTopBtn.classList.add('is-visible');
        else scrollTopBtn.classList.remove('is-visible');
    }
    
    // Timeline Calculation
    if (timelineProgress) {
        const scrollTop = window.scrollY;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight); // 0.0 to 1.0
        const widthPercent = scrollPercent * 100;
        
        timelineProgress.style.width = `${widthPercent}%`;
        
        // Calculate Year
        // Assumption: Timeline represents 1901 to 2025 (approx 124 years)
        const startYear = 1901;
        const totalYears = 124;
        const currentYear = Math.round(startYear + (totalYears * scrollPercent));
        
        if(timelineTooltip) {
            timelineTooltip.textContent = currentYear;
        }
    }
});

if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// --- 4. ADVANCED FILTERING ---
const bikeCards = document.querySelectorAll('.bike-card');
const decadeContainer = document.getElementById('decade-filters');
const yearContainer = document.getElementById('year-filters');
const searchInput = document.getElementById('searchInput');

if (bikeCards.length > 0 && decadeContainer) {
    const eraMap = new Map(); 
    bikeCards.forEach(card => {
        let yearRaw = card.getAttribute('data-year').toString();
        let year = parseInt(yearRaw.match(/\d{4}/)[0]); 
        let eraLabel = "";
        if (year <= 1900) { eraLabel = "1890 - 1900"; } 
        else {
            let offset = year - 1901;
            let chunkIndex = Math.floor(offset / 25);
            let startYear = 1901 + (chunkIndex * 25);
            let endYear = startYear + 24;
            eraLabel = `${startYear} - ${endYear}`;
        }
        if (!eraMap.has(eraLabel)) { eraMap.set(eraLabel, new Set()); }
        eraMap.get(eraLabel).add(year);
        card.dataset.era = eraLabel;
        card.dataset.cleanYear = year;
        card.dataset.searchText = card.innerText.toLowerCase();
    });

    const sortedEras = Array.from(eraMap.keys()).sort((a, b) => {
        let numA = parseInt(a.match(/\d{4}/)[0]);
        let numB = parseInt(b.match(/\d{4}/)[0]);
        return numA - numB;
    });

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
        filterGrid(card => card.dataset.era === era);
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

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const allEraBtns = decadeContainer.querySelectorAll('.filter-btn');
            allEraBtns.forEach(b => b.classList.remove('active')); 
            filterGrid(card => { return card.dataset.searchText.includes(term); });
        });
    }

    function setActiveBtn(container, activeBtn) {
        const current = container.querySelector('.active');
        if (current) current.classList.remove('active');
        activeBtn.classList.add('active');
    }
}

// --- 5. AUDIO PLAYER LOGIC ---
const playBtn = document.getElementById('playThumpBtn');
const audioEl = document.getElementById('bikeAudio');
if (playBtn && audioEl) {
    const audioSrc = playBtn.dataset.audio;
    if(audioSrc) {
        audioEl.src = audioSrc;
        playBtn.addEventListener('click', () => {
            if (audioEl.paused) {
                audioEl.play().catch(e => console.log("Audio file not found or blocked"));
                playBtn.classList.add('playing');
                playBtn.innerHTML = "<span>&#10074;&#10074;</span> Stop Engine";
            } else {
                audioEl.pause();
                audioEl.currentTime = 0;
                playBtn.classList.remove('playing');
                playBtn.innerHTML = "<span>&#9658;</span> Hear the Thump";
            }
        });
        audioEl.addEventListener('ended', () => {
            playBtn.classList.remove('playing');
            playBtn.innerHTML = "<span>&#9658;</span> Hear the Thump";
        });
    } else {
        playBtn.style.display = 'none';
    }
}