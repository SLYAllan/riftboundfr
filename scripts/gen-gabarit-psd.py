"""
Écrit les deux gabarits Photoshop que le tableau de bord propose aux streamers, à partir
des calques posés par `gen-decor-overlay.mts`. Ne pas lancer seul : `npm run gen:decor`.

Demande `pip install psd-tools`.

Le calque de fond porte le masque des découpes : on peint dedans, ou on colle une image
au-dessus en masque d'écrêtage, et les trous restent au bon endroit. L'ancien gabarit
avait un objet dynamique dans un groupe masqué : psd-tools ne sait pas écrire le
premier, et un masque sur un groupe rend le fichier illisible (essayé, version 1.26).

Sort en 1 si le gabarit relu s'écarte du décor du site : un streamer partirait d'un
dessin faux, et ses découpes tomberaient à côté de ce que le code remplit.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from psd_tools import PSDImage

CALQUES = Path("node_modules/.cache/decor-overlay")
STREAM = Path("public/stream")


def calque(nom):
    return Image.open(CALQUES / f"{nom}.png").convert("RGBA")


def gabarit(suffixe, sortie, avec_chrono):
    decor = calque(f"decor{suffixe}")
    psd = PSDImage.frompil(decor)
    fond = psd.create_pixel_layer(calque(f"fond{suffixe}"), name="<- FOND A REMPLACER (le masque garde les decoupes)")
    fond.create_mask(calque(f"masque{suffixe}").convert("L"))
    psd.create_pixel_layer(calque(f"cadres{suffixe}"), name="Cadres")
    # Ce que le site pose lui-même : caché, ça sert à se repérer. Le compact n'a pas de chrono.
    reperes = [
        ("Repère : cartes à droite (laisser caché)", Image.open(STREAM / "cartes_droite.webp").convert("RGBA")),
        ("Repère : cartes à gauche (laisser caché)", Image.open(STREAM / "cartes_gauche.webp").convert("RGBA")),
    ]
    if avec_chrono:
        reperes.append(("Repère : chrono (laisser caché)", calque("chrono")))
    for nom, img in reperes:
        psd.create_pixel_layer(img, name=nom).visible = False
    psd.save(STREAM / sortie)
    return decor


def ecart(chemin, attendu):
    """Relit le fichier écrit et compare, en prémultiplié : un pixel transparent n'a pas de couleur."""
    relu = PSDImage.open(chemin).composite(force=True, viewport=(0, 0, 1920, 1080)).convert("RGBA")
    pre = lambda im: (lambda a: np.dstack([a[..., :3] * a[..., 3:4] / 255, a[..., 3]]))(np.asarray(im).astype(float))
    return np.abs(pre(relu) - pre(attendu)).max(axis=2)


echec = False
for chemin, attendu in ((STREAM / "layout.psd", gabarit("", "layout.psd", True)), (STREAM / "layout_compact.psd", gabarit("_compact", "layout_compact.psd", False))):
    e = ecart(chemin, attendu)
    faux = int((e > 8).sum())
    print(f"{chemin} : {chemin.stat().st_size // 1024} Ko, {faux} pixels s'écartent du décor (écart max {e.max():.0f})")
    # Quelques pixels de bord changent à l'arrondi du masque ; au-delà, le dessin est faux.
    if faux > 200:
        echec = True

sys.exit(1 if echec else 0)
