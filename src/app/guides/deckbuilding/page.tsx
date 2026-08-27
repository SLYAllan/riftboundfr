import type { Metadata } from "next";
import Link from "@/components/lien";
import { Hammer, AlertTriangle } from "lucide-react";
import { CardRef } from "@/components/card-ref";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { metaTraduite, tr } from "@/lib/i18n-server";

const metadata: Metadata = {
  title: { absolute: "Guide Deckbuilding Riftbound - Construire son premier deck" },
  description:
    "Construire un deck Riftbound compétitif : choix de la Légende, du champion, signatures, courbe d'énergie et conseils de jeu.",
  alternates: { canonical: "/guides/deckbuilding" },
  openGraph: {
    type: "article",
    siteName: "Riftbound France",
    locale: "fr_FR",
    title: "Guide Deckbuilding Riftbound - Construire son premier deck",
    description:
      "Choix de la Légende, du champion, signatures et courbe d'énergie pour construire votre deck Riftbound.",
    images: ["/img/og-default.png"],
  },
};

const ratios = [
  { label: "Unités", range: "20-28", pct: "50-70%", desc: "Le cœur de votre deck. Sans unités, pas de combat et pas de points. Mélangez des unités pas chères (1-3 énergie) pour agir vite et des unités plus fortes (4-6) pour les combats importants." },
  { label: "Sorts", range: "8-14", pct: "20-35%", desc: "Vos outils : retirer une unité adverse, renforcer la vôtre en combat, piocher des cartes. Gardez toujours 3-4 sorts jouables en réaction pour ne pas subir sans rien faire." },
  { label: "Équipements", range: "2-6", pct: "5-15%", desc: "Des objets que vous attachez à vos unités pour les rendre plus fortes. Ils restent dans votre base et survivent même si l'unité meurt - vous pouvez les ré-attacher à une autre." },
];

const curveGuide = [
  { range: "1-2 Énergie", count: "8-12 cartes", role: "Vos cartes pour le Tour 1. Posez des unités tout de suite pour contester les champs de bataille. Exemples : Lonely Poro, Tideturner, Plundering Poro.", color: "#22c55e" },
  { range: "3-4 Énergie", count: "12-16 cartes", role: "Le gros de votre deck. Unités solides et sorts utiles, jouables dès le Tour 2. Exemples : Noxus Hopeful, Stellacorn Herder, Discipline.", color: "#3b82f6" },
  { range: "5-6 Énergie", count: "6-10 cartes", role: "Vos grosses menaces. Des unités capables de prendre un champ de bataille toutes seules. Exemples : Darius Trifarian, Ferrous Forerunner.", color: "#f97316" },
  { range: "7+ Énergie", count: "2-4 cartes max", role: "Vos bombes. Très puissantes mais injouables avant Tour 4-5. Trop en avoir = main bloquée au début. Exemple : Thousand-Tailed Watcher.", color: "#ef4444" },
];

const runeStrategies = [
  { name: "Agressif (Furie, Corps)", split: "8 Énergie / 4 Puissance", desc: "Beaucoup d'énergie pour jouer plein de cartes vite. Idéal pour submerger l'adversaire avant qu'il se stabilise." },
  { name: "Équilibré (le plus courant)", split: "6 Énergie / 6 Puissance", desc: "Le choix le plus flexible. Vous pouvez accélérer ou ralentir selon l'adversaire. Convient à la plupart des Légendes." },
  { name: "Contrôle (Calme, Esprit)", split: "5 Énergie / 7 Puissance", desc: "Plus de Puissance pour vos cartes fortes en milieu de partie. Début plus lent, mais vous prenez l'avantage sur la durée." },
];

const domainSynergies = [
  { combo: "Furie + Corps", style: "Agression", desc: "Le plus simple : grosses unités qui frappent fort. Attaquez sur les deux fronts et écrasez l'adversaire.", ex: "Draven, Sett, Sivir" },
  { combo: "Calme + Ordre", style: "Défense / Jetons", desc: "Prenez un champ de bataille et défendez-le. Créez des petites unités (jetons) pour submerger l'adversaire par le nombre.", ex: "Azir, Irelia" },
  { combo: "Esprit + Chaos", style: "Combo", desc: "Piochez des cartes, posez des équipements et des cartes face cachée pour surprendre l'adversaire au bon moment.", ex: "Diana, Vex, Viktor" },
  { combo: "Calme + Corps", style: "Milieu de terrain", desc: "Unités résistantes qui gagnent en force avec le temps. Difficiles à éliminer grâce aux soins et au mot-clé Tank.", ex: "Master Yi (Bladesman), Volibear" },
  { combo: "Esprit + Ordre", style: "Valeur", desc: "Tirez profit de la mort de vos propres unités grâce au mot-clé Agonie. Chaque perte vous rapporte quelque chose.", ex: "LeBlanc, Renata Glasc" },
  { combo: "Furie + Chaos", style: "Tempo agressif", desc: "Attaquez sans relâche tout en perturbant la main de l'adversaire. Forcez-le à réagir tour après tour.", ex: "Draven, Jinx, Rumble" },
];

