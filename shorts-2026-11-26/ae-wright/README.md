# Short 26.11.2026: "Der erste Flug dauerte zwoelf Sekunden" (Schluessel `wright`)

**Podcast:** „Allgemeinwissen klar und deutlich“ · **Format:** 9:16 · 1080x1920 · 25 fps · **Skript:** `../skripte.md` (ElevenLabs-Block)

Das Paket ist eine Kopie von `../../2026-11-25/ae-apollo` (Apollo 13, Stand Runde 2 vom PC). apollo wurde zu wright, alle Szenen, Bilder und die Musik sind neu.

**Stil wie Apollo Runde 2 (enno 25.11.)**
- Hintergrund je Szene: Precomp `BG <szene>` mit 2-3 Graustufen-Themenbildern (`archiv/g-*.png`) + Tint + Grunge, SCHWARZ und WEISS im Wechsel je 2 Szenen (hook+jumbo schwarz, ort+brueder weiss, gebaut+muenze schwarz, absturz+folge weiss, foto+dreimal schwarz, letzter+wind weiss, mond+mars schwarz, outro schwarz).
- Davor echte Fotos MITTIG (x 540), unten ~300 px und rechts ~120 px frei.
- Bildquelle senkrecht, grau, Monospace am linken Rand.
- Untertitel von uns im Master (Stil Beethoven 17.11., aus `data/words.json`), rundes Logo oben links, Posterize 12, Grain, CA.
- Die vier PC-Diffs aus `../../2026-11-25/ae-apollo/runde2-pc/` (gen, bitcoin_lib, main, apollo_lib) sind uebernommen, die Szenen folgen `scenes_lehren.md`.

**Stand 25.11.:** Stimme fehlt noch. Alle Zeiten sind PLATZHALTER (2,6 Woerter/s, 134 Woerter, Master 60,84 s, `gen/words_wright.py`). Mock sauber (0 Fehler / 0 ABGESCHNITTEN / 0 KNAPP / 0 SAFE / 0 PFEIL, VIELFALT ok). Musik und SFX sind auf die Platzhalter-Laenge gerechnet; die Mischung wartet auf die Stimme.

## Wenn das Audio da ist (oder eine neue Aufnahme kommt)

Die Stimme als `../audio-wright/voice.mp3` ablegen (Ordner `tage/2026-11-26/audio-wright/`) (oder bei jedem Schritt den Pfad mitgeben). Dann in dieser Reihenfolge:

1. **ASR**
   - `python3 gen/asr_wright.py [stimme.mp3]`
   - faster-whisper small, Deutsch, Wortzeiten. Die Datei wird per ffmpeg zu 16 kHz mono dekodiert und als Array uebergeben (mit Dateipfad scheitert faster-whisper hier an der av-Version).
   - Ergebnis: `data/words_whisper.json`
2. **words.json**
   - `python3 gen/words_wright.py --asr [stimme.mp3]`
   - Woerter und Zeiten kommen direkt aus der ASR (gesprochener Text zaehlt, -> `data/text_gesprochen.txt`); Abweichungen zum Skript -> `data/text_abweichungen.json`. Passt ein Anker nicht mehr, meldet `gen_wright.py` „Wort nicht gefunden“: dann die Szene anpassen, nicht den Text erzwingen.
   - Ergebnis: `audio/wright_voice.wav` (Stille vorn und hinten weg), `data/words.json`, `data/laenge.json`
3. **gen neu**
   - `python3 gen/gen_wright.py && python3 gen/gen_wright.py --cloud`
   - Ergebnis: jsx-Dateien und `data/timeline.json` mit den echten Zeiten
   - Pruefung: `node gen/aemock.js` muss 0 Fehler / 0 ABGESCHNITTEN / 0 KNAPP melden.
4. **Ton-Kette + Mischung**
   - `node ton/events_wright.js && python3 -I ton/sfx_wright.py && python3 ton/music_wright.py && python3 ton/mix_wright.py`
   - Ergebnis: `audio/wright_mix.wav`

