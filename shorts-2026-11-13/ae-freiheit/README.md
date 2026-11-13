# Short 13.11. Freiheitsstatue (Karten-Vox-Stil, key `freiheit`)

"Short 2 · Die Freiheitsstatue war nicht immer grün" – 9:16, 1080x1920, **25 fps**, 49,88 s.

## Bauen auf dem PC
Ordner auf dem PC: `C:\Users\Enrico\Claude\Podcast-Shorts\tage\2026-11-13\ae-freiheit\`
(die Pfade sind in den jsx fest auf diesen Ordner gesetzt).

1. In AE 2023 das Zielprojekt öffnen (tiktoks.aep). Ist kein gespeichertes Projekt offen, legt der Build `Short-freiheit-Vox.aep` im Ordner an.
2. Von `C:\Users\Enrico\Claude` aus:
   - Optional zuerst: `node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-13\ae-freiheit\jsx\plugin_check.jsx 900000`
     (prüft u. a. **CC Sphere** und listet seine Parameter-Namen)
   - `node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-13\ae-freiheit\jsx\build_freiheit.jsx 900000`
     Erwartete Antwort: `0 Fehler | 0 ABGESCHNITTEN | 0 KNAPP | alle Effekte da` (+ eine Zeile `HINWEIS Globus: geprueft: ...`, siehe unten)
   - Stills zum Prüfen (72 Stück, halbe Auflösung, dichter im Globus-Sturzflug):
     `node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-13\ae-freiheit\jsx\snap_freiheit.jsx 900000` → `out\png\frei_*.png` (Name = Zeit in 1/100 s)
   - Rendern: `node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-13\ae-freiheit\jsx\render_freiheit.jsx 900000` → `out\freiheit_vox.mp4` (bricht ab, wenn die Comp nicht 25 fps hat)
   Die `HAND_*.jsx` sind dieselben Skripte zum Starten von Hand (Datei > Skripte); sie schreiben die Antwort zusätzlich nach `out\ergebnis_*.txt`.

AE-Ordner: `Short 13.11. Freiheitsstatue (freiheit)` (mit Assets/Bausteine/Szenen (freiheit)). Der Build löscht und ersetzt **nur** diesen Ordner; andere Shorts in tiktoks.aep bleiben unberührt.
Master-Comp: **`Short 13.11. Freiheitsstatue (freiheit) (9x16)`**, Szenen-Comps `freiheit 01 hook` … `freiheit 16 outro`. Alle Comps 25 fps.
Ton: `audio\freiheit_mix.wav` (Stimme + eigene Musik + SFX, -14,0 LUFS, -1,6 dBTP) wird in den Master importiert.
Untertitel (ein Wort, Arial Bold 52, weiß, y 1370, zwei Drop Shadows 230/135°/3/16 + 90/0/40), rundes Eck-Logo (98/196, 96 px),
Folgen-Klick in der Mitte und Schluss mit großem Logo + "In der Bio" wie bisher.

## Neuer Stil: Karten-Vox
Rückgrat ist eine Vox-Papierkarte (Natural Earth / US Census): beige Land, graublaues Meer, Papiertextur (multipliziert),
Ländernamen mittig in Serif, feines Korn und leichtes Kanten-Kochen ("Karte Leben"). Eine Welt-Kamera ("Kamera Welt", Null)
fährt über die Karte; Striche, Nadeln, Labels und Abzüge behalten dabei ihre Bildschirmgröße (Ausdrücke STRICHFEST / KONSTGROESSE).
Archivfotos sind Vox-Abzüge (weißer Rand, Schatten), die mit Faden an ihre Nadel auf der Karte gehängt werden. Nur Karte, Linien,
Pfeile, Nadeln, Routen, Zahlen, Labels, Textmarker, Bleistiftkreise, Zeitungsausschnitte und Freisteller – keine selbst gezeichneten Gegenstände.
Echte Menschen nur als echte Fotos (Gustave Eiffel). KI-Bilder nur für Gegenstände; die Kupfer-Statue trägt die Leiste "KI-REKONSTRUKTION".

| # | Szene | Zeit (s) | Inhalt |
|---|-------|----------|--------|
| 1 | hook | 0,00–4,00 | Satelliten-Globus (CC Sphere, NASA Blue Marble) im All dreht sich auf die US-Ostküste, Sturzflug: Globus → Satellitenbild → nahtlos Papierkarte Hafen New York. "New York", Nadel Liberty Island, Foto heute (Highsmith) mit Faden, Chip HEUTE: GRÜN, roter Strich, rotes "?" |
| 2 | braun | 4,00–7,04 | Jahreszahl 1886 rollt, Kupfer-Statue (KI-Rekonstruktion), Chip KUPFERBRAUN, Kupfermünze (KI) |
| 3 | geschenk | 7,04–10,16 | Element-Kachel 29 Cu, Schwenk über den Atlantik; Abzug Paris 1883 an Nadel Paris, Frankreich/USA eingefärbt, Route Paris → New York, Quellenbalken "Paris 1883" |
| 4 | haut | 10,16–12,64 | Detail-Abzug Werkstatt Paris, Pfeil "Kupferhaut", "≈ 2,4 mm", zwei Münzen |
| 5 | eiffel | 12,64–17,36 | Eiffels Gerüst-Plan 1881, Porträt Gustave Eiffel (Quellenbalken), Eiffelturm 1889, Kreis "Halt" |
| 6 | folge | 17,36–18,88 | Atlantik-Übersicht mit Route, Folgen-Knopf + Klick |
| 7 | regen | 18,88–21,20 | Statue, Chip KUPFER, Labels Luft / Regen |
| 8 | patina | 21,20–24,08 | Statue färbt sich von unten grün, Zähler 1886 → 1906, Chip GRÜN, Patina-Makro (KI) |
| 9 | rost | 24,08–28,00 | 1906, Zeitungsausschnitt Evening Journal (Wilmington, 17.10.1906) mit Textmarker auf "Rusted", Chip SO GRÜN, Stempel ROST? |
| 10 | kongress | 28,00–30,96 | Karte Nordost-USA, Nadel Washington, Chip US-KONGRESS, "$" / "Geld frei", Farbeimer (KI) |
| 11 | protest | 30,96–32,32 | Stempel NEIN! / PROTEST! / NICHT ANSTREICHEN! |
| 12 | pruefen | 32,32–34,32 | Patina-Abzug, Chip GRÜNE SCHICHT, Lupe |
| 13 | ergebnis | 34,32–37,60 | "Ergebnis:", Schichten Patina / Kupfer, Schutzlinie, Chip SCHÜTZT, Textmarker "darunter" |
| 14 | bleibt | 37,60–41,68 | Eimer rot durchgekreuzt + Stempel NICHTS GESTRICHEN, dann Hafen mit Foto heute, grüner Kreis, Chip BIS HEUTE: GRÜN |
| 15 | frage | 41,68–44,24 | Kupfer-Statue links, Foto grün rechts, "?", Chips BRAUN / GRÜN |
| 16 | outro | 44,24–49,88 | großes Logo, "In der Bio", Folgen-Knopf + Klick |

## Neu erzeugen (Cloud, Reihenfolge)
1. `gen/words_freiheit.py`: ASR + Skript → `data/words.json`, `data/text_gesprochen.txt`, `audio/freiheit_voice.wav`
2. `gen/karte_freiheit.py <ordner mit Natural-Earth/Census-Dateien>` → `data/karte.json` (Hafen/Nordost-USA orthographisch, Atlantik Plattkarte)
3. `gen/globus_freiheit.py` → `tex/globus_ny.jpg` (+ gespiegelt), `tex/satellit_ny.jpg`, `data/globus.json`; `gen/papier_freiheit.py` → `tex/papier_karte.jpg`
4. `gen/archiv_freiheit.py`: Archivbilder zuschneiden, KI-Freisteller, `archiv/credits.json`
5. `gen/gen_freiheit.py` → `data/timeline.json`, `jsx/build_freiheit.jsx`, `snap/render`, `HAND_*`
6. `ton/music_freiheit.py`, `ton/sfx_freiheit.py`, `ton/mix_freiheit.py` → `audio/freiheit_mix.wav` (danach Schritt 5 nicht nötig, Ton-Pfad steht fest)
7. Probelauf: `cd gen && node aemock.js ../jsx/build_freiheit.jsx` (auch `../jsx/HAND_build_freiheit.jsx`)
   → `0 Fehler | 0 ABGESCHNITTEN | 0 KNAPP`, Geometrie alle 0 (PLANRAND, FPS, RAND, LEER, KLEIN, LOGO, UT, UTNAH, SCHWENK, BLASS, KOLLISION, UNSCHAERFE, HOCHSKALIERT).
   Neu in aemock: CC Sphere, Welt-Kamera mit KONSTGROESSE, PLANRAND (Kartenmeer/Satellitenbild deckt das Bild), FPS (alles 25).

## Ton
- Musik `ton/music_freiheit.py`: eigener heller Doku-Puls, 104 bpm, E-Moll (Zupf-Ostinato, Pad, Vibraphon hoch); Kongress/Protest luftiger;
  ab "Ihr Ergebnis" klares G-Dur. 17 LU unter der Stimme, Sprach-Senke 1,9 kHz, -3 dB Ducking.
- SFX `ton/sfx_freiheit.py`: 21 Ereignisse, jedes auf einem sichtbaren Ereignis (Liste mit Frames: `ton/sfx_events.json`).
  earshot-Renderings liegen in `ton/earshot/` (Befehle im Kopf des Skripts), dazu ennos click_real/pop_real und eigene Synthese.
- Mix `ton/mix_freiheit.py`: -14,0 LUFS integriert, True Peak -1,6 dBTP.

## Bildnachweise
`archiv/credits.json` (alle gemeinfrei: Library of Congress, NASA, Natural Earth, US Census; KI-Bilder als solche markiert).
Im Bild steht je Szene eine kleine Quellenzeile unten rechts.

## Nicht ohne AE prüfbar
- **Globus-Ausrichtung**: Der Build prüft die CC-Sphere-Ausrichtung selbst (sampleImage auf 4 Land/Meer-Punkte, normal/gespiegelt, Drehrichtung)
  und meldet `HINWEIS Globus: geprueft: Textur …, Grunddrehung …, Drehrichtung …`. Steht dort `Pruefung ohne Treffer, Standard benutzt`, bitte die Stills
  `frei_00020`–`frei_00140` ansehen
  (NY muss am Ende der Drehung mittig stehen, Norden oben).
- CC-Sphere-Parameternamen (Radius, Light Height/Direction, Ambient/Diffuse/Specular) – plugin_check listet sie; fehlt einer, steht `PARAM ...` im Log.
- Wie nahtlos der Wechsel Satellitenbild → Papierkarte bei 1,10–1,26 s wirkt (Cloud-Vorschau sah gut aus).
- Lesbarkeit der weißen Untertitel auf der hellen Papierkarte (gleicher Doppelschatten wie Kleopatra Runde 4).
