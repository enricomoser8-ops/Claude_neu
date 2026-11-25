# Vox-Plan Erster Flug (Short 26.11.2026, Schluessel `wright`)

**Zeiten = PLATZHALTER** (2,6 Woerter/s aus dem Skript, 134 Woerter, Master 60,84 s). Sobald ennos Stimme da ist, kommen sie aus der ASR (`data/words.json`, README „Wenn das Audio da ist“). Die Szenen haengen an Schluesselwoertern; Zahlen sind als Ziffern ODER ausgeschrieben gesucht (1903/neunzehnhundertdrei, 1969, 2021).

**Regeln (Lehren Apollo Runde 2, `../../2026-11-25/ae-apollo/runde2-pc/scenes_lehren.md`)**
- Jedes Vox-Geraet haengt an einem ECHTEN Bildpunkt (Kind des Abzugs/Freistellers, Pixel in `data/bilder.json`, `pts`).
- Chips nur mit NEUER Info (nicht das, was gerade gesprochen wird), wenig Text.
- Ein Fokus zur Zeit: das vorige Geraet ist weg, bevor das naechste kommt.
- Alles mittig (x 540), unten ~300 px und rechts ~120 px frei; Bildquelle senkrecht grau am linken Rand; Untertitel von uns (Stil Beethoven 17.11.).
- Hintergrund: Graustufen-Collage `archiv/g-*.png` + Tint, Schwarz/Weiss im Wechsel je 2 Szenen (Outro schwarz).
- SFX: ein Ton je Szene (Hauptgeraet `VOX:<art>|HAUPT`) + tiefer Whoosh als J-Cut vor jedem Schnitt.

| # | Szene | Zeit (Platzhalter) | Grund | Bild vorn | Hauptgeraet (Ton) | weitere Geraete | Bildpunkte |
|---|---|---|---|---|---|---|---|
| 1 | hook | 0,00-3,72 | schwarz | p-flug (Erstflug 17.12.1903, Ausschnitt) | kreis um den Flyer (Bleistift) | chip 17.12.1903, punch auf „zwoelf“ | flyer, tip_l, tip_r |
| 2 | jumbo | 3,72-8,04 | schwarz | f-jumbo (eigene Vektor-Draufsicht 747-400, 12 px/m) | marker: 37 m quer ueber die Fluegel (Filzstift) | chip 37 m, strich ueber die ganze Spannweite + chip 64 m | m37_l/m37_r, tip_l/tip_r |
| 3 | ort | 8,04-11,96 | weiss | p-lager (Lager Kill Devil Hills 1903, Himmel retuschiert) | lupe auf den Schuppen (Lupe) | chip KILL DEVIL HILLS | schuppen |
| 4 | brueder | 11,96-14,28 | weiss | f-wilbur + f-orville (Portraits, freigestellt) | kreis Wilbur -> kreis Orville (Bleistift) | punch auf „Wright“ | gesicht |
| 5 | gebaut | 14,28-17,12 | schwarz | p-werkstatt (Werkstatt/Motor) | callout auf den Motor (Filzstift) | pfeil Motor -> Kette, punchCut | motor, kette |
| 6 | muenze | 17,12-21,72 | schwarz | p-schiene (Flyer auf der Startschiene) | muenze: Goldmuenze wirbelt (Muenze) | chip „?“ slam, Wilbur-Bild + haken auf „gewinnt“ | schiene |
| 7 | absturz | 21,72-26,12 | weiss | p-sand (Flyer nach Wilburs Fehlversuch 14.12.) | pfeil steil hoch und runter in den Sand (Papier) | chip 14.12.1903, kreis Wilbur, punch | nase, sand |
| 8 | folge | 26,12-28,40 | weiss | p-front (Flyer von vorn) | parallax + Folgen-Knopf (Klick) | followBtn 540/1090 | - |
| 9 | foto | 28,40-35,24 | schwarz | p-erstflug (das beruehmte Foto) | blitz: weisser Fotoblitz (Ausloeser) | kreis Orville, chip J. T. DANIELS (der Helfer), stapel | orville, daniels |
| 10 | dreimal | 35,24-37,28 | schwarz | p-dritter (dritter Flug) | drei punkte (Ticks) | kreis um den Flyer | flyer |
| 11 | letzter | 37,28-40,72 | weiss | p-weit (vierter Flug, weit draussen) | bahn: gestrichelte Flugbahn (Bleistift) | zaehler 0 -> 59 s, chip 260 m | start, ziel |
| 12 | wind | 40,72-45,40 | weiss | p-schaden (Flyer nach dem Windstoss) | wind: drei Bleistift-Wellen + Wackeln (Whoosh) | kreuz, punch | schaden |
| 13 | mond | 45,40-50,84 | schwarz | p-mond (Aldrin, AS11-40-5903) + p-stoff (Musselin) als Kind | pfeil Stoff -> Mondfaehre (Papier) | chip APOLLO 11, punch auf „Mond“ | eagle |
| 14 | mars | 50,84-54,12 | schwarz | p-mars (Ingenuity, PIA25881) | lupe auf das Kabel unter dem Solarpanel (Lupe) | chip INGENUITY, chip 1,3 CM (Stoffgroesse 1,3 x 1,3 cm laut NASA PIA24438) | kabel |
| 15 | outro | 54,12-60,84 | schwarz | Logo | logo + Ring 930 CREAM (Tap) | followBtn 540/1000 -> „Gefolgt“, „In der Bio“ CREAM mit Schatten bei 540, camRig 540 | - |

Pruefung (`node gen/aemock.js`): 0 Fehler, 0 ABGESCHNITTEN, 0 KNAPP, 0 SAFE, 0 PFEIL (4 Pfeile), 0 RAND, 0 UT/UTNAH, VIELFALT ok (21 Geraetearten).
