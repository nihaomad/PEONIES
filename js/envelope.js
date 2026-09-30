/* ==========================================================================
   envelope.js — the envelope screen and its opening animation
   --------------------------------------------------------------------------
   The envelope markup lives in index.html; its look lives in css/style.css.
   This file fills in the words, draws the wax seal, and runs the opening
   sequence by adding classes one step at a time. The matching CSS
   transitions are in css/animations.css (search "Opening sequence").
   ========================================================================== */
(function () {
    'use strict';

    const LB = (window.LB = window.LB || {});
    const $ = (id) => document.getElementById(id);
    const fillName = (text, name) => String(text || '').replace(/\{name\}/g, name);

    let button;
    let opening = false;

    /* An irregular wax-seal outline with an embossed monogram. */
    function sealSVG(monogram) {
        const points = [];
        const N = 16;
        for (let i = 0; i < N; i++) {
            const a = (i / N) * Math.PI * 2;
            const r = 45 + Math.sin(i * 2.3) * 2.2 + (i % 3 === 0 ? 1.6 : 0);
            points.push([Math.cos(a) * r, Math.sin(a) * r]);
        }
        const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
        const f = (n) => n.toFixed(2);
        let start = mid(points[N - 1], points[0]);
        let d = `M${f(start[0])} ${f(start[1])}`;
        for (let i = 0; i < N; i++) {
            const p = points[i];
            const m = mid(p, points[(i + 1) % N]);
            d += `Q${f(p[0])} ${f(p[1])} ${f(m[0])} ${f(m[1])}`;
        }
        d += 'Z';

        return `
            <svg viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">
                <defs>
                    <radialGradient id="seal-light" cx=".36" cy=".3" r=".85">
                        <stop offset="0" stop-color="#fff" stop-opacity=".45"/>
                        <stop offset=".45" stop-color="#fff" stop-opacity=".06"/>
                        <stop offset="1" stop-color="#2e1a06" stop-opacity=".38"/>
                    </radialGradient>
                </defs>
                <path class="seal__wax" d="${d}"/>
                <path d="${d}" fill="url(#seal-light)"/>
                <circle class="seal__ring seal__ring--light" r="32" transform="translate(.8 .9)"/>
                <circle class="seal__ring" r="32"/>
                <text class="seal__mono seal__mono--light" x=".9" y="2.4" text-anchor="middle" dominant-baseline="central">${monogram}</text>
                <text class="seal__mono" x="0" y="1.4" text-anchor="middle" dominant-baseline="central">${monogram}</text>
            </svg>`;
    }

    function escapeHTML(s) {
        return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    function init(config, onOpen) {
        const env = config.envelope || {};
        const name = config.recipientName;
        button = $('envelope');

        $('envelope-above').textContent = fillName(env.above, name);
        $('envelope-below').textContent = fillName(env.below, name);
        $('envelope-paper-label').textContent = fillName(env.paperLabel, name);

        const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        $('envelope-hint-text').textContent = finePointer ? env.hintPointer : env.hintTouch;

        const monogram = (env.sealMonogram || name || '♡').trim().charAt(0).toUpperCase();
        $('envelope-seal').innerHTML = sealSVG(escapeHTML(monogram));

        button.setAttribute('aria-label', `Open the letter from ${config.senderName}`);
        // <button> gives us Enter / Space keyboard support for free.
        button.addEventListener('click', onOpen);
    }

    /* ----------------------------------------------------------------------
       Opening sequence (~1.8s). Each step adds a class; CSS does the motion.
         0.00s  envelope lifts
         0.12s  flap swings open, seal fades
         0.54s  flap drops behind the paper, paper slides up
         1.09s  envelope recedes, letter expands into focus  (onReveal)
         1.80s  settled — resolve
       LB.wait() shortens every step when reduced motion is requested.
       ---------------------------------------------------------------------- */
    async function open(onReveal) {
        if (opening) return;               // ignore repeated taps
        opening = true;
        button.disabled = true;

        button.classList.add('is-lifting');
        await LB.wait(120);

        button.classList.add('is-flap-open');
        await LB.wait(420);          // let the flap pass upright before it drops behind the paper

        button.classList.add('is-flap-behind', 'is-paper-rising');
        await LB.wait(550);

        if (typeof onReveal === 'function') onReveal();
        await LB.wait(700);
    }

    LB.envelope = { init, open, focus: () => button && button.focus({ preventScroll: true }) };
})();
