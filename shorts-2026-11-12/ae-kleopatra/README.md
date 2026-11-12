# Short 12.11. Kleopatra (Vox-Stil, key `kleopatra`)

"Kleopatra lebte näher an der Mondlandung als am Bau der großen Pyramide" – 9:16, 1080x1920, 30 fps, 50,97 s.

## Bauen auf dem PC
Ordner auf dem PC: `C:\Users\Enrico\Claude\Podcast-Shorts\tage\2026-11-12\ae-kleopatra\`
(die Pfade sind in den jsx fest auf diesen Ordner gesetzt).

1. In AE 2023 das Zielprojekt öffnen (z. B. einishort.aep). Ist kein gespeichertes Projekt offen, legt der Build `Short-kleopatra-Vox.aep` im Ordner an.
2. Von `C:\Users\Enrico\Claude` aus:
   - `node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-12\ae-kleopatra\jsx\build_kleopatra.jsx 900000`
     Erwartete Antwort: `0 Fehler | 0 ABGESCHNITTEN | 0 KNAPP | alle Effekte da`
   - Stills zum Prüfen (ca. 1 pro Sekunde, halbe Auflösung): `node edit-tools\ae.mjs Podcast-Shorts\tage\2026-11-12\ae-kleopatra\jsx\snap_kleopatra.jsx 900000` → `out\png\kleo_*.png`
   - Rendern: `jsx\render_kleopatra.jsx` (H.264, "Match Render Settings - 40 Mbps") → `out\kleopatra_vox.mp4`
   - Optional zuerst `jsx\plugin_check.jsx`.
   Die `HAND_*.jsx` sind dieselben Skripte zum Starten von Hand (Datei > Skripte).

AE-Ordner: `Short 12.11. Kleopatra (kleopatra)` (mit Assets/Bausteine/Szenen (kleopatra)). Der Build löscht und ersetzt nur diesen Ordner; ae-weltkrieg bleibt unberührt.
Master-Comp: **`Short 12.11. Kleopatra (kleopatra) (9x16)`**, Szenen-Comps heißen `kleopatra 01 hook` usw.
Ton: `audio\kleopatra_mix.wav` (Stimme + Musik + SFX, -14 LUFS, -1,6 dBTP) wird in den Master importiert.

## Neu erzeugen (Cloud, Reihenfolge)
1. `gen/words_kleopatra.py`: ASR + Skript → `data/words.json`, `audio/kleopatra_voice.wav`
2. `gen/karte_kleopatra.py`: Mittelmeerkarte (Natural Earth) → `data/karte.json`
3. `gen/archiv_kleopatra.py`: Bilder aufbereiten, Freisteller, `archiv/credits.json`
4. `ton/music_kleopatra.py`, `ton/sfx_kleopatra.py`, `ton/mix_kleopatra.py` → `audio/kleopatra_mix.wav`
5. `gen/gen_kleopatra.py`: `data/timeline.json`, `jsx/build_*.jsx`, `snap/render`, `HAND_*`
6. Probelauf: `cd gen && node aemock.js ../jsx/build_kleopatra.jsx`

Bildnachweise: `archiv/credits.json`.
