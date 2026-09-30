FLOWER ARTWORK
==============

By default the burgundy peonies are drawn in code (js/flowers.js), so this
folder can stay empty. They're crisp at any size and weigh almost nothing.

Want to use your own flower images instead?
1. Put a transparent PNG / WebP / SVG here, e.g. peony.webp and bud.webp
   (square images with the flower centred look best).
2. In js/config.js set:
       flowers: {
           peonyImage: "assets/flowers/peony.webp",
           budImage:   "assets/flowers/bud.webp"
       }

Flower positions on screen are in css/style.css (.flower--a … .flower--f).
Flower colours are in js/config.js (CONFIG.colors.peony*).
