# Weltkrieg-Short (12.11.) – "Der Erste Weltkrieg beginnt mit einem Auto, das falsch abbiegt"

9:16, 1080x1920, 30 fps, 50,27 s (Stimme 48,94 s + Auslauf). After Effects 2023 (Windows).

## Auf dem PC

Ordner: `C:\Users\Enrico\Claude\Podcast-Shorts\tage\2026-11-12\ae-weltkrieg\` (diesen ganzen Ordner dorthin kopieren).

In `C:\Users\Enrico\Claude`:

```
node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-12\ae-weltkrieg\jsx\plugin_check.jsx 60000      (optional: Effekte vorhanden?)
node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-12\ae-weltkrieg\jsx\build_weltkrieg.jsx 900000
node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-12\ae-weltkrieg\jsx\snap_weltkrieg.jsx 900000   (68 Standbilder nach out\png\wk_*.png)
node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-12\ae-weltkrieg\jsx\render_weltkrieg.jsx 1800000 (out\weltkrieg_vox.mp4)
```

Ohne Node: in AE `Datei > Skripte > Skriptdatei ausfuehren` mit den `jsx\HAND_*.jsx`-Versionen.

- Build baut in das offene, gespeicherte Projekt (sonst `Weltkrieg-Short.aep` im Ordner) und ersetzt nur den eigenen obersten Ordner
  **`WK Weltkrieg-Short 12.11.`** (Unterordner `WK Assets`, `WK Bausteine`, `WK Szenen`, Szenen-Comps `WK 01 hook` … `WK 19 outro`).
  Der Kleopatra-Short bleibt unberuehrt.
- Master-Comp: **`WK Weltkrieg-Short 12.11. (9x16)`**
- Rendern: H.264, Vorlage **"Match Render Settings - 40 Mbps"** (render_weltkrieg.jsx waehlt sie, sonst H.264-Standard).
- Ton liegt fertig gemischt im Master: `audio\weltkrieg_mix.wav` (-14,0 LUFS, -1,59 dBTP).
- Rueckgabe des Builds: `0 Fehler | 0 ABGESCHNITTEN | 0 KNAPP | alle Effekte da` (Node-Probelauf mit gen/aemock.js).

## Ordner

- `jsx/` vox_lib.jsx (Vorlage, ab Runde 2 angepasst: focalBlur, focusHunt, homogenize, credit, fxGet, inkReveal) + lib/scenes/main_weltkrieg.jsx -> build_weltkrieg.jsx (generiert), snap, render, HAND_*
- `gen/` Generatoren: words (Wortzeiten), europa (Karte 1914 aus Natural Earth), shapes (Stadtplan Sarajevo, Icons), bilder (Zuschnitte + credits), gen (Build), aemock.js (Probelauf)
- `data/` words.json, europa.json, bilder.json, timeline.json
- `archiv/` Fotos + Logos, `archiv/credits.json` (Quelle + Lizenz jedes Bildes)
- `ton/` eigene Musik, SFX, Mix (Python, numpy); `tex/` Papier/Raster aus der Vorlage

## Neu erzeugen (in der Cloud)

```
cd gen
python3 words_weltkrieg.py && python3 europa_weltkrieg.py <adm1.geojson> && python3 bilder_weltkrieg.py <download-ordner>
python3 gen_weltkrieg.py --cloud && node aemock.js ../jsx/build_weltkrieg.jsx     # Probelauf
python3 gen_weltkrieg.py                                                          # PC-Pfade fuer die Abgabe
cd ../ton && python3 music_weltkrieg.py && python3 sfx_weltkrieg.py && python3 mix_weltkrieg.py
```

## Bilder (alle in archiv/credits.json)

- ff-sophie-einsteigen.jpg – IWM Q91848, PD
- ff-sophie-treppe.jpg – Wikimedia Commons, CC0 (LIFE-Logo weggeschnitten)
- ff-auto-rathaus.jpg – Walter Tausch 1914, PD
- lateinerbruecke-keystone.jpg – Library of Congress, Keystone View Co. (1923), "No known restrictions"
- Europakarte 1914 und Stadtplan Sarajevo: eigene Zeichnung (Grenzen aus Natural Earth, PD, ungefaehr)

## Fixes Runde 2 (12.11., nach Review 1 in AE)

- **schuss schwarz ("Object is invalid", Zeile 31 = findP)**: `tn = addFx(Tint)` wurde nach dem zweiten `addFx(Brightness & Contrast)` auf derselben Ebene benutzt; AE macht die alte Effekt-Referenz dabei ungueltig. Jetzt erst anlegen, dann per Name frisch holen (`fxGet`). `main` ist ausfallsicher: wirft eine Szene, bleibt ihre Comp (mit Papier) im Master statt eines schwarzen Lochs.
- **Dauer-Unschaerfe (thron, ecke)**: Compound Blur liest von der Karten-Ebene nur die Quelle, nicht deren Effekte -> das weisse Solid mit Ramp war fuer AE ganz weiss = ueberall volle Unschaerfe. Karte liegt jetzt in einer Precomp, die Unschaerfe zieht in max. 0,3 s scharf und endet. `homogenize` hatte zusaetzlich einen Fast Box Blur 6x3 auf dem GANZEN Foto (Randmaske gab es nie) -> raus. focusHunt jetzt 9 statt 18 Frames.
- Hook-Foto gibt es auf Commons nur mit 800 px -> kleiner gezeigt (max. 110 % echte Pixel). Alle Fotos so gross, dass sie mit Kamera-Punch in x 60..1020 bleiben; Wagen-Foto faehrt von unten herein, heller statt dunkler Callout.
- Ortsnamen nicht mehr im Plan-Precomp, sondern je Szene (`planLabels`): feste Groesse 40 px, so verschoben, dass sie mit Zoom im Bild bleiben, Lateinerbruecke entfaellt, wenn die Bruecke ausserhalb liegt. Krankenhaus-Symbol poppt aus seinem Fusspunkt (vorher aus der Bildecke). Kolonnen/Plaene, Ringe, Wagen-Endpunkt (waswaere), Bildquelle (rechte Kante 1008) nach innen.
- Sarajevo-Karte: saubere Tusche-Blende (Linear Wipe) statt CC Burn Film (graue Flecken bei 3,5 s). Outro ohne blassen Stadtplan. "19 Jahre": dunkel, groesser, mit Abstand ueber dem Foto. schuss-Plan 1,35 statt 1,7 (weniger hochskaliert).
- **aemock.js** strenger: Referenzen werden nach `addProperty` auf ihrer Gruppe ungueltig wie in AE; neue Pruefungen RAND (echte Bildschirm-Ausdehnung inkl. Skalierung, Anker, Rotation, Eltern, Kamera, Precomps; Textbreite geschaetzt), UNSCHAERFE (> 0,3 s am Stueck, Compound-Blur-Karte ohne Wirkung), HOCHSKALIERT (> 125 % echte Pixel). `AEMOCK_EXT=1` listet alle Ausdehnungen.
- Probelauf (Cloud und PC-Build): `0 Fehler | 0 ABGESCHNITTEN | 0 KNAPP | alle Effekte da`, RAND 0, UNSCHAERFE 0, HOCHSKALIERT 0. Ton, Untertitel, Sprechzeiten unveraendert.
