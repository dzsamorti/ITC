# ITC – Nemzetközi kereskedelmi compliance tanácsadás

Statikus, **nem görgetős** weboldal. Minden menüpont (Főoldal, Az ITC-ről, Szolgáltatások,
Hírek, Kapcsolat) egy teljes képernyős nézet; a menü a nézetek között vált, az oldal nem gördül.
Kétnyelvű (magyar / angol), a nyelvválasztás a fejlécben található.

## Megnyitás

Nincs szükség build lépésre. Helyi megtekintéshez:

```bash
npx http-server -p 8080 .
# majd: http://localhost:8080
```

Bármilyen statikus tárhelyre (GitHub Pages, Netlify, saját szerver) feltölthető a mappa tartalma.

## Mit hol lehet szerkeszteni

| Mit | Hol |
| --- | --- |
| Szövegek (HU és EN) | `js/i18n.js` |
| E-mail, telefonszám, cím | `js/main.js`, a fájl elején a `CONTACT` objektum |
| Színek, betűtípusok, méretek | `css/style.css`, a `:root` változók |
| Háttérkép | `assets/img/hero-port.jpg` |

## Fontos teendők élesítés előtt

- **Elérhetőségek:** a `CONTACT` objektumban jelenleg helykitöltő adatok vannak.
- **Háttérkép:** a jelenlegi fotó a tervből van kivágva, ezért nagy kijelzőn kissé lágy.
  Érdemes azonos hangulatú, legalább 2400 px széles fotóra cserélni ugyanezen a néven.
- **Hírek:** a három cikk mintatartalom, a saját híreikre cserélhetők a `js/i18n.js`-ben.
- **Űrlap:** a küldés a látogató levelezőprogramját nyitja meg (mailto). Szerveroldali
  küldéshez (pl. Formspree, Netlify Forms) a `js/main.js` űrlapkezelőjét kell átírni.

## Közvetlen hivatkozások

Minden nézetnek saját címe van, így linkelhető és a böngésző „vissza” gombja is működik:
`#about`, `#services`, `#services/export`, `#services/sanctions`, `#services/fta`, `#news`, `#contact`.
