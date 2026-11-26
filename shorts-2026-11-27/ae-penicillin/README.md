# Short 27.11.2026: "Ein Forscher raeumt sein Labor nicht auf" (Schluessel `penicillin`)

**Podcast:** „Allgemeinwissen klar und deutlich“ · **Format:** 9:16 · 1080x1920 · 25 fps · **Skript:** `../skripte.md` (ElevenLabs-Block)

Das Paket ist eine Kopie von `../../2026-11-26/ae-wright` (Erster Flug). wright wurde zu penicillin, alle Szenen, Bilder und die Musik sind neu.

**Stil wie Apollo Runde 2 / wright (enno 25.11.)**
- Hintergrund je Szene: Precomp `BG <szene>` mit 2-3 Graustufen-Themenbildern (`archiv/g-*.png`) + Tint + Grunge, SCHWARZ und WEISS im Wechsel je 2 Szenen (hook+london schwarz, labor+schale weiss, neugierig+folge schwarz, kaum+oxford weiss, krieg+nobel schwarz, frage weiss, outro schwarz).
- Davor echte Fotos MITTIG (x 540), unten ~300 px und rechts ~120 px frei.
- Bildquelle senkrecht, grau, Monospace am linken Rand.
- Untertitel von uns im Master (aus `data/words.json`), rundes Logo oben links, Posterize 12, Grain, CA.

**Lehren aus wright (26.11.), hier schon eingebaut**
- `gen_penicillin.py`: `findC` faellt auf Gross/Klein-freien Vergleich zurueck (ASR schreibt Satzanfaenge manchmal klein) und meldet das als „Hinweis“.
- `words_penicillin.py --asr`: getrennte Tokens wie „Jumbo -Jets“ werden zusammengefuegt; stimmt die Wortzahl mit dem Skript, wird die Skript-Schreibweise uebernommen (Jahreszahlen bleiben Ziffern).
- Jedes Geraet steht mindestens 8 Frames vor Szenenende fertig.

**Stand 26.11.:** Stimme fehlt noch. Alle Zeiten sind PLATZHALTER (enno 26.11.: ultra schnell ohne Pausen, daher 3,6 Woerter/s, 133 Woerter, Master 38,16 s, `gen/words_penicillin.py`). Mock sauber (0 Fehler / 0 ABGESCHNITTEN / 0 KNAPP / 0 SAFE / 0 PFEIL, VIELFALT ok), auch mit Platzhaltern fuer 35 s und 40 s. Musik und SFX sind auf die Platzhalter-Laenge gerechnet; die Mischung wartet auf die Stimme.

## Wenn das Audio da ist (oder eine neue Aufnahme kommt)

Die Stimme als `../audio-penicillin/voice.mp3` ablegen (Ordner `tage/2026-11-27/audio-penicillin/`) (oder bei jedem Schritt den Pfad mitgeben). Dann in dieser Reihenfolge:

1. **ASR**
   - `python3 gen/asr_penicillin.py [stimme.mp3]`
   - faster-whisper small, Deutsch, Wortzeiten. Die Datei wird per ffmpeg zu 16 kHz mono dekodiert und als Array uebergeben (mit Dateipfad scheitert faster-whisper hier an der av-Version).
   - Ergebnis: `data/words_whisper.json`
2. **words.json**
   - `python3 gen/words_penicillin.py --asr [stimme.mp3]`
   - Woerter und Zeiten kommen direkt aus der ASR (gesprochener Text zaehlt, -> `data/text_gesprochen.txt`); Abweichungen zum Skript -> `data/text_abweichungen.json`. Passt ein Anker nicht mehr, meldet `gen_penicillin.py` „Wort nicht gefunden“: dann die Szene anpassen, nicht den Text erzwingen.
   - Ergebnis: `audio/penicillin_voice.wav` (Stille vorn und hinten weg), `data/words.json`, `data/laenge.json`
3. **gen neu**
   - `python3 gen/gen_penicillin.py && python3 gen/gen_penicillin.py --cloud`
   - Ergebnis: jsx-Dateien und `data/timeline.json` mit den echten Zeiten
   - Pruefung: `node gen/aemock.js` muss 0 Fehler / 0 ABGESCHNITTEN / 0 KNAPP melden.
4. **Ton-Kette + Mischung**
   - `node ton/events_penicillin.js && python3 -I ton/sfx_penicillin.py && python3 ton/music_penicillin.py && python3 ton/mix_penicillin.py`
   - Ergebnis: `audio/penicillin_mix.wav`

