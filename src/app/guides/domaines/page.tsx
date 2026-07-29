import type { Metadata } from "next";
import Link from "next/link";
import { DOMAIN_ICONS, DOMAIN_COLORS } from "@/lib/domains";
import { CardRef } from "@/components/card-ref";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: { absolute: "6 Domaines Riftbound - Fury, Calm, Mind, Body, Chaos, Order" },
  description:
    "Découvrez les 6 domaines de Riftbound : forces, faiblesses, style de jeu et Légendes associées pour chaque couleur.",
  alternates: { canonical: "/guides/domaines" },
  openGraph: {
    type: "article",
    siteName: "Riftbound France",
    locale: "fr_FR",
    title: "6 Domaines Riftbound - Fury, Calm, Mind, Body, Chaos, Order",
    description:
      "Forces, faiblesses, style de jeu et Légendes associées pour chaque domaine Riftbound.",
    images: ["/img/og-default.png"],
  },
};

const domains = [
  {
    name: "Fury",
    fr: "Furie",
    color: DOMAIN_COLORS.Fury,
    philosophy: "Furie, c'est l'attaque pure. Vos unités frappent vite et fort grâce au mot-clé Assaut (bonus en attaque). Idéal pour finir les parties rapidement.",
    strengths: ["Dégâts directs avec des sorts", "Unités prêtes à agir dès leur arrivée (Accélération)", "Conquête rapide des champs de bataille", "Pression constante dès le Tour 1"],
    weaknesses: ["Peu de moyens de défendre", "Peu de pioche de cartes", "S'essouffle si la partie dure", "Vulnérable aux decks qui se préparent tranquillement"],
    keywords: ["Accélération", "Assaut", "Gank"],
    playstyle: "Jouez agressivement dès le Tour 1. Posez des unités rapides, utilisez vos sorts pour éliminer les bloqueurs, et foncez sur les deux champs de bataille. Furie se marie très bien avec Corps - les deux récompensent le jeu offensif.",
    legends: [
      { name: "Draven", pair: "Chaos", desc: "Ultra agressif. Pression maximale dès les premiers tours." },
      { name: "Sivir", pair: "Body", desc: "Construit autour des équipements. Combine attaque et objets puissants." },
      { name: "Rengar", pair: "Body", desc: "Attaques surprises. Se déplace vite entre les champs de bataille." },
    ],
  },
  {
    name: "Calm",
    fr: "Calme",
    color: DOMAIN_COLORS.Calm,
    philosophy: "Calme mise sur la durée. Vos unités se soignent, grandissent au fil des tours et deviennent de plus en plus difficiles à éliminer. La défense est votre meilleure attaque.",
    strengths: ["Soins et récupération", "Sorts jouables en réponse à l'adversaire", "Unités qui gagnent en force au fil du temps", "Embuscade pour surprendre l'adversaire"],
    weaknesses: ["Lent à démarrer", "Vulnérable aux attaques rapides", "Doit tenir un champ de bataille pour être efficace"],
    keywords: ["Embuscade", "Bouclier", "Caché"],
    playstyle: "Prenez un champ de bataille, puis défendez-le. Vos unités deviennent plus fortes chaque tour grâce aux soins et aux améliorations. Utilisez l'Embuscade pour envoyer des renforts quand l'adversaire attaque.",
    legends: [
      { name: "Irelia", pair: "Order", desc: "Joue en réaction. Excellent pour contre-attaquer au bon moment." },
      { name: "Master Yi (Bladesman)", pair: "Body", desc: "Légende Origines. Très forte en défense grâce à un bonus de Puissance." },
      { name: "Master Yi (Wuju Master)", pair: "Body", desc: "Légende Unleashed. Gagne de l'XP en combat pour débloquer des capacités." },
      { name: "Azir", pair: "Order", desc: "Crée des petites unités (jetons) pour submerger l'adversaire." },
      { name: "Vex", pair: "Chaos", desc: "Verrouille les champs de bataille. Difficile à déloger." },
    ],
  },
  {
    name: "Mind",
    fr: "Esprit",
    color: DOMAIN_COLORS.Mind,
    philosophy: "Esprit préfère la ruse à la force. Piochez des cartes, posez des équipements puissants et perturbez les plans de l'adversaire avec vos sorts de contrôle.",
    strengths: ["Pioche de cartes (vous avez toujours des options)", "Équipements puissants", "Sorts de contrôle pour neutraliser les menaces", "S'adapte à la stratégie adverse"],
    weaknesses: ["Unités fragiles", "Demande de bien lire le jeu adverse", "Vulnérable aux attaques rapides du Tour 1"],
    keywords: ["Protection"],
    playstyle: "Construisez votre avantage en piochant des cartes et en posant des équipements. Répondez aux actions adverses avec vos sorts, et prenez le contrôle de la partie une fois votre moteur en place. Esprit + Ordre est une combinaison très solide pour le contrôle.",
    legends: [
      { name: "Diana", pair: "Chaos", desc: "Rapide et perturbatrice. Combine vitesse et sorts de contrôle." },
      { name: "LeBlanc", pair: "Order", desc: "Tire profit de la mort de ses propres unités (mot-clé Agonie)." },
    ],
  },
  {
    name: "Body",
    fr: "Corps",
    color: DOMAIN_COLORS.Body,
    philosophy: "Corps écrase l'adversaire par la force brute. Vos unités ont les plus hautes statistiques du jeu et dominent les combats grâce à leur Puissance supérieure.",
    strengths: ["Les plus grosses unités du jeu", "Domine les combats directs", "Les unités s'améliorent en permanence", "Le mot-clé Chasse fait gagner de l'XP"],
    weaknesses: ["Peu de sorts ou d'astuces", "Vulnérable aux sorts d'élimination ciblée", "Dépend beaucoup des résultats de combat"],
    keywords: ["Chasse", "Légion"],
    playstyle: "Posez des unités et améliorez-les. Le mot-clé Chasse vous fait gagner de l'XP quand vous conquérez ou tenez un champ de bataille, et cette XP débloque des capacités de plus en plus fortes. Gagnez par la force brute.",
    legends: [
      { name: "Master Yi (Bladesman)", pair: "Calm", desc: "Légende Origines. Bonus de Puissance en défense. Très dur à déloger." },
      { name: "Master Yi (Wuju Master)", pair: "Calm", desc: "Légende Unleashed. Basée sur l'XP et les améliorations progressives." },
      { name: "Sivir", pair: "Fury", desc: "Combine attaque agressive et équipement finisseur." },
      { name: "Fiora", pair: "Order", desc: "Attaque rapide avec des améliorations permanentes." },
      { name: "Miss Fortune", pair: "Chaos", desc: "Mobilité + équipement dévastateur." },
      { name: "Sett", pair: "Order", desc: "Résistant et difficile à retirer du plateau." },
      { name: "Rengar", pair: "Fury", desc: "Attaques surprises depuis un autre champ de bataille." },
    ],
  },
  {
    name: "Chaos",
    fr: "Chaos",
    color: DOMAIN_COLORS.Chaos,
    philosophy: "Chaos, c'est le risque et la récompense. Posez des cartes face cachée pour piéger l'adversaire, forcez-le à se défausser et déclenchez des combos explosifs. Imprévisible mais dévastateur.",
    strengths: ["Cartes face cachée pour piéger l'adversaire", "Force l'adversaire à se défausser", "Combos très puissants", "Peut renverser une partie en un tour"],
    weaknesses: ["Résultats variables - parfois ça ne marche pas", "Dépend de combinaisons spécifiques", "Difficile à maîtriser pour les débutants"],
    keywords: ["Caché", "Agonie"],
    playstyle: "Posez des cartes face cachée pour surprendre l'adversaire. Videz sa main pour qu'il n'ait plus de réponses. Assemblez vos combos et punissez ses erreurs. Chaos demande de l'expérience - évitez-le pour vos premières parties.",
    legends: [
      { name: "Draven", pair: "Fury", desc: "Ultra agressif avec des dégâts directs." },
      { name: "Diana", pair: "Mind", desc: "Rapide et perturbatrice. Sorts + vitesse." },
      { name: "Vex", pair: "Calm", desc: "Défense solide. Verrouille les champs de bataille." },
      { name: "Miss Fortune", pair: "Body", desc: "Mobile et capable de finir avec un équipement." },
    ],
  },
  {
    name: "Order",
    fr: "Ordre",
    color: DOMAIN_COLORS.Order,
    philosophy: "Ordre construit des stratégies méthodiques et difficiles à perturber. Protégez vos unités, créez des jetons et tirez profit de chaque mort grâce au mot-clé Agonie.",
    strengths: ["Protection des unités alliées", "Création de petites unités (jetons)", "Résistant à la disruption", "Le mot-clé Agonie donne un bonus quand vos unités meurent"],
    weaknesses: ["Chaque jeton est faible individuellement", "Stratégie prévisible pour l'adversaire", "Besoin de temps pour se mettre en place"],
    keywords: ["Agonie", "Légion"],
    playstyle: "Créez des jetons pour submerger l'adversaire par le nombre. Quand vos unités meurent, Agonie déclenche des effets bonus - chaque mort vous rapporte quelque chose. Ordre construit lentement mais devient très dur à arrêter.",
    legends: [
      { name: "Irelia", pair: "Calm", desc: "Joue en réaction et contre-attaque au bon moment." },
      { name: "Azir", pair: "Calm", desc: "Crée des jetons en masse pour submerger l'adversaire." },
      { name: "LeBlanc", pair: "Mind", desc: "Tire de la valeur de chaque unité éliminée." },
      { name: "Fiora", pair: "Body", desc: "Attaque rapide avec des améliorations qui restent." },
      { name: "Sett", pair: "Body", desc: "Résistant. Très difficile à retirer." },
    ],
  },
];

