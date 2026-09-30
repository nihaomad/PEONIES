/* ==========================================================================
   music.js — "♪ Our song"
   --------------------------------------------------------------------------
   • Never plays on page load. With CONFIG.music.playOnOpen, the song starts
     (softly fading in) when she taps the envelope — that tap is the user
     gesture browsers require before audio may play.
   • A small button lets her pause / resume; if she pauses, that choice is
     remembered in localStorage and respected on her next visit.
   • If the song file is missing, the button quietly hides itself.
   ========================================================================== */
(function () {
    'use strict';

    const LB = (window.LB = window.LB || {});
    const STORAGE_KEY = 'for-you.music';

    let audio = null;
    let button = null;
    let settings = {};
    let failed = false;
    let started = false;       // has the song been positioned at startAt yet?
    let fadeTimer = null;

    function remember(value) {
        try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* private mode — fine */ }
    }
    function remembered() {
        try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
    }

    function targetVolume() {
        return typeof settings.volume === 'number' ? settings.volume : 0.6;
    }

    function sync() {
        const playing = !!audio && !audio.paused;
        button.setAttribute('aria-pressed', String(playing));
        button.setAttribute('aria-label', playing ? 'Pause our song' : 'Play our song');
    }

    /* Raise the volume from 0 to the target over fadeInMs.
       (iPhones ignore volume changes, so there it simply plays.) */
    function fadeIn() {
        clearInterval(fadeTimer);
        const duration = settings.fadeInMs || 0;
        const target = targetVolume();
        if (!duration) { audio.volume = target; return; }

        const stepMs = 50;
        const step = target / (duration / stepMs);
        audio.volume = 0;
        fadeTimer = setInterval(() => {
            const next = Math.min(target, audio.volume + step);
            audio.volume = next;
            if (next >= target) clearInterval(fadeTimer);
        }, stepMs);
    }

    function play() {
        if (!started) {
            started = true;
            try { audio.currentTime = settings.startAt || 0; } catch (e) { /* not seekable yet — starts at 0 */ }
        }
        fadeIn();
        const p = audio.play();
        if (p && p.catch) p.catch(() => sync());
    }

    function init(config) {
        button = document.getElementById('music-toggle');
        if (!config || !config.enabled || !config.src) return;
        settings = config;

        button.querySelector('.music-toggle__label').textContent = config.label || 'Our song';

        audio = new Audio();
        audio.src = config.src;
        audio.loop = true;
        audio.preload = 'auto';          // ready to go the moment she opens the envelope
        audio.volume = targetVolume();

        audio.addEventListener('error', () => {
            failed = true;
            button.hidden = true;
            console.info(`[music] No song found at "${config.src}". Add your file there (see assets/music/README.txt) or set CONFIG.music.enabled = false.`);
        });
        audio.addEventListener('play', sync);
        audio.addEventListener('pause', sync);

        button.addEventListener('click', () => {
            if (audio.paused) {
                play();
                remember('on');
            } else {
                clearInterval(fadeTimer);
                audio.pause();
                remember('off');
            }
        });
    }

    /* Called from inside the envelope tap, so starting audio is allowed. */
    function reveal() {
        if (!audio || failed) return;
        button.hidden = false;
        sync();
        requestAnimationFrame(() => button.classList.add('is-visible'));

        const choice = remembered();
        if (choice === 'on' || (settings.playOnOpen && choice !== 'off')) play();
    }

    LB.music = { init, reveal };
})();
