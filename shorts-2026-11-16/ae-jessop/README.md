# Short 16.11. Titanic-Stewardess (Hintergrund-Vox, key `jessop`)

"Diese Frau saß auf der Titanic, als sie sank …" – 9:16, 1080x1920, **25 fps**, 54,68 s. Vorlage: Hintergrund-Vox Runde 2 (ae-freiheit).
Der Name der Stewardess wird weder gezeigt noch gesagt. Es gibt kein Foto von ihr: Wikimedia und Flickr sind aus der Cloud gesperrt, deshalb fehlt der optionale Abzug.
Es gibt keine KI-Bilder und keine selbst gezeichneten Objekte.

## Bauen auf dem PC
Ordner auf dem PC: `C:\Users\Enrico\Claude\Podcast-Shorts\tage\2026-11-16\ae-jessop\`. Die Pfade sind in den jsx fest auf diesen Ordner gesetzt.

1. In AE 2023 **Kurzvideos.aep** öffnen. Der Build baut in das offene Projekt.
2. Die Befehle laufen von `C:\Users\Enrico\Claude` aus:
   - Optional zuerst: `node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-16\ae-jessop\jsx\plugin_check.jsx 900000`
   - `node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-16\ae-jessop\jsx\build_jessop.jsx 900000`
     Erwartete Antwort: `0 Fehler | 0 ABGESCHNITTEN | 0 KNAPP | alle Effekte da`
   - Stills zum Prüfen (71 Stück): `node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-16\ae-jessop\jsx\snap_jessop.jsx 900000`
     → `out\png\jess_*.png`. Der Dateiname ist die Zeit in 1/100 s.
   - Rendern: `node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-16\ae-jessop\jsx\render_jessop.jsx 900000` → `out\jessop_vox.mp4`
   - Rendern in zwei Hälften, falls AE am Stück abbricht:
     `node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-16\ae-jessop\jsx\render_jessop_teile.jsx 900000`
     → `out\jessop_teil1.mp4` und `out\jessop_teil2.mp4`
   - Die `HAND_*.jsx` sind dieselben Skripte zum Starten von Hand über Datei > Skripte. Sie schreiben die Antwort zusätzlich nach `out\ergebnis_*.txt`.

AE-Ordner: `Short 16.11. Titanic-Stewardess (jessop)`. Der Build löscht und ersetzt **nur** diesen Ordner.
Master-Comp: **`Short 16.11. Titanic-Stewardess (jessop) (9x16)`**. Die Szenen-Comps heißen `jessop 01 hook` … `jessop 15 outro`. Alle Comps laufen mit 25 fps, beim Bauen auf Viertel-Auflösung.
Snap und Render rufen `app.purge(ALL_CACHES)` auf. Effekte: kein 3D, kein CC Sphere, kein Deep Glow. Quick Chromatic Aberration 3 liegt nur einmal oben im Master.
Untertitel: ein Wort, Arial Bold 52, weiß, y 1370. Das Eck-Logo (98/196, 96 px) bleibt bis zum großen Logo (360 px) am Anfang des Outros.

## Ton
`audio/jessop_mix.wav` hat -14,0 LUFS und einen True Peak von -1,6 dBTP.
- **Stimme**: `audio/jessop_voice.wav`, nur Stille am Anfang und Ende getrimmt. Keine Lücke ist geschnitten.
- **Musik**: eigene Komposition `ton/music_jessop.py`, D-Moll, 80 bpm, Zupf-Ostinato, Pad und Vibraphon.
  - Britannic bis Sprung dunkler, ab dem Twist F-Dur-Farbe, D-Dur-Schluss auf "Folgen".
  - 17 LU unter der Stimme, Senke bei 1,9 kHz, −3 dB Ducking.
- **SFX**: 20 Ereignisse aus der earshot-Bank (`ton/earshot/*.wav`, Befehle im Kopf von `ton/sfx_jessop.py`) plus `click_real` für die beiden Folgen-Klicks.
  - Jedes Ereignis sitzt auf einem sichtbaren Ereignis (Liste: `ton/sfx_events.json`).
  - Prüfung mit `earshot timeline`: 95 % der Cues haben eine Flanke im Umkreis von 100 ms, Median 30 ms.
- Neu mischen: `python3 ton/music_jessop.py; python3 ton/sfx_jessop.py; python3 ton/mix_jessop.py`

## Szenen
Jede Szene hat ein vollflächiges, warm gegradetes Archivfoto mit langsamer Fahrt. Alle Hilfsmittel wirken auf dieses Foto.
Mittel-Abkürzungen: `HAUPT:` = Hauptmittel der Szene, kein Hauptmittel kommt zweimal hintereinander. `Text:` = Bildschirmtext ohne Untertitel, höchstens 2 je Szene.

| # | Szene (s) | Foto | Mittel auf dem Foto | Text |
|---|---|---|---|---|
| 1 | hook 0–2,5 | Deck der Titanic 1912 | `HAUPT:` Callout auf die Schornsteine; Pfeil; Punch auf "sank" | 1912, TITANIC |
| 2 | einzig 2,5–5,0 | Titanic + Olympic auf der Helling | `HAUPT:` Kreis um das echte Schild "OLYMPIC"; Callout; Punch | Zähler 1→3× |
| 3 | gaeste 5,0–8,6 | Speisesaal 1. Klasse (Olympic) | `HAUPT:` Fokus-Unschärfe wandert über die Tische; Callout Tisch | Chip 1. KLASSE |
| 4 | olympic 8,6–12,8 | Olympic mit Schleppern 1911 | `HAUPT:` Callout Schiff; Pfeil; Punch | 1911, OLYMPIC |
| 5 | hawke 12,8–17,6 | Olympic auf See | `HAUPT:` Anfahrt-Strich aufs Heck; Ringe beim Aufprall; grüner Kreis "bleibt oben"; Zeitung 20.9.1911 mit Marker HAWKE / Quarter | Chip HMS HAWKE |
| 6 | titanic 17,6–21,0 | Newark Evening Star 15.4.1912 | Callout + Kreis auf das Titanic-Foto der Seite; Reißschwenk; `HAUPT:` Marker ICEBERG | Zähler-Chip 0→7 MONATE |
| 7 | baby 21,0–25,5 | Rettungsboote 1912 | `HAUPT:` Lupe auf die Menschen im Boot; Callout; Punch | Chip BOOT 16 |
| 8 | folge 25,5–27,5 | Olympic-Postkarte, Farbe | `HAUPT:` Parallax, das Schiff löst sich; Klick "+ Folgen" → "Gefolgt" | – |
| 9 | britannic 27,5–34,0 | Lazarettschiff Britannic (Rotkreuz-Karte) | Callout; das Kreuz wird rot (Farbsweep, Screen); `HAUPT:` Kreis ums Kreuz; Pfeil; Punch | 1916, BRITANNIC |
| 10 | mine 34,0–35,5 | Evening World 22.11.1916 | `HAUPT:` Brand-Übergang aus britannic; Marker BRITANNIC; Punch auf "reißt" | – |
| 11 | schrauben 35,5–38,6 | Titanic-Schrauben im Dock 1911 | `HAUPT:` Fokus von den Arbeitern zur Nabe; drehende Wirbel-Pfeile um die echte Nabe; Route-Pfeil; Punch | – |
| 12 | springt 38,6–42,8 | Überlebende im Rettungsboot 1912 | Sprung-Pfeil; Ringe im Wasser; `HAUPT:` Callout aufs Boot bei "überlebt" | Chip NICHTSCHWIMMERIN |
| 13 | twist 42,8–47,0 | Olympic am Pier | Callout; `HAUPT:` Messlinie längs des Rumpfs als Zeitleiste; Punch | Zähler 1920→1950 |
| 14 | frage 47,0–48,8 | Farbtafel Olympic 1911 | `HAUPT:` Callout Schiff | ? |
| 15 | outro 48,8–54,7 | Olympic im Hafen von New York | `HAUPT:` Brand-Übergang aus frage; Logo 360 px im Kreis; Folgen-Klick | In der Bio |

## Prüfungen im Mock
Aufruf: `node gen/aemock.js jsx/build_jessop.jsx [--vox] [--text]`. Der Mock lief auf build und HAND_build mit diesem Ergebnis:
- 0 Fehler, 0 ABGESCHNITTEN, 0 KNAPP
- Geometrie: in allen Prüfungen 0 Treffer (TEXT, FOTO, VOX, GRUND, STIL, LEISTUNG, STRICH, FARBE, RAND, LEER, KLEIN, LOGO, UT, UTNAH, SCHWENK, BLASS, KOLLISION, UNSCHAERFE, HOCHSKALIERT)

Neu ist die Prüfung **TEXT**:
- höchstens 2 Textebenen je Szene, ohne Untertitel, Logo, Bildquelle und Folgen-Knopf
- kein Element mit mehr als 3 Wörtern
- kein getippter Satz

Vorschau: `vorschau.jpg` zeigt 17 Frames. Sie entsteht mit `aemock --render` und `gen/vorschau_render.py` und ist eine PIL-Näherung.

## Daten und Quellen
- **Stimme**
  - Die ASR (faster-whisper medium, `gen/asr_whisper.py`) passt Wort für Wort zum Skript.
  - Abweichungen gibt es nur in der Schreibweise: "1911" statt "Neunzehnhundertelf" und "Britannik" statt "Britannic".
  - `gen/words_jessop.py` erzeugt `data/words.json` mit 151 Wörtern.
- **Bilder**: `gen/quellen_jessop.py` lädt sie herunter, `gen/hintergrund_jessop.py` gradet sie. Die Rohdaten liegen nur in der Cloud.
  - Das Grading ist warmes Sepia mit einer Helligkeit von 0,27–0,51.
  - Kein Bild wird über 110 % seiner echten Pixel vergrößert.
- **Nachweise**: alle in `archiv/credits.json` (Titel, Quelle, Lizenz), plus eine Quellzeile unten rechts je Szene. Alle Quellen sind gemeinfrei.
  - LOC: Detroit Publishing, Bain, American Red Cross, Titanic-Schrauben
  - Chronicling America: Evening World 1911 und 1916, Newark Evening Star 1912
  - Internet Archive: The Shipbuilder 1911, Mowbray 1912
- Twist-Zähler 1920→1950: Sie fuhr ab etwa 1920 wieder zur See, bis in die 1950er (Wikipedia de/en). Im Ton heißt es nur "viele Jahre".
