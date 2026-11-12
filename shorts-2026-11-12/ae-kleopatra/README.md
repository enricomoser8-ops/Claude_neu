# Short 12.11. Kleopatra (Vox-Stil, key `kleopatra`)

"Kleopatra lebte näher an der Mondlandung als am Bau der großen Pyramide" – 9:16, 1080x1920, 30 fps, 50,97 s.

## Bauen auf dem PC
Ordner auf dem PC: `C:\Users\Enrico\Claude\Podcast-Shorts\tage\2026-11-12\ae-kleopatra\`
(die Pfade sind in den jsx fest auf diesen Ordner gesetzt).

1. In AE 2023 das Zielprojekt öffnen (z. B. einishort.aep). Ist kein gespeichertes Projekt offen, legt der Build `Short-kleopatra-Vox.aep` im Ordner an.
2. Von `C:\Users\Enrico\Claude` aus:
   - `node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-12\ae-kleopatra\jsx\build_kleopatra.jsx 900000`
     Erwartete Antwort: `0 Fehler | 0 ABGESCHNITTEN | 0 KNAPP | alle Effekte da`
   - Stills zum Prüfen (ca. 1 pro Sekunde, halbe Auflösung): `node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-12\ae-kleopatra\jsx\snap_kleopatra.jsx 900000` → `out\png\kleo_*.png`
   - Rendern: `jsx\render_kleopatra.jsx` (H.264, "Match Render Settings - 40 Mbps") → `out\kleopatra_vox.mp4`
   - Optional zuerst `jsx\plugin_check.jsx`.
   Die `HAND_*.jsx` sind dieselben Skripte zum Starten von Hand (Datei > Skripte).

AE-Ordner: `Short 12.11. Kleopatra (kleopatra)` (mit Assets/Bausteine/Szenen (kleopatra)). Der Build löscht und ersetzt nur diesen Ordner; ae-weltkrieg bleibt unberührt.
Master-Comp: **`Short 12.11. Kleopatra (kleopatra) (9x16)`**, Szenen-Comps heißen `kleopatra 01 hook` usw.
Ton: `audio\kleopatra_mix.wav` (Stimme + Musik + SFX, -14 LUFS, -1,6 dBTP) wird in den Master importiert.

## Neu erzeugen (Cloud, Reihenfolge)
1. `gen/words_kleopatra.py`: ASR + Skript → `data/words.json`, `audio/kleopatra_voice.wav`
2. `gen/karte_kleopatra.py`: Mittelmeerkarte (Natural Earth) → `data/karte.json`
3. `gen/archiv_kleopatra.py`: Bilder aufbereiten, Freisteller, `archiv/credits.json`
4. `ton/music_kleopatra.py`, `ton/sfx_kleopatra.py`, `ton/mix_kleopatra.py` → `audio/kleopatra_mix.wav`
5. `gen/gen_kleopatra.py`: `data/timeline.json`, `jsx/build_*.jsx`, `snap/render`, `HAND_*`
6. Probelauf: `cd gen && node aemock.js ../jsx/build_kleopatra.jsx`

Bildnachweise: `archiv/credits.json`.

## Fixes Runde 2 (nach Review 1 in AE, 12.11.)
Probelauf jetzt mit Geometrie-Pruefung (`gen/aemock.js`): echte Keyframes/Ease, Eltern-Ketten, Ankerpunkte, Bildgroessen + Alpha-Rahmen,
Textbreite geschaetzt (Schriftgroesse x Zeichen), Master-Gate-Weave 102 %. Meldet RAND (ausserhalb x 60..1020), LEER (>= 0,3 s nichts Lesbares),
LOGO, UT (Bild in der Untertitelzone), KOLLISION (Text auf Bild), UNSCHAERFE (> 0,3 s), HOCHSKALIERT (> 125 %), ungueltige Referenzen wie in AE.
`node aemock.js ../jsx/build_kleopatra.jsx` -> `0 Fehler | 0 ABGESCHNITTEN | 0 KNAPP` und `0 RAND | 0 LEER | 0 LOGO | 0 UT | 0 KOLLISION | 0 UNSCHAERFE | 0 HOCHSKALIERT`.
Hilfe: `--dump <szene> <sekunde>` listet alle Ebenen-Rahmen, `--skal` die Skalierung aller Fotos.
- Zeitstrahl: Jahreszahlen blenden sich vor dem Bildrand selbst aus (Opacity-Ausdruck EDGEFADE) -> kein "20"/"500 n. C"/"...Chr." mehr. Linie dicker,
  ohne Roughen Edges (fransen beim Herauszoomen), Striche zeichnen sich einzeln nacheinander (Trim "Einzeln") statt alle halb.
- 2 rechnen (4,4-5,5 s leer): Linie zeichnet sich von heute rueckwaerts direkt vor der Kamera, oben Jahresanzeige mit rotem Lesezeiger (2026 -> 2600 v. Chr.).
- 3 pyramide: Quellenbalken CHEOPS-PYRAMIDE tiefer (y 350, frei unter dem Logo). Auch "Laut Plutarch".
- 4 kleo: Zaehler/"Jahre" hoeher, "Jahre" erst nach dem Pyramiden-Abzug, Bueste auf dem Zeitstrahl kleiner/tiefer (keine Kollision mehr).
- 5 uralt: Bodenlinie kuerzer, Push etwas kleiner (bleibt in x 60..1020).
- 7 mond (18,4 s leer): Fahrt ab Kleopatra mit Jahresanzeige (69 v. Chr. -> ~1969), nur bis 0,55 herauszoomen; Hintergrund-Mond etwas links.
- 8 zweitausend: Ausschnitt so, dass Bueste und Mondfoto ganz im Bild sind; Linie laeuft rechts aus dem Bild statt am Rand zu enden.
- 9 balken (23,4 s leer, "heute"/Abzug links am Rand, rote Kreisreste): alles ab Frame 0 sichtbar, Diagramm mittig und kleiner, Kreis flacher ohne Roughen Edges, "heute" unter der Balkenspitze.
- 10 seltsam (weisse Diagonale): CC Page Turn ersetzt durch Wegziehen der Balken-Seite (nur Keyframes, nichts bleibt stehen).
- Karte: blendet unten weich aus, Aegypten-Orange ebenso -> Untertitelzone frei.
- 12 alexander: Mosaik kleiner, Push auf das Gesicht bleibt im Bild, Bueste endet ueber den Untertiteln, "General Ptolemaios" liegt ueber dem Kontrast-Callout (vorher grau auf grau).
- 13 hof: Inschrift-Ausschnitt groesser und heller (wirkte unscharf), Lupe 1,35-fach mit gefalteten Transformationen, Lupengriff bleibt im Bild.
- 14 aegyptisch: Kopfreihe mittig/enger, Hieroglyphen nicht mehr 3,5 s unscharf (nur kurzer Fokus-Ruck), Hieroglyphen-Bild jetzt 2880 x 1920 (war ~180 % hochskaliert).
- 15 gewusst: weicher dunkler Streifen hinter den Untertiteln auf dem hellen Kopf, "?" fest im Bild, Bueste etwas kleiner.
- Focus Hunting nur noch 9 Frames (~0,3 s), Ebene endet danach. `homogenize`: Box Blur (lag ohne Maske auf jedem Abzug-Foto) entfernt.
Ton, Untertitel-Look und Szenen-Zeiten unveraendert.

## Fixes Runde 3 (nach Review 2 in AE, 12.11.)
Probelauf (`gen/aemock.js`) prueft jetzt zusaetzlich wie AE: Trim/Opacity nur 0..100 und Ease-Einfluss 0,1..100 (sonst Fehler wie
"Value 101,72 out of range"), Keys naeher als 1/2 Frame; KLEIN (groesstes Bild/Grafik-Element < 60.000 px2 und < 15 % Deckung >= 0,5 s),
UTNAH (Bildtext klebt an den Untertiteln), BLASS (Randblenden-Label steht ruhig, aber halb ausgeblendet), SCHWENK (Reissschwenk > 0,7 s;
kuerzere zaehlen nicht als leer). Ergebnis: `0 Fehler | 0 ABGESCHNITTEN | 0 KNAPP`, alle Geometrie-Zaehler 0 (auch fuer HAND_build).
- 2 rechnen (Fehler 101,72 -> Bild leer): Trim-Werte im Zeitstrahl auf 0..100 begrenzt, `ease()` begrenzt Einfluesse auf 0,1..100.
  Jahresanzeige sitzt jetzt in einer dunklen Tafel (700 x 190, frei vom Logo), Zeiger darunter.
- 7 mond (18-19,5 s fast leer, Kopf links angeschnitten): keine Jahresanzeige mehr. Kamera steht nah auf Kleopatra (Bueste ~620 px),
  dann 0,65-s-Reissschwenk zum Mond; der Textmarker Kleopatra-Mond zeichnet sich genau unter der Bildmitte mit, Mond gleitet waehrend
  des Schwenks ein. Endzustand (Mond, Apollo, 1969) wie vorher.
- 8 zweitausend (sehr klein): Ausschnitt nur Kleopatra -> Mond, Bueste (520 px) und Apollo-Abzug (400 px) gross und nach innen,
  "69 v. Chr." links- und "1969" rechtsbuendig an den Nadeln (nicht mehr am Rand).
- 9 balken (winzig, untere Haelfte leer, "~" allein): Balken doppelt so dick, Diagramm 0,182 -> 0,31 (Balken A ~75 % der Breite).
  Bueste (400 px), Pyramiden-Abzug (300 px), "~2.500 Jahre" (92 px), Kreis und "heute" (88 px) liegen im Bild in fester Groesse und
  wandern beim Umklappen mit; "~2.500 Jahre" poppt als Ganzes (kein Tippen mehr).
- 12 alexander (33,4 Mosaik unscharf): weicher, kurzer Fokus-Ruck (Radius 4) statt hart.
- 13 hof ("lang" klebte unter "200 Jahre"): Reihe "ueber 200 Jahre" 74 px hoeher.
- 14 aegyptisch (helles Relief, wenig Kontrast): Relief dunkler (-72 -> -38 statt -48 -> 0), weiches dunkles Band hinter Koepfen und
  Name, weiche Abdunklung unten fuer die Untertitel.
- 15 gewusst (dunkler Streifen ueber dem Mund, Bueste links angeschnitten, Raster scheint durch): Streifen ersetzt durch sehr weiche,
  bildbreite Abdunklung von unten (34 %), Bueste mittig und ganz im Bild, deckende graue Unterlage unter der Bueste, weniger Korn,
  weniger Kamerafahrt.
GOOD-Teile unveraendert. Ton, Untertitel-Look und Szenen-Zeiten unveraendert. Nicht ohne AE pruefbar: wie dunkel B&C -72/-38 auf dem
Relief wirklich wirkt, und ob das "Raster" in 15 von der Bueste kam (Alpha ist deckend; vermutlich Korn auf dem hellen Marmor).
