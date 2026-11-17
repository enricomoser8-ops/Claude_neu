# Short 17.11. Roosevelt (Hintergrund-Vox, key `roosevelt`)

"Dieser Mann wird in die Brust geschossen und hält danach noch über eine Stunde lang seine Rede." – 9:16, 1080x1920, **25 fps**, 53,80 s.
Vorlage: `tage/2026-11-16/ae-jessop` (Hintergrund-Vox Runde 2, unverändert gelassen). Skript: `tage/2026-11-17/skripte.md`, Short 1.
Roosevelts Gesicht ist ab Frame 0 zu sehen (Kontrast-Callout). Der Schütze bleibt namenlos und wird nicht gezeigt.
**Ein KI-Bild** (Szene etui: Brillenetui aus Stahl, ElevenLabs gpt-image-2.5-sunburst, 85 Credits), als "KI-Bild (ElevenLabs)" in der Quellzeile und in `archiv/credits.json` gekennzeichnet.
Alle anderen Bilder sind echte Archivbilder von 1902–1912 (LOC, Chronicling America, Internet Archive). **Kein Wikimedia-Bild nötig** (`archiv/commons_liste.json` ist leer).

## Ablauf auf dem PC (in dieser Reihenfolge)
Ordner auf dem PC: `C:\Users\Enrico\Claude\Podcast-Shorts\tage\2026-11-17\ae-roosevelt\`. Die Pfade sind in den jsx fest auf diesen Ordner gesetzt.

1. **Echte SFX kopieren:** Die Dateien aus `C:\Users\Enrico\Claude\Podcast-Shorts\sfx-vox\` nach `ton\sfx_real\` kopieren.
   Gebraucht werden die 38 Dateien in `ton\sfx_real_liste.json` (Namen wie `marker_1.mp3`). Die Rolle `water` wird nicht gebraucht.
2. **Commons:** nichts zu laden (`archiv\commons_liste.json` ist leer). Fehlt beim Bauen trotzdem eine Datei, meldet der Build `FEHLER DATEI FEHLT: …` und zählt sie als Fehler.
3. In AE 2023 **Kurzvideos.aep** öffnen. Der Build baut in das offene Projekt.
4. Bauen (von `C:\Users\Enrico\Claude` aus):
   - Optional zuerst: `node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-17\ae-roosevelt\jsx\plugin_check.jsx 900000`
   - `node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-17\ae-roosevelt\jsx\build_roosevelt.jsx 900000`
   - Erwartete Antwort: `0 Fehler | 0 ABGESCHNITTEN | 0 KNAPP | alle Effekte da`
5. Stills (73 Stück): `node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-17\ae-roosevelt\jsx\snap_roosevelt.jsx 900000`
   - Ergebnis: `out\png\roos_*.png`. Der Dateiname ist die Zeit in 1/100 s.
   - Ansehen und korrigieren. Besonders prüfen:
     - Lesbarkeit der Untertitel auf der hellen Zeitung (gerettet 40,9–43,1 s) und der Manuskriptseite (seiten 34,7–36,6 s); hinter den Untertiteln liegt dort eine weiche `FIX UT-Abdunklung`.
     - Ob der Textmarker auf der Lake-County-Times-Seite genau auf "script In Breast Pocket Saved Roose- / velt From Instant Death." liegt.
     - Ob die Kreise ganz um Etui, Kugel, Teddy und Blutfleck gehen.
     - Ob "THEODORE ROOSEVELT" (Georgia Bold 58) ganz ins Bild passt.
6. **Sichtbare Frames messen:** Der Master hat Posterize Time 12. `ton\events_alle.json` gibt für jedes Ereignis `f_sicht` an, berechnet als `ceil(ceil(t*12)*25/12)`.
   - In AE ein paar Frames gegenprüfen: Mündungsblitz 355, Textmarker Missoulian 665, Marker LCT 1030 und 1050, Klick 486 und 1290.
   - Wenn am PC die jsx geändert wurde: erst neu bauen, dann `node ton\events_roosevelt.js` (liest `jsx\build_roosevelt.jsx`).
7. **Ton** (im Ordner `ae-roosevelt`, mit dem Python der earshot-Umgebung `C:\Users\Enrico\Claude\tools\earshot\` (venv; braucht numpy, scipy, ffmpeg im PATH)):
   `node ton\events_roosevelt.js; python ton\sfx_roosevelt.py; python ton\mix_roosevelt.py`
   - `sfx_roosevelt.py` nimmt pro Rolle zuerst `ton\sfx_real\<rolle>_*`, dann `ton\sfx_enno\`, dann `ton\earshot\b_*.wav`.
   - Danach `audio\roosevelt_mix.wav` in AE neu laden (Footage ersetzen/neu laden). Messwerte stehen in `ton\mix_messung.json`.
8. Rendern: `node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-17\ae-roosevelt\jsx\render_roosevelt.jsx 1800000` → `out\roosevelt_vox.mp4`
   - Falls AE abbricht, in zwei Hälften: `render_roosevelt_teile.jsx` → `out\roosevelt_teil1.mp4` + `out\roosevelt_teil2.mp4`
   - Die `HAND_*.jsx` sind dieselben Skripte zum Starten von Hand über Datei > Skripte. Sie schreiben die Antwort zusätzlich nach `out\ergebnis_*.txt`.

AE-Ordner: `Short 17.11. Roosevelt (roosevelt)`. Der Build löscht und ersetzt **nur** diesen Ordner. Der Ordner beethoven bleibt unberührt.
Master-Comp: **`Short 17.11. Roosevelt (roosevelt) (9x16)`**. Die Szenen-Comps heißen `roosevelt 01 hook` … `roosevelt 16 outro`.
- Alle Comps laufen mit 25 fps, beim Bauen auf Viertel-Auflösung. Snap und Render rufen `app.purge` auf.
- Effekte: kein 3D, kein CC Sphere, kein Deep Glow. Quick Chromatic Aberration 3 liegt nur einmal oben im Master.
- Untertitel: ein Wort, Arial Bold 52, weiß, y 1370, Schatten wie in der Vorlage.
- Eck-Logo (98/196, 96 px) bis zum großen Logo (360 px) am Anfang des Outros. Folgen-Klick: "+ Folgen" → "Gefolgt", mittig, ohne ✓.

## Szenen
Jede Szene hat ein vollflächiges, warm/sepia gegradetes Archivfoto mit langsamer Fahrt. Kein Foto wird über 110 % seiner echten Pixel vergrößert: der Mock misst mit Gate Weave, Kamera und Punch höchstens 109 %.
`HAUPT:` = Hauptmittel der Szene. Kein Hauptmittel kommt zweimal hintereinander. Text = Bildschirmtext ohne Untertitel.

| # | Szene (s) | Bild (Quelle) | Mittel auf dem Bild | Text |
|---|---|---|---|---|
| 1 | hook 0–4,56 | Roosevelt spricht, 1912 (LOC 2009633786) | `HAUPT:` Callout aufs Gesicht ab Frame 0; Bleistiftkreis auf die Brust; Punch auf "Mann" | Zähler 0→60+ MIN |
| 2 | name 4,56–8,16 | Portrait, Geo. Prince 1912 (LOC 2013648186) | Callout Gesicht; Name tippt sich; `HAUPT:` Ausschnitt Berryman-Karikatur 1902 "Drawing the line in Mississippi" (LOC 2008678324) rutscht ein, Kreis um den Bären | THEODORE ROOSEVELT, Chip TEDDY |
| 3 | wahl 8,16–11,28 | Menge in Chicago, Bain 1912 (LOC 2014690550) | `HAUPT:` Farbsweep (blau) über die Menge; Punch-Cut | 1912 (getippt) |
| 4 | auto 11,28–13,88 | Roosevelt am offenen Auto, Bain, Negativ "10/14/12" = Tag des Attentats (LOC 2014690852) | Callout; `HAUPT:` Kreis um den Kopf; Punch-Cut | – |
| 5 | schuss 13,88–18,32 | Roosevelt spricht, Bain "Yonkers 10/17/12" (LOC 2009633788) | `HAUPT:` Brand-Übergang; Mündungsblitz + Ringe auf der Brust; Callout; Focus Hunting + Wackler bei "wankt"; Punch bei "stehen" | – |
| 6 | folge 18,32–20,32 | Roosevelt sitzend, American Press Ass. (LOC 93511353) | `HAUPT:` Parallax; Folgen-Klick | – |
| 7 | halle 20,32–24,52 | "The new auditorium, Milwaukee", Postkarte um 1908, Farbe (LOC 2013646928) | Callout; Chip wird rot durchgestrichen; `HAUPT:` Bleistift-Pfeil zur echten Eingangstür; Punch-Cut | Chip KRANKENHAUS |
| 8 | buehne 24,52–27,64 | Roosevelt am Pult, Carnegie Hall 1912 (LOC 90712592) | Callout; `HAUPT:` echte Schlagzeile Daily Missoulian 15.10.1912 rutscht ein, Textmarker auf "DESPITE A WOUND IN THE BREAST," | – |
| 9 | hemd 27,64–30,88 | W. A. Rogers 1912 "We are against his politics but we like his grit" (LOC 2010717717) | Callout; Farbsweep rot auf den Blutfleck; Buchtafel 1912 "Shirts worn by Ex-President Roosevelt" (Internet Archive) rutscht ein; `HAUPT:` Kreis ums Blut | – |
| 10 | tasche 30,88–34,72 | Elbert Martin mit der durchschossenen Rede, Bain 1912 (LOC 2014690861) | Punch auf "Verrückteste"; Callout auf die Papiere; `HAUPT:` Lupe aufs Einschussloch | – |
| 11 | seiten 34,72–36,64 | Manuskriptseite mit 2 Einschusslöchern (Buchtafel 1912, Internet Archive) | `HAUPT:` Zähler-Chip 0→50 SEITEN; Kreise um beide Löcher | 50 SEITEN |
| 12 | etui 36,64–40,88 | **KI-Bild** Brillenetui aus Stahl mit Loch (ElevenLabs) | Callout; Kreis ums ganze Etui; `HAUPT:` roter Strich = Kugelbahn bis ins Loch; Punch auf "gebremst" | Chip STAHL |
| 13 | gerettet 40,88–43,12 | Lake County Times 15.10.1912, S. 1, rechte Spalte (Chronicling America) | `HAUPT:` Textmarker "…Manuscript In Breast Pocket Saved Roosevelt From Instant Death." (2 Zeilen) | – |
| 14 | kugel 43,12–46,32 | Röntgenbild "X-Ray of Roosevelt", Bain 1912 (LOC 2014690853) | `HAUPT:` Kreis um die echte Kugel; Punch-Cut | Zähler 1912→1919 |
| 15 | frage 46,32–47,92 | "Roosevelt speaking" 1912, nachdenklich (LOC 2013651235) | `HAUPT:` Callout Gesicht | ? |
| 16 | outro 47,92–53,80 | Parteitag Chicago, Bain 1912 (LOC 2014691372) | `HAUPT:` Brand-Übergang; Logo 360 px im Kreis; "In der Bio"; Folgen-Klick | In der Bio |

## Prüfungen im Mock
Aufruf: `node gen/aemock.js jsx/build_roosevelt.jsx [--vox] [--text] [--skal]`.
- Ergebnis: `0 Fehler | 0 ABGESCHNITTEN | 0 KNAPP`. Alle Geometrie-Prüfungen haben 0 Treffer (TEXT, FOTO, VOX, GRUND, STIL, LEISTUNG, STRICH, FARBE, RAND, LEER, KLEIN, LOGO, UT, UTNAH, SCHWENK, BLASS, KOLLISION, UNSCHAERFE, HOCHSKALIERT).
- Neu am 17.11.: HOCHSKALIERT ist auf 110 % gesetzt (vorher 125 %).
- TEXT: höchstens 2 Textebenen je Szene, kein Element mit mehr als 3 Wörtern.
- `vorschau.jpg` zeigt 36 Frames als PIL-Näherung (`aemock --render` + `gen/vorschau_render.py`). Kein Glühen, keine Posterize, keine CA. Die Vorschau schneidet beim Namen das letzte "T" ab; in AE ist es da.

## Ton (Zwischenstand aus der Cloud)
`audio/roosevelt_mix.wav`: -14,0 LUFS, True Peak -1,3 dBTP, 48 kHz Stereo, exakt 53,80 s.
- **Stimme**: `audio/roosevelt_voice.wav`. Nur die Stille am Anfang (0,05 s) und am Ende ist gekürzt, keine Lücke ist geschnitten.
- **Musik**: eigene Komposition `ton/music_roosevelt.py`, ernst, aber treibend.
  - C-Moll, 96 bpm, Zupf-Ostinato, Pad, weiche Pauke, Vibraphon-Motiv.
  - Beim Schuss bricht alles ab, nur ein dunkles Pad und ein Herzschlag-Puls bleiben bis zum Folge-Aufruf.
  - Ab "Doch das Verrückteste" wechselt die Musik in Es-Dur-Farbe. Bei kugel/frage wird sie ruhig, auf "Folgen" löst sie sich nach C-Dur auf.
  - Frequency Pocket: 1,9 kHz, Q 0,3, -8 dB. -3 dB Ducking beim Sprechen.
  - **14,5 LU unter der Stimme** (neu, vorher 17).
- **SFX**: 109 Anschläge auf 73 Ereignissen, jeweils auf dem sichtbaren Frame. 20 Ereignisse bleiben mit Begründung stumm (`ton/sfx_events.json`).
  - Jeder Marker- und Bleistiftstrich klingt so lang, wie er sichtbar zeichnet. Jeder Type-on tippt, jeder Zähler tickt.
  - Zeitungen bekommen Whoosh plus Papier plus Tap. Die Buchtafel (Foto) bekommt Verschluss und Fotoabzug. Das erste Foto bekommt einen Verschluss.
  - Schnitte haben einen tiefen Whoosh als J-Cut (3 Frames vorher).
  - Der Schuss ist ein tiefer Einschlag (impact + hit) auf dem Mündungsblitz, kein Revolver-Knall.
  - Nie zweimal dasselbe Sample hintereinander. Hauptereignisse liegen im Median 8 dB unter den Stimmspitzen.
  - Quellen in der Cloud: ennos SFX und die earshot-Bank. Marker und Bleistift sind Code-Platzhalter, weil Freesound die Cloud mit 403 blockt. Mit `ton/sfx_real/` am PC werden sie automatisch ersetzt (Schritt 1 + 7).
  - **CC-BY**: `photodrop_2` = "Paper Rustle and Plop on Wooden Table" von djlprojects (CC BY 3.0). Wenn sie im Mix klingt (`ton/credits_sfx.json`), muss sie in der Videobeschreibung genannt werden.

## Daten und Quellen
- **Wörter**: faster-whisper medium (`gen/asr_whisper.py`, `data/roosevelt-asr.json`). Die ASR passt Wort für Wort zum Skript, ohne Abweichung (150 Wörter).
  - Zusammengeführt: "Brillen etui" → Brillenetui, "weiter geredet" → weitergeredet.
  - Untertitel zeigen "1912" und "50" als Ziffern.
  - `gen/words_roosevelt.py` → `data/words.json`. `gen/gen_roosevelt.py --timeline` → `data/timeline.json`.
- **Bilder**: `gen/quellen_roosevelt.py <dl>` lädt die Masterdateien (LOC tile.loc.gov, Chronicling America IIIF, archive.org). Die Rohdaten liegen nur in der Cloud.
  - `gen/hintergrund_roosevelt.py <dl>` gradet sie und schreibt `archiv/bg-*.jpg`, `archiv/lupe-tasche.jpg`, die Ausschnitte `archiv/zeitung-*.jpg`, `data/grund.json` und `archiv/credits.json`.
- **Nachweise**: alle in `archiv/credits.json` (Titel, Autor, Quelle, Lizenz), plus eine Quellzeile unten rechts je Szene.
  - Gemeinfrei: LOC "No known restrictions", Chronicling America (Zeitungen 1912), Internet Archive: Buch "The attempted assassination of ex-President Theodore Roosevelt" (Milwaukee 1912), Tafeln S. 18 und 24.
  - KI: Etui (ElevenLabs Flow UmpNtfvLKY9bf4cEBvvP, Generation XPubIaNwV3Rwb05fpf3U, 85 Credits).
