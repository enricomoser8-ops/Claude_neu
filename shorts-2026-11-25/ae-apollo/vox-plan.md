# Vox-Plan Apollo 13 (Short 25.11.2026, Schluessel `apollo`)

**Zeiten sind Platzhalter.** Sie kommen aus `data/words.json` (Platzhalter mit 2,3 Woertern/s, [kurze Pause] 0,35 s, [Pause] 0,7 s, Satzende +0,15 s).
Nach der echten Stimme verschieben sich alle Zeiten automatisch. Die Szenen haengen an Schluesselwoertern, nicht an festen Sekunden.

**Spalten**
- Bildpunkt-Anker: Pixel im jeweiligen Abzug bzw. Freisteller, wie sie in `archiv/<datei>` liegen (Punkte in `data/bilder.json`, `pts`).
- Hauptgeraet: in der jsx als `VOX:<art>|HAUPT` markiert.
- Hintergrund: Farbfamilie plus drei Duotone-Collagen `archiv/s-<farbe>-*.png` plus Textur `archiv/b-<farbe>.jpg`.
- Kamera: Grunddrift `kamera(c,103)` mit Gate Weave in jeder Szene, dazu was zusaetzlich passiert.
- SFX: Chris Moran, ein Ton je Szene (`ton/sfx_events.json`). Dazu kommt an jedem Schnitt ein tiefer Whoosh als J-Cut, 3 Frames vorher.

