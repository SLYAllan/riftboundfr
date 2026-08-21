// Seed de l'article « Streamer Riftbound avec un téléphone ».
//
// Article d'annonce : l'overlay compact (?compact=1) et le compagnon de match.
// Aucune decklist, aucune donnée de tournoi : rien à relire en base, tout est du
// texte, des images et une vidéo servis par le site.
//
// Le mot du site est « overlay », pas « habillage » : c'est le libellé de la
// navbar et celui qu'emploient les streamers.
//
// L'article vise le montage MOBILE. Pas de marche à suivre OBS : le lien complet
// existe, on le mentionne, on ne l'explique pas ici.
//
// Les liens de matériel ne sont PAS sponsorisés (`isSponsored: false`) : le rendu
// n'affiche donc pas de pastille « Sponsorisé » et les liens ne partent pas en
// rel="sponsored". Une phrase le dit aussi en clair dans le texte.
//
// Rejouable : upsert sur le slug. Après toute retouche de texte, relancer aussi
// `scripts/gen-i18n-article-overlay.mts` : les clés anglaises sont indexées par
// le français exact, une phrase modifiée ici repasse en français sur /en.
//
//   npx tsx --env-file=.env scripts/seed-article-overlay-compagnon.mts
import { prisma } from "../src/lib/prisma";

const SLUG = "streamer-riftbound-avec-un-telephone";

const t = (id: string, content: string) => ({ id, type: "text", content });
const sep = (id: string) => ({ id, type: "separator" });
const img = (id: string, src: string, alt: string, caption?: string) => ({ id, type: "image", src, alt, caption });
const video = (id: string, src: string, poster: string, caption: string) => ({ id, type: "video", src, poster, caption });
// Lien de matériel. `isSponsored: false` : Allan ne touche rien dessus, et le
// rendu doit le refléter (pas de pastille, pas de rel="sponsored").
const materiel = (id: string, title: string, description: string, imageUrl: string, url: string) => ({
  id,
  type: "sponsor_link",
  title,
  description,
  imageUrl,
  ctaText: "Voir sur Amazon",
  url,
  style: "standard",
  isSponsored: false,
});

