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
