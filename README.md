# For you — a digital love letter

A small, personal website: burgundy peonies open the scene, drift aside to reveal
a wax-sealed envelope, and the envelope opens into a handwritten-style letter.

Plain HTML, CSS and JavaScript. No build step and no libraries.

---

## ✎ Change the letter (the only file you really need)

Open **`js/config.js`**. It holds everything personal:

| What | Where in `CONFIG` |
|---|---|
| Her name / your name | `recipientName`, `senderName` |
| Date (or `"today"`) | `date` |
| "My Dearest …," | `greeting` (`{name}` becomes her name) |
| The letter itself | `letterParagraphs` (one string per paragraph, `\n` for a line break) |
| Sign-off | `closing`, `signature`, optional `postscript` |
| Envelope words | `envelope.above`, `envelope.below`, `envelope.sealMonogram` |
| Quiet ending lines | `ending.lines` |
| Hidden easter egg | `secret.message` (a tiny gold petal in the letter's bottom-right corner) |
| Music | `music.src` (see below) |
| Colours | `colors` (flowers, envelope, paper, background) |
| Intro length | `intro.holdMs` |

## ▶ Preview it

- **VS Code:** install the recommended **Live Server** extension, then right-click
  `index.html` → **Open with Live Server**. It reloads as you edit.
- Or just double-click `index.html`. It works straight from the file too.

To check the phone layout, open your browser's DevTools (F12) → device toolbar
(Ctrl+Shift+M) and pick an iPhone or Pixel.

## ♪ Add your song (optional)

Put an MP3 at `assets/music/our-song.mp3`, or change `CONFIG.music.src`.
It never autoplays. A small "♪ Our song" button appears after she opens the
envelope, and her play/pause choice is remembered. With no file, the button
hides itself. To turn it off completely, set `music.enabled: false`.

## Project structure

```
index.html            page structure (envelope markup, letter shell)
css/style.css         look & layout: colours, envelope, letter, flower positions
css/animations.css    all motion: intro, envelope opening, letter reveal, ending
js/config.js          ✎ YOUR WORDS, colours and settings
js/flowers.js         draws the peonies/buds as SVG + floating petals
js/envelope.js        envelope text, wax seal, opening sequence
js/letter.js          builds the letter, ending and easter egg from config
js/music.js           optional music button
js/main.js            state machine: INTRO → ENVELOPE → OPENING → LETTER → FINISHED
assets/flowers/       optional: your own flower images (see README.txt inside)
assets/music/         your song goes here
assets/images/        favicon
```

## Common tweaks

- **Flower placement:** `css/style.css`, section 4. Each flower (`.flower--a` … `--f`)
  has an intro position (`--ix/--iy`), a position once the envelope appears
  (`--ex/--ey`), and a size. The phone layout is the default; the desktop layout
  is under "Responsive layouts" at the bottom.
- **A different look for a flower:** change its `seed` in `GARDEN` at the top of
  `js/flowers.js`.
- **Your own flower pictures:** see `assets/flowers/README.txt`.
- **Animation speed:** `css/animations.css` (durations) and the step timings in
  `open()` in `js/envelope.js`.
- **Fonts** come from Google Fonts (Cormorant Garamond, Lora, Allura, Inter) and are
  linked in `index.html`. Without internet it falls back to Georgia and a script font.

## Sharing it with her

Upload the whole folder to any static host. Free options:

- **Netlify Drop** (app.netlify.com/drop): drag the folder in and you get a link.
- **GitHub Pages**: push the folder to a repository and enable Pages.

The page has `noindex` set so search engines won't list it.

## Accessibility

- The envelope is a real `<button>`, so Tab, Enter and Space work, with a visible focus ring.
- "Skip intro" is available during the opening flowers.
- If the device asks for reduced motion, animations become short, gentle fades.
- After opening, focus moves to the letter for screen readers.