const mistakes = [
  { name: "Pas assez d'unités", fix: "Mettez au moins 20 unités. Sans unités, pas de combat et pas de points. Les sorts complètent, mais les unités sont votre priorité." },
  { name: "Trop de cartes dans le deck", fix: "Le minimum est 40 cartes - restez-y. Chaque carte en plus réduit vos chances de piocher vos meilleures." },
  { name: "Trop de cartes chères", fix: "Limitez-vous à 2-4 cartes à 7+ énergie. Si votre main de départ ne contient rien de jouable avant le Tour 3, vous partez avec un gros désavantage." },
  { name: "Pas de sorts pour se défendre", fix: "Gardez 3-4 sorts capables de retirer une unité adverse (Defy, Charm, Falling Star...). Sans ça, une seule grosse unité adverse peut vous bloquer." },
  { name: "Ignorer les champs de bataille", fix: "Vos 3 champs de bataille ont des capacités uniques. Lisez-les et choisissez-en qui complètent votre stratégie." },
  { name: "Copier un deck sans le comprendre", fix: "Un deck ne fonctionne que si vous comprenez pourquoi chaque carte est là. Sinon vous prendrez de mauvaises décisions en jeu." },
  { name: "Tout changer après une défaite", fix: "Une seule défaite ne signifie pas que le deck est mauvais. Jouez au moins 5-10 parties avant de modifier votre liste." },
  { name: "Oublier la Réserve en Bo3", fix: "En match en 3 manches, la Réserve vous permet d'adapter votre deck entre les manches. Préparez des réponses aux stratégies adverses." },
];

