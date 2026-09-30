/* ==========================================================================
   flowers.js — burgundy peonies, buds, leaves and floating petals
   --------------------------------------------------------------------------
   Peonies are generated as inline SVG from a seed, so every flower is a
   little different but always the same between visits. Colours come from
   CSS variables (see CONFIG.colors), so nothing here needs editing to
   re-colour them.

   Where each flower sits on screen is controlled in css/style.css
   (.flower--a … .flower--f). This file only decides what they look like.
   ========================================================================== */
(function () {
    'use strict';

    const LB = (window.LB = window.LB || {});

    /* One entry per flower on screen. Change a seed for a different bloom. */
    const GARDEN = [
        { key: 'a', type: 'peony', seed: 11, leaves: 3 },
        { key: 'b', type: 'peony', seed: 29, leaves: 2 },
        { key: 'c', type: 'peony', seed: 47, leaves: 2 },
        { key: 'd', type: 'peony', seed: 63, leaves: 1 },
        { key: 'e', type: 'bud',   seed: 5 },
        { key: 'f', type: 'bud',   seed: 8 }
    ];

    /* Petal rings, drawn from the outside in. Lengths are in SVG units
       (the bloom is ~200 units across inside a 300-unit viewBox). */
    const RINGS = [
        { count: 7, len: 96, width: 86, lift: 4, ruffles: 6, grad: 'pg-outer', jitter: 16, veins: true,  sheen: true },
        { count: 8, len: 80, width: 70, lift: 4, ruffles: 5, grad: 'pg-outer', jitter: 14, veins: true,  sheen: true },
        { count: 8, len: 64, width: 58, lift: 3, ruffles: 5, grad: 'pg-mid',   jitter: 14, veins: false, sheen: true },
        { count: 9, len: 48, width: 46, lift: 3, ruffles: 4, grad: 'pg-mid',   jitter: 18, veins: false, sheen: false },
        { count: 9, len: 34, width: 34, lift: 2, ruffles: 4, grad: 'pg-inner', jitter: 20, veins: false, sheen: false }
    ];

    /* ---------- helpers ---------- */

    // Small deterministic PRNG (mulberry32) so flowers look the same every visit.
    function seeded(seed) {
        let s = seed >>> 0;
        return function () {
            s = (s + 0x6D2B79F5) | 0;
            let t = Math.imul(s ^ (s >>> 15), 1 | s);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    const r2 = (v) => Math.round(v * 100) / 100;

    /* ---------- shared gradients (inserted once into #svg-defs) ---------- */

    const DEFS = `
        <linearGradient id="pg-outer" x1=".5" y1="1" x2=".5" y2="0">
            <stop offset="0" class="s-deep"/><stop offset=".42" class="s-mid"/>
            <stop offset=".84" class="s-light"/><stop offset="1" class="s-edge"/>
        </linearGradient>
        <linearGradient id="pg-mid" x1=".5" y1="1" x2=".5" y2="0">
            <stop offset="0" class="s-deep"/><stop offset=".55" class="s-mid"/><stop offset="1" class="s-light"/>
        </linearGradient>
        <linearGradient id="pg-inner" x1=".5" y1="1" x2=".5" y2="0">
            <stop offset="0" class="s-deep"/><stop offset=".7" class="s-mid"/><stop offset="1" class="s-light"/>
        </linearGradient>
        <linearGradient id="pg-core" x1=".5" y1="1" x2=".5" y2="0">
            <stop offset="0" class="s-deep"/><stop offset=".8" class="s-mid"/><stop offset="1" class="s-light"/>
        </linearGradient>
        <linearGradient id="pg-sheen" x1=".5" y1="1" x2=".5" y2="0">
            <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".09"/>
        </linearGradient>
        <radialGradient id="pg-shadow">
            <stop offset="0" class="s-shadow" stop-opacity=".55"/>
            <stop offset=".62" class="s-shadow" stop-opacity=".22"/>
            <stop offset="1" class="s-shadow" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="pg-center">
            <stop offset="0" class="s-shadow"/><stop offset="1" class="s-deep"/>
        </radialGradient>
        <radialGradient id="pg-light" cx=".36" cy=".3" r=".78">
            <stop offset="0" stop-color="#fff4f6" stop-opacity=".2"/>
            <stop offset=".6" stop-color="#fff4f6" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="leaf-grad" x1=".5" y1="1" x2=".5" y2="0">
            <stop offset="0" class="s-leaf-dark"/><stop offset=".55" class="s-leaf"/><stop offset="1" class="s-leaf-light"/>
        </linearGradient>
        <radialGradient id="bud-grad" cx=".38" cy=".3" r=".8">
            <stop offset="0" class="s-edge"/><stop offset=".35" class="s-light"/>
            <stop offset=".75" class="s-mid"/><stop offset="1" class="s-deep"/>
        </radialGradient>`;

    /* ---------- petal geometry ---------- */

    /* A fan-shaped petal with a ruffled, scalloped top edge.
       Base at (0,0), tip pointing up (-y). */
    function petalPath(len, width, ruffles, rand) {
        const w = width / 2;
        const shoulder = len * 0.62;          // where the petal is widest
        const ry = len - shoulder;
        // point on the rounded top edge; k < 1 pulls it in (a notch), k > 1 pushes out (a ruffle)
        const edge = (a, k) => [r2(-w * Math.cos(a) * k), r2(-shoulder - ry * Math.sin(a) * k)];

        let d = `M0 0C${r2(-w * 0.25)} ${r2(-len * 0.1)} ${r2(-w * 1.05)} ${r2(-shoulder * 0.55)} ${r2(-w)} ${r2(-shoulder)}`;
        for (let i = 1; i <= ruffles; i++) {
            const a0 = (Math.PI * (i - 1)) / ruffles;
            const a1 = (Math.PI * i) / ruffles;
            const [cx, cy] = edge((a0 + a1) / 2, 1.04 + rand() * 0.13);
            const [x, y] = edge(a1, i === ruffles ? 1 : 0.9 + rand() * 0.07);
            d += `Q${cx} ${cy} ${x} ${y}`;
        }
        d += `C${r2(w * 1.05)} ${r2(-shoulder * 0.55)} ${r2(w * 0.25)} ${r2(-len * 0.1)} 0 0Z`;
        return d;
    }

    function drawRing(out, ring, rand) {
        const start = rand() * 360;
        for (let i = 0; i < ring.count; i++) {
            const angle = start + (i * 360) / ring.count + (rand() - 0.5) * ring.jitter;
            const len = ring.len * (0.88 + rand() * 0.22);
            const wid = ring.width * (0.85 + rand() * 0.3);
            const d = petalPath(len, wid, ring.ruffles + Math.floor(rand() * 2), rand);
            const lift = ring.lift * (1 + rand());

            out.push(`<g transform="rotate(${r2(angle)}) translate(0 ${r2(-lift)})">`);
            out.push(`<path class="petal" d="${d}" fill="url(#${ring.grad})"/>`);
            if (ring.sheen) {
                out.push(`<path d="${d}" fill="url(#pg-sheen)" transform="translate(0 ${r2(-len * 0.2)}) scale(.58 .7)"/>`);
            }
            if (ring.veins) {
                const x = wid * 0.16;
                for (const k of [-1, 0, 1]) {
                    out.push(`<path class="vein" d="M${r2(k * x * 0.2)} ${r2(-len * 0.12)}Q${r2(k * x * 0.9)} ${r2(-len * 0.5)} ${r2(k * x * 1.4)} ${r2(-len * 0.84)}"/>`);
                }
            }
            out.push('</g>');
        }
    }

    /* The tight, cupped centre: small crescent folds crowded together. */
    function drawCore(out, rand) {
        out.push('<circle r="11" fill="url(#pg-center)"/>');
        const folds = [];
        for (let i = 0; i < 18; i++) {
            folds.push({ r: 2 + rand() * 19, a: rand() * 360, s: 6 + rand() * 8 });
        }
        folds.sort((p, q) => q.r - p.r);
        for (const f of folds) {
            const s = f.s;
            out.push(
                `<path class="fold" fill="url(#pg-core)" transform="rotate(${r2(f.a)}) translate(0 ${r2(-f.r)})" ` +
                `d="M${r2(-s)} 0Q0 ${r2(-s * 1.25)} ${r2(s)} 0Q0 ${r2(-s * 0.4)} ${r2(-s)} 0Z"/>`
            );
        }
    }

    function leafPath(len, w, bend) {
        return `M0 0C${r2(w)} ${r2(-len * 0.22)} ${r2(w * 0.75 + bend)} ${r2(-len * 0.72)} ${r2(bend)} ${r2(-len)}` +
               `C${r2(-w * 0.75 + bend)} ${r2(-len * 0.72)} ${r2(-w)} ${r2(-len * 0.22)} 0 0Z`;
    }

    function drawLeaf(out, len, w, bend) {
        out.push(`<path class="leaf" d="${leafPath(len, w, bend)}" fill="url(#leaf-grad)"/>`);
        out.push(`<path class="leaf-rib" d="M0 ${r2(-len * 0.04)}Q${r2(bend * 0.6 + w * 0.08)} ${r2(-len * 0.5)} ${r2(bend)} ${r2(-len * 0.94)}"/>`);
    }

    /* Peony leaves come in loose groups of three, peeking from under the bloom. */
    function drawLeaves(out, count, rand) {
        const base = rand() * 360;
        for (let i = 0; i < count; i++) {
            const angle = base + (i * 360) / count + (rand() - 0.5) * 50;
            const len = 58 + rand() * 18;
            const w = 16 + rand() * 6;
            const bend = (rand() - 0.5) * 16;
            out.push(`<g transform="rotate(${r2(angle)}) translate(0 -70)">`);
            if (rand() > 0.3) {
                out.push('<g transform="rotate(-34)">'); drawLeaf(out, len * 0.64, w * 0.8, bend * 0.5); out.push('</g>');
                out.push('<g transform="rotate(32)">');  drawLeaf(out, len * 0.6,  w * 0.8, -bend * 0.5); out.push('</g>');
            }
            drawLeaf(out, len, w, bend);
            out.push('</g>');
        }
    }

    /* ---------- public artwork builders ---------- */

    function peonySVG(seed, opts) {
        const options = opts || {};
        const rand = seeded(seed);
        const leaves = options.leaves || 0;
        const viewBox = options.viewBox || '-150 -150 300 300';
        const out = [`<svg class="peony" viewBox="${viewBox}" aria-hidden="true" focusable="false">`];

        if (leaves) {
            out.push('<g class="flower__leaves">');
            drawLeaves(out, leaves, rand);
            out.push('</g>');
        }

        out.push('<g class="flower__petals">');
        RINGS.forEach((ring, i) => {
            // a soft shadow under each inner ring gives the bloom its depth
            if (i > 0) out.push(`<circle r="${r2(ring.len * 0.95)}" fill="url(#pg-shadow)"/>`);
            drawRing(out, ring, rand);
        });
        drawCore(out, rand);
        out.push('<circle r="100" fill="url(#pg-light)"/>');
        out.push('</g></svg>');
        return out.join('');
    }

    function budSVG(seed) {
        const rand = seeded(seed);
        const tilt = r2((rand() - 0.5) * 18);
        const out = ['<svg class="bud" viewBox="-60 -60 120 120" aria-hidden="true" focusable="false">'];

        out.push('<g class="flower__leaves">');
        out.push('<path class="stem" d="M0 8C3 26-3 40 3 60"/>');
        out.push('<g transform="translate(1 36) rotate(58)">'); drawLeaf(out, 26, 8, 2); out.push('</g>');
        out.push('</g>');

        out.push(`<g class="flower__petals" transform="rotate(${tilt})">`);
        out.push('<ellipse cx="0" cy="-8" rx="21" ry="23" fill="url(#bud-grad)" class="petal"/>');
        out.push('<path d="M-20 -4Q-15 -31 8 -30Q-10 -22 -20 -4Z" fill="#fff" fill-opacity=".1"/>');
        out.push('<path class="bud-line" d="M-17 -1Q-5 -29 14 -25"/>');
        out.push('<path class="bud-line" d="M-7 12Q11 3 18 -13"/>');
        out.push('<path class="bud-line" d="M-19 3Q-16 -14 -6 -21"/>');
        // sepals hugging the bud
        out.push('<g transform="translate(0 12) rotate(-38)">'); drawLeaf(out, 24, 8, 3); out.push('</g>');
        out.push('<g transform="translate(0 12) rotate(36)">');  drawLeaf(out, 24, 8, -3); out.push('</g>');
        out.push('<g transform="translate(0 13)">');             drawLeaf(out, 14, 7, 0); out.push('</g>');
        out.push('</g></svg>');
        return out.join('');
    }

    /* ---------- mounting ---------- */

    function flowerArt(f) {
        const custom = (typeof CONFIG !== 'undefined' && CONFIG.flowers) || {};
        const img = f.type === 'bud' ? custom.budImage : custom.peonyImage;
        if (img) return `<img src="${encodeURI(img)}" alt="" decoding="async">`;
        return f.type === 'bud' ? budSVG(f.seed) : peonySVG(f.seed, { leaves: f.leaves });
    }

    function mountGarden(container) {
        document.getElementById('svg-defs').innerHTML = DEFS;
        container.innerHTML = GARDEN.map((f) =>
            `<div class="flower flower--${f.key} flower--${f.type}">` +
                `<div class="flower__bloom"><div class="flower__sway">${flowerArt(f)}</div></div>` +
            '</div>'
        ).join('');
    }

    /* A handful of drifting petals and faint gold specks — kept deliberately sparse.
       Random values are passed as CSS custom properties for the keyframes. */
    function mountParticles(container) {
        const small = window.matchMedia('(max-width: 600px)').matches;
        const petals = small ? 6 : 11;
        const specks = small ? 6 : 10;
        const html = [];

        for (let i = 0; i < petals; i++) {
            const dur = 24 + Math.random() * 16;
            const vars = [
                `--x:${r2(Math.random() * 100)}%`,
                `--dur:${r2(dur)}s`,
                `--delay:${r2(-Math.random() * dur)}s`,
                `--dx:${r2((Math.random() - 0.5) * 30)}vw`,
                `--rot:${r2(180 + Math.random() * 360)}deg`,
                `--size:${r2(8 + Math.random() * 8)}px`,
                `--o:${r2(0.16 + Math.random() * 0.2)}`
            ].join(';');
            html.push(
                `<span class="particle particle--petal" style="${vars}"><span class="particle__sway">` +
                '<svg viewBox="-10 -14 20 17"><path d="M0 2C-8-2-7-12 0-13C7-12 8-2 0 2Z"/></svg>' +
                '</span></span>'
            );
        }
        for (let i = 0; i < specks; i++) {
            const dur = 8 + Math.random() * 8;
            const vars = [
                `--x:${r2(Math.random() * 100)}%`,
                `--y:${r2(10 + Math.random() * 80)}%`,
                `--dur:${r2(dur)}s`,
                `--delay:${r2(-Math.random() * dur)}s`,
                `--size:${r2(1.5 + Math.random() * 2)}px`,
                `--o:${r2(0.25 + Math.random() * 0.3)}`
            ].join(';');
            html.push(`<span class="particle particle--speck" style="${vars}"></span>`);
        }
        container.innerHTML = html.join('');
    }

    LB.flowers = { mountGarden, mountParticles, peonySVG, budSVG };
})();