| Szene | Zeit (Platzhalter) | Hintergrund-Collage (Farbe + Bilder) | Freisteller | Hauptgeraet | Zweitgeraet | Bildpunkt-Anker (Pixelkoordinaten im Bild) | Kamera | SFX |
|---|---|---|---|---|---|---|---|---|
| 01 hook | 0,00-3,32 | orange: s-orange-rakete, s-orange-sm, s-orange-mond | p-start.jpg (Saturn V, AS13 Start) + f-mond.png als Kind | kreis um die Rakete | pfeil Nase -> Mond, fokus (Focus Hunting), punch auf "Mond" | p-start rakete (360,674), nase (365,271); f-mond mitte (230,230) | Drift 103 + Punch 1,04 auf "Mond" | Bleistift-Kreis 0,52 s |
| 02 klebeband | 3,32-7,52 | teal: s-teal-mcc, s-teal-wolken, s-teal-crew | p-crew.jpg (Lovell, Swigert, Haise) + p-band.jpg (Klebeband-Ausschnitt; KI-Wunsch ki-band) | slam: Klebeband-Abzug schlaegt ein | fokus wandert ueber die drei Gesichter | p-crew lovell (220,233), swigert (461,163), haise (639,326); p-band mitte (164,184) | Drift 103 | dumpfer Schlag 6,12 s |
| 03 april | 7,52-9,24 | papier: s-papier-patch, s-papier-mond, s-papier-jubel | f-patch.png (Missionsabzeichen) | zaehler: Odometer "APRIL 1970" | lupe auf "XIII" (190 px, 1,9x) | f-patch xiii (943,273), mitte (574,574) | Drift 103 | Ticks je sichtbarem Wechsel ab 7,76 s |
| 04 weg | 9,24-14,64 | blau: s-blau-erde, s-blau-meer, s-blau-capcom | f-erde.png + f-mond.png als Kind | bahn: gestrichelte Flugbahn Erde -> Mond | zaehler 0 -> 330.000 km, punch auf "Erde" | f-erde mitte (250,250); f-mond mitte (230,230); Zaehler an f-erde geheftet | Drift 103 + Punch 1,04 auf "Erde" | Bleistift-Bahn 9,52 s |
| 05 explosion | 14,64-17,08 | orange: s-orange-rakete, s-orange-sm, s-orange-mond | p-sm.jpg (beschaedigtes Servicemodul, NASA/MSFC 7010516) | callout: dunkle Flaeche, Schaden bleibt hell | ring auf dem Schaden, chip SAUERSTOFF, fokus, punch | p-sm schaden (404,356); Chip (685,74) | Drift 103 + Punch 1,05 auf "explodiert" | Filzstift-Hervorhebung 16,00 s |
| 06 houston | 17,08-21,04 | violett: s-violett-mcc, s-violett-jubel, s-violett-sm | p-mcc.jpg (Mission Control, Houston) | ringe: drei Funkringe vom Bildschirm | kreis um den Bildschirm, chip HOUSTON, punch | p-mcc schirm (576,155); Chip (205,518) | Drift 103 + Punch 1,04 auf "Problem" | kurzes Funkrauschen 18,20 s (static_1, CC0) |
| 07 folge (CTA) | 21,04-23,48 | ocker: s-ocker-training, s-ocker-mcc, s-ocker-rakete | f-erde.png + f-mond.png (frei) | parallax: Erde und Mond in zwei Tiefen | klick: Folgen-Knopf -> "Gefolgt" (Text mittig) | f-erde mitte (250,250); f-mond mitte (230,230) | Drift 102, Parallax 112/120 % | Mausklick 22,28 s |
| 08 faehre | 23,48-26,88 | teal: s-teal-mcc, s-teal-wolken, s-teal-crew | p-lm.jpg (Mondfaehre Aquarius, Luke) | punkte: drei Crew-Punkte fliegen in die Luke | kreis um die Luke, chip AQUARIUS, punchCut | p-lm luke (318,431); Chip (625,684) | punchCut 1,07 + Drift 103 | Tap je Punkt ab 23,92 s |
| 09 zwei | 26,88-31,48 | violett: s-violett-mcc, s-violett-jubel, s-violett-sm | p-sim.jpg (Haise im Simulator) | zaehler: Odometer "2 MENSCHEN" | punkte (dritter Platz wird rot), Odometer "2 TAGE" (rote Platte) | p-sim Punkte (599,90), (676,90), (753,90); haise (315,305) | Drift 103 | Ticks je Wechsel ab 28,68 s |
| 10 luft | 31,48-33,32 | orange: s-orange-rakete, s-orange-sm, s-orange-mond | p-lovell.jpg (Lovell in der Kabine) | farbsweep: Rot steigt von unten | balken CO2 steigt, chip CO2 | p-lovell Balken-Fuss (752,673), Sweep-Kante y 224-254, gesicht (391,169) | Drift 103 | Filzstift-Flaeche 32,52 s |
| 11 filter | 33,32-35,72 | ocker: s-ocker-training, s-ocker-mcc, s-ocker-rakete | p-filter.jpg (eckiger LiOH-Filter, AS13-62-8929) | stapel: drei Filter-Abzuege fallen | haken "genug", punchCut | p-filter mitte (264,312), Stapel-Versatz (+70,-50) | punchCut 1,06 + Drift 103 | Ticks je Stapel-Abzug ab 33,84 s |
| 12 eckig | 35,72-41,00 | papier: s-papier-patch, s-papier-mond, s-papier-jubel | p-filter.jpg (links) + rundes Loch (Vox-Form, KI-Wunsch ki-loch) | kreuz: "passt nicht" | formen (Rechteck um den Filter, Kreis um das Loch), pfeil Filter -> Loch | p-filter Rahmen (0,0)-(528,624), Pfeil ab (aQ 470,840); Loch an p-filter geheftet | Drift 103 | Bleistift-Kreuz 39,92 s |
| 13 adapter | 41,00-45,16 | blau: s-blau-erde, s-blau-meer, s-blau-capcom | p-proto.jpg (Adapter-Prototyp der Ingenieure) | lupe gleitet Kiste -> Schlauch (1,25x) | kreis um die Kiste | p-proto kiste (351,303), schlauch (439,507) | Drift 102 | leise Papier-Reibung 42,00 s |
| 14 bauplan | 45,16-47,84 | teal: s-teal-mcc, s-teal-wolken, s-teal-crew | p-mailbox.jpg (fertiger "Mailbox"-Adapter) | kreis um das Klebeband | fokus Kasten -> Schlauch -> Band, kreis um den Schlauch | p-mailbox kasten (328,372), schlauch (392,843), band (403,605) | Drift 103 | Bleistift-Kreis 45,60 s |
| 15 funk | 47,84-50,80 | violett: s-violett-mcc, s-violett-jubel, s-violett-sm | p-capcom.jpg (CAPCOM am Mikrofon) | ringe vom Mikrofon | drei haken auf den Papieren (Schritt fuer Schritt), punchCut | p-capcom mikro (517,282), papiere (717,439) | punchCut 1,06 + Drift 103 | kurzes Funkrauschen 48,28 s |
| 16 landung | 50,80-55,52 | blau: s-blau-erde, s-blau-meer, s-blau-capcom | p-splash.jpg (Wasserung mit drei Schirmen) | haken "funktioniert" | kreis um die Schirme, chip PAZIFIK, punch | p-splash Haken (669,533), schirme (458,255), Chip (251,781) | Drift 103 + Punch 1,04 auf "landen" | Bleistift-Haken 51,28 s |
| 17 frage | 55,52-58,28 | ocker: s-ocker-training, s-ocker-mcc, s-ocker-rakete | p-iwo.jpg (Crew auf der USS Iwo Jima) | slam: rotes "?" | fokus ueber die drei Gesichter | p-iwo haise (408,186), lovell (526,321), swigert (625,267); "?" (753,213) | Drift 103 | dumpfer Schlag 57,20 s |
| 18 outro | 58,28-65,56 | papier: s-papier-patch, s-papier-mond, s-papier-jubel | logo.png (rundes Podcast-Logo) | logo springt auf | kreis um das Logo, klick Folgen -> "Gefolgt", Text "In der Bio" | logo mitte (627,627) | camRig 100 -> 102 | Tap 58,44 s |

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
