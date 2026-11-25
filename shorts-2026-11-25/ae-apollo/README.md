# Short 25.11.2026: "Apollo 13: Gerettet mit Klebeband" (Schluessel `apollo`)

**Podcast:** „Allgemeinwissen klar und deutlich“ · **Format:** 9:16 · 1080x1920 · 25 fps · **Skript:** `../skripte.md` (ElevenLabs-Block)

Das Paket ist eine Kopie der Vorlage `folge-42-bitcoin/short/ae-pizza`. Ueberall wurde pizza zu apollo umbenannt, und die Szenen sind neu.

**Stil: lebendiger Vox nach Chris Moran**
- Hintergrund (enno 25.11., Chris Moran TikTok 13, ersetzt die Farbfamilien): je Szene eine Precomp `BG <szene>` mit 2-3 Graustufen-Themenbildern (`archiv/g-*.png`, schraeg, angeschnitten), darueber Tint, dazu Grunge-Kratzer niedrig deckend; Grundplatte und Collage driften und zoomen langsam.
  - SCHWARZ und WEISS im Wechsel je 2 Szenen (hook+klebeband schwarz, april+weg weiss, explosion+houston schwarz, folge+faehre weiss, zwei+luft schwarz, filter+eckig weiss, adapter+bauplan schwarz, funk+landung weiss, frage+outro schwarz).
  - Schwarz: Map Black To #111111, Map White To #615E59, Grunge Screen 20 %. Weiss: Map Black To #A9A6A0, Map White To #F4F1EA, Grunge Multiply 16 %. Bildkontrast ~30 % (etwas sichtbarer als bei Chris Moran).
  - Auf weissen Szenen sind Linien, Pfeile, Ringe und Formen auf dem Hintergrund dunkel (#1C1B19) statt hell.
- Davor steht ein Abzug oder Freisteller in echten Farben.
- Je Szene laufen mindestens 2 Vox-Geraete nacheinander, jedes an einem echten Bildpunkt.

**Keine Untertitel:** Die macht CapCut. Das Band y 1290-1460 bleibt frei.

**Stand 25.11.:** ennos Stimme ist da (`../audio-apollo/voice.mp3`, 48,7 s). Master 49,32 s. Alle Szenen-Anker kommen aus dem GESPROCHENEN Text (`data/text_gesprochen.txt`, aus der ASR); Abweichungen zum Skript stehen in `data/text_abweichungen.json`:
- „basteln“ -> „entwickeln“ (Szene adapter, keine Aenderung noetig)
- „Handbuch-Deckeln“ -> „Plastiktueten, Karton“: Szene bauplan angepasst (Fokus Schlauch -> Tuete -> Karton am echten Foto, KI-Wunsch ki-handbuch gestrichen)
- neu „... den Astronauten jeden einzelnen Schritt. Die Crew baut den Adapter nach.“: Szene funk laenger, neues Etikett NACHGEBAUT auf „baut“
- Zahlen als Ziffern (1970, 13, 300.000): Anker angepasst

Fertig: `audio/apollo_mix.wav` (-14,0 LUFS, True Peak -1,3 dBTP, Musik 14,5 LU unter der Stimme).

## Wenn das Audio da ist (oder eine neue Aufnahme kommt)

Die Stimme als `../audio-apollo/voice.mp3` ablegen (oder bei jedem Schritt den Pfad mitgeben). Dann in dieser Reihenfolge:

1. **ASR**
   - `python3 gen/asr_apollo.py [stimme.mp3]`
   - faster-whisper small, Deutsch, Wortzeiten. Die Datei wird per ffmpeg zu 16 kHz mono dekodiert und als Array uebergeben (mit Dateipfad scheitert faster-whisper hier an der av-Version).
   - Ergebnis: `data/words_whisper.json`
2. **words.json**
   - `python3 gen/words_apollo.py --asr [stimme.mp3]`
   - Woerter und Zeiten kommen direkt aus der ASR (gesprochener Text zaehlt, -> `data/text_gesprochen.txt`); Abweichungen zum Skript -> `data/text_abweichungen.json`. Passt ein Anker nicht mehr, meldet `gen_apollo.py` „Wort nicht gefunden“: dann die Szene anpassen, nicht den Text erzwingen.
   - Ergebnis: `audio/apollo_voice.wav` (Stille vorn und hinten weg), `data/words.json`, `data/laenge.json`
3. **gen neu**
   - `python3 gen/gen_apollo.py && python3 gen/gen_apollo.py --cloud`
   - Ergebnis: jsx-Dateien und `data/timeline.json` mit den echten Zeiten
   - Pruefung: `node gen/aemock.js` muss 0 Fehler / 0 ABGESCHNITTEN / 0 KNAPP melden.
4. **Ton-Kette + Mischung**
   - `node ton/events_apollo.js && python3 -I ton/sfx_apollo.py && python3 ton/music_apollo.py && python3 ton/mix_apollo.py`
   - Ergebnis: `audio/apollo_mix.wav`

## Bauen in After Effects (AE 2023)

Zielprojekt ist das am PC offene **`C:\Users\Enrico\Videos\Kurzvideos.aep`** (nicht ein eigenes Apollo-Projekt). Der Build baut wie die Vorlage in das gerade offene Projekt und ersetzt nur seinen eigenen Top-Ordner `Short 25.11. Apollo 13 (apollo)`; andere Shorts bleiben unberuehrt. Ohne gespeichertes offenes Projekt bricht er ab.

0. Backup: `Kurzvideos.aep` nach `Podcast-Shorts\Backups\Kurzvideos_BACKUP_vor_apollo_2511.aep` kopieren.
1. `jsx/HAND_plugin_check.jsx`: prueft die Effekte (Posterize Time, Gate Weave, Tint usw.).
2. `jsx/HAND_build_apollo.jsx` (oder `node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-25\ae-apollo\jsx\build_apollo.jsx 900000` per RC):
   - Top-Ordner und Master `Short 25.11. Apollo 13 (apollo)`, Precomps `BG <szene>` unter `Bausteine (apollo)`
   - PC-Pfad `C:/Users/Enrico/Claude/Podcast-Shorts/tage/2026-11-25/ae-apollo/`
   - Ergebnis muss 0 Fehler / 0 ABGESCHNITTEN / 0 KNAPP melden
3. `jsx/HAND_snap_apollo.jsx`: Standbilder zur Kontrolle.
4. `jsx/HAND_render_apollo.jsx`: Gesamt-Render (oder `HAND_render_apollo_teile.jsx`).

Der Master hat Posterize Time 12, Grain, CA und das runde Logo oben links bis zum Outro. Die Audio-Ebene ist `audio/apollo_mix.wav`.

## Szenen (18)

| # | Szene | Inhalt |
|---|---|---|
| 1 | hook | Saturn V, Bleistift-Kreis, Pfeil zum Mond |
| 2 | klebeband | Crew, Fokus ueber die Gesichter, Klebeband-Abzug schlaegt ein |
| 3 | april | Missionsabzeichen, Odometer APRIL 1970, Lupe auf XIII |
| 4 | weg | Erde und Mond, gestrichelte Bahn, 330.000 km |
| 5 | explosion | Servicemodul, dunkler Callout auf den Schaden, SAUERSTOFF |
| 6 | houston | Mission Control, Funkringe, HOUSTON |
| 7 | folge | Erde/Mond-Parallax, Folgen-Knopf -> „Gefolgt“ |
| 8 | faehre | Aquarius, drei Punkte in die Luke, AQUARIUS |
| 9 | zwei | Simulator, 3 Plaetze -> 2 MENSCHEN / 2 TAGE |
| 10 | luft | Lovell, CO2-Balken, Rot steigt |
| 11 | filter | Filter-Stapel, Haken |
| 12 | eckig | eckig vs. rund, Pfeil, Kreuz |
| 13 | adapter | Prototyp, Lupe Kiste -> Schlauch |
| 14 | bauplan | Mailbox, Fokus Schlauch -> Tuete -> Karton, Kreis aufs Klebeband |
| 15 | funk | CAPCOM, Ringe vom Mikro, Haken Schritt fuer Schritt, NACHGEBAUT |
| 16 | landung | Wasserung, Haken, Kreis um die Schirme, PAZIFIK |
| 17 | frage | Crew auf der Iwo Jima, rotes ? |
| 18 | outro | Logo, Folgen -> „Gefolgt“, „In der Bio“ |

Details stehen in `vox-plan.md`.

## Bilder

**Echte NASA-Fotos:** nur von images.nasa.gov (`images-api.nasa.gov` / `images-assets.nasa.gov`), alle angesehen.
- Rohdateien: `archiv/roh/` (nach NASA-ID benannt)
- aufbereitet: `archiv/`, ueber `python3 gen/bilder_apollo.py` -> `data/bilder.json` mit Bildpunkten
- Nachweise: `archiv/credits.json`, je Datei NASA-ID, „NASA, gemeinfrei“, Quelle und Original-URL
- Im Video steht der Nachweis klein unten links.
- Hintergrund: `archiv/g-*.png` (Graustufen aus denselben NASA-Rohbildern), `archiv/b-schwarz|weiss.jpg` (Grundplatten), `archiv/t-grunge-hell|dunkel.jpg` (aus der Vorlagen-Textur `tex/lensfx216.jpg`). Die alten Farb-Collagen `s-*` und `b-<farbe>` sind entfernt.

**Fehlende Bilder:** In `data/ki_wunsch.json` stehen Prompts (9:16, Fotostil 1970). Sie sind NICHT erzeugt.
- `ki-band`: Klebebandrolle. Jetzt: echter NASA-Ausschnitt `p-band.jpg`.
- `ki-loch`: runde Filteraufnahme. Jetzt: saubere Vox-Form „Form Loch“ und Hilfsebene „KI Platzhalter ki-loch“.
- (`ki-handbuch` gestrichen: enno spricht jetzt „Plastiktueten, Karton“, das echte Foto zeigt beides.)

So kommt ein geliefertes Bild ins Paket:
1. Bild als `archiv/roh/ki-<name>.png` ablegen.
2. `python3 gen/bilder_apollo.py && python3 gen/gen_apollo.py` laufen lassen.

Die Platzhalter sind Hilfsebenen (Guide). Sie rendern nicht.

## Ton (`ton/`)

Reihenfolge nach `gen` (oder nach neuer Stimme):

```
node ton/events_apollo.js          # SFX-Ereignisliste aus dem Mock -> ton/events_alle.json
python3 -I ton/sfx_apollo.py       # -> ton/sfx.wav, sfx_events.json, credits_sfx.json
python3 ton/music_apollo.py        # -> ton/music_apollo.wav (Laenge aus data/timeline.json; kuerzen: --laenge 45)
python3 ton/mix_apollo.py          # NUR mit echter Stimme -> audio/apollo_mix.wav (-14 LUFS, TP -1,3, Musik 14,5 LU unter der Stimme)
```

**SFX nach Chris Moran**
- Nur das wichtigste Ereignis je Szene bekommt einen Ton:
  - Filzstift bei Hervorhebungen
  - Bleistift bei Kreisen, Bahn, Haken und Kreuz
  - Ticks bei Zaehlern und Stapel
  - Schlag bei Slam, Funkrauschen bei Funkringen, Tap beim Logo, Klick beim Folgen-Knopf
- Tiefer Whoosh als J-Cut 3 Frames vor jedem Schnitt.
- Jeder Ton endet in seiner Szene.
- Die Zeiten liegen auf sichtbaren Frames (Posterize 12).
- Quellen:
  - nur `ton/sfx_real/` (alle CC0, Liste `ton/sfx_real_liste.json`, darin auch Funkrauschen „Radio static“ von penyasounds, CC0, freesound.org/s/730772)
  - und ennos eigene Klicks (`ton/sfx_enno/`)
  - keine CC-BY-Dateien

**Musik (Fassung 2, leicht und hell):** eigene Komposition.
- D-Dur, 100 bpm, nur reine Dur-Dreiklaenge (D G A D | D G D A), keine Moll-Akkorde, keine Vorhalte
- ohne Schlagzeug: Marimba-Achtel-Arpeggio, Pizzicato, Glockenspiel-Motiv, ganz leises helles Pad
- EQ-Senke 1,9 kHz
- kuerzbar mit `--laenge`
- Fassung 1 (ruhig, 76 bpm) liegt als `ton/music_apollo_v1.wav` daneben; earshot hoerte sie als „sad and melancholic“.
- Auf die echte Laenge 49,32 s gerendert, Schluss-Akkord bei 46,72 s, sauberer Ausklang bis zum Ende.
- earshot-Pruefung Fassung 2 (Platzhalter-Laenge 65,56 s):
  - -15,4 LUFS, True Peak -1,0 dBTP
  - Stimmung gesamt: nur „uplifting and hopeful“ (z 2,22) in den Hinweisen, „sad“ nicht mehr dabei
  - Abfragen: bright/cheerful z 2,17, happy/uplifting 2,07, sad 1,90, Schlagzeug -0,25 (keins)
  - erkannt als music box / glockenspiel / cheerful ukulele / marimba
  - Nur im Explosionsteil (14,6-21 s, absichtlich zurueckgenommen) steht „sad“ auf Platz 5 (z 2,12).

**Mischung (25.11.):** `audio/apollo_mix.wav`, 49,32 s, -14,0 LUFS, True Peak -1,3 dBTP, Musik 14,5 LU unter der Stimme, SFX-Hauptereignisse im Median 8 dB unter den Stimmspitzen (Messung `ton/mix_messung.json`).
- earshot-Check der SFX (`timeline` mit allen 35 Ereignissen als Cues): kein Ereignis ohne Ton; 60 % liegen innerhalb eines Frames (Zufall waere 15 %), 77 % innerhalb von 100 ms (Zufall 28 %). Die 6 „near“-Treffer sind 5 Whooshes, deren Spitze 40-100 ms vor dem Schnitt liegt (J-Cut), und ein Bleistift 55 ms spaet.
- Kein Ton beginnt vor seiner Szene (ausser den Whoosh-J-Cuts, hoechstens 3 Frames), keiner reicht ueber das Szenenende (geprueft aus `ton/sfx_events.json`).
- `mix_apollo.py` bricht ohne `audio/apollo_voice.wav` ab (keine Testmischung mit stummer Stimme).

## Pruefen

- `node gen/aemock.js`: Fehler, ABGESCHNITTEN, KNAPP, TEXT, RAND, SAFE und PFEIL muessen 0 sein, VIELFALT ok.
- Vorschau:
  1. `node gen/aemock.js --render out/anz.json 1.62,6.36,...`
  2. `python3 gen/vorschau_render.py out/anz.json out/v 0.5`
- Kontaktbogen: `out/vorschau_v2.jpg` (neuer Stil, echte Zeiten; `out/vorschau.jpg` ist der alte Farbstil mit Platzhalterzeiten)