const blocks = [
  t(
    "intro",
    `L'overlay du site permet de filmer une partie avec OBS. Pour un tournoi en boutique ou une partie entre amis, un PC, une caméra et un second écran prennent vite trop de place.

Cette nouvelle version tient sur deux appareils : un téléphone sur un trépied filme la table et affiche l'overlay ; une tablette, ou un vieux téléphone, reste entre les joueurs pour compter les points. Les joueurs gèrent leur match, le score suit à l'écran et vous pouvez vous concentrer sur le direct.`,
  ),
  video(
    "demo",
    "/video/overlay-compagnon-demo.mp4",
    "/img/articles/overlay-compagnon-demo.webp",
    "Le téléphone filme la table pendant que les joueurs comptent leurs points sur la tablette.",
  ),
  sep("sep-compact"),
  t(
    "compact",
    `## Un overlay prévu pour le téléphone

L'overlay compact garde ce qui aide à suivre la partie : le score, les deux Légendes avec leur champion élu, les champs de bataille, les manches gagnées et la carte affichée. Il retire les cadres caméra, le décor, le chrono et le logo du tournoi.

Son fond transparent se pose sur la vidéo sans cacher le tapis. Les textes restent lisibles sur le petit écran d'un téléphone.`,
  ),
  img(
    "compact-partie",
    "/img/articles/overlay-compact-partie.webp",
    "Une partie en cours vue du dessus, avec l'overlay compact posé par-dessus.",
    "Le score, les Légendes et les champs de bataille restent visibles pendant la partie.",
  ),
  t(
    "compact-details",
    `Vous pouvez lancer la scène avant de recevoir les decklists. Le cadre des cartes reste vide, puis vous collez chaque liste pendant que les joueurs s'installent.`,
  ),
  t(
    "compact-cartes",
    `Pendant la partie, un clic affiche une carte de la decklist et un second la retire. La recherche permet aussi de montrer une carte absente des deux decks. Si personne ne pilote le direct, le mode automatique fait défiler les cartes à la vitesse choisie.`,
  ),
  img(
    "compact-plateau",
    "/img/articles/overlay-compact-plateau.webp",
    "Le plateau vide avant le début de la partie, avec les deux Légendes et le score déjà affichés.",
    "Le spectateur voit les deux decks avant le début de la partie.",
  ),
  sep("sep-compagnon"),
  t(
    "compagnon",
    `## Le compagnon de match

Les joueurs ouvrent un lien, sans compte ni application à installer. Ils choisissent le format, les points requis pour gagner, puis leurs pseudos, leur Légende, leur champion élu et leur champ de bataille. Après le récapitulatif, « Lancer la partie » envoie tout sur l'overlay.

L'écran se partage ensuite dans la longueur. Chaque joueur lit sa moitié à l'endroit depuis sa chaise et change ses points avec deux gros boutons.`,
  ),
  img(
    "compagnon-tablette",
    "/img/articles/compagnon-tablette.webp",
    "Le compagnon de match sur une tablette posée à plat entre les deux joueurs, l'écran coupé en deux.",
    "Chaque joueur gère ses points depuis son côté de la table.",
  ),
  t(
    "compagnon-mecanique",
    `À la fin d'une manche, les joueurs touchent « Fin de la manche », indiquent le gagnant et choisissent le champ de bataille suivant. « Annuler la dernière manche » corrige une erreur.

De votre côté, vous pouvez changer le titre ou la carte affichée sans toucher au score saisi par les joueurs.`,
  ),
  t(
    "compagnon-securite",
    `Toute personne qui possède le lien du compagnon peut changer le score. Ne montrez pas ce lien en direct et ne le laissez pas dans une capture.`,
  ),
  sep("sep-montage"),
  t(
    "montage",
    `## Installer l'overlay sur votre téléphone

Tout part de la page **[Overlay](/profil/overlay)**, dans votre profil. Connectez-vous avec Discord, et gardez ces deux liens sous la main :

| Lien | À quoi il sert |
|---|---|
| L'overlay compact | L'overlay à poser sur l'image de votre téléphone |
| Le lien compagnon | La version des joueurs, à leur envoyer |

## Préparer le match sur le site

La page Overlay pilote le direct. Chaque changement est enregistré et envoyé à l'écran aussitôt : il n'y a pas de bouton « Enregistrer ».

1. Ouvrez **Liens et affichage OBS**, puis copiez **l'overlay compact**. C'est cette adresse que vous collerez dans Moblin.
2. Copiez ensuite le **lien compagnon** et ouvrez-le sur la tablette posée entre les joueurs.
3. Les joueurs choisissent le format, les points requis pour gagner, leurs pseudos, leurs Légendes, leurs champions élus et leurs champs de bataille. Dès qu'ils touchent **Lancer la partie**, l'overlay reçoit ces données.
4. Pour montrer des cartes, ouvrez **Cartes à l'écran** dans le tableau de bord. Collez une decklist pour chaque joueur, touchez **Charger**, puis choisissez l'affichage. Un clic sur une carte la montre ; **Diapo auto** les fait défiler.

Vous pouvez corriger un pseudo, un score ou une carte depuis le tableau de bord pendant le match. Le compagnon et la page Overlay mettent à jour des parties différentes de l'écran, donc les joueurs peuvent continuer à compter leurs points pendant vos changements.

## Avec Moblin

[Moblin](https://apps.apple.com/app/moblin/id6466745933) est une application gratuite et à code ouvert pour iPhone. Elle filme, diffuse vers Twitch, YouTube ou Kick et peut poser une page web sur la vidéo.

L'overlay compact se charge dans Moblin comme un widget Navigateur transparent. Moblin reçoit une page web en 1920 × 1080, puis l'adapte à la vidéo du téléphone. Il faut donc garder cette taille même si l'écran de l'iPhone a une autre définition.

Le réglage prend six étapes :

1. **Réglages**, puis **Widgets de scène**, puis **Créer**.
2. Type **Navigateur**, et un nom pour le retrouver.
3. Collez le lien de l'overlay compact dans le champ **URL**.
4. Cochez la scène qui filme la table.
5. Dans les réglages du widget, gardez une largeur de **1920** et une hauteur de **1080** pour ne pas déformer l'overlay.
6. Vérifiez que le widget est bien allumé dans la scène.

La vidéo ci-dessous montre les six étapes. L'application y apparaît en anglais car elle suit la langue du téléphone.`,
  ),
  video(
    "moblin-video",
    "/video/moblin-widget.mp4",
    "/img/articles/moblin-widget.webp",
    "Le montage complet dans Moblin, de la création du widget jusqu'à l'overlay affiché sur la scène.",
  ),
  img(
    "moblin-telephone",
    "/img/articles/overlay-moblin-telephone.webp",
    "Un iPhone sur un petit trépied, qui filme le tapis avec l'overlay compact déjà en place.",
    "Côté caméra, le montage tient dans un téléphone et un trépied.",
  ),
  sep("sep-materiel"),
  t(
    "materiel",
    `## Choisir un support

Pour garder une image stable pendant toute la partie, posez le téléphone sur un trépied ou un bras fixé à la table. **Aucun de ces deux liens n'est sponsorisé** : je ne touche rien sur les ventes et les prix peuvent changer.`,
  ),
  t(
    "materiel-1",
    `### Sur la table, à côté du tapis

Ce petit trépied filme de biais depuis le bord du tapis et tient dans une poche de sac. Il faut ajouter une pince pour téléphone : le modèle porte une vis photo, pas un berceau.`,
  ),
  materiel(
    "lien-pixi",
    "Manfrotto PIXI, trépied de table",
    "Un petit trépied à poser au bord du tapis.",
    "/img/articles/materiel/pixi.webp",
    "https://www.amazon.fr/dp/B09GKLCP95",
  ),
  t(
    "materiel-2",
    `### Au-dessus du tapis

La vue du dessus montre mieux la partie, mais demande de suspendre le téléphone sans gêner les joueurs. Ce bras articulé se serre au bord de la table et tient l'iPhone avec un aimant MagSafe. Un anneau magnétique est fourni pour les autres téléphones.`,
  ),
  materiel(
    "lien-ugreen",
    "UGREEN, bras articulé magnétique",
    "Se serre au bord de la table, tient le téléphone par aimant.",
    "/img/articles/materiel/ugreen.webp",
    "https://www.amazon.fr/dp/B0D2RC162S",
  ),
];

const data = {
  title: "Comment streamer une partie de Riftbound avec un téléphone",
  excerpt:
    "Un téléphone filme la table, les joueurs comptent leurs points sur un second appareil et l'overlay se met à jour. Voici le matériel et les réglages nécessaires.",
  coverImage: "/img/articles/overlay-compagnon-cover.webp",
  category: "guide",
  tags: ["stream", "overlay", "compagnon", "moblin", "tutoriel"],
  blocks,
  published: true,
  publishedAt: new Date(),
};

async function main() {
  const a = await prisma.article.upsert({
    where: { slug: SLUG },
    create: { slug: SLUG, ...data },
    update: data,
  });
  console.log(`Article ${a.published ? "publié" : "en brouillon"} : /articles/${a.slug}`);
  console.log(`${blocks.length} blocs, 2 liens de matériel non sponsorisés.`);
  console.log(`Couverture : ${a.coverImage}`);
}

main().finally(() => prisma.$disconnect());
