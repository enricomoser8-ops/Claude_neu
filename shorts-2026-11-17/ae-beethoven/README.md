# Short 17.11. Beethoven (Hintergrund-Vox, key `beethoven`)

"Dieser Mann schreibt eins der berühmtesten Musikstücke der Welt und kann es nicht hören …" – der taube Beethoven bei der Uraufführung der Neunten, Wien 1824.
9:16, 1080x1920, **25 fps**, 51,76 s. Vorlage: ae-jessop (Hintergrund-Vox Runde 2). Die Vorlage selbst wurde nicht verändert.
Stimme: `beethoven.mp3` (Short 2 aus skripte.md), ohne jeden Schnitt.

**Es gibt keine KI-Bilder.** Für die zwei erlaubten Momente (jubelnder Saal, Hüte und Tücher) wurde ElevenLabs vorbereitet. Der Lauf wurde in der Cloud aber von der Rechteprüfung abgelehnt. Stattdessen laufen dort zwei gemeinfreie Konzertsaal-Holzstiche aus Harper's Weekly (LOC).
Die Knoten liegen noch unbenutzt im ElevenLabs-Flow `xanmvhT1c2peyASmLpBk`, falls enno sie doch will.

## Bauen auf dem PC (in dieser Reihenfolge)
Ordner auf dem PC: `C:\Users\Enrico\Claude\Podcast-Shorts\tage\2026-11-17\ae-beethoven\`. Die Pfade sind in den jsx fest auf diesen Ordner gesetzt. Alle Befehle laufen von `C:\Users\Enrico\Claude` aus.

1. **Echte SFX kopieren.**
   - Den Inhalt von `C:\Users\Enrico\Claude\Podcast-Shorts\sfx-vox\` (40 Dateien) nach `ae-beethoven\ton\sfx_real\` kopieren.
   - Zusätzlich die 3 Applaus-Dateien laden. Sie sind **nicht** in sfx-vox. Sie stehen in `ton/sfx_real_liste.json` (Feld `download`, alle CC0) und kommen unter dem Namen im Feld `datei` nach `ton\sfx_real\`: `applause_1.mp3`, `applause_2.mp3`, `applause_3.mp3`.
2. **Commons-Bilder laden.**
   - Die drei Dateien aus `archiv/commons_liste.json` mit `"verwendet": true` in voller Auflösung von der Dateiseite laden. Sie kommen unter genau dem Namen aus `ziel` nach `archiv\commons\`:
     - `konversationsheft.jpg`
     - `premiere-neunte.jpg`
     - `unger.jpg`
   - Die Lizenz auf jeder Dateiseite prüfen.
   - Fehlt eine Datei, meldet der Build `FEHLER DATEI FEHLT (Commons, …)`.
   - Caroline Unger ist unsicher (siehe unten). Ohne ihr Bild: in `jsx/scenes_beethoven.jsx` `var MIT_UNGER = false;` setzen und `python gen/gen_beethoven.py` laufen lassen. Ohne Cloud-Flag schreibt das die PC-Pfade. Die Szene läuft dann ohne Abzug, mit Spot auf den Dirigenten und den Dreh-Pfeilen als Hauptmittel. Der Mock war auch so überall 0.
3. **Bauen.** In AE 2023 **Kurzvideos.aep** öffnen, dann:
   - Optional zuerst: `node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-17\ae-beethoven\jsx\plugin_check.jsx 900000`
   - `node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-17\ae-beethoven\jsx\build_beethoven.jsx 900000`
     Erwartete Antwort: `0 Fehler | 0 ABGESCHNITTEN | 0 KNAPP | alle Effekte da`
4. **Snap.** `node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-17\ae-beethoven\jsx\snap_beethoven.jsx 900000` → 71 Stills in `out\png\beet_*.png`. Der Dateiname ist die Zeit in 1/100 s. Danach ansehen, vor allem:
   - **heft** (~9,4–11,4 s): Liegt der Textmarker `KONV_ZEILE` auf der ersten Zeile des Konversationshefts? Die Anteile x0, x1, y und Höhe stehen in `jsx/scenes_beethoven.jsx`.
   - **takt** (~19,4–25,4 s): Sitzt der rote Kreis auf Beethoven (`PREM_BEETHOVEN`)? Zeigt der blaue Kreis plus Pfeil auf den zweiten Dirigenten (`PREM_DIRIGENT`)? Die Werte sind Anteile am Bild.
   - **saengerin** (~33,4 s): Abzug Unger. **hymne** (~43,4 s): blau mit 12 Sternen.
   - Bei Korrekturen: `python gen/gen_beethoven.py` und dann neu bauen.
5. **Sichtbare Frames messen.**
   - In den Stills (bzw. in AE auf Frame-Ebene) prüfen, wann die Ereignisse wirklich zu sehen sind.
   - Abweichungen vom Mock trägt man in `ton/events_beethoven.js` → `PC_FIX` ein: `'typ:szene': [f_sicht, f1_sicht]`.
   - Typen und Mock-Frames stehen in `ton/events_alle.json`.
   - Regel ohne PC-Wert: `f = ceil(ceil(t·12)·25/12)` (Posterize 12).
6. **Ton neu machen**, mit dem Python aus der earshot-venv (`C:\Users\Enrico\Claude\tools\earshot\…\python.exe`):
   `node ton\events_beethoven.js; python ton\sfx_beethoven.py; python ton\mix_beethoven.py`
   Die Messwerte landen in `ton/mix_messung.json`. Ziel: -14 LUFS, TP ≤ -1 dBTP, 48 kHz, genau 51,76 s.
7. **Ton in AE neu laden.** `audio/beethoven_mix.wav` im Projekt neu laden (Footage > Neu laden) oder den Build noch einmal laufen lassen.
8. Rendern: `node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-17\ae-beethoven\jsx\render_beethoven.jsx 900000` → `out\beethoven_vox.mp4`.
   Falls AE am Stück abbricht: `render_beethoven_teile.jsx` (zwei Hälften).
   - Die `HAND_*.jsx` sind dieselben Skripte zum Starten von Hand über Datei > Skripte. Sie schreiben die Antwort zusätzlich nach `out\ergebnis_*.txt`.

**AE-Struktur**
- AE-Ordner: `Short 17.11. Beethoven (beethoven)`. Der Build löscht und ersetzt **nur** diesen Ordner.
- Master-Comp: **`Short 17.11. Beethoven (beethoven) (9x16)`**.
- Szenen-Comps: `beethoven 01 hook` … `beethoven 15 outro`. Alle Comps laufen mit 25 fps, beim Bauen auf Viertel-Auflösung.

**Technik**
- Snap und Render rufen vorher `app.purge(ALL_CACHES)` auf.
- Effekte: kein 3D, kein CC Sphere, kein Deep Glow. Quick Chromatic Aberration liegt nur einmal oben im Master.
- Untertitel: ein Wort, Arial Bold 52, weiß, y 1370. Lücken in der Stimme werden nicht geschnitten.
- Eck-Logo: 98/196, 96 px, bis zum großen Logo am Anfang des Outros.
- Folgen-Knopf: "Gefolgt" mittig, ohne ✓.

## Szenen
Jede Szene hat ein vollflächiges, warm sepia gegradetes Archivbild mit langsamer Fahrt. Keines wird über 110 % seiner echten Pixel vergrößert; das Maximum liegt bei 108 %.
Mittel-Abkürzungen:
- `HAUPT:` = Hauptmittel der Szene. Kein Hauptmittel kommt zweimal hintereinander.
- `Text:` = Bildschirmtext ohne Untertitel, höchstens 2 je Szene und je ≤ 3 Wörter.
- Es gibt genau 1 Abzug (Druck), in der Szene saengerin.

| # | Szene (s) | Hintergrund | Mittel auf dem Bild | Text |
|---|---|---|---|---|
| 1 | hook 0–4,40 | Beethoven, Chromolithografie nach Stieler (LOC). Gesicht ab Frame 0 | `HAUPT:` Spot aufs Gesicht ab 0; Punch auf "hören" | – |
| 2 | name 4,40–6,08 | Lithografie Paris (Schlesinger, LOC), Signatur | `HAUPT:` Textmarker auf die gedruckte Signatur; Spot; Punch-Schnitt | – |
| 3 | taub 6,08–8,72 | dieselbe Lithografie, Gesicht | `HAUPT:` Spot aufs Gesicht; Punch auf "taub" | Zähler 50 ("knapp fünfzig") |
| 4 | heft 8,72–11,60 | Partitur 1826, S. 1 (abgedunkelt) | `HAUPT:` Ausschnitt **Konversationsheft** (Commons) mit Textmarker auf der 1. Zeile; Spot | – |
| 5 | wien 11,60–13,88 | Jakob Alt, Wien um 1830 (LOC) | `HAUPT:` Kreis um den Stephansdom; Punch-Schnitt | Zähler 1824 |
| 6 | sinfonie 13,88–16,88 | Titelblatt der Erstausgabe 1826 (BPL) | `HAUPT:` Textmarker "Sinfonie"; Punch auf "gespielt" | Chip NR. 9 |
| 7 | folge 16,88–18,96 | Büste Beethoven, Foto um 1892 (LOC) | `HAUPT:` Parallax, die Büste löst sich; Klick "+ Folgen" → "Gefolgt" | – |
| 8 | takt 18,96–25,56 | Partitur 1826, S. 103 (abgedunkelt) | `HAUPT:` Ausschnitt **Offterdinger 1879** (Commons): roter Kreis Beethoven, Pfeil + blauer Kreis zum zweiten Dirigenten; 4 Metronom-Ticks; Punch auf "Takt" | – |
| 9 | jubel 25,56–29,04 | Harper's Weekly 1861, Konzertsaal Brooklyn (LOC) | `HAUPT:` Fokus Bühne → Publikum (≤ 2 s); Spot Menge; Punch auf "jubelt" | – |
| 10 | ruecken 29,04–32,56 | derselbe Saal, Dirigent | `HAUPT:` Spot auf den Dirigenten mit dem Rücken zum Saal; Punch | – |
| 11 | saengerin 32,56–34,96 | derselbe Saal | `HAUPT:` Abzug **Caroline Unger** (Commons, ohne Namen); Dreh-Pfeile um den Dirigenten; Kamera schwingt | – |
| 12 | huete 34,96–40,68 | Harper's Weekly 1865, Ovation Cooper Institute (LOC) | Brand-Übergang; Spot Menge; `HAUPT:` Bleistiftkreise um 3 gehobene Hüte/Tücher | – |
| 13 | hymne 40,68–44,28 | Partitur 1826, S. 113 ("Freude, schöner Götterfunken") | Textmarker auf die Textzeile; `HAUPT:` Farbsweep ins Europablau, 12 goldene Sterne | – |
| 14 | frage 44,28–45,92 | Stieler-Chromolithografie, Augen | `HAUPT:` Spot auf die Augen | ? |
| 15 | outro 45,92–51,76 | Jakob Alt, Wien | `HAUPT:` Brand-Übergang; Logo 360 px im Kreis; Folgen-Klick | In der Bio |

## Ton (taktiler Vox-Ton nach Chris Moran)
`audio/beethoven_mix.wav` (Cloud-Zwischenstand): **-14,01 LUFS**, True Peak **-1,3 dBTP**, 48 kHz Stereo, genau **51,76 s**.
- **Stimme** `audio/beethoven_voice.wav`: unverändert, kein Lückenschnitt. -14,3 LUFS.
- **Musik**: eigene Komposition `ton/music_beethoven.py`, warm-klassisch mit 76 bpm.
  - Harmonik: d-Moll (Pizzicato-Ostinato, Streicher-Pad, Bass), ab "huete" D-Dur.
  - Bei "Die Melodie kennst du" (ab 40,83 s) zitiert sie leise die Ode an die Freude (8 Töne), danach folgt eine Schlusskadenz.
  - In der Hook und von 26,4–34,96 s (Beethoven hört den Jubel nicht) klingt sie dumpf mit Tiefpass.
  - Frequency Pocket: Peaking 1,9 kHz, Q 0,3, -8 dB.
  - -3 dB Ducking beim Sprechen; **14,5 LU unter der Stimme** (gemessen 14,5).
- **SFX**: 87 Anschläge auf 64 benannten Ereignissen (13 bewusst stumm), jeweils auf dem *sichtbaren* Frame (Posterize 12).
  - Ereignisse: `ton/events_alle.json` (67). Platzierungen: `ton/sfx_events.json`. Quellen: `ton/credits_sfx.json`.
  - Quellenreihenfolge je Rolle:
    1. `ton/sfx_real/` (echte Freesound-Aufnahmen, Liste `ton/sfx_real_liste.json`)
    2. `ton/sfx_enno/`
    3. earshot-Bank `ton/earshot/`
  - Regeln:
    - Marker- und Bleistiftstriche klingen so lang, wie sie zeichnen.
    - Whooshes setzen 3 Frames vor dem Schnitt ein.
    - Ausschnitte bekommen Whoosh plus Papier.
    - Nie zweimal dasselbe Sample hintereinander.
    - Hauptereignisse liegen im Median 8,0 dB unter den Stimmspitzen (lautestes 6,9, leisestes 13,1).
    - Die SFX haben beim Sprechen eine Senke bei 1–4 kHz.
  - Neu für Beethoven:
    - Applaus-Bett: ab "jubelt" **dumpf** (Tiefpass, so hört Beethoven ihn nicht), ab "Jetzt sieht er es" **klar**, bis kurz in die Hymne.
    - 4 leise Metronom-Ticks bei "Takt".
    - Sterne: 6 feine Ticks. Farbsweep: weicher Whoosh.
  - **Cloud-Zwischenstand**:
    - sfx_real fehlte in der Cloud. Deshalb laufen hier enno-Aufnahmen und earshot.
    - Marker (4), Bleistift (10) und Applaus (2 Betten) sind noch **Code-Platzhalter**.
    - Mit `ton/sfx_real/` auf dem PC werden sie automatisch durch echte Aufnahmen ersetzt (Rollen `marker_*`, `pencil_*`, `applause_*`).
  - **CC-BY**: `photodrop_2` (djlprojects, CC BY 3.0) muss in der Videobeschreibung genannt werden, falls sie benutzt wird. Siehe `ton/credits_sfx.json` nach dem PC-Mix. Alles andere ist CC0, MIT oder eigen.
- Sprachabstand (Stimme gegen Rest): Median 12,6 dB, Anteil unter 6 dB 18,5 %.

## Prüfungen im Mock
Aufruf: `node gen/aemock.js jsx/build_beethoven.jsx [--vox] [--text]`. Der Mock lief auf build und HAND_build (Commons-Bilder als Platzhalter). Ergebnis:
- 0 Fehler, 0 ABGESCHNITTEN, 0 KNAPP, alle Effekte da
- Geometrie: in allen Prüfungen 0 Treffer (TEXT, FOTO, VOX, GRUND, STIL, LEISTUNG, STRICH, LEISTE, FARBE, FPS, RAND, LEER, KLEIN, LOGO, UT, UTNAH, SCHWENK, BLASS, KOLLISION, UNSCHAERFE, HOCHSKALIERT)
- Auch mit `MIT_UNGER = false` ist alles 0.
- Fehlende Commons-Dateien ergeben 3 Fehler `FEHLER DATEI FEHLT` (getestet).

Vorschau: `vorschau.jpg` zeigt 21 Frames. Sie entsteht mit `aemock --render` und `gen/vorschau_render.py` und ist eine PIL-Näherung. Die drei Commons-Elemente sind darin nur Platzhalter oder Näherungen.

## Daten und Quellen
- **Stimme**
  - ASR mit faster-whisper (`gen/asr_whisper.py`), daraus `data/words.json` mit 150 Wörtern (`gen/words_beethoven.py`).
  - Zahlwörter werden im Untertitel als Zahl gezeigt: "achtzehnhundertvierundzwanzig" → 1824, "fünfzig" → 50.
- **Bilder**: `gen/quellen_beethoven.py` lädt sie (LOC und Internet Archive), `gen/hintergrund_beethoven.py` gradet sie. Daraus entstehen `archiv/bg-*.jpg` (15), `data/grund.json` und `archiv/credits.json`.
- **Nachweise**: alle in `archiv/credits.json`, plus eine Quellzeile unten rechts je Szene.
  - LOC:
    - Chromolithografie nach Stieler (um 1870)
    - Lithografie Paris (Schlesinger)
    - Jakob Alt, Wien (1825–38)
    - Büstenfoto (um 1892)
    - Harper's Weekly 1861 (Brooklyn Academy of Music) und 1865 (Cooper Institute)
  - Internet Archive:
    - Erstausgabe op. 125, Schott 1826: Titelblatt (Boston Public Library)
    - Partitur S. 1, 103 und 113 (SMU Bywaters, Public Domain Mark)
  - Wikimedia Commons (nur auf dem PC laden): Konversationsheft 1823, Offterdinger 1879, Caroline Unger. Reserve-Dateien stehen in `archiv/commons_liste.json`.
  - Die Europaflagge ist in AE nach der offiziellen Geometrie selbst gezeichnet.
- Die Hintergründe zu Saal und Jubel (Szenen 9–12) zeigen **nicht** das Kärntnertortheater 1824. Es sind amerikanische Konzertsäle von 1861 und 1865, als Stimmungsbild ohne Beschriftung. Ein gemeinfreies Bild des echten Saals mit Publikum gibt es nicht frei aus der Cloud.

## Offene Punkte
- **Caroline Unger**: Herkunft laut Commons ein CD-Booklet (Opera Rara), Urheber und Datum unbekannt. Lizenz prüfen, im Zweifel `MIT_UNGER = false`.
- **KONV_ZEILE / PREM_***: Die Positionen sind aus der Vorschau geschätzt. Im PC-Snap prüfen.
- Die Konversationsheft-Seite ist Beethovens eigene Schrift (ein Eintrag zu Julie Guicciardi für Schindler), keine Notiz eines Besuchers. Für "schrieben ihm Fragen in Hefte" ist sie ein Symbolbild.
- "knapp fünfzig" erscheint als Zähler "50".
- Marker, Bleistift und Applaus bleiben Platzhalter, bis `ton/sfx_real/` gefüllt ist (Schritt 1).
