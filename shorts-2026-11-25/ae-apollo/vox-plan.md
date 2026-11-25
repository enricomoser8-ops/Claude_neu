# Vox-Plan Apollo 13 (Short 25.11.2026, Schluessel `apollo`)

**Zeiten = echte Stimme** (ennos Aufnahme 25.11., 48,7 s; Master 49,32 s). Sie kommen aus `data/words.json` (ASR, gesprochener Text in `data/text_gesprochen.txt`).
Die Szenen haengen an Schluesselwoertern des GESPROCHENEN Texts.

**Spalten**
- Bildpunkt-Anker: Pixel im jeweiligen Abzug bzw. Freisteller, wie sie in `archiv/<datei>` liegen (Punkte in `data/bilder.json`, `pts`).
- Hauptgeraet: in der jsx als `VOX:<art>|HAUPT` markiert.
- Hintergrund (25.11., Chris Moran TikTok 13): Grundplatte `archiv/b-schwarz|weiss.jpg`, Precomp `BG <szene>` mit 2-3 Graustufen-Themenbildern `archiv/g-*.png` (schraeg, angeschnitten), Tint (Schwarz: #111111 / #615E59, Weiss: #A9A6A0 / #F4F1EA, Bildkontrast ~30 %), Grunge `archiv/t-grunge-*.jpg` (Screen 20 % / Multiply 16 %). Schwarz und Weiss wechseln alle 2 Szenen. Auf Weiss sind Linien, Pfeile, Ringe und Formen auf dem Hintergrund dunkel.
- Kamera: Grunddrift `kamera(c,103)` mit Gate Weave in jeder Szene, dazu was zusaetzlich passiert.
- SFX: Chris Moran, ein Ton je Szene (`ton/sfx_events.json`). Dazu kommt an jedem Schnitt ein tiefer Whoosh als J-Cut, 3 Frames vorher.

| Szene | Zeit (echte Stimme) | Hintergrund-Collage (Schwarz/Weiss + Bilder) | Freisteller | Hauptgeraet | Zweitgeraet | Bildpunkt-Anker (Pixelkoordinaten im Bild) | Kamera | SFX |
|---|---|---|---|---|---|---|---|---|
| 01 hook | 0,00-2,32 | SCHWARZ: Graustufen-Collage g-rakete, g-mond, g-erde + Tint + Grunge | p-start.jpg (Saturn V, AS13 Start) + f-mond.png als Kind | kreis um die Rakete | pfeil Nase -> Mond, fokus (Focus Hunting), punch auf "Mond" | p-start rakete (360,674), nase (365,271); f-mond mitte (230,230) | Drift 103 + Punch 1,04 auf "Mond" | Bleistift-Kreis 0,28 s |
| 02 klebeband | 2,32-5,16 | SCHWARZ: Graustufen-Collage g-crew, g-training, g-mcc + Tint + Grunge | p-crew.jpg (Lovell, Swigert, Haise) + p-band.jpg (Klebeband-Ausschnitt; KI-Wunsch ki-band) | slam: Klebeband-Abzug schlaegt ein | fokus wandert ueber die drei Gesichter | p-crew lovell (220,233), swigert (461,163), haise (639,326); p-band mitte (164,184) | Drift 103 | dumpfer Schlag 4,28 s |
| 03 april | 5,16-6,88 | WEISS: Graustufen-Collage g-patch, g-rakete + Tint + Grunge | f-patch.png (Missionsabzeichen) | zaehler: Odometer "APRIL 1970" | lupe auf "XIII" (190 px, 1,9x) | f-patch xiii (943,273), mitte (574,574) | Drift 103 | Ticks je sichtbarem Wechsel ab 5,36 s |
| 04 weg | 6,88-10,96 | WEISS: Graustufen-Collage g-erde, g-mond, g-rakete + Tint + Grunge | f-erde.png + f-mond.png als Kind | bahn: gestrichelte Flugbahn Erde -> Mond | zaehler 0 -> 330.000 km, punch auf "Erde" | f-erde mitte (250,250); f-mond mitte (230,230); Zaehler an f-erde geheftet | Drift 103 + Punch 1,04 auf "Erde" | Bleistift-Bahn 7,20 s |
| 05 explosion | 10,96-12,80 | SCHWARZ: Graustufen-Collage g-sm, g-mond + Tint + Grunge | p-sm.jpg (beschaedigtes Servicemodul, NASA/MSFC 7010516) | callout: dunkle Flaeche, Schaden bleibt hell | ring auf dem Schaden, chip SAUERSTOFF, fokus, punch | p-sm schaden (404,356); Chip (685,74) | Drift 103 + Punch 1,05 auf "explodiert" | Filzstift-Hervorhebung 11,76 s |
| 06 houston | 12,80-15,60 | SCHWARZ: Graustufen-Collage g-mcc, g-capcom, g-mcc2 + Tint + Grunge | p-mcc.jpg (Mission Control, Houston) | ringe: drei Funkringe vom Bildschirm | kreis um den Bildschirm, chip HOUSTON, punch | p-mcc schirm (576,155); Chip (205,518) | Drift 103 + Punch 1,04 auf "Problem" | kurzes Funkrauschen 13,84 s (static_1, CC0) |
| 07 folge (CTA) | 15,60-17,56 | WEISS: Graustufen-Collage g-erde, g-mond, g-jubel + Tint + Grunge | f-erde.png + f-mond.png (frei) | parallax: Erde und Mond in zwei Tiefen | klick: Folgen-Knopf -> "Gefolgt" (Text mittig) | f-erde mitte (250,250); f-mond mitte (230,230) | Drift 102, Parallax 112/120 % | Mausklick 16,76 s |
| 08 faehre | 17,56-19,76 | WEISS: Graustufen-Collage g-sm, g-mond, g-training + Tint + Grunge | p-lm.jpg (Mondfaehre Aquarius, Luke) | punkte: drei Crew-Punkte fliegen in die Luke | kreis um die Luke, chip AQUARIUS, punchCut | p-lm luke (318,431); Chip (625,684) | punchCut 1,07 + Drift 103 | Tap je Punkt ab 17,76 s |
| 09 zwei | 19,76-22,84 | SCHWARZ: Graustufen-Collage g-training, g-crew + Tint + Grunge | p-sim.jpg (Haise im Simulator) | zaehler: Odometer "2 MENSCHEN" | punkte (dritter Platz wird rot), Odometer "2 TAGE" (rote Platte) | p-sim Punkte (599,90), (676,90), (753,90); haise (315,305) | Drift 103 | Ticks je Wechsel ab 20,76 s |
| 10 luft | 22,84-24,12 | SCHWARZ: Graustufen-Collage g-sm, g-mcc + Tint + Grunge | p-lovell.jpg (Lovell in der Kabine) | farbsweep: Rot steigt von unten | balken CO2 steigt, chip CO2 | p-lovell Balken-Fuss (752,673), Sweep-Kante y 224-254, gesicht (391,169) | Drift 103 | Filzstift-Flaeche 23,28 s |
| 11 filter | 24,12-25,76 | WEISS: Graustufen-Collage g-training, g-capcom + Tint + Grunge | p-filter.jpg (eckiger LiOH-Filter, AS13-62-8929) | stapel: drei Filter-Abzuege fallen | haken "genug", punchCut | p-filter mitte (264,312), Stapel-Versatz (+70,-50) | punchCut 1,06 + Drift 103 | Ticks je Stapel-Abzug ab 24,52 s |
| 12 eckig | 25,76-28,36 | WEISS: Graustufen-Collage g-patch, g-sm + Tint + Grunge | p-filter.jpg (links) + rundes Loch (Vox-Form, KI-Wunsch ki-loch) | kreuz: "passt nicht" | formen (Rechteck um den Filter, Kreis um das Loch), pfeil Filter -> Loch | p-filter Rahmen (0,0)-(528,624), Pfeil ab (aQ 470,840); Loch an p-filter geheftet | Drift 103 | Bleistift-Kreuz 27,68 s |
| 13 adapter | 28,36-31,52 | SCHWARZ: Graustufen-Collage g-mcc, g-capcom, g-training + Tint + Grunge | p-proto.jpg (Adapter-Prototyp der Ingenieure) | lupe gleitet Kiste -> Schlauch (1,25x) | kreis um die Kiste | p-proto kiste (351,303), schlauch (439,507) | Drift 102 | leise Papier-Reibung 29,36 s |
| 14 bauplan | 31,52-34,80 | SCHWARZ: Graustufen-Collage g-training, g-mcc2 + Tint + Grunge | p-mailbox.jpg (fertiger "Mailbox"-Adapter) | kreis um das Klebeband | fokus Schlauch -> Plastiktuete -> Karton (gesprochen 25.11.), kreis um den Schlauch | p-mailbox schlauch (392,843), tuete (420,181), kasten (328,372), band (403,605) | Drift 103 | Bleistift-Kreis 31,76 s |
| 15 funk | 34,80-39,60 | WEISS: Graustufen-Collage g-capcom, g-mcc, g-jubel + Tint + Grunge | p-capcom.jpg (CAPCOM am Mikrofon) | ringe vom Mikrofon | drei haken auf den Papieren (Schritt fuer Schritt), chip NACHGEBAUT auf "baut" (neuer Satz 25.11.), punchCut | p-capcom mikro (517,282), papiere (717,439); Chip (257,517) | punchCut 1,06 + Drift 103 | kurzes Funkrauschen 35,00 s |
| 16 landung | 39,60-42,52 | WEISS: Graustufen-Collage g-meer, g-wolken, g-crew + Tint + Grunge | p-splash.jpg (Wasserung mit drei Schirmen) | haken "funktioniert" | kreis um die Schirme, chip PAZIFIK, punch | p-splash Haken (669,533), schirme (458,255), Chip (251,781) | Drift 103 + Punch 1,04 auf "landen" | Bleistift-Haken 39,84 s |
| 17 frage | 42,52-44,20 | SCHWARZ: Graustufen-Collage g-jubel, g-crew, g-meer + Tint + Grunge | p-iwo.jpg (Crew auf der USS Iwo Jima) | slam: rotes "?" | fokus ueber die drei Gesichter | p-iwo haise (408,186), lovell (526,321), swigert (625,267); "?" (753,213) | Drift 103 | dumpfer Schlag 43,52 s |
| 18 outro | 44,20-49,32 | SCHWARZ: Graustufen-Collage g-patch, g-mond, g-erde + Tint + Grunge | logo.png (rundes Podcast-Logo) | logo springt auf | kreis um das Logo, klick Folgen -> "Gefolgt", Text "In der Bio" | logo mitte (627,627) | camRig 100 -> 102 | Tap 44,36 s |

## Regeln, die der Mock prueft (`node gen/aemock.js`)

- Kein Hauptgeraet kommt zweimal hintereinander. Jede Szene hat mindestens 2 Geraetearten nacheinander, insgesamt sind es 21 Arten.
- voxSauce laeuft in jeder Szene. Es gibt immer nur einen Fokus zur Zeit.
- Hoechstens 2 Textebenen je Szene mit je hoechstens 3 Woertern. Getippt wird nur 1 Wort.
- Pfeilspitzen sitzen auf dem Schaft-Ende, entlang der End-Tangente (PFEIL: Abstand unter 3 px, Winkel unter 5 Grad).
- Safe Zone 1080x1920:
  - alles innerhalb x 45-1031 / y 114-1543
  - oben Mitte (x 313-763) frei bis y 216
  - unter y 956 Inhalt nur bis x 887
  - Band y 1290-1460 frei (Untertitel kommen in CapCut)
- Rundes Logo oben links, bis zum Outro.
- Nichts ist selbst gezeichnet ausser sauberen Vox-Elementen (Kreise, Pfeile, Chips, Formen).
