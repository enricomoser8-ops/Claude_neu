# scenes_apollo.jsx Runde 2 (PC), Kernänderungen
- Mitte kommt über ABZ_DX = 70 in abz()/aQ(); Abzug-x in scenes bleiben, aber kindBild/Zusatzbilder etwas nach innen (Mond 810->740).
- followBtn, camRig, "In der Bio" direkt auf x 540.
- Outro: Logo-Kreis 930x930 in CREAM (hell, Abstand zum Logo); "In der Bio" CREAM + schatten().
- Chips nur NEUE Info: "APRIL 1970" -> "11.04.1970", "SAUERSTOFF" -> "TANK NR. 2" (am Schaden verankert: [P.x+40, P.y-190]), "HOUSTON" -> "MISSION CONTROL", "PAZIFIK" -> "17.04.1970", "2 MENSCHEN" weg, "2 TAGE" -> "3 AN BORD", Chip "NACHGEBAUT" gestrichen.
- Zusätzlicher Kreis auf dem echten Schaden (aKreis an A.P("schaden")).
- Punkte an echten Bildpunkten statt px()-Prozentwerten (über Haise' Kopf).
- Nur EIN Fokus zur Zeit: Kreis/Haken/Lupe-outPoint endet, bevor der nächste Kreis startet (kS.outPoint, hF.outPoint, Lupe bis k.adapter-0.10).
- aFokus (Unschärfe) wirkte auf dem ganzen Abzug wie Unschärfe -> durch aCalloutF ersetzt.
- "?"-Chip weiter in die Ecke (px 0.93/0.10), nicht über Gesichtern.
