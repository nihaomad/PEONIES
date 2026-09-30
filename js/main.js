/* ==========================================================================
   main.js — the experience's state machine
   --------------------------------------------------------------------------
     INTRO  →  ENVELOPE  →  OPENING  →  LETTER  →  FINISHED

   The current state is mirrored on <body data-state="…"> and the CSS reacts
   to it. Only the transitions listed in NEXT are allowed, so stray or
   repeated taps can never skip ahead or break an animation.
   ========================================================================== */
(function () {
    'use strict';

    const LB = (window.LB = window.LB || {});

    const NEXT = {
        INTRO: ['ENVELOPE'],
        ENVELOPE: ['OPENING'],
        OPENING: ['LETTER'],
        LETTER: ['FINISHED'],
        FINISHED: []
    };

    let currentState = 'INTRO';
    let introTimer = null;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    /* Promise-based delay; nearly instant when reduced motion is requested. */
    LB.wait = (ms) => new Promise((resolve) => setTimeout(resolve, reducedMotion.matches ? Math.min(ms, 80) : ms));

    function setState(next) {
        if (!NEXT[currentState].includes(next)) return false;
        currentState = next;
        document.body.dataset.state = next;
        return true;
    }

    /* CONFIG.colors → CSS custom properties used throughout the stylesheets. */
    const THEME_VARS = {
        background: '--c-bg',
        blush: '--c-blush',
        cream: '--c-cream',
        paper: '--c-paper',
        ink: '--c-ink',
        burgundy: '--c-burgundy',
        burgundyDark: '--c-burgundy-dark',
        wine: '--c-wine',
        gold: '--c-gold',
        peonyDeep: '--c-peony-deep',
        peonyMid: '--c-peony-mid',
        peonyLight: '--c-peony-light',
        peonyEdge: '--c-peony-edge',
        leaf: '--c-leaf',
        leafDark: '--c-leaf-dark',
        leafLight: '--c-leaf-light',
        envelope: '--c-envelope',
        envelopeFlap: '--c-envelope-flap',
        envelopeInside: '--c-envelope-inside',
        envelopeLining: '--c-envelope-lining',
        seal: '--c-seal'
    };

    function applyTheme(colors) {
        const root = document.documentElement.style;
        Object.keys(colors || {}).forEach((key) => {
            if (THEME_VARS[key] && colors[key]) root.setProperty(THEME_VARS[key], colors[key]);
        });
        if (colors && colors.background) {
            const meta = document.querySelector('meta[name="theme-color"]');
            if (meta) meta.setAttribute('content', colors.background);
        }
    }

    /* ---------- INTRO → ENVELOPE ---------- */

    function showEnvelope(skipped) {
        clearTimeout(introTimer);
        if (!setState('ENVELOPE')) return;
        if (skipped) {
            document.body.classList.add('intro-skipped');
            // The skip button disappears, so hand keyboard focus to the envelope.
            LB.envelope.focus();
        }
    }

    function startIntro() {
        // Two frames so the initial (hidden) styles are painted before animating in.
        requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('is-loaded')));
        const hold = reducedMotion.matches ? 900 : CONFIG.intro.holdMs;
        introTimer = setTimeout(() => showEnvelope(false), hold);
    }

    /* ---------- ENVELOPE → OPENING → LETTER → FINISHED ---------- */

    async function openEnvelope() {
        if (!setState('OPENING')) return;
        LB.music.reveal();                      // still inside the tap, so audio may start
        await LB.envelope.open(LB.letter.show);
        setState('LETTER');
        LB.letter.focus();
        LB.letter.watchEnding(() => setState('FINISHED'));
    }

    /* ---------- boot ---------- */

    function init() {
        if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);

        applyTheme(CONFIG.colors);
        LB.flowers.mountGarden(document.getElementById('garden'));
        LB.flowers.mountParticles(document.getElementById('particles'));
        LB.letter.render(CONFIG);
        LB.envelope.init(CONFIG, openEnvelope);
        LB.music.init(CONFIG.music);

        const skip = document.getElementById('skip-intro');
        skip.textContent = CONFIG.intro.skipLabel;
        skip.addEventListener('click', () => showEnvelope(true));

        startIntro();
    }

    init();
})();
