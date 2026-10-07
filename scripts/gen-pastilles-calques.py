"""
Découpe les pastilles de points (`public/stream/<n>_empty.webp`) en deux calques,
pour que l'overlay recolore le fond du point marqué et les chiffres.

    python -X utf8 scripts/gen-pastilles-calques.py

Écrit `public/stream/points/<n>_socle.webp` (anneau et ombres, sans le chiffre) et
`<n>_chiffre.webp` (le chiffre seul, blanc, dont seul le canal alpha sert de masque).

Mesuré sur les images, pas supposé :
- une pastille « full » est la « empty » posée sur un disque (28, 96, 166) : vérifié
  au pixel sur le 8. Le disque se dessine donc en CSS sous le socle ;
- les images sont en gris pur (R = G = B partout) : le chiffre blanc se sépare de son
  ombre noire par le calcul, `blanc = R × alpha` ;
- le chiffre est fait des composantes blanches qui restent sous un rayon de 270 px ;
  l'anneau et les encoches commencent à 240 px du centre et vont au-delà.

Sort en 1 si le recollage des calques s'écarte de l'image d'origine : un calque
faux se verrait en direct, sur toutes les pastilles.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

SOURCE = Path("public/stream")
CIBLE = SOURCE / "points"
RAYON_CHIFFRE = 270
MARGE_BORD = 6  # px autour du chiffre, pour garder son bord adouci

CIBLE.mkdir(exist_ok=True)
yy, xx = np.mgrid[0:1000, 0:1000]
rayon = np.hypot(xx - 500, yy - 500)
echec = False

for n in range(1, 11):
    a = np.array(Image.open(SOURCE / f"{n}_empty.webp").convert("RGBA")).astype(float) / 255
    if a.shape[:2] != (1000, 1000):
        sys.exit(f"{n}_empty.webp n'est pas en 1000x1000")
    alpha = a[..., 3]
    blanc = a[..., 0] * alpha  # part de blanc, prémultipliée

    etiquettes, nombre = ndimage.label(blanc > 0.5)
    chiffre = np.zeros_like(alpha, dtype=bool)
    for i in range(1, nombre + 1):
        composante = etiquettes == i
        if rayon[composante].max() < RAYON_CHIFFRE:
            chiffre |= composante
    if not chiffre.any():
        sys.exit(f"{n} : aucun chiffre trouvé au centre")
    zone = ndimage.binary_dilation(chiffre, iterations=MARGE_BORD) & (rayon < RAYON_CHIFFRE)

    # Dans la zone : pixel = chiffre blanc (alpha w) posé sur une ombre noire (alpha s).
    w = np.where(zone, blanc, 0)
    ombre = np.where(zone, np.where(w < 0.999, (alpha - w) / np.maximum(1 - w, 1e-3), 0), alpha)
    ombre = np.clip(ombre, 0, 1)

    socle = a.copy()
    socle[..., 3] = ombre
    socle[zone, :3] = 0
    masque = np.ones_like(a)
    masque[..., 3] = w

    socle8 = (socle * 255).round().astype(np.uint8)
    masque8 = (masque * 255).round().astype(np.uint8)
    Image.fromarray(socle8, "RGBA").save(CIBLE / f"{n}_socle.webp", lossless=True)
    Image.fromarray(masque8, "RGBA").save(CIBLE / f"{n}_chiffre.webp", lossless=True)

    # Contrôle : chiffre blanc sur socle doit redonner l'image d'origine.
    recolle = Image.alpha_composite(Image.fromarray(socle8, "RGBA"), Image.fromarray(masque8, "RGBA"))
    origine = np.array(Image.open(SOURCE / f"{n}_empty.webp").convert("RGBA")).astype(int)
    r = np.array(recolle).astype(int)
    # Comparaison en prémultiplié : la couleur d'un pixel transparent ne compte pas.
    pre = lambda p: np.dstack([p[..., :3] * p[..., 3:4] / 255, p[..., 3]])
    ecart = np.abs(pre(r) - pre(origine)).max()
    print(f"{n:>2} : chiffre {int(chiffre.sum())} px, écart max au recollage {ecart:.1f}")
    if ecart > 3:
        echec = True

sys.exit(1 if echec else 0)
