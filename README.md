# NEON BREACH – pokračovanie podľa konceptov / 14. 10. 2026

Táto verzia upravuje Mars, lander, sklad ARES-3 a vrak. Podrobnosti a dej nájdeš v `PRIBEH-MARS.txt`. Nový modul `js/17d-mars-art.js` pridáva výtvarné detaily bez ďalších povinných úloh a bez zmeny priechodnosti trasy.

Uloženia a rekordy majú vlastné kľúče `neon-breach-next-*`. Kompatibilné staršie uloženia sa pri prvom spustení prekopírujú do nových slotov; pôvodné dáta zostávajú zachované. Texty načítaných záznamov sa pri zobrazení aktualizujú.

Overené v Chrome: marsovská misia, sloty, spätné načítanie, zachovanie starých uložených dát, dotykové rozloženie. Obraz kryokomory, pôvodného EVA výstupu a kokpitu bol pri rovnakých podmienkach totožný s dodaným ZIP-om. Základné ovládanie a rozlíšenie zostávajú z dodanej verzie.

Nasledujúce technické poznámky opisujú základ dodaného projektu.

# NEON BREACH · nová verzia (základ pre ďalší obsah)

Hra je stále čisté HTML + JavaScript + WebGL bez knižníc. Oproti jednému veľkému `index.html` je rozdelená
na súbory, takže sa v nej dá pracovať a pridávať obsah.

## Spustenie
- Otvor `index.html` v prehliadači (funguje aj z disku, nepotrebuje server), alebo ho nahraj na GitHub Pages.
- `python3 build.py` zloží všetko do jedného súboru `dist/neon-breach.html` (rovnaké správanie, vhodné na posielanie).

## Štruktúra
- `index.html` – HTML kostra a poradie skriptov.
- `css/style.css` – pôvodné štýly, `css/responsive.css` – zbraň a HUD pre nízke okná, `css/features.css` – sloty a štatistiky,
  `css/mobile.css` – rozloženie HUD pre telefón na šírku (len dotykový režim, desktop a zvislý režim sa nemenia).
- `js/` – moduly v poradí načítania (číslo na začiatku názvu). Sú to bežné skripty so zdieľaným globálnym rozsahom,
  preto stačí zachovať poradie. Poradie je v `index.html`.
  - `01-renderer.js` WebGL renderer (objekt `G`), `02`–`07` miestnosti a systémy lode, `08`–`12` stav hry, level,
    boj a update, `13-render.js` vykresľovanie a zbraň, `14-input.js` vstup, `15`–`17` pomocné veci a štart,
    `17`–`19` zastávka na Marse (`17` terén a sklad, `17b` stanica, most, vrak a ostatné miesta, `17c` lander KESTREL, `18` scény a kinematiky, `19` hrateľnosť), `20-boot.js` štart, `21`–`22` mobil,
    `23-saves-stats.js` sloty a štatistiky.

## Čo je nové oproti predošlému súboru
- Súbor je rozdelený na moduly, výstup hry ostáva pixel po pixeli rovnaký.
- Zbraň drží pomer strán 16:9 v každom okne (predtým sa naťahovala). V okne 16:9 je rovnaká ako predtým.
- HUD: v oknách nižších ako 760 px sa správy dole v strede neprekrývajú. Vyššie okná sú bez zmeny.
- 3 sloty uloženia. Slot 1 používa samostatný kľúč pokračovania, a kompatibilné pôvodné uloženie sa prekopíruje bez prepísania pôvodných dát.
- Štatistiky na konci hry: čas, presnosť, zásahy, smrti, poškodenie, záznamy, opravené systémy, najlepší čas.
- Hviezdy, rozlíšenie, vzhľad a blikanie hviezd sú nezmenené.

## Nový obsah: medzizastávka MARS
Po oprave lode Mira a Jaro naplánujú krátky skok na servisnú zastávku pri Marse. Stabilizátor pri ukončení skoku definitívne zlyhá. Loď zostane na orbite a Alex musí získať náhradný diel zo skladu ARES-3.
- Malý pristávací modul (vlastný kokpit) je pripojený k servisnej lávke. Nastúpiš cez prechod na lávke, v kokpite si sadneš
  k pilotnej konzole a spustí sa zostup (27 s): odpojenie, deorbitácia, vstup do atmosféry, klesanie, dotyk.