Hinweis ASR: whisper schreibt Jahreszahlen mal als Ziffern, mal ausgeschrieben. Die Anker in `gen/gen_penicillin.py` suchen beides (1928/neunzehnhundertachtundzwanzig, 1945/neunzehnhundertfuenfundvierzig). Meldet gen trotzdem „Wort nicht gefunden“, den Anker anpassen, nicht den Text.

## Bauen in After Effects (AE 2023)

Zielprojekt ist das am PC offene **`C:\Users\Enrico\Videos\Kurzvideos.aep`** (nicht ein eigenes Projekt). Der Build baut wie die Vorlage in das gerade offene Projekt und ersetzt nur seinen eigenen Top-Ordner `Short 27.11. Penicillin (penicillin)`; andere Shorts bleiben unberuehrt. Ohne gespeichertes offenes Projekt bricht er ab.

0. Backup: `Kurzvideos.aep` nach `Podcast-Shorts\Backups\Kurzvideos_BACKUP_vor_penicillin_2711.aep` kopieren.
1. `jsx/HAND_plugin_check.jsx`: prueft die Effekte (Posterize Time, Gate Weave, Tint usw.).
2. `jsx/HAND_build_penicillin.jsx` (oder `node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-27\ae-penicillin\jsx\build_penicillin.jsx 900000` per RC):
   - Top-Ordner und Master `Short 27.11. Penicillin (penicillin)`, Precomps `BG <szene>` unter `Bausteine (penicillin)`
   - PC-Pfad `C:/Users/Enrico/Claude/Podcast-Shorts/tage/2026-11-27/ae-penicillin/`
   - Ergebnis muss 0 Fehler / 0 ABGESCHNITTEN / 0 KNAPP melden
3. `jsx/HAND_snap_penicillin.jsx`: Standbilder zur Kontrolle.
4. `jsx/HAND_render_penicillin.jsx`: Gesamt-Render (oder `HAND_render_penicillin_teile.jsx`).

Der Master hat Posterize Time 12, Grain, CA und das runde Logo oben links bis zum Outro. Die Audio-Ebene ist `audio/penicillin_mix.wav`.

## Szenen (12)

hook, london, labor, schale, neugierig, folge, kaum, oxford, krieg, nobel, frage, outro. Tabelle mit Geraeten, Bildpunkten und Zeiten: `vox-plan.md`.

## Bilder

**Nur echte Fotos, keine KI-Bilder.** Rohdateien in `archiv/roh/`, aufbereitet mit `python3 gen/bilder_penicillin.py` -> `archiv/` + `data/bilder.json` (Bildpunkte, alle angesehen). Nachweise je Datei in `archiv/credits.json`. `data/pc_bilder.json` ist leer: kein Schluesselbild nur von Commons noetig.
- Wellcome Collection (iiif.wellcomecollection.org, nur CC BY 4.0 oder Public Domain Mark):
  - L0000655 Fleming mit Petrischale (CC BY 4.0): p-fleming, g-fleming, f-fleming
  - L0012312 Gruppe mit Florey und Chain (CC BY 4.0): p-oxford, g-oxford, f-florey, f-chain
  - B0011300 Penicillium-Hyphen unter dem Mikroskop (CC BY 4.0): g-pilz
  - V0013627 St Mary's Hospital, Lithografie 19. Jh. (gemeinfrei, PDM): p-hospital, g-hospital
  - V0027402 Gruppe mit Florey (gemeinfrei, PDM): g-gruppe
- Library of Congress, Prints & Photographs (nur die online freigegebenen 640/1024-px-Fassungen; „Rights status not evaluated“, siehe unten):
  - 95519946 Fleming im Labor mit Schalen: p-labor, g-labor
  - 93510138 Petrischale mit Schimmel und klarem Hof (Kultur der 1940er, nicht Flemings Originalschale von 1928): p-schale, g-schale
  - 95519957: p-stern, g-stern · 97519964 Forscher mit Kulturflaschen: p-flaschen, g-flaschen · 92519545 Kulturflaschen: p-kultur, g-kultur
  - cph.3a40776 Fleming am Schreibtisch (Harris & Ewing): p-portrait, g-portrait
  - 91483071 Kriegsplakat „A Race against death“ (1941-45): p-plakat, g-plakat
- Eigene Vektorgrafik: f-medaille (Medaille mit Band), keine Quelle noetig.
- Im Video steht der Nachweis senkrecht grau am linken Rand („Foto: Wellcome Collection, CC BY 4.0“, „Foto: Library of Congress“ usw.).

