// force-dynamic: queries the DB; `revalidate` froze it empty at Docker build.
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { prisma, safeQuery } from "@/lib/prisma";
import { GlossaireClient } from "./glossaire-client";

export const metadata: Metadata = {
  title: { absolute: "Glossaire Riftbound - Tous les termes du jeu expliqués" },
  description:
    "Dictionnaire complet des termes Riftbound : Conquer, Hold, Showdown, Rune, Domaine, Might et tous les keywords expliqués en français.",
  alternates: { canonical: "/guides/glossaire" },
  openGraph: {
    type: "article",
    siteName: "Riftbound France",
    locale: "fr_FR",
    title: "Glossaire Riftbound - Tous les termes du jeu expliqués",
    description:
      "Conquer, Hold, Showdown, Rune, Domaine, Might et tous les keywords Riftbound expliqués en français.",
    images: ["/img/og-default.png"],
  },
};

export type GlossaryCategory =
  | "Mécaniques"
  | "Types de cartes"
  | "Phases de jeu"
  | "Zones de jeu"
  | "Actions"
  | "Timing"
  | "Ressources"
  | "Formats & Règles";

export interface GlossaryTerm {
  term: string;
  en: string;
  category: GlossaryCategory;
  subcategory?: string;
  definition: string;
  related?: string[];
}

