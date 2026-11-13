# Papier fuer die Vox-Karte (ohne Karo-Raster, das tex/paper300.jpg hat): Fasern, Wolken, feines Korn -> tex/papier_karte.jpg
# Wird in AE ueber der Karte multipliziert (Bildschirm-fest, faehrt nicht mit). Eigene Erzeugung (numpy), frei.
import os
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
W, H = 1200, 2134
r = np.random.default_rng(1311)
v = np.ones((H, W), np.float32)
for sig, amp in ((180, 0.035), (60, 0.025), (14, 0.018), (3, 0.012)):   # Wolken in mehreren Groessen
    n = gaussian_filter(r.standard_normal((H, W)).astype(np.float32), sig); n /= (np.abs(n).max() + 1e-6); v += n * amp
v += r.standard_normal((H, W)).astype(np.float32) * 0.012                # feines Korn
fib = np.zeros((H, W), np.float32)                                         # Fasern: kurze, leicht gebogene Striche
for _ in range(2600):
    x, y = r.uniform(0, W), r.uniform(0, H); a = r.uniform(0, np.pi); L = r.uniform(8, 46); cv = r.uniform(-0.03, 0.03)
    for t in np.linspace(0, L, int(L)):
        xx, yy = int(x + np.cos(a + cv * t) * t), int(y + np.sin(a + cv * t) * t)
        if 0 <= xx < W and 0 <= yy < H: fib[yy, xx] += 1
fib = gaussian_filter(fib, 0.6); v -= np.clip(fib, 0, 1) * 0.05
# Raender minimal dunkler (Papier-Altern)
yy, xx = np.mgrid[0:H, 0:W]; d = np.minimum(np.minimum(xx, W - 1 - xx) / W, np.minimum(yy, H - 1 - yy) / H)
v -= np.clip(0.06 - d, 0, None) * 0.5
img = np.clip(v * 242, 0, 255).astype(np.uint8)
Image.fromarray(img).save(os.path.join(ROOT, 'tex', 'papier_karte.jpg'), quality=88)
print('papier_karte.jpg', W, H, 'Mittel', img.mean().round(1), 'min', img.min(), 'max', img.max())
