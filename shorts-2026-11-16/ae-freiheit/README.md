# Short 16.11. Freiheitsstatue (Hintergrund-Vox, key `freiheit`)

"Short 2 · Die Freiheitsstatue war nicht immer grün" – 9:16, 1080x1920, **25 fps**, 49,88 s.
Gleiches Skript, gleiche `data/words.json`, gleiche Untertitel und gleiches Timing wie am 13.11.; Ton `audio/freiheit_mix.wav` unverändert.

## Bauen auf dem PC
Ordner auf dem PC: `C:\Users\Enrico\Claude\Podcast-Shorts\tage\2026-11-16\ae-freiheit\`
(die Pfade sind in den jsx fest auf diesen Ordner gesetzt).

1. In AE 2023 **Kurzvideos.aep** öffnen. Der Build baut in das offene Projekt.
2. Von `C:\Users\Enrico\Claude` aus:
   - Optional zuerst: `node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-16\ae-freiheit\jsx\plugin_check.jsx 900000`
     (listet u. a. Quick Chromatic Aberration 3 = `PEQCAGL`; CC Sphere wird nicht mehr gebraucht)
   - `node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-16\ae-freiheit\jsx\build_freiheit.jsx 900000`
     Erwartete Antwort: `0 Fehler | 0 ABGESCHNITTEN | 0 KNAPP | alle Effekte da`
   - Stills zum Prüfen (73 Stück): `node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-16\ae-freiheit\jsx\snap_freiheit.jsx 900000`
     → `out\png\frei_*.png` (Name = Zeit in 1/100 s)
   - Rendern: `node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-16\ae-freiheit\jsx\render_freiheit.jsx 900000` → `out\freiheit_vox.mp4`
   - Rendern in zwei Hälften (falls AE beim Rendern am Stück abbricht):
     `node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-16\ae-freiheit\jsx\render_freiheit_teile.jsx 900000`
     → `out\freiheit_teil1.mp4` (0–25 s) und `out\freiheit_teil2.mp4` (25 s–Ende), danach zusammenfügen.
   Die `HAND_*.jsx` sind dieselben Skripte zum Starten von Hand (Datei > Skripte); sie schreiben die Antwort zusätzlich nach `out\ergebnis_*.txt`.

AE-Ordner: `Short 16.11. Freiheitsstatue (freiheit)`. Der Build löscht und ersetzt **nur** diesen Ordner; alles andere in Kurzvideos.aep bleibt unberührt.
Master-Comp: **`Short 16.11. Freiheitsstatue (freiheit) (9x16)`**, Szenen-Comps `freiheit 01 hook` … `freiheit 16 outro`. Alle Comps 25 fps,
beim Bauen auf **Viertel-Auflösung**.
Untertitel (ein Wort, Arial Bold 52, weiß, y 1370, zwei Drop Shadows 230/135°/3/16 + 90/135°/0/40) und rundes Eck-Logo (98/196, 96 px) unverändert
(das Eck-Logo geht jetzt mit dem großen Logo zu Beginn der Schluss-Szene weg).

### Snap / Render (Speicher)
- Snap und Render rufen `app.purge(PurgeTarget.ALL_CACHES)` am Anfang auf, der Snap zusätzlich alle 20 Stills und am Ende.
- Der Snap stellt die Master-Comp nur währenddessen auf **Halb** und danach wieder auf die vorige Auflösung.
- Render: Vorlage H.264 `Match Render Settings - 40 Mbps`, bricht ab, wenn die Comp nicht 25 fps hat. Andere Aufträge der Renderliste werden
  nur abgehakt (nicht gelöscht). `render_freiheit_teile.jsx` (`TEILE = true`, `SPLIT = 25`) rendert beide Hälften nacheinander, mit Purge dazwischen.

## Neuer Stil: Hintergrund-Vox (16.11.)
Globus (CC Sphere) und Papierkarte sind ganz raus. Jede Szene liegt auf einem **vollflächigen Hintergrundfoto** (echte Archivfotos der
Library of Congress, kein KI-Hintergrund) mit langsamer Ken-Burns-Fahrt (Zoom + Drift), abgedunkelt, warm/Sepia gegradet, mit Vignette –
Ansatz wie beim Kleopatra-Short. Das Grading ist **in die JPGs eingebacken** (keine Effekte auf dem Hintergrund); in AE gibt es pro Szene
den Regler `Grund Abdunklung (Regler)` (schwarze Fläche, Deckkraft = Abdunklung) und den Untertitel-Verlauf `FIX UT-Schatten`.
Der Einstieg (hook) ist ein Flug über den Hafen auf Liberty Island: drei Ausschnitte desselben Luftbilds (weit/mittel/nah) mit gemeinsamer Fahrt.
Darüber voller Vox-Stil: Abzüge mit weißem Rand und Schatten, Linien, Pfeile, Zahlen, Chips, Stempel, Textmarker, Bleistiftkreise,
Zeitungsausschnitte, Freisteller, Nadeln mit Faden. Keine selbst gezeichneten Gegenstände; echte Menschen nur als echte Fotos (Gustave Eiffel);
KI-Bilder nur für Gegenstände (Statue in Kupfer, Kupfermünze, Farbeimer, Patina-Makro). Die KI-Statue trägt die Leiste "KI-REKONSTRUKTION",
die immer **oben** liegt (auch über der grünen Statue).

Fixes vom 13.11. übernommen: Fotos "heute grün" und Patina bleiben farbig (kein Schwarzweiß), der rote Strich geht mittig und ganz durch
"HEUTE: GRÜN", das Kreuz deckt den ganzen Eimer, die Leiste KI-REKONSTRUKTION liegt über der Statue.

Leistung: kein CC Sphere, keine 3D-Ebenen/Kamera, kein Deep Glow, keine großen Weichzeichner. Quick Chromatic Aberration 3 (`PEQCAGL`) nur
**einmal**: oberste Einstellungsebene im Master (`Master CA ...`). Korn nur einmal im Master (ADBE Noise), Flackern = Exposure-Ausdruck.
Hintergründe max. 2200 px lange Seite, JPG.

| # | Szene | Zeit (s) | Hintergrund (Quelle LOC) | Vordergrund |
|---|-------|----------|--------------------------|-------------|
| 1 | hook | 0,00–4,00 | Luftbild Liberty Island + Manhattan (Highsmith, 2017882052), Flug in 3 Stufen | "New York", Nadel, Foto heute + Faden, Chip HEUTE: GRÜN mit rotem Strich, "?" |
| 2 | braun | 4,00–7,04 | Stich "Re-constructing the statue on Bedloe's Island" 1886 (99614141) | 1886, Kupfer-Statue (KI), Chip KUPFERBRAUN, Kupfermünze (KI) |
| 3 | geschenk | 7,04–10,16 | Kopf der Statue, Weltausstellung Paris 1878 (97502744) | "Paris, 1878", Kachel 29 Cu, Abzug Paris 1883, FRANKREICH → USA |
| 4 | haut | 10,16–12,64 | Werkstatt Paris, Kupfer wird getrieben (97502750) | Detail-Abzug, "Kupferhaut", "≈ 2,4 mm", Münzen |
| 5 | eiffel | 12,64–17,36 | Gerüst in Paris (2020634761) | Gerüst-Plan 1881, Porträt Eiffel, Eiffelturm 1889, Kreis "Halt" |
| 6 | folge | 17,36–18,88 | Statue im Hafen um 1890 (2016801649) | Folgen-Knopf + Klick |
| 7 | regen | 18,88–21,20 | Statue mit Wolken um 1910 (2016814203) | Statue (KI), Chip KUPFER, Luft / Regen |
| 8 | patina | 21,20–24,08 | Kupfer-Gewand heute, Nahaufnahme (Highsmith, 2011630662) | Statue wird grün, 1886 → 1906, Chip GRÜN, Patina-Makro (KI) |
| 9 | rost | 24,08–28,00 | Photochrom um 1905 (2008679689) | 1906, Zeitung Evening Journal 1906 + Textmarker "Rusted", SO GRÜN, ROST? |
| 10 | kongress | 28,00–30,96 | Kapitol Washington 1902 (2025164878) | echter Zeitungsausschnitt 1906 ("Congress … $62,800") + Textmarker, Nadel, US-KONGRESS, "$", Farbeimer (KI) |
| 11 | protest | 30,96–32,32 | Zeitungsseite Evening Journal 17.10.1906 S. 3 (Chronicling America) | Farbeimer, Stempel NEIN! / PROTEST! / NICHT ANSTREICHEN! |
| 12 | pruefen | 32,32–34,32 | Luftbild Statue nah (Highsmith, 2017882051) | Patina-Abzug, GRÜNE SCHICHT, Lupe |
| 13 | ergebnis | 34,32–37,60 | Krone heute, Nahaufnahme (Highsmith, 2011630662) | Ergebnis: Patina / Kupfer, SCHÜTZT, "darunter" |
| 14 | bleibt | 37,60–41,68 | Hafen nah (wie hook) | Eimer rot durchgekreuzt + NICHTS GESTRICHEN, dann Foto heute, Kreis, BIS HEUTE: GRÜN |
| 15 | frage | 41,68–44,24 | Statue mit Wolken um 1905 (2016799950) | Kupfer-Statue (KI) + Foto grün, "?", BRAUN / GRÜN |
| 16 | outro | 44,24–49,88 | Luftbild Liberty Island (Highsmith, 2011632948) | großes Logo, "In der Bio", Folgen-Knopf |

## Neu erzeugen (Cloud, Reihenfolge)
1. `gen/words_freiheit.py`: ASR + Skript → `data/words.json`, `data/text_gesprochen.txt`, `audio/freiheit_voice.wav` (unverändert seit 13.11.)
2. `gen/archiv_freiheit.py <dl>`: Abzüge zuschneiden, KI-Freisteller, `archiv/credits.json` (unverändert seit 13.11.)
3. `gen/hintergrund_freiheit.py <dl>`: LOC-Downloads → `archiv/bg-*.jpg` (Ausschnitt, ≤ 2200 px, Grading eingebacken), `data/grund.json`
   (Fahrt-Keys je Szene), Zeitungsausschnitt `archiv/zeitung-1906-kongress.jpg`, Einträge `bg-*` in `archiv/credits.json`.
   Bricht ab, wenn ein Ausschnitt über 120 % hochskaliert würde.
4. `gen/gen_freiheit.py` → `data/timeline.json`, `jsx/build_freiheit.jsx`, `snap`, `render`, `render_teile`, `HAND_*`
5. Ton (nur bei Änderungen): `ton/music_freiheit.py`, `ton/sfx_freiheit.py`, `ton/mix_freiheit.py` → `audio/freiheit_mix.wav`
6. Probelauf: `cd gen && node aemock.js ../jsx/build_freiheit.jsx` (auch `../jsx/HAND_build_freiheit.jsx`)
   → `0 Fehler | 0 ABGESCHNITTEN | 0 KNAPP`, Geometrie alle 0.
   Neu im Mock (16.11.): **GRUND** (in jedem Frame deckt ein Hintergrundfoto mit voller Deckkraft 0..1080 x 0..1920, auch während der Fahrt),
   **STIL** (Eck-Logo + Untertitel unverändert), **LEISTUNG** (max. 1 QCA, nur oben im Master; kein CC Sphere/Deep Glow/3D/große Blurs),
   **STRICH** (Strich geht ganz und mittig durch sein Ziel, Kreuz deckt das ganze Ziel), **LEISTE** (KI-REKONSTRUKTION über jeder Statue),
   **FARBE** (kein Schwarzweiß/Tint auf Farbfotos), echte Ebenen-Reihenfolge. PLANRAND (Karte) entfällt.

## Bildnachweise
`archiv/credits.json` (alle gemeinfrei: Library of Congress inkl. Carol M. Highsmith Archive und Chronicling America; KI-Bilder als solche markiert).
Im Bild steht je Szene eine kleine Quellenzeile unten rechts. Für 16.11. wurden keine neuen KI-Bilder erzeugt.

## Nicht ohne AE prüfbar
- Wie hell/warm die Hintergründe in AE wirken (Cloud-Vorschau mit PIL sah gut aus). Nachregeln je Szene über `Grund Abdunklung (Regler)`.
- Der Hook-Flug nutzt beim mittleren Ausschnitt bis 119 % der echten Pixel (kurz, in Bewegung).
- Snap/Render mit Purge und die Zwei-Hälften-Variante sind nur im Mock geprüft (Syntax), nicht in AE.