export default async function GuideDeckbuildingPage() {
  const t = await tr();
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Guides", href: "/guides" }, { name: "Construire son deck", href: "/guides/deckbuilding" }]} className="mb-6" />
      <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Construire son deck Riftbound")}</h1>
      <p className="mt-2 text-lg text-ink-secondary">{t("Vous avez compris les règles de base et vous voulez construire votre propre deck ? Ce guide vous montre les bons ratios, la courbe d’énergie idéale et les erreurs à éviter.")}</p>

      <div className="mt-10 space-y-12">

        <section>
          <h2 className="text-2xl font-semibold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Quelle est la structure d’un deck Riftbound ?")}</h2>
          <p className="mt-2 text-sm text-ink-secondary">{t("Un deck Riftbound contient au minimum")}{" "}<strong>40 cartes</strong>{" "}{t("dans le deck principal (rester à 40 est recommandé),")}{" "}<strong>12 Runes</strong>, <strong>{t("3 champs de bataille")}</strong>{t(", plus une")}{" "}<strong>{t("Légende")}</strong>{" "}{t("et un")}{" "}<strong>Champion</strong>{" "}{t("(1 copie désignée, jusqu’à 3 copies dans le deck + jusqu’à 3 cartes Signature). La Réserve compte")}{" "}<strong>10 cartes</strong>{" "}{t("depuis Vendetta et permet d’adapter votre deck entre les manches en Bo3.")}</p>
          <div className="mt-3 rounded-lg border-2 border-gold/20 bg-gold-glow p-3 text-sm text-gold">
            <strong>{t("Règle des 3 copies :")}</strong>{" "}{t("si une carte mérite d’être incluse, jouez-en 3 copies. Si elle est situationnelle, jouez-en 1 ou 2.")}</div>
          <div className="mt-4 space-y-2">
            {ratios.map((r) => (
              <div key={t(r.label)} className="flex flex-col gap-1 rounded-lg border border-hairline bg-surface p-4 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex items-center gap-3 sm:min-w-[200px]">
                  <span className="font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t(r.label)}</span>
                  <span className="text-sm text-arcane">{r.range}</span>
                  <span className="text-xs text-ink-muted">({r.pct})</span>
                </div>
                <p className="text-sm text-ink-secondary">{t(r.desc)}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Comment optimiser sa courbe d’énergie ?")}</h2>
          <p className="mt-2 text-sm text-ink-secondary">{t("La courbe d’énergie détermine quand vous pouvez jouer vos cartes. Visez une courbe centrée autour de 3-4 énergie. Trop de cartes chères = vulnérable en début de partie. Trop de cartes pas chères = manque de puissance en milieu de partie.")}</p>
          <div className="mt-4 space-y-2">
            {curveGuide.map((c) => (
              <div key={c.range} className="flex gap-3 rounded-lg border border-hairline bg-surface p-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-canvas" style={{ backgroundColor: c.color }}>
                  {c.range.split(" ")[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{c.range}</span>
                    <span className="text-xs text-arcane">{c.count}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-secondary">{c.role}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg bg-surface-raised p-3 text-xs text-ink-muted">{t("Rappel : vous recevez 2 Runes par tour (3 au Tour 1 si second joueur). Tour 1 = 2-3 énergie, Tour 2 = 4-5, Tour 3 = 6-7.")}</div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Comment répartir ses runes entre Énergie et Puissance ?")}</h2>
          <p className="mt-2 text-sm text-ink-secondary">{t("Vos 12 Runes génèrent soit de l’")}<strong>{t("Énergie")}</strong>{" "}{t("(Épuiser - la rune reste disponible) soit de la")}{" "}<strong>Puissance</strong>{" "}{t("(Recycler - la rune va sous le deck de runes). L’Énergie est votre mana pour jouer des cartes, la Puissance amplifie les effets de certaines cartes.")}</p>
          <div className="mt-4 space-y-2">
            {runeStrategies.map((r) => (
              <div key={t(r.name)} className="rounded-lg border border-hairline bg-surface p-4">
                <div className="flex items-center gap-3">
                  <span className="font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t(r.name)}</span>
                  <span className="rounded-full bg-surface-raised px-2 py-0.5 text-xs font-semibold text-gold">{t(r.split)}</span>
                </div>
                <p className="mt-1 text-sm text-ink-secondary">{t(r.desc)}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg border-2 border-gold/20 bg-gold-glow p-3 text-sm text-gold">
            <strong>Important :</strong>{" "}{t("Le pool de Runes se vide 2 fois par tour. Planifiez vos dépenses entre la phase de Pioche et la fin de tour.")}</div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Quelles sont les meilleures synergies de domaines ?")}</h2>
          <p className="mt-2 text-sm text-ink-secondary">{t("Chaque Légende a 2 domaines qui déterminent quelles Runes et cartes vous pouvez jouer. Se concentrer sur un seul domaine peut déclencher des bonus d’Allégeance cumulatifs. Voici les combinaisons les plus courantes.")}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {domainSynergies.map((s) => (
              <div key={t(s.combo)} className="rounded-lg border border-hairline bg-surface p-4">
                <h3 className="font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t(s.combo)}</h3>
                <span className="text-xs font-semibold text-arcane">{t(s.style)}</span>
                <p className="mt-1 text-xs text-ink-secondary">{t(s.desc)}</p>
                <p className="mt-1 text-xs text-ink-muted">Légendes : {t(s.ex)}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Comment gagner avec la Conquête et les champs de bataille ?")}</h2>
          <p className="mt-2 text-sm text-ink-secondary">{t("Rappel : le premier à")}{" "}<strong>8 points</strong>{" "}{t("gagne. Il y a deux grandes approches pour y arriver.")}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-hairline bg-surface p-4">
              <h3 className="font-semibold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Stratégie agressive")}</h3>
              <ul className="mt-2 space-y-1.5 text-xs text-ink-secondary">
                <li>{t("• Unités rapides qui arrivent prêtes à agir (Accélération)")}</li>
                <li>{t("• Sorts pas chers pour éliminer les bloqueurs (")}<CardRef name="Defy">Defy</CardRef>, <CardRef name="Charm">Charm</CardRef>)</li>
                <li>{t("• Objectif : scorer sur les deux champs le plus vite possible")}</li>
                <li>• Domaines typiques : Furie, Corps</li>
              </ul>
            </div>
            <div className="rounded-lg border border-hairline bg-surface p-4">
              <h3 className="font-semibold text-gold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Stratégie contrôle")}</h3>
              <ul className="mt-2 space-y-1.5 text-xs text-ink-secondary">
                <li>{t("• Grosses unités résistantes avec Bouclier et Tank pour tenir les positions")}</li>
                <li>{t("• Surprenez l’adversaire avec des renforts (Embuscade)")}</li>
                <li>{t("• Objectif : tenir un champ de bataille - chaque tour tenu = +1 point automatique")}</li>
                <li>• Domaines typiques : Calme, Ordre</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Quelles sont les cartes polyvalentes à connaître ?")}</h2>
          <p className="mt-2 text-sm text-ink-secondary">{t("Quelques cartes que vous verrez souvent - elles sont fortes dans beaucoup de decks différents.")}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-hairline bg-surface p-3 text-sm text-ink-secondary">
              <CardRef name="Ferrous Forerunner">Ferrous Forerunner</CardRef>{" "}{t("- Unité 6 énergie. Menace de milieu de partie solide et polyvalente.")}</div>
            <div className="rounded-lg border border-hairline bg-surface p-3 text-sm text-ink-secondary">
              <CardRef name="Defy">Defy</CardRef>{" "}{t("- Sort 1 énergie. Retrait universel bas coût, jouable dans presque tous les decks.")}</div>
            <div className="rounded-lg border border-hairline bg-surface p-3 text-sm text-ink-secondary">
              <CardRef name="Guardian Angel">Guardian Angel</CardRef>{" "}{t("- Équipement 2 énergie. Protection essentielle pour vos unités clés.")}</div>
            <div className="rounded-lg border border-hairline bg-surface p-3 text-sm text-ink-secondary">
              <CardRef name="Noxus Hopeful">Noxus Hopeful</CardRef>{" "}{t("- Unité 4 énergie. Pilier solide du milieu de courbe.")}</div>
            <div className="rounded-lg border border-hairline bg-surface p-3 text-sm text-ink-secondary">
              <CardRef name="Discipline">Discipline</CardRef>{" "}{t("- Sort 2 énergie. Buff de combat polyvalent qui transforme les échanges en votre faveur.")}</div>
            <div className="rounded-lg border border-hairline bg-surface p-3 text-sm text-ink-secondary">
              <CardRef name="Dazzling Aurora">Dazzling Aurora</CardRef>{" "}{t("- Équipement 9 énergie. Finisseur puissant mais jouable tard uniquement.")}</div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Comment réussir son mulligan ?")}</h2>
          <div className="mt-4 rounded-lg border border-hairline bg-surface p-4 text-sm text-ink-secondary">
            <p>{t("Vous commencez avec")}{" "}<strong>4 cartes</strong>{t(". Vous pouvez remettre jusqu’à")}{" "}<strong>2 cartes</strong>{" "}{t("de votre main, piocher autant de nouvelles cartes, puis recycler les cartes mises de côté sous votre deck.")}</p>
            <ul className="mt-3 space-y-1.5 text-xs">
              <li><span className="text-gold">&#x2022;</span> <strong>Gardez :</strong>{" "}{t("1-2 unités jouables Tour 1-2, 1 sort de retrait ou buff de combat")}</li>
              <li><span className="text-gold">&#x2022;</span> <strong>Renvoyez :</strong>{" "}{t("les cartes 6+ énergie, les doublons de finisseurs, les équipements sans unités pour les porter")}</li>
              <li><span className="text-gold">&#x2022;</span> <strong>{t("Adaptez au match-up :")}</strong>{" "}{t("contre l’agression, gardez vos retraits bas coût. Contre le contrôle, gardez vos menaces de milieu de partie")}</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Quelles légendes sont fortes en ce moment ?")}</h2>
          <p className="mt-2 text-sm text-ink-secondary">
            {t("Pour apprendre, partez d’une liste qui a déjà obtenu des résultats. Consultez la tier list du format actuel, copiez le core du deck, puis changez les slots flexibles après quelques parties.")}
          </p>
          <div className="mt-3 rounded-lg border-2 border-gold/20 bg-gold-glow p-3 text-sm text-gold">
            <strong>Astuce :</strong>{" "}{t("une légende peu jouée mais qui gagne souvent (comme")}{" "}<strong>Annie</strong> ou{" "}
            <strong>Sett</strong>{t(") est souvent un meilleur choix qu’une légende très populaire qui ne convertit pas. Le détail set par set est dans le")}{" "}<Link href="/tier-list" className="inline-flex min-h-6 items-center underline">{t("tier list")}</Link>.
          </div>
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-2xl font-semibold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
            <AlertTriangle size={20} />{" "}{t("Quelles erreurs éviter en deckbuilding ?")}</h2>
          <div className="mt-4 space-y-2">
            {mistakes.map((m) => (
              <div key={t(m.name)} className="rounded-lg border border-hairline bg-surface p-3">
                <h3 className="text-sm font-semibold text-danger" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t(m.name)}</h3>
                <p className="mt-0.5 text-xs text-ink-secondary">{m.fix}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/deckbuilder" className="inline-flex items-center gap-2 rounded-lg bg-violet-dark px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
            <Hammer size={16} />{" "}{t("Créer un deck")}</Link>
          <Link href="/decks" className="inline-flex items-center gap-2 rounded-lg bg-arcane px-4 py-2 text-sm font-semibold text-canvas hover:opacity-90">{t("Voir des decks de tournoi")}</Link>
          <Link href="/guides/debuter" className="inline-flex items-center gap-2 rounded-lg border border-hairline px-4 py-2 text-sm font-semibold text-ink hover:bg-surface">{t("Guide du débutant")}</Link>
        </div>
      </div>
    </div>
  );
}

export const generateMetadata = () => metaTraduite(metadata);
