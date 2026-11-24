# Taktiles Sounddesign nach Chris Moran fuer den Apollo-13-Short (25.11.2026), aufgebaut wie ton/sfx_pizza.py der Vorlage.
# Eingang: ton/events_alle.json (node ton/events_apollo.js). Regeln:
#   - je Szene genau EIN Ton: das Ereignis mit ton=true (Hauptgeraet, bei Dauerbewegung das naechste klare Ereignis); alle anderen bleiben stumm (Liste "stumm")
#   - Hervorhebung (Callout, Farbsweep) -> Filzstift; Kreise/Formen/Pfeile/Bahn/Haken/Kreuz -> Bleistift mit der sichtbaren Strichlaenge
#   - Zaehler/Odometer/Stapel -> Ticks auf jedem sichtbaren Wechsel; Schlag -> dumpfer Impact; Funkringe -> kurzes Funkrauschen (static_1, CC0)
#   - jeder Schnitt -> TIEFER Whoosh (Rate 0.8 + Tiefpass 2.5 kHz) als J-Cut: setzt 3 Frames vor dem Schnitt ein, Spitze auf dem ersten neuen Frame
#   - jeder Ton bleibt in seiner Szene: wird hart vor f_ende (Szenenende - 2 Frames) mit Fade beendet; der Schnitt-Whoosh endet 0.3 s nach dem Schnitt
#   - alle Zeiten sind SICHTBARE Frames (Master hat Posterize Time 12)
#   - Quellen nur ton/sfx_real/ (alle CC0, Liste ton/sfx_real_liste.json) und ennos eigene Aufnahmen ton/sfx_enno/; keine CC-BY-Dateien
# Aufruf: python3 ton/sfx_apollo.py   -> ton/sfx.wav (Stereo 48 kHz, Spitzen-normiert), ton/sfx_events.json, ton/credits_sfx.json
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

# ---------- Bibliothek je Rolle ----------
ENNO_ROLLE = {'whoosh': ['swipe4', 'swipe3', 'whoosh_real', 'swipe7', 'swipe1'], 'whip': ['swipe1', 'whoosh_real', 'swipe6'],
              'typewriter': ['typing'], 'click': ['click_real'], 'pop': ['pop_real']}
BANK_ROLLE = {}   # Apollo: keine earshot-Bank, nur echte CC0-Aufnahmen + enno
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

# ---------- Apollo: Szenengrenzen (jeder Ton bleibt in seiner Szene) ----------
E = EVJ['events']; SZ = EVJ['szenen']
def scene_end_f(f):   # letzter erlaubter Frame der Szene, in der Frame f sichtbar ist
    for s in SZ:
        if s['start'] * FPS - 1e-6 <= f < s['end'] * FPS - 1e-6: return int(round(s['end'] * FPS)) - 2
    return int(round(DUR * FPS)) - 1
def in_scene(fn, f_last):
    """fn() setzt Toene; danach wird alles, was ueber f_last hinausragt, abgeschnitten (Fade 30 ms)"""
    global out
    keep = out.copy(); out[:] = 0; i0 = len(PLACED)
    fn()
    n1 = min(N, int(F(f_last + 1) * SR)); fo = int(0.03 * SR)
    seg = out.copy()
    seg[:, n1 - fo:n1] *= np.linspace(1, 0, fo)[None, :]; seg[:, n1:] = 0
    out[:] = keep + seg
    for p in PLACED[i0:]: p['bis_f'] = f_last
def low_whoosh(f_cut, db, what, ev, k):
    """tiefer Whoosh: echte Aufnahme langsamer (Rate 0.8, tiefer) + Tiefpass; J-Cut 3 Frames vor dem Schnitt"""
    x, src, r = take('whoosh')
    x = x[:, onset(x):]; x = rate(x, 0.8 * (1.0 + 0.04 * ((k % 3) - 1)))
    x = lp(x, 2500, 2); x = hp(x, 60, 2); x = norm(x)
    a = apex(x); lead = int(F(3) * SR)
    if a > lead:
        x = x[:, a - lead:]; a = lead
    x = fade(x[:, :a + int(0.3 * SR)], 0.02, 0.12)
    put(x, F(f_cut) - a / SR, db, 0.0, what, ev, src + ' (Rate 0.8, Tiefpass 2.5 kHz)', F(f_cut))

