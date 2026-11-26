# Vox-Plan Penicillin (Short 27.11.2026, Schluessel `penicillin`)

**Zeiten = PLATZHALTER** (3,6 Woerter/s aus dem Skript, keine Pausen, 133 Woerter, Master 38,16 s; enno 26.11.: Stimme ultra schnell, etwa 35-40 s). Sobald ennos Stimme da ist, kommen sie aus der ASR (`data/words.json`, README „Wenn das Audio da ist“). Die Szenen haengen an Schluesselwoertern; Jahreszahlen sind als Ziffern ODER ausgeschrieben gesucht (1928, 1945).

**Regeln (Lehren Apollo Runde 2 und wright 26.11.)**
- Jedes Vox-Geraet haengt an einem ECHTEN Bildpunkt (Kind des Abzugs/Freistellers, Pixel in `data/bilder.json`, `pts`).
- Mindestens 2 Geraetearten je Szene. Chips nur mit NEUER Info (nicht das, was gerade gesprochen wird), wenig Text.
- Ein Fokus zur Zeit: das vorige Geraet ist weg (`ende`), bevor das naechste kommt.
- Jedes Geraet steht mindestens 8 Frames vor Szenenende fertig (`bis`). Bei der ultra schnellen Stimme lieber streichen als quetschen: gestrichen wurden Chip ST MARY'S HOSPITAL (london), Namens-Chips H. FLOREY / E. CHAIN (oxford), Chip STOCKHOLM und Ringe (nobel).
- Alles mittig (x 540), unten ~300 px und rechts ~120 px frei; Bildquelle senkrecht grau am linken Rand; Untertitel von uns.
- Hintergrund: Graustufen-Collage `archiv/g-*.png` + Tint, Schwarz/Weiss im Wechsel je 2 Szenen (Outro schwarz).
- SFX: ein Ton je Szene (Hauptgeraet `VOX:<art>|HAUPT`) + tiefer Whoosh als J-Cut vor jedem Schnitt.

| # | Szene | Zeit (Platzhalter) | Grund | Bild vorn | Hauptgeraet (Ton) | weitere Geraete | Bildpunkte |
|---|---|---|---|---|---|---|---|
| 1 | hook | 0,00-3,56 | schwarz | p-fleming (Fleming mit Petrischale, Wellcome L0000655) | kreis um die Schale (Bleistift) | chip ALEXANDER FLEMING, Medaille (eigene Vektorgrafik) ploppt auf „Nobelpreis“, punch | schale |
| 2 | london | 3,56-5,12 | schwarz | p-hospital (St Mary's Hospital, Lithografie, Wellcome V0013627) | chip 03.09.1928 (Tap) | nadel auf das Haus, punch auf „1928“ | haus |
| 3 | labor | 5,12-10,20 | weiss | p-labor (Fleming im Labor, LOC 95519946) | kreis um Fleming (Bleistift), endet auf „Urlaub“ | pfeil Tuer -> Fleming („zurueck“), callout auf die Schalen, chip STAPHYLOKOKKEN | fleming, tuer, schalen |
| 4 | schale | 10,20-14,08 | weiss | p-schale (Schale mit Schimmel und klarem Ring, LOC 93510138) | callout auf den Schimmel (Filzstift) | kreis um die Schale (bis „Pilz“), 2 ringe auf „rund“, pfeil Bakterien -> leere Zone, punch | schimmel, bakterien, zone |
| 5 | neugierig | 14,08-17,00 | schwarz | p-stern (LOC 95519957) + f-fleming als Kind | „?“ slam (Schlag) | callout „Stoff“, zaehler 1929 auf „Penicillin“ | mitte |
| 6 | folge | 17,00-18,20 | schwarz | p-flaschen (Forscher mit Kulturflaschen, LOC 97519964) | parallax + Folgen-Knopf (Klick), kurze Federung | followBtn 540/1090 | - |
| 7 | kaum | 18,20-22,40 | weiss | p-portrait (Fleming am Schreibtisch, Harris & Ewing, LOC cph.3a40776) | callout aufs Gesicht (Filzstift) | chip AUFSATZ 1929, p-kultur ploppt auf „Mengen“, rotes kreuz auf „herstellen“ | gesicht |
| 8 | oxford | 22,40-24,92 | weiss | p-oxford (Gruppe mit Florey und Chain, Wellcome L0012312) | kreis Florey (Bleistift) | kreis Chain auf „Oxford“, punch | florey, chain |
| 9 | krieg | 24,92-27,88 | schwarz | p-plakat (Kriegsplakat „A Race against death“, LOC 91483071) | bogen-pfeil vom Wort Penicillin zum Verwundeten (Papier) | chip 1944, kreis um den Soldaten, punch | penicillin, soldat |
| 10 | nobel | 27,88-31,52 | schwarz | f-fleming gross | kreis ums Gesicht (Bleistift), endet auf „Nobelpreis“ | f-florey + f-chain ploppen auf „zusammen“, gruene haken auf „Oxford“, punch | gesicht |
| 11 | frage | 31,52-33,28 | weiss | p-schale | „?“ slam (Schlag) | bahn: gestrichelte Wurfbahn auf „weg“ | schimmel |
| 12 | outro | 33,28-38,16 | schwarz | Logo | logo + Ring 930 (Tap) | followBtn 540/1000 -> „Gefolgt“, „In der Bio“ mit Schatten, camRig | - |

Pruefung (`node gen/aemock.js`): 0 Fehler, 0 ABGESCHNITTEN, 0 KNAPP, 0 SAFE, 0 PFEIL (4 Pfeile), alle anderen Pruefungen 0, VIELFALT ok (15 Geraetearten). Gegenprobe mit gestauchten/gestreckten Platzhaltern (Stimme 35,1 s und 40,0 s): ebenfalls alles 0.
