# Vox-Handbuch nach Chris Moran (Stand 11.11.2026)

Quelle: 21 TikToks, 3 YouTube-Videos ("How VOX Directs Your Attention", "How VOX breaks the Digital Feel", "The VOX Sound Design System"), das Video "Install and Use" (Focus-Skript) und sein komplettes Asset-Paket (9 Projektdateien, 14 Presets, Focus.jsx, Texturen, Footage).
Detailnotizen mit allen Werten und Zeitstempeln: `notizen/` (tiktoks-a.md, tiktoks-b.md, yt1-attention.md, yt2-digitalfeel.md, yt3-sound.md). Transkripte: `transkripte/`. Ausgelesene Effekte und Expressions seiner Projektdateien: `assets-auslese.md`.
Ergänzt (ersetzt nicht) `../vox-playlist/vox-stil-after-effects.md` und `../vox-tutorials-neu/00-ueberblick.md`.

---

## 1. Diagnose: Warum unsere Folgen noch "eintönig" wirken

Abgleich mit unserem Folge-41-Generator (`folge-41-einstein-quantenphysik/video-ae/generator/`):

| Baustein laut Chris Moran | Folge 41 |
|---|---|
| Posterize Time 12 über allem | ja |
| Noise/Korn | ja (Noise, nicht Add Grain) |
| Roughen Edges | nur auf einer Pinselstrich-Maske, nicht auf Linien/Pfeilen |
| Chromatic Aberration über allem | **fehlt** |
| Belichtungsflackern (Exposure-wiggle) | **fehlt** |
| Gate Weave (Bildstand-Zittern) | **fehlt** |
| Edge Boil (Linien wabern 4x pro Sekunde) | **fehlt** |
| Papier/Off-White als Hintergrund | ja (Papierfotos, #F6F0E1) |
| Halftone- und Lichtleck-Overlay | **fehlt** |
| Blicklenkung | teilweise (Marker, Pfeile, Kreise); es fehlen Contrast Callout, Focal Blur, Text Contrast, Doppler, Highlighter-Regeln |
| Kamera-Punch mit Speed-Spitze genau auf dem Schnitt ("Cutting the Curve") | **fehlt** |
| Focus Hunting (Fokus-Atmen beim Auftauchen) | **fehlt** |
| Einheitliche Archiv-Behandlung (Footage Homogenization) | teilweise (Schwarz-Weiß) |
| Screen-/CRT-Behandlung für Bildschirme, Fernseher, Digitalisate | **fehlt** |
| Reveals wie Page Turn, Burn Film, Parallax-Fotos | **fehlt** |
| Sound: Hierarchie, tiefer Whoosh, gestapelte Papier-SFX, EQ-Loch in der Musik | teilweise |

Kurz: Uns fehlt nicht ein Effekt, sondern die **analoge Unvollkommenheit über allem** (Chris: "never fully digital") und die **Abwechslung der Blicklenkung**. Unsere Bilder bewegen sich nur glatt-digital (Zoom), bei Vox atmet, flackert, zittert und fokussiert jedes Bild leicht, und jede Szene lenkt den Blick auf eine andere Art.

---

## 2. Die zehn Säulen des Vox-Stils (nach Wichtigkeit)

### Säule 1: Die "Vox Sauce" über jeder Comp (tt02, tt08, tt17, Flicker-Assets)
Eine Adjustment-Ebene ganz oben, Effekte in dieser Reihenfolge:
1. **Quick Chromatic Aberration 3** (kostenloses Plugin), Channels Red & Blue, Position **0.8** bei Grafik, **1.2** bei Bildschirmen, **2.0** bei Archivmaterial. Mehr wirkt "amateurhaft".
2. **Posterize Time 12** (Standard, "cutting on twos"). **8** für Collage-, Papier- und Seitenwechsel-Momente.
3. **Exposure**-Flackern, Expression auf "Exposure": `wiggle(24,.05)` (Archiv), `wiggle(24,.08)` (Bildschirm; gesprochen "2408", vermutlich .08), `wiggle(14,.2)` (alter Film, tt17), `wiggle(24,.2)` (sehr stark, HeavyFlicker.ffx). Alternativ seine Expression mit `flickerStrength = 0.02..0.04` (läuft in der Praxis pro Frame, holdTime wird nicht benutzt).
4. **Add Grain**: Viewing Mode **Final Output**, Intensity **0.3** (Grafik) bis **1.0** (Archiv), Size **1.0** bzw. **1.4**, Softness 1.
5. **Transform**-Effekt als Gate Weave, Position-Expression: `posterizeTime(24); wiggle(6,1)` (fein) oder `wiggle(12,2)` (sichtbar). Seine GateWeave.ffx: `seedRandom(Math.floor(time*24),true); value + [random(-1.5,1.5), random(-1.5,1.5)]`, dazu Scale leicht über 100 % (unser Wert: 101-102 %, nicht von ihm belegt), damit keine Ränder blitzen.
6. Optional **Glow** mit `wiggle(2,.2)` (vermutlich auf Intensity) (Flicker and Glow.ffx).

### Säule 2: Material statt Fläche (tt13, tt14, tt22, yt2)
- **Hintergrund nie reines Weiß**: **#FDFAF3** (warmes Off-White). Erst dann werden Overlay-Texturen überhaupt sichtbar.
- **Papier echt machen**: Opacity **95 %**, Curves Weißpunkt ca. **−10 %**, **Tint** Map White To **#FFFBF2** (warm) oder leicht kühl, Fasertextur als Overlay, zwei Papierebenen übereinander (obere 90 %), damit die Rückseite durchscheint.
- **Dunkle Hintergründe**: Bilder-Collage precomposen, **Tint** Black → sehr dunkles Grau (#0A0A0A bis #1A1A1A), White → leicht abgedunkelt; Kratzer-/Staubtextur darüber.
- **Raster-Linien** (Grid) mit **Roughen Edges Border 0.3**.
- **Halftone-Textur** (Texturelabs Grunge 340 bzw. sein ScannedHalftone.jpg) in **Overlay**, herunterskaliert.
- **Lichtleck** (Texturelabs LensFX, im Paket LensFX_216L) in **Add**, leicht.
- **Lumetri-Vignette** dezent auf der Sauce-Ebene.

### Säule 3: Lebendige Linien, "Edge Boil" (tt11, tt15, yt1, Pencil/Pen Look.ffx)
- Pfad mit Pen Tool absichtlich unregelmäßig, **Stroke 5**, **Trim Paths End 0 → 100 in ca. 24 Frames**, nur leichtes Easing.
- **Roughen Edges**: Border **etwa halbe Strichbreite oder etwas mehr** (bei Stroke 5 wählt er **3.5**; zu groß, z. B. 8, und der Strich verschwindet), Edge Sharpness 1, Complexity 2, **Random Seed = `time*4`** (4 neue Konturen pro Sekunde).
- Zweite Roughen-Edges-Instanz mit kleinerer Scale für Kreide-Look, oder **Turbulent Displace** Amount 80 / Size 2 plus zweite Instanz Amount 15 / Size 52 (tt15; als fertiges Preset: Pencil Look.ffx).
- Blend Mode **Multiply**, damit die Linie hinter dem Text liegt.
- Weg-Animation: Trim Paths **Start** 0 → 100.

### Säule 4: Blicklenkung, pro Szene eine andere Art (yt1, tt03)
Vier Grundarten: etwas **hinzufügen**, den Rest **zurücknehmen**, **Schärfe gegen Unschärfe**, **Kamera-Punch**.
- **Contrast Callout** (Karten, Fotos): Adjustment mit **Curves**, Schwarzpunkt auf ca. 50 % Output hochziehen (alles wird blass), **invertierte, weich gefederte Maske** um das Ziel. **Harter Schnitt, keine Einblendung.** Dazu Label (Serif weiß auf dunklem Kasten, kleines X).
- **Text Contrast**: Textkopie unten Opacity 100 → **20 %**, Null mit Scale 100 → **110 %**, obere Kopie mit Rechteckmaske auf die Schlüsselwörter, **Linear Wipe** Angle **270°**, Feather **55**, Completion 100 → 0, kurz **nach** dem Zoom.
- **Focal Callout**: unsichtbare Shape-Ebene "gradient map" (Radial Gradient, Weiß Mitte), Adjustment mit **Compound Blur**, Blur Layer = gradient map, **Invert Blur**, Stretch Map to Fit, Maximum Blur ca. **15** (Karte) bzw. **24** (Foto-Randunschärfe). Start Point des Gradienten wandert mit langem, starkem Easing von Ort A zu Ort B.
- **Highlighter**: nur auf **Fließtextzeilen**, nie auf Überschriften. Stroke **25**, Multiply, Trim Paths **ohne starkes Easing** (der Zuschauer liest mit), zwei Turbulent Displace (Size 2 kräftig, große Size schwach). Zeilen gestaffelt nacheinander.
- **Doppler/Reichweite**: eingebauter Effekt **Radio Waves**, weiß, Start Width 8, End Width 0-1, Profil **Sawtooth In**, als 3D-Ebene flach gekippt, plus Compound Blur und CA 0.8. Für Ausbreitung (Funk, Truppen, Seuchen, Nachrichten).
- **Farbbetonung**: Gelb poppt auf (Text Animator Fill Color), blendet dann zu Anthrazit zurück. Rot nur für Nummern/Punkte.
- **Regel**: nie mehrere Textanimationen gleichzeitig; pro Szene mindestens zwei verschiedene Callout-Arten.

### Säule 5: Bewegung und Schnitt (tt02, tt04, tt19, yt1)
- **Lange, weiche Ease-Outs: 1 bis 2 Sekunden**, steiler Start ("Spitze links").
- **Cutting the Curve**: Bewegung mit sehr starkem Easing (Influence ca. **97 %**), **Schnitt genau im Geschwindigkeitsmaximum**, das zweite Bild ist an die gleiche Null geparentet und läuft weiter. Bewegungsunschärfe/Posterize verdecken den Schnitt.
- **Kamera-Punch an den Schnitt koppeln**: Controller-Null, Keys ca. **7 Frames vor** und **21 Frames nach** dem Schnitt, Scale 100 → ca. **124 %**, Speed-Spitze exakt auf dem Schnitt-Frame, Sound genau auf den Schnitt.
- **Focus Hunting** (tt10, Focus.jsx): im Video sanft: Fast Box Blur 0 → 4 → 6 → 0 px, Iterations 3. Im Skript stärker: Adjustment mit **Fast Box Blur**, Iterations **8**, Radius-Keys **0 / 8 / 18 / 5 / 0** bei Frame **0 / 4 / 8 / 13 / 18**. Beim Zoom-Modus Master-Null Scale mit Ease Influence **80 %**, Blur startet 10 Frames nach Zoomstart. Am besten, wenn etwas ins Bild kommt oder man hineinzoomt.
- **Langsamer Foto-Zoom** 100 → 109 → **115 %** über die ganze Einstellung (tt21).

### Säule 6: Archivmaterial vereinheitlichen, "Footage Homogenization" (tt12, tt21, yt2, FootageTreatments.aep)
Über alle Fotos und Clips dieselbe Kette, damit Material aus 1905 und 1955 wie aus einem Guss wirkt:
1. **Randunschärfe**: Fast Box Blur **6** mit invertierter, weich gefederter Ellipsenmaske (oder Compound Blur mit Map, Max **24**).
2. **CC Ball Action**, Grid Spacing **0** (feines Bildschirm-Pixelraster).
3. Quick Chromatic Aberration **2**.
4. Exposure `wiggle(24,.05)`.
5. Add Grain, Final Output, Size **1.4**.
6. **Film Dust** (Grunge-Staubtextur auf Schwarz) in **Screen** + Vignette.
Optional: alles in Schwarz-Weiß zwingen, wenn Farbe und S/W gemischt sind.

### Säule 7: Bildschirme, Fernseher, Digitalisate (tt05, yt2, CRT-Template, Screen-Presets)
- **Screen Treatment**: Venetian Blinds (Completion **5 %**, Direction **90°**, Width **8**, Feather **1**), zweite Kopie mit **180°** für Pixelgitter, **Solid Composite** schwarz, CA **1.2**, Lumetri-Vignette, Exposure `wiggle(24,.08)`. Dazu langsame Kamerafahrt über den Screen.
- **Einfache Variante** (tt05): vertikale Scan-Lines-Textur in Color Dodge oder Overlay, ca. 50 %, CA deutlich höher als bei Grafik, dezente Vignette.
- Fertige Presets im Paket: **Retro Computer_Screen.ffx** (Venetian Blinds, CC Lens, CA, Curves, Exposure-Flicker), **Modern Laptop_Screen.ffx**.
- **CRT-Template** (CRT Emulation_Template.aep / .mogrt): echter, abgefilmter Röhrenfernseher. Regler: Flicker Strength, Downsample %, Overlay Intensity, Smudges Strength, Footage Scale/Position, Fine Tune. Die Datei ist mit AE 2025 gespeichert (in AE 2023 nicht zu öffnen), die .mogrt ist für Premiere. Für Wochenschau- und Fernseharchiv bauen wir es per Skript nach: sein TVFootage.mp4 plus die ausgelesene Regler-Logik.

### Säule 8: Physische Übergänge und Reveals (tt16, tt18, tt20)
- **Seite umblättern**: **CC Page Turn**, Back Page = dieselbe Ebene, Back Opacity **85**, Fold Radius **50**, darüber Posterize Time **8**.
- **Karten-Reveal**: Gebietsform in **Overlay** auf die Karte, Karte Saturation **−15**, Reveal mit **CC Burn Film** Burn **100 → 45 → 0** (Random Seed 180), Textur darüber, leichte Wolken.
- **Parallax-Foto**: Foto in Vorder-, Mittel-, Hintergrund zerlegen (verdeckte Stellen auffüllen), mit dem kostenlosen Skript **Depth** (50 mm, Layer Spacing 1000, Camera Null) oder per Skript in 3D staffeln, Kamera-Null langsam seitlich schieben.
- Bekannt und weiter gültig: Papierriss, Pop-up-Unfold, Ink Bleed (InkBleed.aep).

### Säule 9: Typografie-Animation (tt07, Text-Presets)
- Presets im Paket: **FillAnimation** (Gelb-Pop), **AppearRandom** (Buchstaben in zufälliger Reihenfolge), **LoadUp**, **Text Jitter** (Buchstaben zittern: `posterizeTime(fps); seedRandom(textIndex+123+Math.floor(time*fps),true); random(-jitter,jitter)`), **Film Title Treatment** (Kino-Titel mit Glow, Grain, Film-Jitter 12x pro Sekunde, 1,2 px).
- **Odometer** für Zahlen: Range Selector Offset −100 % → 0 %, Ziffern rollen ein.
- Kombination wie bei Vox: kursive Serif + kräftige Grotesk in Versalien, ein Schlüsselwort groß.

### Säule 10: Sound (tt06, tt09, yt3)
- **Hierarchie**: pro Szene nur das **wichtigste** Ereignis vertonen. Pfeile, kleine Texte, Unterstreichungen bleiben stumm.
- **Tiefe Whooshes**, bei Wiederholung per Tonhöhe/Tempo variieren (nie zweimal identisch hintereinander).
- **Stapeln**: Whoosh + Papier + Uhr-Tick; Texturen deutlich leiser als der Whoosh.
- **Taktile Sounds**: Papier, Filzstift, Kamera-Auslöser, Kassette, Schalter ("circuit breaker" auf einem harten Callout-Schnitt).
- **J-Cut**: Szenen-SFX beginnen ein paar Frames **vor** dem Bild.
- **Bibliothek ordnen** wie er: Mechanical, Tech, Tactile, Ambience, Whooshes, Miscellaneous, Dateinamen `Kat_Typ NN`.
- **Ambience** nur als kurzer, sehr leiser Ausschnitt passend zum Motiv (Projektor-Brummen bei Archivfilm).
- **Pegel** (Spitzen, Premiere): Stimme ca. −6 dB, Musik ca. −20 dB, SFX −10 bis −20 dB.
- **"Frequency Pocket"**: auf der Musik eine breite EQ-Senke im Sprachbereich (ca. **1,9 kHz, Q 0,3, −6 dB**, bis −20 dB testen), danach Stimme prüfen. Bei uns per ffmpeg: `equalizer=f=1900:t=q:w=0.3:g=-6`.
- **Musik**: leichte, hohe Instrumente (Marimba, Pizzicato), dokumentarisch, nicht im Frequenzbereich der Stimme.

---

## 3. Baustein-Katalog für unseren AE-Generator

So übersetzen wir das in unsere JSX-Bausteine (neu zu bauen, Werte siehe oben):

| Baustein | Einsatz in der Geschichtsdoku |
|---|---|
| `voxSauce(comp, typ)` | jede Comp; typ = grafik / screen / archiv steuert CA, Flicker, Grain |
| `paperBase()` | #FDFAF3, Grid mit Roughen 0.3, Halftone Overlay, Lichtleck Add, Vignette |
| `realPaper(layer)` | Zeitungen, Briefe, Urkunden: 95 %, Curves, Tint warm, Fasern, Doppelseite |
| `pencil(path, farbe)` | Unterstreichen, Kreisen, Pfeile mit Edge Boil |
| `highlighter(zeilen)` | Zitate, Zeitungs-Fließtext, gestaffelt |
| `contrastCallout(maske)` | Land, Stadt, Gesicht im Gruppenfoto; harter Schnitt + Schalter-SFX |
| `textContrast(wörter)` | Schlüsselbegriffe in einem Satz, Namen in Listen |
| `focalBlur(a, b)` | Blick wandert über Karte oder Foto |
| `doppler(ort)` | Ausbreitung, Reichweite, Funk, Nachrichten |
| `punchCut(t)` | Kamera-Punch mit Speed-Spitze auf dem Schnitt |
| `focusHunt(t)` | wenn ein Foto, Dokument oder Text ins Bild kommt |
| `homogenize(clip)` | alle Archivfotos und -filme |
| `screenTreat()` / `crt()` | Digitalisate, Archiv-Webseiten, Wochenschau im Röhrenfernseher |
| `pageTurn()` / `burnReveal()` / `parallax()` | Kapitelwechsel, Karten, große Archivfotos |
| `odometer(zahl)` / `yellowPop(wort)` | Jahreszahlen, Opferzahlen, Geldbeträge, Schlüsselwörter |

---

## 4. Plugins, Assets, Versionen

**Wichtig: Seine Projektdateien (.aep) sind mit After Effects 2024, 2025 und 2026 gespeichert. After Effects 2023 kann sie nicht öffnen** (AE-Projekte sind nicht abwärtskompatibel). Die Presets (.ffx) aus 2024 bis 2026 laden in 2023 meist, aber nicht sicher. Das ist kein großes Problem: Aus den Dateien sind Effektnamen, Ebenen- und Reglernamen und alle Expressions wörtlich ausgelesen (`assets-auslese.md`), die Zahlenwerte kommen aus den Videos und aus Focus.jsx. Wir bauen alles per Skript nach. Nur wenn enno die Originalprojekte selbst öffnen möchte, bräuchte er AE 2024 oder neuer.

| Was | Nötig? | Kosten |
|---|---|---|
| **Quick Chromatic Aberration 3** (Plugin Everything) | **ja**, steckt in fast jedem seiner Projekte und ist Teil der Sauce. Ohne Installation lässt unser Skript den Effekt weg | kostenlos |
| Alles andere (Posterize Time, Exposure, Add Grain, Transform, Roughen Edges, Turbulent Displace, Compound Blur, Fast Box Blur, Venetian Blinds, Solid Composite, CC Ball Action, CC Page Turn, CC Burn Film, Radio Waves, Lumetri, Tint, Curves, Linear Wipe, CC Lens, Glow, Hue/Saturation; "VISINF Grain Implant" in den Dateien ist das eingebaute Add Grain) | in AE 2023 eingebaut | – |
| Motion 4 (Mt. Mograph) | nein, Easing setzen wir per Skript | kostenpflichtig |
| Depth (Yat Fung Leung) | optional für Parallax, wir können per Skript staffeln | kostenlos |
| Focus.jsx (im Paket) | optional, wir bauen den Effekt per Skript nach | kostenlos |
| Texturelabs-Texturen | im Paket: Paper 300XL, Paper 338L, LensFX 216L, ScannedHalftone; weitere (Grunge 340/353) kostenlos auf texturelabs.org | kostenlos |
| Soundly (Gratis-Tarif), Freesound | optional für SFX | kostenlos |
| Google Earth Studio | optional für Satelliten-Kamerafahrten | kostenlos |
| Deine vorhandenen 8-9 Plugins (u. a. Boris FX/BCC) | schick mir die Liste, vielleicht ist Quick CA schon dabei | – |
| Schriften seiner Demos (Chromatic Pro, Knockout, Bebas Neue) | nein | – |

---

## 5. Neue Regeln und offene Entscheidungen
- **Sync der Soundeffekte**: Chris sagt, SFX dürfen ein paar Frames daneben liegen. Unsere Regel aus Folge 41 ist "frame-exakt auf sichtbare Ereignisse". **Wir bleiben bei frame-exakt** (enno-Regel), übernehmen aber J-Cut und Hierarchie.
- **Rote Quellen-Labels** (weiße Versalien auf rotem Balken, z. B. "LANCASTER COTTON MILL / NOVEMBER 1908"): ist ein Bildunterschrift-Balken, kein Stempel. Muss enno entscheiden, weil er roten Stempeltext verboten hat.
- Unklar, im Test festlegen: Vignette-Stärke, Maskenfeather, genaue Maximum-Blur-Werte, Länge der Draw-Off-Animation.

## 6. Nächster Schritt
Bausteine aus Abschnitt 3 in den JSX-Generator einbauen und als **Stil-Probe** ein kurzes Stück (z. B. 4 Szenen: Zeitung, Karte, Archivfoto, Zahl) in AE bauen, bevor die nächste Folge gebaut wird.