const terms: GlossaryTerm[] = [
  // === Timing ===
  { term: "Action", en: "Action", category: "Timing", definition: "Mot-clé : en plus de pouvoir être jouée dans un état ouvert, cette carte peut être jouée comme une Action. Jouable pendant le tour de n'importe quel joueur, pas seulement le vôtre.", related: ["Réaction", "Confrontation"] },
  { term: "Réaction", en: "Reaction", category: "Timing", definition: "Mot-clé : octroie toutes les possibilités d'une Action, et permet en plus de jouer la carte pendant un état fermé (par exemple en plein combat). Idéal pour intervenir au dernier moment.", related: ["Action", "Confrontation"] },

  // === Mécaniques (Unité) ===
  { term: "Accélération", en: "Accelerate", category: "Mécaniques", subcategory: "Mot-clé (Unité)", definition: "Payez [1] énergie + un coût supplémentaire en Puissance (ressource) pour que cette unité arrive prête au lieu d'être épuisée. Elle peut agir immédiatement ce tour.", related: ["Épuiser", "Préparer", "Puissance (ressource)"] },
  { term: "Embuscade", en: "Ambush", category: "Mécaniques", subcategory: "Mot-clé (Unité)", definition: "Vous pouvez jouer cette unité directement sur un champ de bataille (au lieu de la Base) si vous y avez déjà des unités. Peut être jouée en Réaction, donc même pendant le combat adverse.", related: ["Réaction", "Champ de bataille", "Caché"] },
  { term: "Assaut", en: "Assault", category: "Mécaniques", subcategory: "Mot-clé (Unité)", definition: "Cette unité gagne +Puissance quand elle attaque. Le bonus s'applique uniquement en attaque, pas en défense. Opposé de Bouclier.", related: ["Bouclier", "Puissance", "Confrontation"] },
  { term: "Arrière-ligne", en: "Backline", category: "Mécaniques", subcategory: "Mot-clé (Unité)", definition: "Cette unité est tuée en dernier pendant le combat. Vos autres unités sans Arrière-ligne meurent avant elle. Utile pour protéger vos unités fragiles mais importantes.", related: ["Tank", "Confrontation"] },
  { term: "Bouclier", en: "Shield", category: "Mécaniques", subcategory: "Mot-clé (Unité)", definition: "Cette unité gagne +Puissance quand elle défend. Le bonus s'applique uniquement en défense, pas en attaque. Opposé d'Assaut.", related: ["Assaut", "Tank", "Puissance"] },
  { term: "Tank", en: "Tank", category: "Mécaniques", subcategory: "Mot-clé (Unité)", definition: "Cette unité est tuée en premier pendant le combat, avant les autres. Elle sert de bouclier humain pour protéger vos unités fragiles.", related: ["Arrière-ligne", "Bouclier", "Confrontation"] },
  { term: "Gank", en: "Ganking", category: "Mécaniques", subcategory: "Mot-clé (Unité)", definition: "Cette unité peut se déplacer directement d'un champ de bataille à un autre, sans repasser par la Base. Très utile pour attaquer sur plusieurs fronts.", related: ["Champ de bataille", "Déplacer", "Conquête"] },
  { term: "Chasse", en: "Hunt", category: "Mécaniques", subcategory: "Mot-clé (Unité)", definition: "Vous gagnez X points d'XP quand cette unité aide à conquérir ou contrôler un champ de bataille. L'XP débloque des bonus Niveau.", related: ["XP", "Niveau", "Conquête"] },
  { term: "Expert en armes", en: "Weaponmaster", category: "Mécaniques", subcategory: "Mot-clé (Unité)", definition: "Quand vous jouez cette unité, vous pouvez immédiatement lui attacher un Équipement que vous contrôlez à coût réduit.", related: ["Équipement", "Équiper"] },

  // === Mécaniques (Permanent) ===
  { term: "Agonie", en: "Deathknell", category: "Mécaniques", subcategory: "Mot-clé (Permanent)", definition: "Quand cette unité meurt, elle déclenche un effet bonus. Très utilisé dans le domaine Ordre.", related: ["Domaine", "Temporaire"] },
  { term: "Protection", en: "Deflect", category: "Mécaniques", subcategory: "Mot-clé (Permanent)", definition: "Votre adversaire doit payer de la Puissance (ressource) supplémentaire pour cibler cette carte avec un sort ou une capacité. Rend vos cartes plus difficiles à détruire.", related: ["Puissance (ressource)"] },
  { term: "Temporaire", en: "Temporary", category: "Mécaniques", subcategory: "Mot-clé (Permanent)", definition: "Cette carte se détruit automatiquement au début de votre prochain tour. Elle n'est là que pour un tour. Se combine bien avec Agonie.", related: ["Agonie"] },
  { term: "Vision", en: "Vision", category: "Mécaniques", subcategory: "Mot-clé (Permanent)", definition: "Quand vous jouez cette carte, regardez la carte du dessus de votre deck. Si elle ne vous plaît pas, vous pouvez la mettre en dessous du deck (recycler).", related: ["Recycler", "Prédiction"] },

  // === Mécaniques (Sort) ===
  { term: "Répétition", en: "Repeat", category: "Mécaniques", subcategory: "Mot-clé (Sort)", definition: "En payant un coût supplémentaire (indiqué sur la carte), vous pouvez lancer ce sort une deuxième fois dans la foulée." },
  // Vendetta, en vigueur le 24 juillet 2026. Définitions reprises des règles du jeu
  // officielles FR du 16/07/2026 (règles 829, 827, 828, 440, 443).
  { term: "Flux", en: "Flow", category: "Mécaniques", subcategory: "Mot-clé (Sort)", definition: "Vous pouvez lancer ce sort depuis votre défausse en payant son coût de Flux au lieu de son coût normal, puis il est banni. Le Flux ne change ni le moment où le sort peut être lancé ni ses autorisations, seulement la zone d'où il part.", related: ["Défausser", "Bannir"] },

  // === Mécaniques (Vendetta) ===
  { term: "Amplification", en: "Empower", category: "Mécaniques", subcategory: "Mot-clé (Vendetta)", definition: "Mot-clé de compétence activée, surtout sur les permanents et les Légendes. Payez le coût d'Amplification et la carte devient amplifiée. Un élément déjà amplifié ne peut pas l'être une seconde fois.", related: ["Amplifié", "Désamplifier"] },
  { term: "Amplifié", en: "Empowered", category: "Mécaniques", subcategory: "Mot-clé (Vendetta)", definition: "État binaire : une carte est amplifiée ou elle ne l'est pas. Le texte écrit après le symbole Amplifié n'est actif que tant que la carte garde cet état.", related: ["Amplification", "Désamplifier"] },
  { term: "Désamplifier", en: "Disempower", category: "Mécaniques", subcategory: "Mot-clé (Vendetta)", definition: "Retirer l'état amplifié d'une ou plusieurs cartes. Désamplifier une carte qui ne l'est pas ne fait rien.", related: ["Amplification", "Amplifié"] },

  // === Mécaniques (Équipement) ===
  { term: "Équiper", en: "Equip", category: "Mécaniques", subcategory: "Mot-clé (Équipement)", definition: "Payez le coût indiqué pour attacher cet Équipement à une de vos unités. L'unité bénéficie alors des bonus de l'Équipement.", related: ["Équipement", "Expert en armes", "Dégainer"] },
  { term: "Dégainer", en: "Quick-Draw", category: "Mécaniques", subcategory: "Mot-clé (Équipement)", definition: "Si vous jouez cet Équipement en Réaction (pendant le combat), il s'attache gratuitement à une de vos unités, sans payer le coût d'Équiper.", related: ["Équiper", "Réaction", "Équipement"] },

  // === Mécaniques (Autres) ===
  { term: "Caché", en: "Hidden", category: "Mécaniques", subcategory: "Mot-clé", definition: "Vous pouvez jouer cette carte face cachée sur un champ de bataille que vous contrôlez. Plus tard, retournez-la pour l'activer gratuitement - effet de surprise garanti. Typique du domaine Chaos.", related: ["Domaine", "Champ de bataille", "Embuscade"] },
  { term: "Légion", en: "Legion", category: "Mécaniques", subcategory: "Mot-clé", definition: "Si vous avez déjà joué une autre carte de votre deck ce tour, cette carte déclenche un effet bonus. Récompense le fait de jouer plusieurs cartes par tour." },
  { term: "Niveau", en: "Level", category: "Mécaniques", subcategory: "Mot-clé", definition: "Cette carte gagne un bonus quand vous avez accumulé suffisamment de points d'XP (le seuil est indiqué sur la carte). Fonctionne avec le mot-clé Chasse.", related: ["XP", "Chasse"] },
  { term: "Unique", en: "Unique", category: "Mécaniques", subcategory: "Construction de deck", definition: "Vous ne pouvez mettre qu'un seul exemplaire de cette carte dans votre deck, au lieu des 3 copies habituelles." },

  // === Actions ===
  { term: "Épuiser", en: "Exhaust", category: "Actions", definition: "Tourner une carte à l'horizontale pour l'utiliser (attaquer, activer une capacité, générer de l'énergie). Une carte épuisée ne peut plus rien faire tant qu'elle n'est pas préparée.", related: ["Préparer", "Accélération", "Énergie"] },
  { term: "Préparer", en: "Ready", category: "Actions", definition: "Remettre une carte à la verticale. Elle est de nouveau disponible pour être utilisée. Toutes vos cartes se préparent au début de votre tour (Phase d'Éveil).", related: ["Épuiser", "Phase d'Éveil"] },
  { term: "Brûler", en: "Burn", category: "Actions", definition: "Déplacer des cartes du dessus de votre deck principal vers la défausse. La carte s'écrit « Brûlez X », X étant le nombre de cartes. Vous ne brûlez que si un effet vous le demande.", related: ["Défausser", "Flux"] },
  { term: "Passer", en: "Skip", category: "Actions", definition: "Remplacer un événement par rien. « Passez votre phase de pioche » supprime la pioche ; « Passez le prochain déplacement de cette unité » supprime ce déplacement. Rien ne se déclenche à la place.", related: ["Déplacer", "Piocher"] },
  { term: "Défausser", en: "Discard", category: "Actions", definition: "Envoyer une carte de votre main directement dans votre défausse, sans la jouer. C'est vous qui choisissez les cartes, et vous ne défaussez que si un effet vous le demande.", related: ["Brûler", "Bannir", "Flux"] },
  { term: "Bannir", en: "Banish", category: "Actions", definition: "Déplacer une carte, depuis n'importe quelle zone, vers la zone de bannissement. Bannir n'est ni une élimination ni une défausse : la carte quitte la partie.", related: ["Défausser", "Flux"] },
  { term: "Prédiction", en: "Predict", category: "Actions", definition: "Regardez plusieurs cartes du dessus de votre deck. Gardez celles qui vous intéressent dans l'ordre voulu, et mettez les autres en dessous du deck.", related: ["Recycler", "Vision"] },
  { term: "Recycler", en: "Recycle", category: "Actions", definition: "Mettre une carte ou une rune en dessous de son deck respectif. Pour les runes, c'est aussi le moyen de générer de la Puissance (ressource).", related: ["Prédiction", "Puissance (ressource)", "Rune"] },
  { term: "Rappeler", en: "Recall", category: "Actions", definition: "Renvoyer des unités dans votre Base après un combat. Cela se produit quand vos unités survivantes ne conquièrent pas le champ de bataille.", related: ["Base", "Confrontation", "Conquête"] },
  { term: "Déplacer", en: "Move", category: "Actions", definition: "Envoyer une unité d'un endroit à un autre (par exemple de la Base vers un champ de bataille). Normalement, il faut épuiser l'unité pour la déplacer.", related: ["Gank", "Base", "Champ de bataille"] },

  // === Types de cartes ===
  { term: "Légende", en: "Legend", category: "Types de cartes", definition: "Votre leader permanent, toujours en jeu dès le début. Elle détermine vos 2 domaines et possède une capacité spéciale unique. Indestructible.", related: ["Domaine", "Champion"] },
  { term: "Champion", en: "Champion", category: "Types de cartes", definition: "Une unité spéciale que vous déclarez avant le début de la partie. Plus puissante qu'une unité normale. Ne pas confondre avec Légende.", related: ["Légende", "Puissance"] },
  { term: "Équipement", en: "Gear", category: "Types de cartes", definition: "Carte jouée dans la Base qui reste en jeu. Peut être attachée à une unité via Équiper. Si l'unité meurt, l'équipement survit et retourne dans la Base.", related: ["Équiper", "Expert en armes", "Dégainer", "Base"] },
  { term: "Rune", en: "Rune", category: "Types de cartes", definition: "Carte de votre deck de runes (12 cartes). Elles produisent vos ressources : épuisez une rune pour de l'Énergie, ou recyclez-la pour de la Puissance. Doivent correspondre aux domaines de votre Légende.", related: ["Énergie", "Puissance (ressource)", "Recycler", "Domaine"] },

  // === Phases de jeu ===
  { term: "Phase d'Éveil", en: "Awaken Phase", category: "Phases de jeu", definition: "Première phase de votre tour. Toutes vos cartes épuisées se redressent (se préparent) et redeviennent utilisables.", related: ["Préparer", "Épuiser"] },
  { term: "Canaliser", en: "Channel Phase", category: "Phases de jeu", definition: "Vous placez 2 Runes de votre deck de runes dans votre Base. Au Tour 1, le second joueur en place 3 pour compenser le désavantage.", related: ["Rune", "Base"] },
  { term: "Piocher", en: "Draw Phase", category: "Phases de jeu", definition: "Vous piochez 1 carte de votre deck principal. Votre Pool de Runes se vide aussi à ce moment.", related: ["Pool de Runes"] },
  { term: "Confrontation", en: "Confrontation", category: "Phases de jeu", definition: "L'affrontement complet sur un champ de bataille : il se déclenche quand les deux joueurs y ont des unités. Les joueurs peuvent jouer des Actions/Réactions, puis le combat se résout, et le vainqueur conquiert ou rappelle ses unités.", related: ["Combat", "Conquête", "Rappeler", "Champ de bataille"] },
  { term: "Combat", en: "Showdown", category: "Phases de jeu", definition: "L'étape de combat au sein d'une Confrontation. Le camp avec la plus grande Puissance totale gagne, et les unités du perdant sont éliminées.", related: ["Confrontation", "Puissance", "Réaction"] },
  { term: "Mulligan", en: "Mulligan", category: "Phases de jeu", definition: "Avant le Tour 1, vous pouvez mettre de côté jusqu'à 2 cartes de votre main de départ (4 cartes), piocher autant de nouvelles cartes, puis remettre les cartes mises de côté au fond du deck." },

  // === Zones de jeu ===
  { term: "Base", en: "Base", category: "Zones de jeu", definition: "Votre zone de départ. Les unités y arrivent quand vous les jouez, et vos Équipements y restent. Pour combattre, vous devez déplacer vos unités de la Base vers un champ de bataille.", related: ["Champ de bataille", "Équipement", "Rappeler"] },
  { term: "Champ de bataille", en: "Battlefield", category: "Zones de jeu", definition: "Zone de combat partagée entre les deux joueurs. Votre deck contient 1 à 3 champs de bataille. C'est là que se déroulent les Confrontations et que vous marquez des points.", related: ["Confrontation", "Conquête", "Base"] },
  { term: "Pool de Runes", en: "Rune Pool", category: "Zones de jeu", definition: "Votre réserve temporaire de ressources (Énergie et Puissance). Attention : elle se vide deux fois par tour (après la Pioche et en fin de tour), donc utilisez vos ressources avant qu'elles ne disparaissent.", related: ["Énergie", "Puissance (ressource)", "Rune"] },
  { term: "Réserve", en: "Side Deck", category: "Zones de jeu", definition: "Un lot de cartes supplémentaires que vous pouvez échanger avec votre deck entre les manches en format Bo3 (Best of 3). Permet de s'adapter à la stratégie adverse.", related: ["Bo1 / Bo3"] },

  // === Ressources ===
  { term: "Énergie", en: "Energy", category: "Ressources", definition: "Ressource de base. Vous l'obtenez en épuisant (tournant) une Rune. La Rune reste en jeu et pourra être réutilisée au prochain tour. Sert à payer la plupart des cartes.", related: ["Épuiser", "Rune", "Puissance (ressource)", "Pool de Runes"] },
  { term: "Puissance (ressource)", en: "Power", category: "Ressources", definition: "Ressource avancée. Vous l'obtenez en recyclant (mettant sous le deck) une Rune du bon domaine. Plus coûteux car la Rune est perdue, mais nécessaire pour les effets puissants.", related: ["Recycler", "Rune", "Énergie", "Domaine"] },
  { term: "XP", en: "XP", category: "Ressources", definition: "Points d'expérience accumulés pendant la partie. Quand vous atteignez certains seuils, vos cartes avec le mot-clé Niveau deviennent plus puissantes.", related: ["Niveau", "Chasse"] },
  { term: "Puissance", en: "Might", category: "Ressources", subcategory: "Stat", definition: "La force d'une unité. Sert à la fois en attaque et en défense. Pendant un Combat, le camp avec le plus de Puissance totale gagne.", related: ["Combat", "Assaut", "Bouclier"] },
  { term: "Domaine", en: "Domain", category: "Ressources", subcategory: "Système", definition: "La « couleur » ou faction d'une carte. Il y a 6 domaines : Furie, Calme, Esprit, Corps, Chaos et Ordre. Votre Légende détermine les 2 domaines que vous pouvez jouer.", related: ["Légende", "Rune"] },

  // === Formats & Règles ===
  { term: "Bo1 / Bo3", en: "Bo1 / Bo3", category: "Formats & Règles", definition: "Bo1 = une seule manche. Bo3 = celui qui gagne 2 manches sur 3 l'emporte. En Bo3, vous pouvez utiliser votre Réserve pour adapter votre deck entre les manches.", related: ["Réserve", "Champ de bataille"] },
  { term: "Conquête", en: "Conquer", category: "Formats & Règles", definition: "Gagner un combat sur un champ de bataille et y rester = +1 point. Un seul point par champ de bataille par tour.", related: ["Confrontation", "Contrôle", "Règle du dernier point"] },
  { term: "Contrôle", en: "Hold", category: "Formats & Règles", definition: "Si vous commencez votre tour avec des unités sur un champ de bataille déjà conquis, vous gagnez automatiquement +1 point. Pas besoin de combattre à nouveau.", related: ["Conquête", "Champ de bataille"] },
  { term: "Règle du dernier point", en: "", category: "Formats & Règles", definition: "Pour gagner (atteindre 8 points), vous devez scorer sur TOUS vos champs de bataille ce tour-là. Si vous n'y arrivez pas, vous piochez une carte à la place.", related: ["Conquête", "Contrôle"] },
];

export default async function GlossairePage() {
  const mechanicTerms = terms.filter(
    (t) => t.category === "Mécaniques" || t.category === "Timing" || t.category === "Actions"
  );

  const cards = await safeQuery(() => prisma.card.findMany({
    where: {
      textPlain: { not: null },
      alternateArt: false,
      type: { not: "Legend" },
    },
    select: {
      name: true,
      imageUrl: true,
      textPlain: true,
      type: true,
      energy: true,
      might: true,
      rarity: true,
    },
  }), []);

  const cardByKeyword: Record<string, { name: string; imageUrl: string | null; type: string; energy: number | null; might: number | null; rarity: string }> = {};

  for (const t of mechanicTerms) {
    const searchKey = (t.en || t.term).toLowerCase().replace("quick-draw", "Quick-Draw");
    const match = cards.find((c) => c.textPlain?.toLowerCase().includes(searchKey));
    if (match) {
      cardByKeyword[t.term] = match;
    }
  }

  return <GlossaireClient terms={terms} cardByKeyword={cardByKeyword} />;
}