**Offen zur Bildlizenz:** Die LOC-Pressefotos und das Plakat haben bei der LOC den Status „Rights status not evaluated“ (keine bekannten Einschraenkungen angegeben, aber nicht ausdruecklich gemeinfrei). Wenn das zu unsicher ist, lassen sich labor/schale/kaum/krieg auf Wellcome-Bilder umstellen.

## Ton (`ton/`)

Reihenfolge nach `gen` (oder nach neuer Stimme):

```
node ton/events_penicillin.js          # SFX-Ereignisliste aus dem Mock -> ton/events_alle.json
python3 -I ton/sfx_penicillin.py       # -> ton/sfx.wav, sfx_events.json, credits_sfx.json
python3 ton/music_penicillin.py        # -> ton/music_penicillin.wav (Laenge aus data/timeline.json; kuerzen: --laenge 45)
python3 ton/mix_penicillin.py          # NUR mit echter Stimme -> audio/penicillin_mix.wav (-14 LUFS, TP -1,3, Musik 14,5 LU unter der Stimme)
```

**SFX nach Chris Moran**
- Nur das wichtigste Ereignis je Szene bekommt einen Ton:
  - Filzstift bei Hervorhebungen
  - Bleistift bei Kreisen, Bahn, Haken und Kreuz
  - Ticks bei Zaehlern und Stapel
  - Schlag bei Slam, Papier bei Pfeilen, Tap bei Chip und Logo, Klick beim Folgen-Knopf
- Tiefer Whoosh als J-Cut 3 Frames vor jedem Schnitt.
- Jeder Ton endet in seiner Szene.
- Die Zeiten liegen auf sichtbaren Frames (Posterize 12).
- Quellen:
  - nur `ton/sfx_real/` (alle CC0, Liste `ton/sfx_real_liste.json`; Stand 26.11.: 23 Anschlaege bei 38,16 s: 12 Szenentoene + 11 Schnitt-Whooshes)
  - und ennos eigene Klicks (`ton/sfx_enno/`)
  - keine CC-BY-Dateien

**Musik:** eigene Komposition `ton/music_penicillin.py`, warm, neugierig, Dur, anders als wright (F-Dur 96 bpm Vibraphon/Zupf) und apollo (D-Dur 100 bpm Marimba/Glockenspiel).
- G-Dur, 92 bpm, nur reine Dur-Dreiklaenge (G C G D | G C D G)
- Gitarre mit Wechselbass + federndem Ukulele-Schlagmuster, leiser Shaker, Floeten-Melodie (aufsteigendes Fragen-Motiv), Glockenspiel-Funken nur bei „neugierig“ und beim Nobelpreis
- Zonen: kaum..oxford leiser ohne Floete, krieg..nobel Motiv hoeher, frage nur Gitarre, Schluss-Akkord G-Dur auf „folgen“ (spaetestens 2,6 s vor Schluss)
- EQ-Senke 1,9 kHz, kuerzbar mit `--laenge`
- earshot (38,16 s): Stimmung „uplifting and hopeful“ + „celebratory and joyful“ (z 2,5), erkannt als „cheerful ukulele music“ (z 3,5); in jedem 9-s-Fenster „celebratory/uplifting“, „sad“ nirgends unter den Stimmungs-Treffern (ueber die ganze Datei nur schwach, z 2,3, Rang 8). Fassung 1 (Fingerpicking + Pad + viel Hall, 88 bpm) las sich „sad“ z 2,8 und wurde verworfen.

**Mischung:** noch keine (Stimme fehlt). `mix_penicillin.py` bricht ohne `audio/penicillin_voice.wav` ab (keine Testmischung mit stummer Stimme). Ziel: -14 LUFS, True Peak -1,3 dBTP, Musik 14,5 LU unter der Stimme, SFX-Hauptereignisse im Median 8 dB unter den Stimmspitzen.

## Pruefen

- `node gen/aemock.js`: Fehler, ABGESCHNITTEN, KNAPP, TEXT, RAND, SAFE und PFEIL muessen 0 sein, VIELFALT ok.
- Vorschau:
  1. `node gen/aemock.js --render out/anz.json 1.0,4.6,...`
  2. `python3 gen/vorschau_render.py out/anz.json out/v 0.5`
- Kontaktbogen: `out/vorschau_v1.jpg` (Platzhalterzeiten)
