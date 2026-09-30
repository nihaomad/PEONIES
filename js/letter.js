/* ==========================================================================
   letter.js — fills the letter from CONFIG, reveals it, quiet ending, secret
   ========================================================================== */
(function () {
    'use strict';

    const LB = (window.LB = window.LB || {});
    const $ = (id) => document.getElementById(id);
    const fillName = (text, name) => String(text || '').replace(/\{name\}/g, name);

    function formatDate(value) {
        if (String(value).toLowerCase() === 'today') {
            return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        }
        return value || '';
    }

    function isoDate(text) {
        const d = new Date(text);
        if (isNaN(d)) return '';
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }

    function paragraph(text, className) {
        const p = document.createElement('p');
        if (className) p.className = className;
        p.textContent = text;
        return p;
    }

    function render(config) {
        const name = config.recipientName;

        document.title = fillName(config.pageTitle, name);
        $('page-title').textContent = `A letter for ${name}`;

        const date = formatDate(config.date);
        const time = $('letter-date');
        time.textContent = date;
        const iso = isoDate(date);
        if (iso) time.setAttribute('datetime', iso);

        $('letter-greeting').textContent = fillName(config.greeting, name);

        const body = $('letter-body');
        body.textContent = '';
        (config.letterParagraphs || []).forEach((text) => {
            body.appendChild(paragraph(fillName(text, name), 'letter__reveal'));
        });
        if (config.dropCap) $('letter').classList.add('letter--dropcap');

        $('letter-closing').textContent = fillName(config.closing, name);
        $('letter-signature').textContent = config.signature || config.senderName;

        if (config.postscript) {
            const ps = $('letter-postscript');
            ps.textContent = fillName(config.postscript, name);
            ps.hidden = false;
        }

        // Stagger the gentle fade-in, capped so nothing waits longer than ~1.5s.
        document.querySelectorAll('.letter .letter__reveal').forEach((el, i) => {
            el.style.setProperty('--d', Math.min(i * 110, 900));
        });

        renderEnding(config);
        setupSecret(config.secret);
    }

    function renderEnding(config) {
        const ending = config.ending || {};
        const lines = $('ending-lines');
        (ending.lines || []).forEach((text, i) => {
            const p = paragraph(fillName(text, config.recipientName), `ending__line ending__line--${i === 0 ? 'first' : 'rest'}`);
            p.style.setProperty('--i', i);
            lines.appendChild(p);
        });

        const count = (ending.lines || []).length;
        const sig = $('ending-signature');
        if (ending.showSignature) {
            sig.textContent = config.signature || config.senderName;
            sig.style.setProperty('--i', count);
        } else {
            sig.hidden = true;
        }

        const flower = $('ending-flower');
        flower.style.setProperty('--i', count + 1);
        flower.innerHTML = LB.flowers.peonySVG(3, { leaves: 0, viewBox: '-106 -106 212 212' });
    }

    function setupSecret(secret) {
        const toggle = $('secret-toggle');
        const note = $('secret-note');
        if (!secret || !secret.enabled) {
            toggle.hidden = true;
            return;
        }
        note.textContent = secret.message;
        toggle.addEventListener('click', () => {
            const open = toggle.getAttribute('aria-expanded') !== 'true';
            toggle.setAttribute('aria-expanded', String(open));
            if (open) {
                note.hidden = false;
                requestAnimationFrame(() => note.classList.add('is-visible'));
            } else {
                note.classList.remove('is-visible');
                note.hidden = true;
            }
        });
    }

    /* Un-hide the letter and start the reveal transition. */
    function show() {
        const view = $('letter-view');
        view.hidden = false;
        window.scrollTo(0, 0);
        void view.offsetHeight;                // commit start styles before transitioning
        document.body.classList.add('is-revealing');
    }

    function focus() {
        $('letter').focus({ preventScroll: true });
    }

    /* Calls back once when the quiet ending scrolls into view. */
    function watchEnding(onFinished) {
        const ending = $('ending');
        if (!('IntersectionObserver' in window)) {
            onFinished();
            return;
        }
        const io = new IntersectionObserver((entries) => {
            if (entries.some((e) => e.isIntersecting)) {
                io.disconnect();
                onFinished();
            }
        }, { threshold: 0.35 });
        io.observe(ending);
    }

    LB.letter = { render, show, focus, watchEnding };
})();
