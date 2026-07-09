/* =========================================================
   ROYAL ENFIELD ARCHIVE / INTERACTION ENGINE
   - Procedural Three.js motorcycle stage with a 2D fallback
   - Local visit counter (no backend required)
   - Catalog filtering, tilt, audio and page transitions
========================================================= */

(() => {
    // The homepage also links this file directly, so protect against a layout loading it a second time.
    if (window.__royalEnfieldArchiveMain1Loaded) return;
    window.__royalEnfieldArchiveMain1Loaded = true;
    'use strict';

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
    const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- 0. BACK BUTTON FIX ---
    window.addEventListener('pageshow', () => {
        document.body.classList.remove('fade-out');
        const follower = $('.cursor-follower');
        if (follower) follower.classList.remove('is-hovering');
    });

    // --- 1. MOTORCYCLE CURSOR ---
    function initCursor() {
        if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;

        let dot = $('.cursor-dot');
        let follower = $('.cursor-follower');
        if (!dot) {
            dot = document.createElement('div');
            dot.className = 'cursor-dot';
            document.body.appendChild(dot);
        }
        if (!follower) {
            follower = document.createElement('div');
            follower.className = 'cursor-follower';
            document.body.appendChild(follower);
        }

        window.addEventListener('pointermove', (event) => {
            dot.style.left = `${event.clientX}px`;
            dot.style.top = `${event.clientY}px`;
            follower.style.left = `${event.clientX}px`;
            follower.style.top = `${event.clientY}px`;
        }, { passive: true });

        document.addEventListener('pointerover', (event) => {
            if (event.target.closest && event.target.closest('a, button, .bike-card, .filter-btn')) {
                follower.classList.add('is-hovering');
            }
        });
        document.addEventListener('pointerout', (event) => {
            if (!event.relatedTarget || !event.relatedTarget.closest || !event.relatedTarget.closest('a, button, .bike-card, .filter-btn')) {
                follower.classList.remove('is-hovering');
            }
        });
    }
    initCursor();

    // --- 2. PAGE TRANSITIONS ---
    $$('a').forEach((link) => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('mailto:') || link.target === '_blank' || link.hasAttribute('data-fancybox')) return;
            if (link.origin && link.origin !== window.location.origin) return;
            if (document.startViewTransition) return;
            event.preventDefault();
            document.body.classList.add('fade-out');
            setTimeout(() => { window.location.href = href; }, 300);
        });
    });

    // --- 3. PERSISTENT LOCAL VISIT COUNTER ---
    function initVisitCounter() {
        const output = $('#visitCount');
        if (!output) return;

        const storageKey = 'royal-enfield-archive-visits-v1';
        let count = 1;
        try {
            count = Number.parseInt(window.localStorage.getItem(storageKey) || '0', 10) + 1;
            window.localStorage.setItem(storageKey, String(count));
        } catch (error) {
            // Private browsing or a blocked storage API: still show a useful session count.
            count = 1;
        }

        const finalValue = Math.max(1, count);
        const duration = reducedMotion ? 0 : 950;
        const started = performance.now();
        const render = (value) => {
            output.textContent = Math.round(value).toString().padStart(6, '0');
        };

        if (!duration) {
            render(finalValue);
            return;
        }
        const tick = (now) => {
            const progress = Math.min(1, (now - started) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            render(finalValue * eased);
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }
    initVisitCounter();

    // --- 4. SCROLL TELEMETRY + TIMELINE ---
    const scrollTopBtn = $('#scrollTopButton');
    const timelineProgress = $('#timelineProgress');
    const timelineTooltip = $('#timelineTooltip');

    function updateScrollUI() {
        if (scrollTopBtn) {
            scrollTopBtn.classList.toggle('is-visible', window.scrollY > 300);
        }
        if (timelineProgress) {
            const scrollTop = window.scrollY;
            const docHeight = Math.max(1, document.body.scrollHeight - window.innerHeight);
            const scrollPercent = Math.max(0, Math.min(1, scrollTop / docHeight));
            timelineProgress.style.width = `${scrollPercent * 100}%`;
            const currentYear = Math.round(1901 + (124 * scrollPercent));
            if (timelineTooltip) timelineTooltip.textContent = currentYear;
        }
    }
    window.addEventListener('scroll', updateScrollUI, { passive: true });
    updateScrollUI();

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', (event) => {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
        });
    }

    // --- 5. CATALOG FILTERING ---
    function initFilters() {
        const cards = $$('.bike-card');
        const decadeContainer = $('#decade-filters');
        const yearContainer = $('#year-filters');
        const searchInput = $('#searchInput');
        if (!cards.length || !decadeContainer) return;

        const bikeCount = $('#bikeCount');
        const activeBikeCount = $('#activeBikeCount');
        if (bikeCount) bikeCount.textContent = cards.length.toString().padStart(2, '0');

        const eraMap = new Map();
        cards.forEach((card) => {
            const rawYear = (card.getAttribute('data-year') || '').toString();
            const yearMatch = rawYear.match(/\d{4}/);
            const year = yearMatch ? Number.parseInt(yearMatch[0], 10) : 0;
            let era;
            if (year <= 1900) {
                era = '1890 - 1900';
            } else {
                const chunkIndex = Math.floor((year - 1901) / 25);
                const startYear = 1901 + (chunkIndex * 25);
                era = `${startYear} - ${startYear + 24}`;
            }
            if (!eraMap.has(era)) eraMap.set(era, new Set());
            eraMap.get(era).add(year);
            card.dataset.era = era;
            card.dataset.cleanYear = String(year);
            card.dataset.searchText = (card.innerText || '').toLowerCase();
        });

        const state = { era: null, year: null, search: '' };
        const visibilityTimers = new WeakMap();

        function setVisible(card, isVisible) {
            const oldTimer = visibilityTimers.get(card);
            if (oldTimer) clearTimeout(oldTimer);
            if (isVisible) {
                card.classList.remove('is-gone');
                requestAnimationFrame(() => card.classList.remove('is-hidden'));
            } else {
                card.classList.add('is-hidden');
                visibilityTimers.set(card, setTimeout(() => card.classList.add('is-gone'), 310));
            }
        }

        function applyFilters() {
            let visibleCount = 0;
            cards.forEach((card) => {
                const matchesEra = !state.era || card.dataset.era === state.era;
                const matchesYear = !state.year || Number.parseInt(card.dataset.cleanYear, 10) === state.year;
                const matchesSearch = !state.search || card.dataset.searchText.includes(state.search);
                const visible = matchesEra && matchesYear && matchesSearch;
                if (visible) visibleCount += 1;
                setVisible(card, visible);
            });
            if (activeBikeCount) activeBikeCount.textContent = visibleCount.toString().padStart(2, '0');
        }

        function setActiveButton(container, activeButton) {
            if (!container || !activeButton) return;
            $$('.filter-btn', container).forEach((button) => button.classList.toggle('active', button === activeButton));
        }

        function clearYears() {
            if (!yearContainer) return;
            yearContainer.classList.remove('is-active');
            yearContainer.innerHTML = '';
        }

        function buildYearButtons(era) {
            if (!yearContainer) return;
            clearYears();
            const years = Array.from(eraMap.get(era) || []).sort((a, b) => a - b);
            if (!years.length) return;

            const allEraButton = document.createElement('button');
            allEraButton.className = 'filter-btn active';
            allEraButton.textContent = `All ${era}`;
            allEraButton.type = 'button';
            allEraButton.addEventListener('click', () => {
                state.year = null;
                setActiveButton(yearContainer, allEraButton);
                applyFilters();
            });
            yearContainer.appendChild(allEraButton);

            years.forEach((year) => {
                const yearButton = document.createElement('button');
                yearButton.className = 'filter-btn';
                yearButton.textContent = String(year);
                yearButton.type = 'button';
                yearButton.addEventListener('click', () => {
                    state.year = year;
                    setActiveButton(yearContainer, yearButton);
                    applyFilters();
                });
                yearContainer.appendChild(yearButton);
            });
            yearContainer.classList.add('is-active');
        }

        const allButton = document.createElement('button');
        allButton.className = 'filter-btn active';
        allButton.textContent = 'All Time';
        allButton.type = 'button';
        allButton.addEventListener('click', () => {
            state.era = null;
            state.year = null;
            state.search = '';
            if (searchInput) searchInput.value = '';
            clearYears();
            setActiveButton(decadeContainer, allButton);
            applyFilters();
        });
        decadeContainer.appendChild(allButton);

        Array.from(eraMap.keys()).sort((a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10)).forEach((era) => {
            const eraButton = document.createElement('button');
            eraButton.className = 'filter-btn';
            eraButton.textContent = era;
            eraButton.type = 'button';
            eraButton.addEventListener('click', () => {
                state.era = era;
                state.year = null;
                state.search = '';
                if (searchInput) searchInput.value = '';
                setActiveButton(decadeContainer, eraButton);
                buildYearButtons(era);
                applyFilters();
            });
            decadeContainer.appendChild(eraButton);
        });

        if (searchInput) {
            searchInput.addEventListener('input', (event) => {
                state.search = event.target.value.trim().toLowerCase();
                state.era = null;
                state.year = null;
                clearYears();
                $$('.filter-btn', decadeContainer).forEach((button) => button.classList.remove('active'));
                if (!state.search) allButton.classList.add('active');
                applyFilters();
            });
        }

        applyFilters();
    }
    initFilters();

    // --- 6. CARD TILT ---
    function initCardTilt() {
        if (reducedMotion || window.matchMedia?.('(pointer: coarse)').matches) return;
        $$('.bike-card[data-tilt]').forEach((card) => {
            card.addEventListener('pointermove', (event) => {
                const rect = card.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - .5;
                const y = (event.clientY - rect.top) / rect.height - .5;
                card.style.transform = `translateY(-9px) perspective(700px) rotateX(${y * -3}deg) rotateY(${x * 4}deg)`;
            });
            card.addEventListener('pointerleave', () => { card.style.transform = ''; });
        });
    }
    initCardTilt();

    // --- 7. AUDIO + REV CONTROL ---
    function initAudio() {
        const playButton = $('#playThumpBtn');
        const audio = $('#bikeAudio');
        const revButton = $('#revEngineBtn');
        const defaultLabel = '<span>&#9658;</span> Hear the Thump';
        const stopLabel = '<span>&#10074;&#10074;</span> Stop Engine';

        if (revButton) {
            revButton.addEventListener('click', () => {
                if (typeof window.__revMotorcycle === 'function') window.__revMotorcycle();
                revButton.classList.add('revving');
                window.setTimeout(() => revButton.classList.remove('revving'), 420);
            });
        }

        if (!playButton || !audio) return;
        const audioSource = playButton.dataset.audio;
        if (!audioSource || audioSource.includes('{{')) {
            playButton.style.display = 'none';
            return;
        }
        audio.src = audioSource;
        playButton.addEventListener('click', () => {
            if (audio.paused) {
                audio.play().then(() => {
                    playButton.classList.add('playing');
                    playButton.innerHTML = stopLabel;
                    if (typeof window.__revMotorcycle === 'function') window.__revMotorcycle();
                }).catch(() => {
                    playButton.classList.remove('playing');
                    playButton.innerHTML = defaultLabel;
                });
            } else {
                audio.pause();
                audio.currentTime = 0;
                playButton.classList.remove('playing');
                playButton.innerHTML = defaultLabel;
            }
        });
        audio.addEventListener('ended', () => {
            playButton.classList.remove('playing');
            playButton.innerHTML = defaultLabel;
        });
    }
    initAudio();

    // --- 8. THREE.JS PROCEDURAL MOTORCYCLE ---
    function loadThree() {
        if (window.THREE) return Promise.resolve(window.THREE);
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
            script.async = true;
            script.onload = () => window.THREE ? resolve(window.THREE) : reject(new Error('Three.js did not expose a renderer'));
            script.onerror = () => reject(new Error('Three.js could not be loaded'));
            document.head.appendChild(script);
        });
    }

    function initBikeStage() {
        const canvas = $('#bikeStage');
        const stage = canvas ? canvas.parentElement : null;
        if (!canvas || !stage) return;

        const modeOutput = $('#renderMode');
        if (modeOutput) modeOutput.textContent = 'LOADING / 3D';

        loadThree().then((THREE) => createThreeMotorcycle(THREE, canvas, stage, modeOutput)).catch(() => createCanvasMotorcycle(canvas, stage, modeOutput));
    }

    function createCanvasMotorcycle(canvas, stage, modeOutput) {
        const context = canvas.getContext('2d');
        if (!context) return;
        if (modeOutput) modeOutput.textContent = 'CANVAS / SAFE MODE';
        const pointer = { x: 0, y: 0 };
        let animationFrame;
        let rev = 0;

        const resize = () => {
            const rect = stage.getBoundingClientRect();
            const ratio = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.max(1, rect.width * ratio);
            canvas.height = Math.max(1, rect.height * ratio);
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
        };
        const draw = (time) => {
            const rect = stage.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            context.clearRect(0, 0, width, height);
            const scale = Math.min(width, height) / 560;
            const cx = width / 2 + pointer.x * 18;
            const cy = height * .57 + pointer.y * 8;
            const glow = context.createRadialGradient(cx, cy, 20, cx, cy, 260 * scale);
            glow.addColorStop(0, 'rgba(214,37,43,.23)');
            glow.addColorStop(1, 'rgba(214,37,43,0)');
            context.fillStyle = glow;
            context.fillRect(0, 0, width, height);

            context.save();
            context.translate(cx, cy);
            context.scale(scale, scale);
            context.translate(0, Math.sin(time * .0015) * 5);
            context.strokeStyle = '#d52b31';
            context.lineWidth = 5;
            context.shadowColor = 'rgba(230,39,45,.8)';
            context.shadowBlur = 18 + rev * 15;
            const wheel = (x) => {
                context.beginPath();
                context.arc(x, 55, 91, 0, Math.PI * 2);
                context.strokeStyle = '#b3b8b7';
                context.lineWidth = 7;
                context.stroke();
                context.beginPath();
                context.arc(x, 55, 70, 0, Math.PI * 2);
                context.strokeStyle = '#a91619';
                context.lineWidth = 2;
                context.stroke();
                context.beginPath();
                context.arc(x, 55, 9, 0, Math.PI * 2);
                context.fillStyle = '#d7d8d5';
                context.fill();
            };
            wheel(-145); wheel(145);
            context.beginPath();
            context.moveTo(-145, 55); context.lineTo(-28, -8); context.lineTo(45, 55); context.lineTo(-145, 55);
            context.moveTo(-28, -8); context.lineTo(5, 55); context.lineTo(45, 55);
            context.moveTo(45, 55); context.lineTo(92, -62); context.lineTo(145, 55);
            context.strokeStyle = '#be252a'; context.lineWidth = 9; context.stroke();
            context.fillStyle = '#272a2b';
            context.fillRect(-45, 0, 92, 48);
            context.fillStyle = '#9c1118';
            context.beginPath(); context.ellipse(0, -28, 73, 30, -.1, 0, Math.PI * 2); context.fill();
            context.fillStyle = '#111'; context.fillRect(-42, -67, 79, 13);
            context.strokeStyle = '#d0d0c9'; context.lineWidth = 5;
            context.beginPath(); context.moveTo(86, -63); context.lineTo(117, -77); context.lineTo(135, -68); context.stroke();
            context.fillStyle = '#f3d37e'; context.shadowColor = '#f3d37e'; context.shadowBlur = 24 + rev * 30;
            context.beginPath(); context.arc(95, -61, 14, 0, Math.PI * 2); context.fill();
            context.restore();
            rev = Math.max(0, rev - .018);
            if (!reducedMotion) animationFrame = requestAnimationFrame(draw);
        };

        const interactiveStage = stage.parentElement || stage;
        interactiveStage.addEventListener('pointermove', (event) => {
            const rect = stage.getBoundingClientRect();
            pointer.x = ((event.clientX - rect.left) / rect.width - .5);
            pointer.y = ((event.clientY - rect.top) / rect.height - .5);
        }, { passive: true });
        interactiveStage.addEventListener('pointerleave', () => { pointer.x = 0; pointer.y = 0; });
        window.__revMotorcycle = () => { rev = 1; if (reducedMotion) draw(performance.now()); };
        window.addEventListener('resize', resize, { passive: true });
        resize();
        draw(performance.now());
        return () => cancelAnimationFrame(animationFrame);
    }

    function createThreeMotorcycle(THREE, canvas, stage, modeOutput) {
        if (modeOutput) modeOutput.textContent = 'WEBGL / 3D';
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
        renderer.setClearColor(0x000000, 0);
        if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
        if ('toneMapping' in renderer) {
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.14;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(31, 1, .1, 100);
        camera.position.set(4.45, 2.55, 8.25);
        camera.lookAt(0, 1.05, 0);

        scene.add(new THREE.HemisphereLight(0xbfc7ca, 0x141516, 1.8));
        const keyLight = new THREE.DirectionalLight(0xffe0bd, 3.1);
        keyLight.position.set(-3, 6, 5);
        scene.add(keyLight);
        const redLight = new THREE.PointLight(0xe51c2c, 4.5, 8);
        redLight.position.set(1.4, 1.8, 2.4);
        scene.add(redLight);
        const fillLight = new THREE.PointLight(0x71d7d0, 1.8, 7);
        fillLight.position.set(-3, 2, -3);
        scene.add(fillLight);

        const bike = new THREE.Group();
        bike.position.y = -.14;
        scene.add(bike);
        const rubber = new THREE.MeshStandardMaterial({ color: 0x080909, metalness: .08, roughness: .75 });
        const chrome = new THREE.MeshStandardMaterial({ color: 0xd0d3cf, metalness: .95, roughness: .2 });
        const steel = new THREE.MeshStandardMaterial({ color: 0x646b6d, metalness: .85, roughness: .29 });
        const red = new THREE.MeshStandardMaterial({ color: 0x8e1118, metalness: .54, roughness: .22, emissive: 0x220000, emissiveIntensity: .3 });
        const gold = new THREE.MeshStandardMaterial({ color: 0xc79e61, metalness: .78, roughness: .25 });
        const engine = new THREE.MeshStandardMaterial({ color: 0x242729, metalness: .78, roughness: .4, emissive: 0x180000, emissiveIntensity: .18 });
        const glass = new THREE.MeshStandardMaterial({ color: 0xffc466, metalness: .25, roughness: .12, emissive: 0xff7b1a, emissiveIntensity: 2.5 });
        const wheels = [];

        const tubeBetween = (a, b, radius, material, segments = 12, parent = bike) => {
            const start = new THREE.Vector3(a.x, a.y, a.z);
            const end = new THREE.Vector3(b.x, b.y, b.z);
            const direction = new THREE.Vector3().subVectors(end, start);
            const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), segments), material);
            mesh.position.copy(start).add(end).multiplyScalar(.5);
            mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
            parent.add(mesh);
            return mesh;
        };

        const addWheel = (x) => {
            const wheel = new THREE.Group();
            wheel.position.set(x, 1.18, 0);
            const tyre = new THREE.Mesh(new THREE.TorusGeometry(1.18, .12, 16, 64), rubber);
            tyre.rotation.y = Math.PI / 2;
            wheel.add(tyre);
            const rim = new THREE.Mesh(new THREE.TorusGeometry(.99, .035, 8, 48), chrome);
            rim.rotation.y = Math.PI / 2;
            wheel.add(rim);
            const hub = new THREE.Mesh(new THREE.CylinderGeometry(.14, .14, .24, 16), chrome);
            hub.rotation.z = Math.PI / 2;
            wheel.add(hub);
            for (let i = 0; i < 8; i += 1) {
                const angle = (Math.PI * 2 * i) / 8;
                tubeBetween({ x: 0, y: 0, z: 0 }, { x: 0, y: Math.cos(angle) * .97, z: Math.sin(angle) * .97 }, .012, chrome, 6, wheel);
            }
            bike.add(wheel);
            wheels.push(wheel);
        };
        addWheel(-1.47);
        addWheel(1.47);

        // Frame geometry: a classic cradle, rendered as connected metal tubes.
        tubeBetween({ x: -1.47, y: 1.18, z: 0 }, { x: -.12, y: .78, z: 0 }, .075, red);
        tubeBetween({ x: -.12, y: .78, z: 0 }, { x: -.64, y: 2.05, z: 0 }, .07, red);
        tubeBetween({ x: -.12, y: .78, z: 0 }, { x: .73, y: 2.03, z: 0 }, .07, red);
        tubeBetween({ x: -.64, y: 2.05, z: 0 }, { x: .73, y: 2.03, z: 0 }, .058, gold);
        tubeBetween({ x: .73, y: 2.03, z: 0 }, { x: 1.47, y: 1.18, z: 0 }, .06, chrome);
        tubeBetween({ x: .79, y: 2.02, z: .08 }, { x: 1.47, y: 1.18, z: .08 }, .043, chrome);

        const crank = new THREE.Mesh(new THREE.CylinderGeometry(.23, .23, .66, 24), steel);
        crank.rotation.x = Math.PI / 2;
        crank.position.set(-.1, .8, 0);
        bike.add(crank);
        const engineBlock = new THREE.Mesh(new THREE.BoxGeometry(.92, .72, .72), engine);
        engineBlock.position.set(.08, 1.16, 0);
        engineBlock.rotation.z = -.07;
        bike.add(engineBlock);
        const engineCap = new THREE.Mesh(new THREE.CylinderGeometry(.27, .27, .08, 24), gold);
        engineCap.rotation.x = Math.PI / 2;
        engineCap.position.set(.08, 1.19, .39);
        bike.add(engineCap);

        const tank = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18), red);
        tank.scale.set(1.02, .45, .53);
        tank.position.set(.05, 1.91, 0);
        bike.add(tank);
        const tankStripe = new THREE.Mesh(new THREE.BoxGeometry(.07, .42, .55), gold);
        tankStripe.position.set(-.08, 1.93, .015);
        tankStripe.rotation.z = -.05;
        bike.add(tankStripe);
        const seat = new THREE.Mesh(new THREE.BoxGeometry(.78, .15, .5), rubber);
        seat.position.set(-.67, 2.15, 0);
        seat.rotation.z = -.04;
        bike.add(seat);
        tubeBetween({ x: -.98, y: 2.12, z: 0 }, { x: -.39, y: 2.12, z: 0 }, .035, chrome);

        tubeBetween({ x: .73, y: 2.03, z: 0 }, { x: .98, y: 2.55, z: 0 }, .05, chrome);
        tubeBetween({ x: .98, y: 2.55, z: 0 }, { x: .88, y: 2.73, z: 0 }, .045, chrome);
        tubeBetween({ x: .82, y: 2.69, z: 0 }, { x: 1.15, y: 2.69, z: 0 }, .04, steel);
        const headlight = new THREE.Mesh(new THREE.SphereGeometry(.22, 24, 16), glass);
        headlight.position.set(.97, 2.4, .02);
        bike.add(headlight);
        const lamp = new THREE.PointLight(0xffb245, 3.5, 4.5);
        lamp.position.set(1.18, 2.4, .2);
        bike.add(lamp);

        tubeBetween({ x: -.03, y: .98, z: -.37 }, { x: -.77, y: .84, z: -.37 }, .075, chrome);
        tubeBetween({ x: -.77, y: .84, z: -.37 }, { x: -1.27, y: .99, z: -.37 }, .065, chrome);
        const exhaustTip = new THREE.Mesh(new THREE.CylinderGeometry(.11, .11, .44, 16), steel);
        exhaustTip.rotation.z = Math.PI / 2;
        exhaustTip.position.set(-1.42, 1.03, -.37);
        bike.add(exhaustTip);

        const groundRing = new THREE.Mesh(new THREE.RingGeometry(2.05, 2.08, 72), new THREE.MeshBasicMaterial({ color: 0xd0222c, transparent: true, opacity: .58, side: THREE.DoubleSide }));
        groundRing.rotation.x = -Math.PI / 2;
        groundRing.position.y = -.02;
        bike.add(groundRing);

        // A small cloud of drifting sparks makes the rig feel alive without image assets.
        const particleCount = 160;
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i += 1) {
            positions[i * 3] = (Math.random() - .5) * 8;
            positions[i * 3 + 1] = Math.random() * 4.7;
            positions[i * 3 + 2] = (Math.random() - .5) * 2.3;
        }
        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: 0xe44b43, size: .028, transparent: true, opacity: .62, blending: THREE.AdditiveBlending }));
        particles.position.y = -.5;
        scene.add(particles);

        const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
        let revBoost = 0;
        let lastTime = performance.now();
        let frame = 0;
        const hero = stage.parentElement;
        const handlePointer = (event) => {
            const rect = hero.getBoundingClientRect();
            pointer.targetX = ((event.clientX - rect.left) / rect.width - .5);
            pointer.targetY = ((event.clientY - rect.top) / rect.height - .5);
        };
        hero.addEventListener('pointermove', handlePointer, { passive: true });
        hero.addEventListener('pointerleave', () => { pointer.targetX = 0; pointer.targetY = 0; }, { passive: true });
        window.__revMotorcycle = () => { revBoost = 1; };

        const resize = () => {
            const rect = stage.getBoundingClientRect();
            const width = Math.max(1, rect.width);
            const height = Math.max(1, rect.height);
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', resize, { passive: true });
        if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);
        resize();

        const render = (now) => {
            const delta = Math.min(.05, (now - lastTime) / 1000);
            lastTime = now;
            const time = now / 1000;
            pointer.x += (pointer.targetX - pointer.x) * .045;
            pointer.y += (pointer.targetY - pointer.y) * .045;
            revBoost = Math.max(0, revBoost - delta * 1.45);

            bike.rotation.y += ((pointer.x * .26) - bike.rotation.y) * .035;
            bike.rotation.x += ((pointer.y * -.08) - bike.rotation.x) * .035;
            bike.rotation.z = Math.sin(time * 1.25) * .012;
            bike.position.y = -.14 + Math.sin(time * 1.75) * .045;
            wheels.forEach((wheel) => { wheel.rotation.x -= delta * (1.1 + revBoost * 5.5); });
            groundRing.rotation.z += delta * (.25 + revBoost * 1.5);
            particles.rotation.y += delta * (.035 + revBoost * .18);
            redLight.intensity = 3.8 + revBoost * 7 + Math.sin(time * 4) * .35;
            lamp.intensity = 3.5 + revBoost * 10;
            glass.emissiveIntensity = 2.5 + revBoost * 4;
            engine.emissiveIntensity = .18 + revBoost * .9;
            red.emissiveIntensity = .3 + revBoost * .35;

            if (frame++ % 8 === 0) {
                const temp = $('#engineTemp');
                const throttle = $('#throttleReadout');
                if (temp) temp.textContent = `${Math.round(72 + revBoost * 24 + Math.sin(time * 2) * 2)}°`;
                if (throttle) throttle.textContent = `${Math.round(18 + revBoost * 78)}%`;
            }
            renderer.render(scene, camera);
            if (!reducedMotion) requestAnimationFrame(render);
        };
        render(performance.now());
    }

    initBikeStage();
})();