Hinweis ASR: whisper schreibt Jahreszahlen mal als Ziffern, mal ausgeschrieben. Die Anker in `gen/gen_wright.py` suchen beides (1903/neunzehnhundertdrei, 1969, 2021). Meldet gen trotzdem „Wort nicht gefunden“, den Anker anpassen, nicht den Text.

## Bauen in After Effects (AE 2023)

Zielprojekt ist das am PC offene **`C:\Users\Enrico\Videos\Kurzvideos.aep`** (nicht ein eigenes Projekt). Der Build baut wie die Vorlage in das gerade offene Projekt und ersetzt nur seinen eigenen Top-Ordner `Short 26.11. Erster Flug (wright)`; andere Shorts bleiben unberuehrt. Ohne gespeichertes offenes Projekt bricht er ab.

0. Backup: `Kurzvideos.aep` nach `Podcast-Shorts\Backups\Kurzvideos_BACKUP_vor_wright_2611.aep` kopieren.
1. `jsx/HAND_plugin_check.jsx`: prueft die Effekte (Posterize Time, Gate Weave, Tint usw.).
2. `jsx/HAND_build_wright.jsx` (oder `node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-26\ae-wright\jsx\build_wright.jsx 900000` per RC):
   - Top-Ordner und Master `Short 26.11. Erster Flug (wright)`, Precomps `BG <szene>` unter `Bausteine (wright)`
   - PC-Pfad `C:/Users/Enrico/Claude/Podcast-Shorts/tage/2026-11-26/ae-wright/`
   - Ergebnis muss 0 Fehler / 0 ABGESCHNITTEN / 0 KNAPP melden
3. `jsx/HAND_snap_wright.jsx`: Standbilder zur Kontrolle.
4. `jsx/HAND_render_wright.jsx`: Gesamt-Render (oder `HAND_render_wright_teile.jsx`).

Der Master hat Posterize Time 12, Grain, CA und das runde Logo oben links bis zum Outro. Die Audio-Ebene ist `audio/wright_mix.wav`.

## Szenen (15)

hook, jumbo, ort, brueder, gebaut, muenze, absturz, folge, foto, dreimal, letzter, wind, mond, mars, outro. Tabelle mit Geraeten, Bildpunkten und Zeiten: `vox-plan.md`.

## Bilder

**Nur echte Fotos, keine KI-Bilder.** Rohdateien in `archiv/roh/`, aufbereitet mit `python3 gen/bilder_wright.py` -> `archiv/` + `data/bilder.json` (Bildpunkte). Nachweise je Datei in `archiv/credits.json`.
- Library of Congress, Wright Brothers Negatives (gemeinfrei, Originale als u.tif von tile.loc.gov):
  - Erstflug 17.12.1903 (00652085): p-erstflug, p-flug, g-erstflug
  - Lager Kill Devil Hills (2001696489): p-lager (Glasplatten-Fleck im Himmel retuschiert: `archiv/roh/loc-lager-retusche.jpg`), g-lager
  - Werkstatt (2001696557), Startschiene (2001696493), Wilbur im Sand 14.12. (2001696253), Flyer von vorn (2001696496), dritter Flug (2001696558), vierter Flug weit (2001696559), Schaden nach dem Windstoss (2001696495), Bau (2001696586)
  - Portraits Wilbur (2001696612) und Orville (2001696611): p-/g-/f-wilbur, -orville
- NASA (gemeinfrei, images.nasa.gov):
  - AS11-40-5903 (Aldrin auf dem Mond): p-mond, g-aldrin
  - PIA25881 (Ingenuity auf dem Mars, NASA/JPL-Caltech/ASU/MSSS): p-mars
  - PIA24438 (Wright-Musselin 1,3 x 1,3 cm am Ingenuity-Kabel, NASA/JPL-Caltech): p-stoff
  - PIA24498 (Ingenuity, NASA/JPL-Caltech/ASU/MSSS): g-heli
  - AS13-60-8703 / AS13-60-8588 (Mond / Erde): g-mond, g-erde
