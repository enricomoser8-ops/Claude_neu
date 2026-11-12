# Review 1 in After Effects (12.11., real AE 2023 build on enno's PC, 68 stills checked)
Build: 1 Fehler | 0 ABGESCHNITTEN | 0 KNAPP | all effects/fonts present. Subtitles + round logo OK everywhere.
ERROR in scene "schuss" (35.97-37.33 s): "ReferenceError: Object is invalid (Zeile 31)" (line 31 refers to a sub-function; scene function starts at build_weltkrieg.jsx line 1067). Typical ExtendScript cause: a property reference used after addProperty/another addProperty on the same group (see ae-skript-bridge-regeln). The aemock dry run did NOT catch it -> make the mock stricter for this pattern if you can.
Times = master comp seconds (still names wk_XXXXX = hundredths of a second).
PROBLEMS
- 36.5-37.23 s: COMPLETELY BLACK, only the subtitles "schießt"/"zweimal" (broken scene "schuss").
- 6.5-11.47 s (scene "thron"): whole frame strongly blurred for ~5 s. Tag SARAJEVO, "Franz Ferdinand" and photo unreadable. Looks like a stuck blur (focalBlur/defocus key not returning?). Biggest problem next to "schuss".
- 0.5-3.17 s (hook): archive photo very blurry. At 2.5 it sticks out past x 1020, at 3.17 it hugs the left edge.
- 3.5 s: transition to the map with grey-white blotches and map shreds, looks broken (page-turn remnant?).
- 11.47-12.5 s: dark grey background, photo dark and blurry, at 12.5 cut left and right. Looks muddy.
- 13.2-15.5 s: "Appel-Kai" cut on the right and "(Latei)nerbrücke" on the left.
- 18.5-19.83 s: "Lateinerbrücke" cut on the left (very small).
- 20.5-21.5 s: photo blurry, left edge under x 60.
- 24.5 s: whole frame blurred (transition). 25.5 s: circle top right cut off.
- 27.5-30.3 s and 42.5-44.1 s: "A(ppel-Kai)" cut on the right. At 43.5 the car hugs the left edge.
- 30.3 s: whole frame blurred (transition).
- 32.1-35.87 s (scene "ecke", Princip photo): photo strongly blurred, sticks out past x 1020. The grey "Jahre" next to "19" disappears behind the photo and is barely readable.
- 37.5-38.5 s: photo coarse and slightly blurry (acceptable).
- 44.17 s: nearly empty, faded paper (transition).
- 45.5-50.17 s (outro): behind "Link in der Bio" the street map is still faintly visible (grey band right behind the text). Looks like a leftover layer.
REALLY GOOD (keep): 4.5-5.3 (1914 SARAJEVO on the map), 15.5-17.5 (bomb at Appel-Kai, flash), 22.5-23.17 (route with X and green arrow), 25.5-27.0 (car on black with "?"), 27.5-29.5 (red turning route), 30.5-32.1 (stopwatch, very clean), 39.5-41.1 (calendar 28. Juni -> 28. Juli + Europe colouring, strong), 41.5-42.5.
