# Review 2 in After Effects (build of commit 9b5e933 = your round-2 state, 67 stills)
Build: 1 Fehler | 0 ABGESCHNITTEN | 0 KNAPP | all effects present.
ERROR scene "rechnen": After Effects error: Unable to call "setValueAtKey" because of parameter 2. Value 101,72 out of range 0 to 100. (Zeile 107). Ease influence > 100 % (candidates in B.rechnen: rigZoom influences [50,50]/[85,85], timeline/rigPan IN [85,85]; maybe a computed influence, or two keys too close so AE rescales). Clamp every KeyframeEase influence to 0.1..100 in the lib AND make the mock throw on >100 like AE.
Note: saveFrameToPng is async in AE 2023 (files appear up to ~1 min later) - fine, no action.
PROBLEMS (seconds)
- 4.4-5.5: frame completely EMPTY (only logo + subtitles) because "rechnen" failed. Most important.
- 18.4: Kleopatra head cut at the left edge (x ~0-60) while moving out; rest of the page nearly empty (690 over a dashed line, small timeline). 19.4: nearly empty paper (only "1940" + dashed line + timeline).
- 22.4-23.1: the graphic is VERY small (timeline with mini head and mini moon), lots of empty space below.
- 23.4-24.4: nearly empty paper: mini head, short yellow bar, stray "~" to the left.
- 25.4-27.77: works but everything is very small (mini pyramid photo ~50 px), lower half empty.
  => Round 2 overcorrected: things are now inside the frame but tiny. Fill the frame: main element ~60-80 % of the width, readable from a phone. Fix the real cause instead of shrinking.
- 33.4: mosaic strongly blurred (one still; focus pulse, acceptable but noticeable -> make it subtler/shorter).
- 39.27/39.4: subtitle "lang" sits directly under "200 Jahre" (text on text).
- 40.4-43.83: on the bright Egypt relief the white subtitles ("soll","Familie","die","Ägyptisch","lernte"), the white "Kleopatra" label and the person icons have weak contrast; "Ägyptisch"/"lernte" barely readable. Darken/tone the relief (multiply/levels) or put the soft dark band there too.
- 44.4/44.97: big bust head: a DARK SMEARED STRIPE across mouth and chin (~y 640-720 in a 540 px wide still = y ~1280-1440 full res) behind the subtitle - that is your "FIX UT-Schatten" band; it looks like a leftover. Make it a very soft, wide, low-opacity gradient or drop it and darken the head instead. Bust cut at the left edge, and the paper grid shows through the bust at the top (bust needs to be opaque / paper under it hidden).
- 50.87: no fade at the end (info only, ok).
GOOD (keep): hook 0.4-3.83; 6.4-9.83 Cheops; 10.4-13.77 counter ~120 -> ~1.910 -> ~2.500; 14.4-15.9 pyramid on dark; 16.4-17.5 follow; 20.4-21.5 moon landing; 28.4-32.4 map Alexandria/Makedonien; 35.4-36.07 Alexander + Ptolemaios; 36.4-39.4 papyrus + magnifier; outro 45.4-50.87. Logo and subtitles fine.
