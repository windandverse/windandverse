/* WIND & VERSE — JS SCRIPT
   One shared file for every page.
*/

async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
}

    /* ── Card palettes ──
       FIX: ran every palette's title/subtext color through actual WCAG
       contrast math against its own background (the #4b2e19 palette
       reported as unreadable had a subtext contrast of just 1.39:1 — WCAG's
       minimum for normal text is 4.5:1). That check surfaced the same
       problem in 11 of the 15 palettes' subtext colors, and 2 of 15 had
       failing TITLE colors too (#dd7057 at 2.65:1, #5e6253 at 2.36:1) —
       both backgrounds were simply too close in lightness to their
       original light title color to ever read well. Every color below has
       been verified to clear 4.5:1 against its own bg; where a fix was
       needed, the replacement was chosen to stay within that palette's
       existing warm/cool hue family (lightened or darkened, not swapped to
       an unrelated color) so the palette's overall mood doesn't change,
       just its readability. */
    const cardPalettes = [
        { bg: '#1a1a1e', text: '#e4d9c5', subtext: '#b8a994', accent: '#8a7a5a', border: '#3a352a', qMark: '#3a352a', pattern: 'dots' },
        { bg: '#6a5b74', text: '#f0e6d3', subtext: '#e5dcd0', accent: '#3a2c20', border: '#14150a', qMark: '#3a2c20', pattern: 'lines' },
        { bg: '#14150a', text: '#b8c9a0', subtext: '#75895b', accent: '#2b5420', border: '#4c563f', qMark: '#2b5420', pattern: 'diamonds' },
        { bg: '#4c563f', text: '#f0dcc0', subtext: '#dbc4a9', accent: '#964734', border: '#692721', qMark: '#b78953', pattern: 'waves' },
        { bg: '#0d0d0d', text: '#b49a83', subtext: '#8c7d72', accent: '#7e3e28', border: '#2c3e50', qMark: '#5b4636', pattern: 'grid' },
        { bg: '#3d2228', text: '#f4a971', subtext: '#de775f', accent: '#213241', border: '#272233', qMark: '#dd7057', pattern: 'dots' },
        { bg: '#d6d2c8', text: '#121212', subtext: '#6e3b46', accent: '#9a4e3a', border: '#3f4436', qMark: '#6e3b46', pattern: 'lines' },
        { bg: '#2b5420', text: '#f0e6d3', subtext: '#b3bea4', accent: '#4c563f', border: '#14150a', qMark: '#75895b', pattern: 'diamonds' },
        { bg: '#964734', text: '#f4e8d0', subtext: '#e5d5c2', accent: '#692721', border: '#4c563f', qMark: '#b78953', pattern: 'waves' },
        { bg: '#4b2e19', text: '#b49a83', subtext: '#c9a888', accent: '#7e3e28', border: '#2c3e50', qMark: '#b49a83', pattern: 'grid' },
        { bg: '#dd7057', text: '#1a1816', subtext: '#302116', accent: '#213241', border: '#272233', qMark: '#f4a971', pattern: 'dots' },
        { bg: '#3f4436', text: '#d6d2c8', subtext: '#cca69c', accent: '#6e3b46', border: '#2b3440', qMark: '#9a4e3a', pattern: 'lines' },
        { bg: '#121212', text: '#d6d2c8', subtext: '#99757d', accent: '#9a4e3a', border: '#2b3440', qMark: '#6e3b46', pattern: 'diamonds' },
        { bg: '#5e6253', text: '#f0e6d3', subtext: '#dfdcd8', accent: '#5a3d55', border: '#2c3e50', qMark: '#b49a83', pattern: 'waves' },
        { bg: '#2b3440', text: '#d6d2c8', subtext: '#b69da2', accent: '#9a4e3a', border: '#3f4436', qMark: '#6e3b46', pattern: 'grid' },
        /* ── 5 new palettes — built with 4.5:1+ contrast verified from the
           start (each checked against the same WCAG math used to fix the
           original 15), in hue families distinct from the existing set:
           deep indigo, terracotta clay, teal/seafoam, plum/mauve, and
           desert sand. ── */
        { bg: '#1c2240', text: '#e8dfc8', subtext: '#a9a8c4', accent: '#6b5b95', border: '#3a3a5c', qMark: '#6b5b95', pattern: 'dots' },
        { bg: '#7a3b2e', text: '#f5e6d3', subtext: '#e0bba0', accent: '#c9783f', border: '#4a241c', qMark: '#e0bba0', pattern: 'diamonds' },
        { bg: '#16302e', text: '#d8ecdf', subtext: '#8fc7b8', accent: '#3f8f7a', border: '#0d1f1d', qMark: '#8fc7b8', pattern: 'waves' },
        { bg: '#3a1f33', text: '#f0d9e8', subtext: '#c896b8', accent: '#8a4f78', border: '#1f0f1c', qMark: '#c896b8', pattern: 'lines' },
        { bg: '#c9a876', text: '#2c1f12', subtext: '#49371f', accent: '#8a5a2e', border: '#7a6038', qMark: '#5c4527', pattern: 'grid' }
    ];

    /* Small deterministic string hash → stable palette index per poem/id.
       Same id always picks the same palette, but different ids spread
       across the full cardPalettes array instead of all landing on 0. */
    function hashStringToIndex(str, modulo) {
        let hash = 0;
        const s = String(str || '');
        for (let i = 0; i < s.length; i++) {
            hash = (hash * 31 + s.charCodeAt(i)) | 0; // |0 keeps it a 32-bit int
        }
        return Math.abs(hash) % modulo;
    }

    /* ══════════════════════════════════════
       DYNAMIC HEADER HEIGHT
       FIX: body's top padding was a hardcoded 80px in CSS, which silently
       goes stale whenever header content changes height (e.g. restoring the
       quote-slideshow block made the header taller again). This measures
       the header's actual rendered height and exposes it as --header-height
       on the root element, which global.css's "body { padding-top:
       var(--header-height, 80px); }" reads — so spacing self-corrects on
       load, on resize, and on font-loading reflows, instead of needing a
       manually-tuned pixel number every time the header's content changes.
    ══════════════════════════════════════ */
    const siteHeader = document.querySelector('header');
    function syncHeaderHeight() {
        if (!siteHeader) return;
        document.documentElement.style.setProperty('--header-height', `${siteHeader.offsetHeight}px`);
    }
    if (siteHeader) {
        syncHeaderHeight();
        window.addEventListener('resize', syncHeaderHeight);
        // Header height can also change when the rotating quote text wraps
        // differently after fonts finish loading.
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(syncHeaderHeight);
        }
    }

    /* ══════════════════════════════════════
       SITE NAV
    ══════════════════════════════════════ */
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileSidebar = document.getElementById('mobileSidebar');
    const navOverlay = document.getElementById('navOverlay');
    const closeNavBtn = document.getElementById('closeNavBtn');

    function openNav() { mobileSidebar.classList.add('open'); navOverlay.classList.add('visible'); document.body.style.overflow = 'hidden'; }
    function closeNav() { mobileSidebar.classList.remove('open'); navOverlay.classList.remove('visible'); document.body.style.overflow = ''; }
    if (hamburgerBtn) hamburgerBtn.addEventListener('click', openNav);
    if (closeNavBtn) closeNavBtn.addEventListener('click', closeNav);
    if (navOverlay) navOverlay.addEventListener('click', closeNav);
    document.querySelectorAll('.mobile-nav-links a').forEach(l => l.addEventListener('click', closeNav));

    /* ══════════════════════════════════════
       QUOTE SLIDESHOW
    ══════════════════════════════════════ */
    const quoteSlides = document.querySelectorAll('.quote-slide');
    if (quoteSlides.length) {
        let qi = 0;
        quoteSlides.forEach((q, i) => q.classList.toggle('active', i === 0));
        setInterval(() => {
            quoteSlides[qi].classList.remove('active');
            qi = (qi + 1) % quoteSlides.length;
            quoteSlides[qi].classList.add('active');
        }, 4500);
    }

    /* ══════════════════════════════════════
       HERO SLIDESHOW
    ══════════════════════════════════════ */
    document.querySelectorAll('.hero-slideshow').forEach(box => {
        const slides = box.querySelectorAll('.hero-slide');
        if (!slides.length) return;
        let hi = 0;
        slides.forEach((s, i) => s.classList.toggle('active', i === 0));
        setInterval(() => {
            const next = (hi + 1) % slides.length;
            slides[next].classList.add('active');
            slides[hi].classList.remove('active');
            hi = next;
        }, 5000);
    });

    /* ══════════════════════════════════════
       BACK TO TOP
    ══════════════════════════════════════ */
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) backToTop.addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });

    /* ══════════════════════════════════════
       FLOATING "ALL POEMS" BUTTON / SIDEBAR
    ══════════════════════════════════════ */
    const collectionBtnWrap = document.getElementById('collectionBtnWrap');
    const collectionSidebar = document.getElementById('collectionSidebar');

    function openCollectionSidebar() {
        if (!collectionSidebar) return;
        collectionSidebar.classList.add('open');
        if (collectionBtnWrap) collectionBtnWrap.classList.add('hidden');
        const btn = document.getElementById('collectionBtn');
        if (btn) btn.setAttribute('aria-expanded', 'true');
    }
    function closeCollectionSidebar() {
        if (!collectionSidebar) return;
        collectionSidebar.classList.remove('open');
        if (collectionBtnWrap) collectionBtnWrap.classList.remove('hidden');
        const btn = document.getElementById('collectionBtn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
    }

   // Unified Global Listener
document.addEventListener('click', (e) => {
    // 1. Sidebar Logic (Unified)
    const collectionBtn = e.target.closest('#collectionBtn');
    // FIX: the real close button's id is "closeSidebar" (see BaseLayout.astro),
    // not "closeSidebarBtn". This mismatch was why the close (×) button did
    // nothing even once the sidebar markup existed.
    const closeSidebarBtn = e.target.closest('#closeSidebar');
    const sidebar = document.getElementById('collectionSidebar');

    if (collectionBtn) {
        e.stopPropagation();
        openCollectionSidebar();
    }
    
    if (closeSidebarBtn) {
        closeCollectionSidebar();
    }

    // Sidebar Close-on-outside-click
    if (sidebar && sidebar.classList.contains('open') && !sidebar.contains(e.target) && !e.target.closest('#collectionBtn')) {
        closeCollectionSidebar();
    }

    // 2. Your Existing Share/Poem Logic (Keep this)
    delegateShareClick(e);
});

    /* ══════════════════════════════════════
       SHARE SYSTEM
    ══════════════════════════════════════ */
    const SITE_URL = 'https://windandverse.com';

    const SHARE_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>`;

    const EXPAND_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
        <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
    </svg>`;
    const COLLAPSE_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
        <line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>
    </svg>`;

    function getShareOverlay() {
        let overlay = document.getElementById('shareOverlay');
        if (overlay) overlay.remove();
        overlay = document.createElement('div');
        overlay.id = 'shareOverlay';
        overlay.className = 'share-overlay';
        overlay.innerHTML = `
            <div class="share-panel">
                <div class="share-panel-header">
                    <h3>Share</h3>
                    <button class="share-panel-close" type="button" aria-label="Close">&times;</button>
                </div>
                <img class="share-card-preview" id="shareCardPreview" alt="Quote card preview">
                <div class="share-panel-actions">
                    <button class="share-action-btn primary" type="button" id="shareDownloadBtn">Download image</button>
                    <button class="share-action-btn" type="button" id="shareCopyLinkBtn">Copy link</button>
                    <button class="share-more-btn" type="button" id="shareMoreBtn" aria-expanded="false">
                        <span>More options</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                </div>
                <div class="share-social-row share-social-grid" id="shareSocialRow" hidden></div>
                <p class="share-app-tip" id="shareAppTip" style="display:none"></p>
            </div>`;
        document.body.appendChild(overlay);
        overlay.querySelector('.share-panel-close').addEventListener('click', closeShareOverlay);
        overlay.addEventListener('click', e => { if (e.target === overlay) closeShareOverlay(); });
        return overlay;
    }

    function closeShareOverlay() {
        const o = document.getElementById('shareOverlay');
        if (!o) return;
        o.style.opacity = '0';
        o.style.transition = 'opacity 0.25s ease';
        setTimeout(() => {
            o.remove();
            const bar = document.getElementById('quoteSelectBar');
            if (bar && document.querySelector('#poem-body.selecting')) {
                bar.classList.add('visible');
            }
        }, 250);
    }

    function wrapCanvasText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = []; let cur = '';
        words.forEach(w => {
            const test = cur ? cur + ' ' + w : w;
            if (ctx.measureText(test).width > maxWidth && cur) { lines.push(cur); cur = w; }
            else cur = test;
        });
        if (cur) lines.push(cur);
        return lines;
    }

    function drawPattern(ctx, W, H, type, accent) {
        ctx.save();
        ctx.globalAlpha = 0.055;
        ctx.strokeStyle = accent;
        ctx.fillStyle = accent;
        ctx.lineWidth = 1.2;

        if (type === 'dots') {
            const gap = 52;
            for (let x = gap; x < W; x += gap)
                for (let y = gap; y < H; y += gap) {
                    ctx.beginPath(); ctx.arc(x, y, 2.8, 0, Math.PI * 2); ctx.fill();
                }
        } else if (type === 'lines') {
            const gap = 44;
            for (let i = -H; i < W + H; i += gap) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke();
            }
        } else if (type === 'diamonds') {
            const gap = 76, sz = 20;
            for (let x = gap / 2; x < W; x += gap)
                for (let y = gap / 2; y < H; y += gap) {
                    ctx.beginPath();
                    ctx.moveTo(x, y - sz); ctx.lineTo(x + sz, y);
                    ctx.lineTo(x, y + sz); ctx.lineTo(x - sz, y);
                    ctx.closePath(); ctx.stroke();
                }
        } else if (type === 'waves') {
            const gap = 54, amp = 13, freq = 0.014;
            for (let row = gap; row < H; row += gap) {
                ctx.beginPath();
                for (let x = 0; x <= W; x += 2) {
                    const y = row + Math.sin(x * freq * Math.PI * 2) * amp;
                    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
        } else if (type === 'grid') {
            const gap = 58;
            for (let x = gap; x < W; x += gap) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
            for (let y = gap; y < H; y += gap) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
        }
        ctx.restore();
    }

    function generateQuoteCardImage(quoteLines, label, paletteIndex) {
        const canvas = document.createElement('canvas');
        const W = 1080, H = 1080;
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d');
        const p = cardPalettes[(paletteIndex || 0) % cardPalettes.length];

        ctx.fillStyle = p.bg;
        ctx.fillRect(0, 0, W, H);

        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, 'rgba(255,255,255,0.04)');
        grad.addColorStop(1, 'rgba(0,0,0,0.2)');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

        drawPattern(ctx, W, H, p.pattern, p.accent);

        ctx.strokeStyle = p.border; ctx.lineWidth = 2;
        ctx.strokeRect(40, 40, W - 80, H - 80);

        ctx.fillStyle = p.qMark; ctx.font = '260px Georgia, serif';
        ctx.fillText('\u201C', 70, 260);

        const title = quoteLines[0];
        const bodyLines = quoteLines.slice(1);
        const maxW = W - 200;

        /* ── measure title ── */
        ctx.font = 'bold 56px Georgia, serif';
        const titleWrapped = wrapCanvasText(ctx, title, maxW);

        /* ── measure body ── */
        ctx.font = 'italic 38px Georgia, serif';
        let bodyWrapped = [];
        bodyLines.forEach(line => {
            bodyWrapped = bodyWrapped.concat(wrapCanvasText(ctx, line, maxW));
        });

        const titleLH = 72;
        const bodyLH = 56;
        const gap = 36;
        const totalH = (titleWrapped.length * titleLH) + gap + (bodyWrapped.length * bodyLH);
        let y = (H - totalH) / 2;

        /* Draw title — bold, large, full brightness */
        ctx.font = 'bold 56px Georgia, serif';
        ctx.fillStyle = p.text;
        titleWrapped.forEach(line => { ctx.fillText(line, 100, y); y += titleLH; });

        y += gap;

        /* Draw body — italic, smaller, muted */
        ctx.font = 'italic 38px Georgia, serif';
        ctx.fillStyle = p.subtext;
        bodyWrapped.forEach(line => { ctx.fillText(line, 100, y); y += bodyLH; });

        /* Footer */
        ctx.font = '28px Georgia, serif'; ctx.fillStyle = p.subtext;
        ctx.fillText(label || '', 100, H - 120);
        ctx.font = '24px Georgia, serif'; ctx.fillStyle = p.accent;
        ctx.fillText('Rom\u00e9on, windandverse.com', 100, H - 80);

        return canvas.toDataURL('image/png');
    }

    /* * buildSocialPlatforms
     * Returns platforms containing clean SVG shapes colored dynamically.
     */
    function buildSocialPlatforms(fullUrl, text) {
        const enc = encodeURIComponent;
        return [
            { id: 'x', color: '#fff', label: 'X', href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(fullUrl)}`, svg: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>X</title><path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"/></svg>` },
            { id: 'threads', color: '#fff', label: 'Threads', href: `https://threads.net/intent/post?text=${enc(text + ' ' + fullUrl)}`, svg: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Threads</title><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z"/></svg>` },
            { id: 'whatsapp', color: '#25D366', label: 'WhatsApp', href: `https://wa.me/?text=${enc(text + ' ' + fullUrl)}`, svg: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>WhatsApp</title><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>` },
            { id: 'facebook', color: '#1877F2', label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${enc(fullUrl)}`, svg: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Facebook</title><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>` },
            { id: 'telegram', color: '#26A5E4', label: 'Telegram', href: `https://t.me/share/url?url=${enc(fullUrl)}&text=${enc(text)}`, svg: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Telegram</title><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>` },
            { id: 'bluesky', color: '#0085FF', label: 'Bluesky', href: `https://bsky.app/intent/compose?text=${enc(text + ' ' + fullUrl)}`, svg: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Bluesky</title><path d="M5.202 2.857C7.954 4.922 10.913 9.11 12 11.358c1.087-2.247 4.046-6.436 6.798-8.501C20.783 1.366 24 .213 24 3.883c0 .732-.42 6.156-.667 7.037-.856 3.061-3.978 3.842-6.755 3.37 4.854.826 6.089 3.562 3.422 6.299-5.065 5.196-7.28-1.304-7.847-2.97-.104-.305-.152-.448-.153-.327 0-.121-.05.022-.153.327-.568 1.666-2.782 8.166-7.847 2.97-2.667-2.737-1.432-5.473 3.422-6.3-2.777.473-5.899-.308-6.755-3.369C.42 10.04 0 4.615 0 3.883c0-3.67 3.217-2.517 5.202-1.026"/></svg>` },
            { id: 'reddit', color: '#FF4500', label: 'Reddit', href: `https://www.reddit.com/submit?url=${enc(fullUrl)}&title=${enc(text)}`, svg: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Reddit</title><path d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z"/></svg>` },
            { id: 'substack', color: '#FF6719', label: 'Substack', href: `https://substack.com/share?url=${enc(fullUrl)}`, svg: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Substack</title><path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/></svg>` },
        ];
    }

    function openShareFlow({ quoteLines, label, url, shareText, paletteIndex }) {
        const bar = document.getElementById('quoteSelectBar');
        if (bar) bar.classList.remove('visible');
        closeCollectionSidebar();
        const overlay = getShareOverlay();
        const preview = overlay.querySelector('#shareCardPreview');
        const dlBtn = overlay.querySelector('#shareDownloadBtn');
        const copyBtn = overlay.querySelector('#shareCopyLinkBtn');
        const moreBtn = overlay.querySelector('#shareMoreBtn');
        const socialRow = overlay.querySelector('#shareSocialRow');
        const appTip = overlay.querySelector('#shareAppTip');

        const imageData = generateQuoteCardImage(quoteLines, label, paletteIndex);
        preview.src = imageData;

        const fullUrl = url.startsWith('http') ? url : `${SITE_URL}/${url}`;
        const text = shareText || quoteLines.join(' / ');

        // FIX: was always "wind-and-verse-quote.png" regardless of which
        // poem/story/post was being shared. Deriving the name from the
        // page's URL slug (e.g. "/poem/balcony" -> "balcony", matching the
        // poem's actual .md filename) instead of the title text, since
        // titles can contain punctuation, accents, or emoji (some poem
        // author fields in this site's content do) that aren't safe or
        // meaningful in a filename. Falls back to the generic name if no
        // slug can be extracted (e.g. sharing from the homepage, which has
        // no single-item slug).
        let slug = '';
        try {
            const segments = new URL(fullUrl).pathname.split('/').filter(Boolean);
            slug = segments.length ? segments[segments.length - 1] : '';
        } catch {
            slug = '';
        }
        const downloadName = slug ? `${slug}.png` : 'wind-and-verse-quote.png';

        dlBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = imageData; a.download = downloadName; a.click();
        };

        copyBtn.onclick = async () => {
            try {
                await navigator.clipboard.writeText(`${text} — ${fullUrl}`);
                copyBtn.textContent = '✓ Copied!';
                setTimeout(() => { copyBtn.textContent = 'Copy link'; }, 1800);
            } catch {
                copyBtn.textContent = 'Could not copy';
                setTimeout(() => { copyBtn.textContent = 'Copy link'; }, 1800);
            }
        };
        moreBtn.addEventListener('click', () => {
            const isHidden = socialRow.style.display === 'none' || socialRow.style.display === '';
            if (isHidden) {
                socialRow.style.display = 'grid';
                moreBtn.setAttribute('aria-expanded', 'true');
                moreBtn.classList.add('open');
            } else {
                socialRow.style.display = 'none';
                moreBtn.setAttribute('aria-expanded', 'false');
                moreBtn.classList.remove('open');
            }
        });

        /* ── FIX: set up the row's initial state ONCE, before the loop,
           instead of resetting display:'none' on every iteration.
           That repeated reset is what fought with the "More options"
           toggle and made the first click behave unpredictably. ── */
        socialRow.innerHTML = '';
        socialRow.style.display = 'none';
        socialRow.removeAttribute('hidden');

        const platforms = buildSocialPlatforms(fullUrl, text);
        platforms.forEach(pl => {
            const el = document.createElement(pl.href ? 'a' : 'button');
            el.className = 'share-social-btn ssb';
            el.setAttribute('style', `--brand-color: ${pl.color}`);

            if (pl.href) {
                el.href = pl.href; el.target = '_blank'; el.rel = 'noopener noreferrer';
            } else {
                // Fallback for any future platform added here without a real
                // share-intent URL (none currently in the list use this path,
                // now that Instagram/Snapchat/TikTok/Mastodon have all been
                // removed — every remaining platform has a working href).
                el.type = 'button';
                el.addEventListener('click', () => {
                    dlBtn.click();
                    if (appTip) { appTip.textContent = pl.tip; appTip.style.display = 'block'; setTimeout(() => { appTip.style.display = 'none'; }, 5000); }
                });
            }
            el.setAttribute('aria-label', pl.label);
            el.setAttribute('title', pl.label);
            const svgWithColor = pl.svg.replace('<svg ', `<svg style="fill:${pl.color};color:${pl.color};" `);

            el.innerHTML = `
    <span class="ssb-icon">${svgWithColor}</span>
    <span class="ssb-name">${pl.label}</span>`;
            socialRow.appendChild(el);
        });

        if (appTip) appTip.style.display = 'none';
        overlay.classList.add('open');
    }

// ... existing code in your main.js ...
// ... your functions like openShareFlow, toggleFullScreen, etc. are up here ...

/* ══════════════════════════════════════
   FULLSCREEN POEM MODE
   FIX: this previously only called the native browser
   Fullscreen API on <html>, which never added the
   `.fullscreen` class that global.css actually styles
   (.poem-display.fullscreen). So even when the browser
   went fullscreen, the poem still rendered with the old
   layout — looked broken/did nothing useful.

   Now it: 1) toggles `.fullscreen` on the actual poem
   container (driving all the CSS), and 2) requests native
   fullscreen on that same element (so header/footer/chrome
   get hidden) — but native fullscreen failing (e.g. blocked
   by the browser, or unsupported on iOS Safari) no longer
   prevents the visual "fullscreen mode" from working, since
   the class toggle happens independently of the API call.
══════════════════════════════════════ */
function toggleFullScreen() {
    const target = document.getElementById('poem-container') || document.querySelector('.poem-display');
    if (!target) return;

    const turningOn = !target.classList.contains('fullscreen');
    target.classList.toggle('fullscreen', turningOn);

    // Swap the expand/collapse icon + label so it's clear what tapping again will do.
    const expandBtn = document.getElementById('poemExpandBtn');
    if (expandBtn) {
        expandBtn.innerHTML = turningOn ? COLLAPSE_SVG : EXPAND_SVG;
        expandBtn.setAttribute('aria-label', turningOn ? 'Exit fullscreen' : 'Expand poem fullscreen');
    }

    // FIX: previously this also called target.requestFullscreen() /
    // document.exitFullscreen() as a "best-effort" native fullscreen layer
    // on top of the CSS-class approach above. That actively broke sharing
    // while fullscreen: the native Fullscreen API renders ONLY the
    // fullscreened element's own subtree — anything outside it (like
    // #shareOverlay, which getShareOverlay() appends directly to <body>,
    // making it a SIBLING of #poem-container rather than a descendant)
    // becomes invisible and unreachable the moment native fullscreen
    // engages, regardless of z-index. That's why the share panel produced
    // no backdrop at all in fullscreen — it wasn't rendering behind
    // anything, the browser simply wasn't displaying it.
    // The CSS-class fullscreen already gives the same full-bleed visual
    // (fixed position, 100vw/100vh, opaque background, hides header/footer
    // since they're outside .poem-display) without this isolation problem,
    // so the native API call is no longer used here at all.
}

// Kept for any other native-fullscreen state changes (e.g. user presses
// Esc while genuinely in native fullscreen for some other reason) so the
// .fullscreen class doesn't get stuck out of sync — harmless no-op now that
// toggleFullScreen() no longer requests native fullscreen itself.
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        const target = document.getElementById('poem-container') || document.querySelector('.poem-display');
        if (target && target.classList.contains('fullscreen')) {
            target.classList.remove('fullscreen');
            const expandBtn = document.getElementById('poemExpandBtn');
            if (expandBtn) {
                expandBtn.innerHTML = EXPAND_SVG;
                expandBtn.setAttribute('aria-label', 'Expand poem fullscreen');
            }
        }
    }
});

/* FIX: the expand/fullscreen button is now hidden on desktop widths (see
   global.css, "@media (min-width: 1000px) { #poemExpandBtn { display:
   none; } }") since fullscreen mode doesn't look good there. Without this,
   someone who entered fullscreen on mobile/tablet and then resized the
   window (or rotated a tablet) past that breakpoint would get stuck: the
   only button that exits fullscreen would have just disappeared, with no
   other visible way out. This watches for the window crossing that
   threshold while fullscreen is active and exits automatically. */
window.addEventListener('resize', () => {
    if (window.innerWidth >= 1000) {
        const target = document.getElementById('poem-container') || document.querySelector('.poem-display');
        if (target && target.classList.contains('fullscreen')) {
            toggleFullScreen();
        }
    }
});

/* ══════════════════════════════════════
   POEM LINE NORMALIZATION
   FIX: poems are written in Markdown two different ways —
   some poems put a blank line between every single line
   (each line becomes its own <p>), others use a trailing
   double-space "hard break" within a stanza (the whole
   stanza becomes ONE <p> with <br> tags between lines).

   The old selection code assumed every <p> in #poem-body
   was exactly one line. For "one <p> per stanza" poems this
   meant: tapping anywhere selected the entire stanza as a
   block, and quoteLines ended up containing a whole
   multi-line stanza as a single chunk (which is also why the
   share card showed a "duplicated title" — the first stanza's
   full text got used in place of a single line).

   This function runs once per poem page load and rewrites the
   DOM so every visual line — whether it originally came from
   its own <p> or from a <br>-joined stanza — becomes its own
   <p class="poem-line">. The last line of each original stanza
   gets an extra class, "stanza-break", which carries the larger
   gap that used to come from separate <p> margins, so stanzas
   still read as visually grouped instead of every line getting
   equal spacing.
══════════════════════════════════════ */
function normalizePoemLines() {
    const body = document.getElementById('poem-body');
    if (!body || body.dataset.linesNormalized === 'true') return;

    const originalParagraphs = Array.from(body.querySelectorAll('p'));
    originalParagraphs.forEach(p => {
        // Split this paragraph's content on <br> into individual lines.
        // innerHTML is split on <br> (with or without trailing slash/spacing)
        // so each resulting chunk is the raw HTML for one line.
        const rawLines = p.innerHTML.split(/<br\s*\/?>/i).map(s => s.trim()).filter(s => s.length > 0);

        if (rawLines.length === 0) return;

        const frag = document.createDocumentFragment();
        rawLines.forEach((lineHtml, i) => {
            const lineEl = document.createElement('p');
            lineEl.className = 'poem-line';
            lineEl.innerHTML = lineHtml;
            // Last line from this original paragraph carries the stanza gap,
            // matching where a blank line / paragraph break used to be.
            if (i === rawLines.length - 1) {
                lineEl.classList.add('stanza-break');
            }
            frag.appendChild(lineEl);
        });

        p.replaceWith(frag);
    });

    body.dataset.linesNormalized = 'true';
}

function initPoemUI() {
    // Normalize poem markup into one selectable element per line
    // BEFORE wiring up any click handling that depends on line structure.
    normalizePoemLines();

    // FIX: Prev/Next are plain <a href> links causing a full page reload
    // (this site has no view-transitions/client router), which wipes all JS
    // state including the .fullscreen class toggled by toggleFullScreen().
    // To let someone stay in fullscreen while paging through poems with
    // Prev/Next, a flag is written to sessionStorage the instant they click
    // a nav link WHILE fullscreen is active (synchronous, so it completes
    // before the browser unloads the page for navigation) — then restored
    // immediately on the next page's load, below.
    document.querySelectorAll('.fullscreen-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const poemDisplay = document.getElementById('poem-container') || document.querySelector('.poem-display');
            if (poemDisplay && poemDisplay.classList.contains('fullscreen')) {
                sessionStorage.setItem('poemFullscreenNav', '1');
            } else {
                sessionStorage.removeItem('poemFullscreenNav');
            }
        });
    });

    // On THIS page's load, if the flag was set by the previous page's
    // Prev/Next click, re-apply fullscreen immediately and clear the flag
    // (so a normal, unrelated visit to a poem page later doesn't
    // accidentally start in fullscreen).
    if (sessionStorage.getItem('poemFullscreenNav') === '1') {
        sessionStorage.removeItem('poemFullscreenNav');
        if (typeof toggleFullScreen === 'function') {
            const poemDisplay = document.getElementById('poem-container') || document.querySelector('.poem-display');
            if (poemDisplay && !poemDisplay.classList.contains('fullscreen')) {
                toggleFullScreen();
            }
        }
    }

    // Check if the listener is already attached to avoid duplicates
    document.removeEventListener('click', delegateShareClick);
    document.addEventListener('click', delegateShareClick);
    
    console.log("Poem UI event delegation initialized");
}

// Single handler that catches clicks on any .share-btn
function delegateShareClick(event) {
    const btn = event.target.closest('.share-btn');
    if (!btn) return;
    // Poems still have their own dedicated inline <script> (in [slug].astro /
    // poem.astro) that calls window.openShareFlow directly — keep excluding
    // #poem-container so this generic handler doesn't also fire for it.
    //
    // FIX: #story-container used to be excluded here too, on the assumption
    // stories had their own working inline share script — they did, but it
    // was a bespoke, broken one (a bare URL-input overlay with no title/
    // description, firing ALONGSIDE this very function on the same click
    // since the exclusion check came AFTER .share-btn was already matched —
    // actually the exclusion did stop this function from running for
    // stories, but that just meant NEITHER system worked correctly: the
    // bespoke overlay had no styling tie-in and this function's story-
    // extraction logic below was unreachable dead code). That bespoke
    // overlay has been removed from stories/[slug].astro; stories now rely
    // entirely on this function, the same way blog posts do, so the
    // exclusion is removed and the branch below is reachable again.
    if (btn.closest('#poem-container')) {
        return; 
    }

    // 1. Get base data from button attributes
    let data = {
        label: btn.dataset.title || "Wind & Verse",
        shareText: btn.dataset.text || "Check out this content",
        url: window.location.href,
        paletteIndex: parseInt(btn.dataset.palette) || 0,
        quoteLines: []
    };

    // 2. Page-specific extraction logic
    const storyContainer = document.getElementById('story-container');
    const blogContainer = document.getElementById('blog-container');

    if (storyContainer) {
        // Title rendered bold/large as the card headline, description as the
        // muted body text beneath it — same visual treatment poems get,
        // since generateQuoteCardImage() styles quoteLines[0] vs the rest
        // identically regardless of page type.
        data.label = storyContainer.dataset.storyTitle || data.label;
        data.quoteLines = [storyContainer.dataset.storyTitle, storyContainer.dataset.storyExcerpt];
        // FIX: this branch set quoteLines/label but never touched
        // paletteIndex, so it stayed at the base default (parseInt of a
        // dataset.palette attribute that doesn't exist on these buttons,
        // i.e. always 0) — every story's share card used the same palette
        // regardless of which story it was. Hashing the story's own id
        // (e.g. "better-to-have-loved") the same way poems already do gives
        // each story a stable, distinct palette.
        data.paletteIndex = hashStringToIndex(storyContainer.dataset.storyTitle || '', cardPalettes.length);
    } else if (blogContainer) {
        data.label = blogContainer.dataset.blogTitle || data.label;
        data.quoteLines = [blogContainer.dataset.blogTitle, blogContainer.dataset.blogExcerpt];
        // Same fix as stories — hash the post's title so each post gets its
        // own stable palette instead of always defaulting to 0.
        data.paletteIndex = hashStringToIndex(blogContainer.dataset.blogTitle || '', cardPalettes.length);
    }

    openShareFlow(data);
}

// Run on initial load and Astro navigations
document.addEventListener('DOMContentLoaded', initPoemUI);
document.addEventListener('astro:page-load', initPoemUI);

/* ══════════════════════════════════════
   EXPOSE TO is:inline SCRIPTS
   FIX: this file is loaded with <script type="module">
   in BaseLayout.astro, so none of the functions above are
   automatically on `window`. [slug].astro's poem-page script
   is a separate is:inline script and calls toggleFullScreen()
   and openShareFlow() as bare globals — without this, both
   calls threw "toggleFullScreen is not defined" /
   "openShareFlow is not defined" in the console and did nothing.
══════════════════════════════════════ */
window.toggleFullScreen = toggleFullScreen;
window.openShareFlow = openShareFlow;
// Needed by [slug].astro / poem.astro's inline <script>, which compute a
// poem-specific paletteIndex for the bar's "Share" button (see the bug where
// every poem's share card was always using palette 0 because paletteIndex was
// never being passed at all — fixed by calling these from the inline script).
window.hashStringToIndex = hashStringToIndex;
window.cardPalettesLength = cardPalettes.length;