export default function DomainesGuidePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Guides", href: "/guides" }, { name: "Les 6 domaines", href: "/guides/domaines" }]} className="mb-6" />
      <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>Les 6 Domaines de Riftbound</h1>
      <p className="mt-2 text-lg text-ink-secondary">
        Chaque Légende Riftbound appartient à 2 domaines (couleurs) qui définissent quelles cartes vous pouvez jouer.
        Comprendre les domaines vous aide à choisir votre Légende et à construire votre deck.
      </p>

      <div className="mt-4 space-y-2">
        <div className="rounded-lg border border-hairline bg-surface-raised px-4 py-3 text-sm text-ink-secondary">
          <strong className="text-arcane">Pour débuter :</strong> Furie ou Corps pour une approche directe - posez des unités et attaquez. Évitez Chaos tant que vous n&apos;êtes pas à l&apos;aise avec les bases.
        </div>
        <div className="rounded-lg border border-hairline bg-surface px-4 py-3 text-sm text-ink-secondary">
          <strong className="text-gold">Astuce :</strong> survolez les noms de cartes soulignés pour voir leur image.
        </div>
      </div>

      <div className="mt-10 space-y-12">
        {domains.map((d) => (
          <section key={d.name} id={d.name.toLowerCase()}>
            <div className="flex items-center gap-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: `${d.color}20` }}
              >
                {DOMAIN_ICONS[d.name] ? (
                  <img src={DOMAIN_ICONS[d.name]} alt={d.name} className="h-8 w-8" />
                ) : (
                  <span className="text-xl font-bold text-white">{d.name[0]}</span>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: d.color, fontFamily: "var(--font-rubik), sans-serif" }}>
                  {d.fr} <span className="text-base font-normal text-ink-muted">({d.name})</span>
                </h2>
              </div>
            </div>

            <p className="mt-3 text-ink-secondary">{d.philosophy}</p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-hairline bg-surface p-4">
                <h3 className="text-sm font-semibold text-ink-muted uppercase tracking-wider">Forces</h3>
                <ul className="mt-2 space-y-1">
                  {d.strengths.map((s) => (
                    <li key={s} className="flex gap-2 text-sm text-ink-secondary">
                      <span style={{ color: d.color }}>+</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-hairline bg-surface p-4">
                <h3 className="text-sm font-semibold text-ink-muted uppercase tracking-wider">Faiblesses</h3>
                <ul className="mt-2 space-y-1">
                  {d.weaknesses.map((w) => (
                    <li key={w} className="flex gap-2 text-sm text-ink-secondary">
                      <span className="text-danger">-</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {d.keywords.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {d.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded-full border px-2.5 py-0.5 text-xs font-bold"
                    style={{
                      backgroundColor: `${d.color}15`,
                      color: d.color,
                      borderColor: `${d.color}40`,
                    }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 rounded-lg border border-hairline bg-surface-raised p-4">
              <h3 className="text-sm font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>Comment jouer ce domaine ?</h3>
              <p className="mt-1 text-sm text-ink-secondary">{d.playstyle}</p>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-semibold text-ink-muted uppercase tracking-wider">Légendes populaires</h3>
              <div className="mt-2 space-y-1">
                {d.legends.map((l) => (
                  <div key={l.name} className="flex items-center gap-3 rounded-lg bg-surface p-2 text-sm">
                    <span className="font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{l.name}</span>
                    <span
                      className="rounded-full border px-1.5 py-0.5 text-[10px] font-semibold"
                      style={{
                        backgroundColor: `${d.color}15`,
                        color: d.color,
                        borderColor: `${d.color}40`,
                      }}
                    >
                      +{l.pair}
                    </span>
                    <span className="text-xs text-ink-secondary">{l.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className="mt-12 rounded-card border border-hairline bg-surface p-6">
        <h2 className="text-xl font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
          Quelques cartes emblématiques
        </h2>
        <p className="mt-2 text-sm text-ink-secondary">
          Pour mieux comprendre l&apos;identité de chaque domaine, voici des cartes qui les représentent bien :
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-hairline bg-surface-raised p-3 text-sm">
            <CardRef name="Dazzling Aurora">Dazzling Aurora</CardRef>
            <span className="text-ink-secondary"> - Équipement à 9 énergie. La bombe ultime des decks d&apos;équipements. Cher mais dévastateur.</span>
          </div>
          <div className="rounded-lg border border-hairline bg-surface-raised p-3 text-sm">
            <CardRef name="Adaptatron">Adaptatron</CardRef>
            <span className="text-ink-secondary"> - Détruit les équipements adverses. Indispensable si l&apos;adversaire joue des objets.</span>
          </div>
          <div className="rounded-lg border border-hairline bg-surface-raised p-3 text-sm">
            <CardRef name="Back Off">Back Off</CardRef>
            <span className="text-ink-secondary"> - Sort qui étourdit une unité. Utilisable dans beaucoup de combinaisons de domaines.</span>
          </div>
          <div className="rounded-lg border border-hairline bg-surface-raised p-3 text-sm">
            <CardRef name="Mindsplitter">Mindsplitter</CardRef>
            <span className="text-ink-secondary"> - Force l&apos;adversaire à se défausser. L&apos;identité de Chaos en une carte.</span>
          </div>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/guides/deckbuilding" className="inline-flex items-center gap-2 rounded-lg bg-arcane px-4 py-2 text-sm font-semibold text-canvas hover:opacity-90">
          Guide de deckbuilding
        </Link>
        <Link href="/guides/meta" className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-canvas hover:opacity-90">
          Méta &amp; Tier List
        </Link>
        <Link href="/tier-list" className="inline-flex items-center gap-2 rounded-lg bg-violet-dark px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
          Tier List actuelle
        </Link>
      </div>
    </div>
  );
}
