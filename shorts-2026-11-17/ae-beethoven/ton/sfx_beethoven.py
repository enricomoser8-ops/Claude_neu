# Taktiles Sounddesign nach Chris Moran (Vox Sound Design System, notizen/yt3-sound.md) fuer den Beethoven-Short (17.11.2026).
# Jedes Ereignis aus ton/events_alle.json (node ton/events_beethoven.js) bekommt seinen Ton auf dem SICHTBAREN Frame (Master: Posterize 12):
#   - jeder Textmarker -> Filzstift-Strich mit der Strichlaenge, jedes Tippen -> Tastenanschlaege auf jedem sichtbaren Tipp-Schritt
#   - Kreise/Pfeile/Linien -> Bleistift, Zaehler/Odometer/Messlinie -> Uhr-Ticks auf jedem sichtbaren Zahlenwechsel
#   - Schnitte -> tiefer Whoosh als J-Cut (setzt 3 Frames vor dem Schnitt ein, Spitze auf dem ersten neuen Frame)
#   - Zeitung / Reissschwenk / Seite -> Whoosh + Papier-Textur 6-10 dB darunter (Stapeln)
#   - nie zweimal dieselbe Datei hintereinander: Varianten im Wechsel + Rate +-5..10 %; Ausklang immer mit Fade
#   - Hierarchie: was gleichzeitig mit einem staerkeren Ereignis kommt, bleibt stumm (Liste "stumm" in sfx_events.json, mit Grund)
# Quellen je Rolle, in dieser Reihenfolge: ton/sfx_real/<rolle>_*.mp3|wav (echte Freesound-Aufnahmen, Liste ton/sfx_real_liste.json),
#   sonst ennos echte Aufnahmen (ton/sfx_enno/), sonst earshot-Bank (ton/earshot/b_*.wav, Befehle in ton/credits_sfx.json),
#   sonst Code-Platzhalter (nur Filzstift/Bleistift, bis die echten Dateien da sind).
#   Neu: Applaus-Bett (Rolle applause): ab "jubelt" dumpf (Tiefpass, so hoert ihn Beethoven nicht), ab "Jetzt sieht er es" klar;
#   Metronom-Ticks auf "schlaegt den Takt"; 12 Sterne der Europaflagge = leise Ticks. Ohne echte Applaus-Datei: Code-Applaus (Klatsch-Koerner).
# Aufruf: python3 ton/sfx_beethoven.py   -> ton/sfx.wav (Stereo 48 kHz, Spitzen-normiert), ton/sfx_events.json, ton/credits_sfx.json
import glob, json, os, subprocess, sys
sys.dont_write_bytecode = True
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from dsp import SR, ns, read_wav, write_wav, place, bp, hp, lp, smooth_noise, reson
from scipy.signal import resample_poly

EVJ = json.load(open(os.path.join(HERE, 'events_alle.json')))
FPS, DUR = EVJ['fps'], EVJ['end']; N = ns(DUR)
F = lambda f: f / FPS
REAL, ENNO, BANK = os.path.join(HERE, 'sfx_real'), os.path.join(HERE, 'sfx_enno'), os.path.join(HERE, 'earshot')