- Povrch (kráter, prach, červená obloha): vo vákuu sa míňa kyslík, skafander je povinný. Zváračka sa používa **držaním E**.
  1. zvar poškodenej rozvodnej skrinky (5 s) otvorí dvere skladu,
  2. vo vnútri 5 spiacich robotov (2 strelci, 2 bežci, 1 strážca), pokiaľ sú blízko, zváranie nejde,
  3. odrež svorku (4 s) a vezmi diel,
  4. späť do modulu, štart (21 s) a dokovanie k lodi.
- Na lávke odrež starý stabilizátor (4 s), zasaď nový a privar ho (6 s). Potom do komory, vyzliecť skafander,
  prepočítať kurz a druhý skok k Lyre, ktorý končí hru.
- V menu je tlačidlo **MARS · ZAČAŤ SKOKOM OD KOKPITU**: loď je opravená a stojíš pri navigačnom paneli, E spustí prvý skok k Marsu. Uloží sa do vybraného slotu (vyber prázdny, aby si neprepísal hru).
- Kokpit modulu má široký priechod k poklopu a hra hráča automaticky vytiahne z nábytku, ak by sa niekde zasekol.
- Stav je uložený v checkpointe (`mission.mars`), sloty ukazujú MARS · POVRCH / ZASTÁVKA / OPRAVENÉ.
- Mars má dlhú trasu (mapa 72×132): pristátie na planine, údolie, úzky priesmyk s lávkou nad trhlinou, plošina pred stanicou ARES-3, vrak servisnej zátoky. Lander stojí na podvozku a k poklopu vedú schody (kamera sa vo vnútri zdvihne o `MZ.lift`).
- Nové moduly: `17-mars-world.js` (terén, sklad, interiér modulu), `17b-mars-sites.js` (stanica, vrak, most, osvetlenie), `17c-mars-lander.js` (trup, podvozok, sklo), `18-mars-scenes.js` (osvetlenie, kinematiky, prekryvy),
  `19-mars-play.js` (úlohy, držanie E, roboty, ukladanie). Renderer dostal uniformy prostredia (`G.env`); loď ich má
  nastavené na pôvodné hodnoty, takže pôvodné scény ostávajú pixel po pixeli rovnaké.

## Mobil (dotykový režim na šírku)
- Zdravie je vedľa ovládacieho kruhu, úloha (guide) končí nad ním a posúva sa, keď je text dlhý.
- Správa AEGIS (comm) je pod zameriavačom, výzva na interakciu a kyslík dole, lišta bossa hore v strede (už nie na zameriavači).
- Na najmenších displejoch (do 340 px na výšku) sa skrýva názov zbrane a nápoveda pohľadu a oznámenia idú pod zameriavač.
- `python3 tests/check_mobile_layout.py` skontroluje 9 veľkostí telefónov (568×320 až 932×430) s HUD naplneným dlhými textami, `--shots` uloží obrázky do `tests/out_mobile/`.

## Prepínače v URL
- `?hash=old` – pôvodná hash funkcia pre hviezdy a podlahu (rozbité hviezdy na niektorých GPU).
- `?scale=sharp` – voliteľné ostré bilineárne škálovanie.
- `?debug=1` – ukáže GPU, rozlíšenie a režimy v rohu obrazovky.

## Testy (potrebujú `pip install playwright pillow numpy` a `playwright install chromium`)
- `python3 tests/run_visual.py` – vykreslí 8 pevných scén (menu, kryo, široké a nízke okno, EVA, warp, mobil) a porovná
  ich s `tests/baseline/`. Po zámernej zmene vzhľadu spusti `--update`.
- `python3 tests/check_hud_layout.py` – hľadá prekrývanie prvkov HUD pri rôznych výškach okna.
- `python3 tests/check_mobile_layout.py` – to isté pre telefóny na šírku.
- `python3 tests/test_saves.py` – sloty, štatistiky a načítanie starého uloženia.
- `python3 tests/test_mars.py` – prejde celú zastávku na Marse cez herné funkcie (zostup, zváranie, roboty, vzlet, montáž, uloženie, druhý skok).
- `python3 tests/mars_shots.py` – nafotí scény Marsu do `tests/out_mars/` (na kontrolu vzhľadu), `tests/montage.py` ich zloží do jedného obrázka.
- Testy bežia so softvérovým WebGL, takže nezávisia od tvojej grafickej karty.
- `NB_INDEX=cesta/k/inemu/index.html` spustí testy nad inou verziou, `NB_QUERY='?hash=old'` pridá parametre do URL.