# ---------- Plan: Ereignis -> Ton ----------
STUMM = []; pside = 0.2; k = 0
for e in E:
    typ, f0, w = e['typ'], e['f_sicht'], e['what']; f1 = e.get('f1_sicht', f0); sc = e.get('scene')
    if typ == 'cut':
        low_whoosh(f0, -8, 'tiefer Whoosh, J-Cut 3 Frames: ' + w, f0, k); k += 1; continue
    if not e.get('ton'):
        STUMM.append((f0, sc + ': ' + w, e.get('grund', 'stumm'))); continue
    pside = -pside; fe = e['f_ende']; art, rolle = e['art'], e['rolle']
    def go():
        if rolle == 'pencil':
            if art == 'kreuz' or art == 'haken':
                stroke('pencil', f0, min(f1, fe - 4), -5, pside, 'Bleistift-Strich (%s): %s' % (art, w), f0)
            else:
                stroke('pencil', f0, min(f1, fe - 4), -6, pside, 'Bleistift (%s): %s' % (art, w), f0)
        elif rolle == 'marker':
            stroke('marker', f0, min(max(f1, f0 + 6), fe - 4), -4, pside, 'Filzstift-Hervorhebung (%s): %s' % (art, w), f0)
        elif rolle == 'tick':
            fr = [int(round(t * FPS)) for t in (e.get('steps_sicht') or [])]
            if not fr: fr = [int(round(t * FPS)) for t in e.get('hits_sicht', [])] if art == 'stapel' else steps12(f0, f1)
            fr = [f for f in fr if f <= fe - 2]
            keys('tick', fr, -9, 0.2, 'Ticks je sichtbarem Wechsel (%s): %s' % (art, w), f0)
        elif rolle == 'impact':
            oneshot('impact', f0, -5, 0.0, 'dumpfer Schlag (Slam): ' + w, f0, at='apex', maxlen=0.6)
        elif rolle == 'static':
            L = lib('static'); x, src = L[0]
            seg = norm(fade(best_segment(x, 0.5, k=0 if sc == 'houston' else 1), 0.01, 0.15))
            put(seg, F(f0), -14, 0.0, 'kurzes Funkrauschen unter den Funkringen: ' + w, f0, src, F(f0)); SRC[src] = SRC.get(src, 0) + 1
        elif rolle == 'paper':
            stroke('paper', f0, min(f0 + 10, fe - 4), -8, pside, 'Lupe gleitet (leise Papier-Reibung): ' + w, f0)
        elif rolle == 'tap':
            hits = [int(round(t * FPS)) for t in e.get('hits_sicht', [f0 / FPS])][:3]
            keys('tap', [h for h in hits if h <= fe - 2], -7, pside, 'Tap je Einsatz (%s): %s' % (art, w), f0)
        elif rolle == 'click':
            oneshot('click', f0, -3, 0.1, 'Mausklick: Folgen -> Gefolgt', f0)
    in_scene(go, fe)

o = hp(out, 30)
pk = np.abs(o).max(); o = o / pk * 0.9   # Spitzen-normiert; mix_apollo.py setzt den Pegel gegen die Stimme
write_wav(os.path.join(HERE, 'sfx.wav'), o)
main = [p for p in PLACED if p['what']]
json.dump({'fps': FPS, 'hinweis': 'f/t = sichtbares Ereignis (Sync-Punkt), start = Einsatz der Datei (J-Cut/Vorlauf), db = Pegel relativ, bis_f = letzter Frame der Szene (Ton endet davor).',
           'gain_in_sfx_wav_db': round(20 * np.log10(0.9 / pk), 2),
           'events': [{'f': p['f'], 'kind': 'sfx', 'id': p['what'], 't': p['t'], 'start': p['start'], 'db': p['db'], 'src': p['src'], 'event_f_sicht': p['ev'], 'bis_f': p.get('bis_f')} for p in main],
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
        cred.append(dict(datei=None, einsaetze=n, art='Code-PLATZHALTER (Reibungsrauschen) bis echte Aufnahmen in ton/sfx_real/ liegen', titel=name, autor='sfx_apollo.py', lizenz='eigen'))
json.dump({'stand': 'automatisch von ton/sfx_apollo.py', 'dateien': cred}, open(os.path.join(HERE, 'credits_sfx.json'), 'w'), indent=1, ensure_ascii=False)
print('sfx.wav: %d Anschlaege, %d benannte Ereignisse, %d stumm' % (len(PLACED), len(main), len(STUMM)))
print('Quellen:', ', '.join('%s x%d' % kv for kv in sorted(SRC.items())))
