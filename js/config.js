/* ==========================================================================
   ✎  EDIT YOUR LETTER HERE
   --------------------------------------------------------------------------
   Everything personal lives in this one file. You should never need to
   touch the other files just to change the words, names, colours or music.

   Tips
   • {name} anywhere below is replaced with recipientName.
   • Inside a paragraph you can use \n for a line break.
   • Keep the quotes and commas — each paragraph is "text in quotes",
   ========================================================================== */

const CONFIG = {

    /* ---- Who it's for / from ------------------------------------------ */
    recipientName: "Kazel",
    senderName: "Ahmad",

    /* Browser-tab title. */
    pageTitle: "For {name}",

    /* Write any date you like, or use "today" to always show the current date. */
    date: "September 30, 2026",

    /* ---- The letter ----------------------------------------------------- */
    greeting: "Hi, baby,",

    letterParagraphs: [
        "Alam mo, baby. Kanina habang nakatunganga, napaisip ako kung gaano ka-bilis ng panahon. Ang pinagkaiba lang ngayon, kasama na kita sa mga araw na lumilipas patungo sa pagtatapos ng taon. Hanggang ngayon, hindi pa rin ako makapaniwalang weeks na pala tayong magkausap, noh? Yung dating hiya ko, napalitan na ng excitement na makita ka ulit at makasama.",

        "Our dates and quick escapes from this noisy world are my sanctuary and one of my weekly highlights. At this point I couldn't ask for anything more. I really think all those years of trying to make myself better each day, healing, and building myself are finally bearing fruit, because when you finally came into my life, I'm able to show you what a real man is. I may not have the financial stability for now, but I'll slowly work from here to get there.",

        "I am as ambitious as you are, and that's one of the reasons why I'm really into you. You know what you want and you're taking the initiative to get it. I may say this way too often, but I am really proud of you for always showing up and trying each day. Salamat ng marami sa pagbuo ng September ko, baby. From the nahihiya-pa-sa-chat phase hanggang sa puntong 'to na kaya na nating i-express ng buo yung nararamdaman natin sa isa't isa."
    ],

    closing: "Mahal na mahal kita,",
    signature: "Ahmad",

    /* Optional P.S. printed under the signature. Leave "" to hide it. */
    postscript: "",

    /* A decorative large first letter on the first paragraph. */
    dropCap: true,

    /* ---- Envelope screen ------------------------------------------------ */
    envelope: {
        above: "Something I wrote for you.",
        below: "Open when you're ready.",
        hintTouch: "Tap the envelope to open",
        hintPointer: "Click the envelope to open",
        paperLabel: "For {name}",      // peeks out of the envelope as it opens
        sealMonogram: ""               // letter on the wax seal ("" = first letter of recipientName)
    },

    /* ---- Quiet ending under the letter ---------------------------------- */
    ending: {
        lines: [
            "Thank you for taking the time para basahin 'to, baby.",
            "I made this with you in mind. Sana magustuhan mo."
        ],
        showSignature: true
    },

    /* ---- Hidden easter egg (a tiny gold petal in the letter's corner) ---- */
    secret: {
        enabled: true,
        message: "P.S. I made this just for you."
    },

    /* ---- Music ------------------------------------------------------------
       "Panaginip" by nicole. Starts softly the moment she opens the envelope
       (never on page load). A small "♪ Our song" button lets her pause it,
       and if she pauses, it stays paused next time she visits.
       If the file is missing, the button hides itself.                      */
    music: {
        enabled: true,
        src: "assets/music/our-song.mp3",
        label: "Our song",
        volume: 0.55,
        playOnOpen: true,      // start playing when the envelope is opened
        startAt: 0,            // seconds into the song to begin (0 = from the intro)
        fadeInMs: 2500         // gentle fade-in so it doesn't start abruptly
    },

    /* ---- Intro timing ----------------------------------------------------- */
    intro: {
        holdMs: 2800,              // how long the flowers stay centred before the envelope appears
        skipLabel: "Skip intro"
    },

    /* ---- Colours ------------------------------------------------------------
       Any CSS colour works (#hex, rgb(), etc.).                              */
    colors: {
        background:     "#FCF5F7",   // very pale pink page
        blush:          "#F4DCE4",
        cream:          "#FFF9F1",
        paper:          "#F8F0E3",   // the letter
        ink:            "#35151F",   // letter text
        burgundy:       "#64152D",
        burgundyDark:   "#3E0D1C",
        wine:           "#7A1F3D",
        gold:           "#B9935A",

        peonyDeep:      "#3E0D1C",   // flower centres / petal bases
        peonyMid:       "#64152D",
        peonyLight:     "#8E2A4B",
        peonyEdge:      "#B45A77",   // petal rims & highlights
        leaf:           "#5C6844",
        leafDark:       "#3C4630",
        leafLight:      "#848D67",

        envelope:       "#64152D",   // envelope body
        envelopeFlap:   "#50112A",   // top flap
        envelopeInside: "#3E0D1C",
        envelopeLining: "#F4DCE4",   // inside of the flap
        seal:           "#B9935A"    // wax seal
    },

    /* ---- Flowers --------------------------------------------------------------
       The peonies are drawn in code (js/flowers.js) so they stay crisp and light.
       If you'd rather use your own transparent PNG/WebP/SVG artwork, put it in
       assets/flowers/ and set the paths here, e.g. "assets/flowers/peony.webp". */
    flowers: {
        peonyImage: "",
        budImage: ""
    }
};