- Eigene Vektorgrafik: f-jumbo (Boeing 747-400 Draufsicht, 64,4 m Spannweite, 12 px/m), keine Quelle noetig.
- Im Video steht der Nachweis senkrecht grau am linken Rand.

## Ton (`ton/`)

Reihenfolge nach `gen` (oder nach neuer Stimme):

```
node ton/events_wright.js          # SFX-Ereignisliste aus dem Mock -> ton/events_alle.json
python3 -I ton/sfx_wright.py       # -> ton/sfx.wav, sfx_events.json, credits_sfx.json
python3 ton/music_wright.py        # -> ton/music_wright.wav (Laenge aus data/timeline.json; kuerzen: --laenge 45)
python3 ton/mix_wright.py          # NUR mit echter Stimme -> audio/wright_mix.wav (-14 LUFS, TP -1,3, Musik 14,5 LU unter der Stimme)
```

**SFX nach Chris Moran**
- Nur das wichtigste Ereignis je Szene bekommt einen Ton:
  - Filzstift bei Hervorhebungen
  - Bleistift bei Kreisen, Bahn, Haken und Kreuz
  - Ticks bei Zaehlern und Stapel
  - Schlag bei Slam, Muenze beim Muenzwurf, Ausloeser beim Fotoblitz, Whoosh beim Windstoss, Papier bei Pfeilen, Tap beim Logo, Klick beim Folgen-Knopf
- Tiefer Whoosh als J-Cut 3 Frames vor jedem Schnitt.
- Jeder Ton endet in seiner Szene.
- Die Zeiten liegen auf sichtbaren Frames (Posterize 12).
- Quellen:
  - nur `ton/sfx_real/` (alle CC0, Liste `ton/sfx_real_liste.json`; Stand 25.11.: 31 Anschlaege, u. a. coin_1, shutter_1, marker, pencil, paper, tap, whoosh)
  - und ennos eigene Klicks (`ton/sfx_enno/`)
  - keine CC-BY-Dateien

**Musik (Fassung 4):** eigene Komposition `ton/music_wright.py`, ruhig, warm, leicht neugierig, anders als Apollo.
- F-Dur, 96 bpm, nur reine Dur-Dreiklaenge (F C Bb F | F Bb C F)
- Vibraphon-Achtel-Arpeggio, Zupf-Puls, Melodie Zupf + Vibraphon (aufsteigendes Fragen-Motiv), ganz leiser Besen auf 2 und 4, hohes leises Pad
- Zonen: brueder..absturz zurueckgenommen, folge..letzter Motiv hoeher, wind nur Pad + Zupf, mond..outro Glockenspiel-Funkeln, Schluss-Akkord auf „folgen“
- EQ-Senke 1,9 kHz, kuerzbar mit `--laenge`
- earshot (Platzhalter-Laenge 60,84 s): Stimmung nur „uplifting and hopeful“ (z 2,2), „sad“ z 1,9 (kein Treffer); erkannt als music box / success chime / cheerful ukulele. Fassungen 1-3 (Spieluhr, Viertel-Arpeggio, tiefes Pad) lasen sich „sad“ z 2,3-2,7 und wurden verworfen.

**Mischung:** noch keine (Stimme fehlt). `mix_wright.py` bricht ohne `audio/wright_voice.wav` ab (keine Testmischung mit stummer Stimme). Ziel: -14 LUFS, True Peak -1,3 dBTP, Musik 14,5 LU unter der Stimme, SFX-Hauptereignisse im Median 8 dB unter den Stimmspitzen.

## Pruefen

- `node gen/aemock.js`: Fehler, ABGESCHNITTEN, KNAPP, TEXT, RAND, SAFE und PFEIL muessen 0 sein, VIELFALT ok.
- Vorschau:
  1. `node gen/aemock.js --render out/anz.json 1.62,6.36,...`
  2. `python3 gen/vorschau_render.py out/anz.json out/v 0.5`
- Kontaktbogen: `out/vorschau_v1.jpg` (10 Bilder, Platzhalterzeiten 2,0 / 6,5 / 10,5 / 19,5 / 24,5 / 33,0 / 39,5 / 48,0 / 52,8 / 58,0 s)