# ---------- Laden + Werkzeuge ----------
def load(path):
    if path.lower().endswith('.wav'):
        x, sr = read_wav(path)
    else:   # mp3/flac/ogg ueber ffmpeg
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
        x, sr = np.frombuffer(raw, '<f4').astype(np.float64).reshape(-1, 2).T, SR
    if x.shape[0] == 1: x = np.vstack([x[0], x[0]])
    if sr != SR:
        from math import gcd
        g = gcd(SR, sr); x = resample_poly(x, SR // g, sr // g, axis=1)
    return x
def env50(x):   # 50-ms-RMS-Huellkurve (Mono)
    m = np.mean(x, axis=0) ** 2; w = int(0.05 * SR)
    return np.sqrt(np.convolve(m, np.ones(w) / w, mode='same') + 1e-12)
def norm(x, db=-12.0):   # lauteste 50 ms auf db dBFS (RMS) -> alle Quellen vergleichbar
    return x * 10 ** (db / 20) / env50(x).max()
def fade(x, fi=0.003, fo=0.03):
    x = x.copy(); n = x.shape[1]; a, b = min(n // 2, int(fi * SR)), min(n // 2, int(fo * SR))
    if a: x[:, :a] *= np.linspace(0, 1, a)[None, :]
    if b: x[:, -b:] *= (np.linspace(1, 0, b) ** 2)[None, :]
    return x
def onset(x, thr_db=-30):
    a = np.abs(x).max(axis=0); i = int(np.argmax(a > a.max() * 10 ** (thr_db / 20))); return max(0, i - int(0.002 * SR))
def apex(x):
    return int(np.argmax(env50(x)))
def rate(x, r):   # Rate-Stretch wie Chris' "R"-Werkzeug: Tonhoehe + Laenge zusammen
    if abs(r - 1) < 1e-3: return x
    return resample_poly(x, int(round(1000 / r)), 1000, axis=1)
def best_segment(x, dur, k=0):   # Abschnitt mit gleichmaessig viel Energie (lange Aufnahmen: Stift, Ticken, Ambience)
    e = env50(x); n = int(dur * SR); hop = int(0.02 * SR)
    if x.shape[1] <= n + hop: return x
    starts = np.arange(0, x.shape[1] - n, hop)
    sc = np.array([e[s:s + n].mean() - 0.7 * e[s:s + n].std() for s in starts])
    picks = []
    for i in np.argsort(-sc):   # verschiedene Stellen fuer verschiedene Varianten
        if all(abs(starts[i] - p) > n for p in picks): picks.append(starts[i])
        if len(picks) > k: break
    s = picks[min(k, len(picks) - 1)]
    return x[:, s:s + n]
def transients(x, maxn=40, length=0.09):   # einzelne Anschlaege (Tasten, Ticks) aus einer Aufnahme schneiden
    a = np.abs(x).mean(axis=0); w = int(0.004 * SR); e = np.convolve(a, np.ones(w) / w, mode='same')
    thr = e.max() * 0.25; gap = int(0.06 * SR); out = []; i = 1
    while i < len(e) and len(out) < maxn:
        if e[i] > thr and e[i - 1] <= thr:
            s = max(0, i - int(0.003 * SR)); out.append(fade(x[:, s:s + int(length * SR)], 0.001, 0.03)); i += gap
        else: i += 1
    return out

# ---------- Code-Platzhalter (nur bis echte Filzstift-/Bleistift-Aufnahmen in ton/sfx_real/ liegen) ----------
def code_stroke(dur, seed, kind):
    r = np.random.default_rng(seed); n = max(int(dur * SR), int(0.08 * SR)); x = r.standard_normal(n)
    lo, hi, am, gr = (3000, 10000, 60, 2000) if kind == 'marker' else (4000, 12000, 110, 5000)   # ueber dem Sprachband
    y = bp(x, lo, hi, 2) * (0.3 + 0.7 * np.abs(smooth_noise(n, r, am)))
    k = np.zeros(n); idx = r.integers(0, n, int(n / SR * gr)); k[idx] = r.standard_normal(len(idx)); y = y + hp(k, 1500) * 0.8
    if kind == 'marker': y = y + 0.08 * reson(x, 4200 + 800 * r.random(), 25)
    y = hp(y, 2500)
    return fade(np.vstack([y, y]), 0.015, 0.06)

def code_applause(dur, seed, dichte=70):
    """Platzhalter-Applaus: viele einzelne Klatscher (gefiltertes Rauschen, 6-14 ms), zufaellig, Stereo verteilt"""
    r = np.random.default_rng(seed); n = int(dur * SR); y = np.zeros((2, n))
    for _ in range(int(dur * dichte)):
        L = int(r.uniform(0.006, 0.014) * SR); b = r.standard_normal(L) * np.exp(-np.linspace(0, 6, L))
        f0 = r.uniform(900, 2600); c = bp(b, f0 * 0.6, min(f0 * 2.2, 9000), 2) * r.uniform(0.4, 1.0)
        i = int(r.integers(0, max(1, n - L))); p = r.uniform(-0.8, 0.8)
        y[0, i:i + L] += c * np.cos((p + 1) * np.pi / 4); y[1, i:i + L] += c * np.sin((p + 1) * np.pi / 4)
    body = lp(r.standard_normal(n), 900, 2) * 0.05; y += np.vstack([body, body])
    return y
# ---------- Bibliothek je Rolle ----------
ENNO_ROLLE = {'whoosh': ['swipe4', 'swipe3', 'whoosh_real', 'swipe7', 'swipe1'], 'whip': ['swipe1', 'whoosh_real', 'swipe6'],
              'typewriter': ['typing'], 'click': ['click_real'], 'pop': ['pop_real']}
BANK_ROLLE = {'paper': ['b_paper1', 'b_paper2', 'b_paper3'], 'shutter': ['b_shutter1', 'b_shutter2', 'b_shutter3'],
              'tick': ['b_tick1', 'b_tick3', 'b_tick4'], 'tap': ['b_tap1', 'b_tap2', 'b_tap4'], 'cloth': ['b_cloth1', 'b_cloth2'],
              'impact': ['b_impact1'], 'water': ['b_water1', 'b_water2'], 'hit': ['b_hit1']}
LIB, SRC = {}, {}
def lib(role):
    if role in LIB: return LIB[role]
    fs = sorted(glob.glob(os.path.join(REAL, role + '_*.*')))
    if fs: LIB[role] = [(load(f), 'real:' + os.path.basename(f)) for f in fs]
    elif role in ENNO_ROLLE: LIB[role] = [(load(os.path.join(ENNO, n + '.wav')), 'enno:' + n + '.wav') for n in ENNO_ROLLE[role]]
    elif role in BANK_ROLLE: LIB[role] = [(load(os.path.join(BANK, n + '.wav')), 'earshot:' + n + '.wav') for n in BANK_ROLLE[role]]
    else: LIB[role] = []
    return LIB[role]
CNT = {}
RATES = [1.0, 0.93, 1.07, 0.96, 1.05]
def take(role):   # naechste Variante; bei Wiederholung andere Rate -> nie zweimal dasselbe hintereinander
    L = lib(role); i = CNT.get(role, 0); CNT[role] = i + 1
    if not L: return None, None, 1.0
    x, src = L[i % len(L)]
    r = RATES[(i // len(L)) % 5] if len(L) > 1 else RATES[i % 5]
    SRC[src] = SRC.get(src, 0) + 1
    return x, src, r

out = np.zeros((2, N)); PLACED = []
def put(x, t, db, p=0.0, what='', ev=None, src='', sync=None):
    if x is None: return
    g = np.array([[np.cos((p + 1) * np.pi / 4)], [np.sin((p + 1) * np.pi / 4)]]) * np.sqrt(2)
    place(out, x * g, t, 10 ** (db / 20))
    s = sync if sync is not None else t
    PLACED.append(dict(t=round(s, 3), f=int(round(s * FPS)), start=round(t, 3), db=db, what=what, src=src, ev=ev))

# ---------- Bausteine ----------
def oneshot(role, f, db, p=0.0, what='', ev=None, maxlen=1.2, at='onset'):
    x, src, r = take(role)
    if x is None: return False
    o = onset(x); x = norm(x[:, o:o + int(maxlen * SR)])
    x = fade(rate(x, r), 0.001, 0.04)
    t = F(f); off = apex(x) / SR if at == 'apex' else 0.0
    put(x, t - off, db, p, what, ev, src, t); return True
def whoosh(role, f_hit, db, lead_frames=3, p=0.0, what='', ev=None, maxlen=0.9):
    """J-Cut: Whoosh setzt lead_frames vor f_hit ein, Spitze genau auf f_hit"""
    x, src, r = take(role)
    if x is None: return
    x = x[:, onset(x):]
    x = norm(rate(x, r))
    a = apex(x); lead = int(F(lead_frames) * SR)
    if a > lead: x = x[:, a - lead:]; a = lead      # Vorlauf kuerzen (weich eingeblendet)
    x = fade(x[:, :a + int(maxlen * SR)], 0.02, 0.15)
    put(x, F(f_hit) - a / SR, db, p, what, ev, src, F(f_hit))
def stroke(role, f0, f1, db, p=0.0, what='', ev=None):
    """Strich mit der sichtbaren Strichlaenge (+ 2 Frames Ausklang)"""
    dur = F(f1 - f0) + F(2)
    x, src, r = take(role)
    if x is None:
        x, src, r = code_stroke(dur, 100 + CNT[role], role), 'code:' + role, 1.0
        SRC[src] = SRC.get(src, 0) + 1
    else:
        x = rate(best_segment(x, dur * r + 0.05, k=CNT[role] % 3), r)
    x = norm(fade(x[:, :int(dur * SR)], 0.005, 0.05))
    put(x, F(f0), db, p, what, ev, src, F(f0))
TR, KC = {}, {}
def keys(role, frames, db, p=0.0, what='', ev=None):
    """einzelne Anschlaege (Tasten/Ticks) auf genau diesen Frames, jeder Anschlag ein anderer"""
    L = lib(role)
    if not L or not frames: return
    if role not in TR:
        TR[role] = []
        for x, src in L:
            for y in (transients(x) if x.shape[1] > 0.6 * SR else [x[:, onset(x):]]): TR[role].append((norm(fade(y, 0.001, 0.03)), src))
    T = TR[role]
    for j, f in enumerate(frames):
        i = KC.get(role, 0); KC[role] = i + 1
        y, src = T[(i * 7) % len(T)]; y = rate(y, RATES[i % 5])
        put(y, F(f), db + (-2 if j % 2 else 0), p, what if j == 0 else None, ev if j == 0 else None, src, F(f))
        SRC[src] = SRC.get(src, 0) + 1
def steps12(f0, f1, every=1):   # sichtbare 12-fps-Schritte zwischen f0 und f1 (Frames)
    fr, q = [f0], int(np.floor(F(f0) * 12 + 1e-6)) + every   # f0 ist selbst ein sichtbarer Schritt
    while True:
        f = int(np.ceil(q * FPS / 12 - 1e-6))
        if f > f1: break
        if f > fr[-1]: fr.append(f)
        q += every
    return fr
def ambience(role, idx, t0, dur, db, what):
    L = lib(role)
    if len(L) <= idx: return False
    x, src = L[idx]; x = norm(fade(best_segment(x, dur), 0.5, 0.8))
    put(x, t0, db, 0, what, None, src, t0); SRC[src] = SRC.get(src, 0) + 1
    return True

# ---------- Plan: Ereignis -> Ton (Pegel in dB relativ; 0 = Hauptereignis, Texturen 6-10 dB darunter) ----------
E = EVJ['events']
def find(typ, f, d=2):
    for e in E:
        if e['typ'] == typ and abs(e['f_sicht'] - f) <= d: return e
STUMM = []
cuts = [e['f_sicht'] for e in E if e['typ'] in ('cut', 'burn')]
near_cut = lambda f, d=3: any(abs(f - c) <= d for c in cuts)
pside = 0.25
for e in E:
    typ, f0, w = e['typ'], e['f_sicht'], e['what']; f1 = e.get('f1_sicht', f0); ev = f0
    pside = -pside
    if typ == 'photo_in':
        oneshot('shutter', f0, -6, 0, 'Kamera-Verschluss: Beethoven-Gesicht erscheint (minimal)', ev)
    elif typ == 'cut':
        whoosh('whoosh', f0, 0, 3, 0, 'tiefer Whoosh, J-Cut 3 Frames: ' + w, ev)
    elif typ == 'burn':
        whoosh('whoosh', f0 + 3, -1, 4, 0, 'tiefer Whoosh auf den Brand-Uebergang (J-Cut)', ev, maxlen=0.6)
        if lib('match'): oneshot('match', f0, -8, 0.1, 'Streichholz-Textur unter dem Brand', ev)
        else: stroke('paper', f0, f1, -9, 0.1, 'Papier-Textur unter dem Brand (9 dB unter dem Whoosh)', ev)
    elif typ == 'type_on':
        keys('typewriter', steps12(f0, f1), -4, 0.15, 'Tippen ' + w.split('"')[1] + ' (Anschlag je sichtbarem Tipp-Schritt)', ev)
    elif typ == 'marker':
        stroke('marker', f0, f1, -4, pside, 'Filzstift-Strich: ' + w, ev)
    elif typ == 'circle':
        stroke('pencil', f0, f1, -8 if e.get('pc') else -6, pside, 'Bleistift-Kreis: ' + w, ev)
    elif typ in ('arrow', 'line'):
        lab = find('type_on', f0, 3)
        if typ == 'arrow' and lab: stroke('pencil', f0 + 2, f1, -10, pside, 'Bleistift (leise, das Label tippt gerade): ' + w, ev)
        else: stroke('pencil', f0, f1, -8, pside, 'Bleistift-Strich: ' + w, ev)
    elif typ == 'measure_line':
        stroke('pencil', f0, f1, -8, -0.1, 'Bleistift-Strich: Messlinie', ev)
        keys('tick', steps12(f0, f1, 2), -12, -0.1, 'Stoppuhr-Ticks unter der Messlinie (Textur)', ev)
    elif typ in ('odometer', 'counter'):
        fr = [int(round(t * FPS)) for t in e.get('steps_sicht', [])] or steps12(f0, f1)
        keys('tick', fr, -10, 0.2, 'Uhr-Ticks je sichtbarem Zahlenwechsel: ' + w, ev)
    elif typ == 'whip_pan':
        whoosh('whip', f0 + 3, 0, 3, 0, 'schneller Whoosh: Reissschwenk (setzt mit der Bewegung ein)', ev, maxlen=0.5)
        oneshot('paper', f0, -9, -0.2, 'Papier-Textur unter dem Schwenk (Zeitungsseite)', ev)
    elif typ == 'newspaper_in':
        whoosh('whoosh', f0 + 3, -3, 3, 0.1, 'Whoosh: ' + w.split(' rutscht')[0].replace('Zeitung ', 'Ausschnitt ') + ' rutscht ein', ev, maxlen=0.4)
        stroke('paper', f0, f1, -9, 0.1, 'Papier-Slide unter dem Whoosh', ev)
        oneshot('tap', f1, -10, 0.1, 'Ausschnitt rastet ein (leiser Tap)', ev)
    elif typ == 'newspaper_out':
        oneshot('cloth', f0, -12, -0.1, 'Zeitung weg (leiser Flap mit Fade)', ev)
    elif typ == 'photo_drop':
        hit = int(round(e.get('f_hit', f1)))
        if not oneshot('photodrop', f0, -4, -0.1, 'Fotoabzug faellt (echte Aufnahme)', ev):
            oneshot('paper', f0, -5, -0.1, 'Fotoabzug-Flick (Papier)', ev)
        oneshot('tap', hit, -5, -0.1, 'Abzug landet (weicher Tap, Frame %d)' % hit, ev)
    elif typ == 'rings':
        oneshot('tick', f0, -12, -0.1, 'Ringe breiten sich aus (leiser Tick)', ev)
    elif typ == 'chip':
        oneshot('tap', f0, -8, 0.2, 'Chip springt auf (Tap)', ev)
        oneshot('pop', f0 + 1, -12, 0.2, None, None)
    elif typ == 'callout':
        if near_cut(f0): STUMM.append((f0, w, 'kommt mit dem Schnitt, der Whoosh traegt es')); continue
        oneshot('shutter', f0, -10, 0.1, 'minimaler Verschluss: Kontrast-Callout springt an', ev)
    elif typ == 'magnifier':
        whoosh('whoosh', f0 + 3, -5, 3, 0.1, 'kurzer Whoosh: Lupe waechst auf', ev, maxlen=0.35)
        oneshot('tick', f1, -12, 0.1, 'Lupe rastet ein (Tick)', ev)
    elif typ == 'button_in':
        oneshot('pop', f0, -8, 0.1, 'Folgen-Knopf springt auf', ev)
    elif typ == 'click':
        oneshot('click', f0, -3, 0.1, 'Mausklick: Folgen', ev)
    elif typ == 'arrow_head':
        oneshot('tick', f0, -11, 0.1, 'Pfeilspitze springt auf', ev)
    elif typ == 'slam':
        oneshot('tap', f0, -4, 0.15, 'Fragezeichen knallt (Tap)', ev)
        oneshot('hit', f0, -12, 0.15, None, None, at='apex')
    elif typ == 'logo':
        oneshot('tap', f0, -7, 0, 'Logo springt auf (Tap; der Brand-Whoosh traegt die Bewegung)', ev)
    elif typ == 'pop_in':
        oneshot('pop', f0, -9, -0.1, '"In der Bio" springt auf', ev)
    elif typ == 'push_in':
        if find('marker', f0, 3) or find('slam', f0, 3): STUMM.append((f0, w, 'gleichzeitig mit Textmarker/Slam: der hat Vorrang'))
        else: whoosh('whoosh', f0 + 3, -6, 3, 0, 'tiefer Whoosh: Punch-in auf das Wort', ev, maxlen=0.4)
    elif typ == 'focus':
        STUMM.append((f0, w, 'setzt 2 Frames nach dem Schnitt ein: der Schnitt-Whoosh traegt es'))
    elif typ == 'punch_cut':
        STUMM.append((f0, w, 'gleicher Frame wie der Schnitt: der Schnitt-Whoosh ist der Punch'))
    elif typ == 'callout_off':
        STUMM.append((f0, w, 'Abdunklung geht nur weg (Nebensache)'))
    elif typ == 'cursor':
        STUMM.append((f0, w, 'Mauszeiger gleitet (Nebensache, der Klick ist das Ereignis)'))
    elif typ == 'color_sweep':
        whoosh('whoosh', f0 + 4, -9, 3, 0, 'weicher Whoosh: Blau wischt von oben ins Bild', ev, maxlen=0.4)
    elif typ == 'stars':
        fr = [f0 + 2 * j for j in range(6)]   # jeder zweite Stern ein leiser Tick (12 waeren Teppich)
        keys('tick', fr, -15, 0.25, '6 leise Ticks: Sterne der Europaflagge springen auf', ev)

# ---------- Takt: Metronom-Ticks auf "schlaegt den Takt" (4 Schlaege, 0,5 s Abstand, leise) ----------
TL = json.load(open(os.path.join(HERE, '..', 'data', 'timeline.json')))
KS = {s['id']: s['k'] for s in TL['scenes']}
tk = KS['takt']['takt']; keys('tick', [int(round((tk + 0.5 * j) * FPS)) for j in range(4)], -14, -0.2, 'Metronom-Ticks: er schlaegt den Takt', None)
# ---------- Applaus-Bett: dumpf (wie Beethoven ihn NICHT hoert) -> klar ab "Jetzt sieht er es" ----------
def applaus(t0, t1, db, dumpf, what, k=0, fi=0.6, fo=0.5):
    dur = t1 - t0; L = lib('applause')
    if L:
        x, src = L[k % len(L)]; x = best_segment(x, dur, k=k // len(L)); SRC[src] = SRC.get(src, 0) + 1
    else:
        x, src = code_applause(dur, 500 + k), 'code:applause'; SRC[src] = SRC.get(src, 0) + 1
    x = x[:, :int(dur * SR)]
    if dumpf: x = lp(lp(x, 520, 2), 700, 2) * 1.6   # durch Watte: nur noch Grollen
    x = norm(fade(x, fi, fo))
    put(x, t0, db, 0, what, None, src, t0)
ts_jubel = KS['jubel']['jubelt']   # k in timeline.json sind Master-Zeiten
ts_huete = [s for s in TL['scenes'] if s['id'] == 'huete'][0]['start']
ts_hymne = [s for s in TL['scenes'] if s['id'] == 'hymne'][0]['start']
applaus(ts_jubel - 0.25, ts_huete + 0.35, -16, True, 'Applaus dumpf (Tiefpass): der Saal jubelt, Beethoven hoert nichts', k=0, fi=0.7, fo=0.35)
applaus(ts_huete - 0.05, ts_hymne + 0.6, -13, False, 'Applaus klar: jetzt sieht er den Jubel (Huete, Tuecher)', k=1, fi=0.3, fo=0.9)

o = hp(out, 30)
pk = np.abs(o).max(); o = o / pk * 0.9   # Spitzen-normiert; mix_beethoven.py setzt den Pegel gegen die Stimme
write_wav(os.path.join(HERE, 'sfx.wav'), o)
main = [p for p in PLACED if p['what']]
json.dump({'fps': FPS, 'hinweis': 'f/t = sichtbares Ereignis (Sync-Punkt), start = Einsatz der Datei (J-Cut/Vorlauf), db = Pegel relativ (0 = Hauptereignis).',
           'gain_in_sfx_wav_db': round(20 * np.log10(0.9 / pk), 2),
           'events': [{'f': p['f'], 'kind': 'sfx', 'id': p['what'], 't': p['t'], 'start': p['start'], 'db': p['db'], 'src': p['src'], 'event_f_sicht': p['ev']} for p in main],
           'alle_anschlaege': [{'t': p['t'], 'db': p['db'], 'src': p['src']} for p in PLACED],
           'stumm': [{'f': f, 'ereignis': w, 'grund': g} for f, w, g in STUMM]}, open(os.path.join(HERE, 'sfx_events.json'), 'w'), indent=0, ensure_ascii=False)

# ---------- Nachweise: nur was wirklich klingt ----------
REALL = {os.path.basename(d['datei']): d for d in json.load(open(os.path.join(HERE, 'sfx_real_liste.json')))['dateien']}
BANKCMD = {'b_shutter1': 'shutter/film', 'b_shutter2': 'shutter/mirror', 'b_shutter3': 'shutter/quick', 'b_tick1': 'fit/tick/domino', 'b_tick2': 'hover_tick/detent',
           'b_tick3': 'fit/click/floss_lid', 'b_tick4': 'pro_hover_tick/detent', 'b_paper1': 'swipe/paper --dur 0.5 --apex 0.12 --seed 1', 'b_paper2': 'swipe/paper --dur 0.5 --apex 0.12 --seed 2',
           'b_paper3': 'swipe/paper --dur 0.5 --apex 0.12 --seed 3', 'b_cloth1': 'swipe/cloth --dur 0.6 --apex 0.15', 'b_cloth2': 'swipe/cloth --dur 0.5 --apex 0.12 --seed 4',
           'b_impact1': 'pro_impact/deep', 'b_water1': 'drip/drop', 'b_water2': 'drip/bloop --pitch C4', 'b_tap1': 'fit/land.light/fingertip_book', 'b_tap2': 'fit/land.light/finger_wood',
           'b_tap4': 'knock/wood', 'b_hit1': 'cut_hit/punch'}
cred = []
for src, n in sorted(SRC.items()):
    kind, name = src.split(':', 1)
    if kind == 'real':
        d = REALL.get(name, {}); cred.append(dict(datei='ton/sfx_real/' + name, einsaetze=n, art='echte Aufnahme (Freesound)', titel=d.get('titel'), autor=d.get('autor'), lizenz=d.get('lizenz'), url=d.get('seite'), namensnennung=d.get('namensnennung')))
    elif kind == 'enno':
        cred.append(dict(datei='ton/sfx_enno/' + name, einsaetze=n, art='echte Aufnahme (ennos eigene SFX, shorts-wissen/sfx)', titel=name, autor='enno', lizenz='eigen'))
    elif kind == 'earshot':
        cred.append(dict(datei='ton/earshot/' + name, einsaetze=n, art='earshot-Bank (im Code gerendert)', titel=name, autor='earshot 0.4.1 (Leonxlnx/earshot)', lizenz='MIT',
                         befehl='earshot sfx render %s -o %s --peak -3' % (BANKCMD.get(name[:-4], '?'), name)))
    else:
        cred.append(dict(datei=None, einsaetze=n, art='Code-PLATZHALTER (Reibungsrauschen bzw. Klatsch-Koerner) bis echte Aufnahmen in ton/sfx_real/ liegen', titel=name, autor='sfx_beethoven.py', lizenz='eigen'))
json.dump({'stand': 'automatisch von ton/sfx_beethoven.py', 'dateien': cred}, open(os.path.join(HERE, 'credits_sfx.json'), 'w'), indent=1, ensure_ascii=False)
print('sfx.wav: %d Anschlaege, %d benannte Ereignisse, %d stumm' % (len(PLACED), len(main), len(STUMM)))
print('Quellen:', ', '.join('%s x%d' % kv for kv in sorted(SRC.items())))
