import type { Metadata } from "next";
import Link from "@/components/lien";
import { Hammer, BookOpen } from "lucide-react";
import { DOMAIN_ICONS, DOMAIN_COLORS } from "@/lib/domains";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { metaTraduite, tr } from "@/lib/i18n-server";

const metadata: Metadata = {
  title: { absolute: "Riftbound : premiers pas, règles et comment jouer (guide débutant FR)" },
  description:
    "Tes premiers pas à Riftbound : règles, déroulement d'un tour, les 6 domaines et conditions de victoire. Guide débutant complet, en français.",
  alternates: { canonical: "/guides/debuter" },
  openGraph: {
    type: "article",
    siteName: "Riftbound France",
    locale: "fr_FR",
    title: "Riftbound : premiers pas, règles et comment jouer (guide débutant FR)",
    description:
      "Règles complètes, tour de jeu, domaines et conditions de victoire pour débuter à Riftbound.",
    images: ["/img/og-default.png"],
  },
};

const domains = [
  { name: "Fury", fr: "Furie", color: DOMAIN_COLORS.Fury, desc: "Attaque rapide et dégâts directs. Foncez sur l'adversaire." },
  { name: "Calm", fr: "Calme", color: DOMAIN_COLORS.Calm, desc: "Défense solide, soins et unités qui grandissent au fil du temps." },
  { name: "Mind", fr: "Esprit", color: DOMAIN_COLORS.Mind, desc: "Sorts malins, pioche de cartes et équipements puissants." },
  { name: "Body", fr: "Corps", color: DOMAIN_COLORS.Body, desc: "Grosses unités qui écrasent tout sur leur passage." },
  { name: "Chaos", fr: "Chaos", color: DOMAIN_COLORS.Chaos, desc: "Imprévisible, risqué mais dévastateur. Pour joueurs expérimentés." },
  { name: "Order", fr: "Ordre", color: DOMAIN_COLORS.Order, desc: "Armée de jetons, protection de vos unités et stratégie méthodique." },
];

const keywordsEssential = [
  { name: "Accélération", en: "Accelerate", desc: "Normalement, une unité arrive épuisée et ne peut pas agir tout de suite. En payant un surcoût (1 énergie + 1 Puissance), elle arrive prête et peut bouger ou combattre immédiatement." },
  { name: "Assaut", en: "Assault", desc: "Cette unité devient plus forte quand elle attaque. Le bonus ne s'applique pas en défense." },
  { name: "Bouclier", en: "Shield", desc: "Cette unité devient plus forte quand elle défend. Le bonus ne s'applique pas en attaque." },
  { name: "Tank", en: "Tank", desc: "L'adversaire doit concentrer ses dégâts sur cette unité en premier. Protège vos unités fragiles derrière elle." },
  { name: "Agonie", en: "Deathknell", desc: "Quand cette unité meurt, elle déclenche un effet bonus. Certains decks sont construits autour de cette mécanique." },
  { name: "Caché", en: "Hidden", desc: "Vous pouvez poser cette carte face cachée sur un champ de bataille. Au tour suivant, jouez-la gratuitement pour surprendre l'adversaire." },
];

const keywordsOther = [
  { name: "Protection", en: "Deflect", desc: "L'adversaire doit dépenser de la Puissance supplémentaire pour cibler cette carte." },
  { name: "Gank", en: "Ganking", desc: "Cette unité peut se déplacer directement d'un champ de bataille à l'autre." },
  { name: "Embuscade", en: "Ambush", desc: "Peut être jouée directement sur un champ de bataille où vous avez déjà des unités, même en réponse à l'adversaire." },
  { name: "Arrière-ligne", en: "Backline", desc: "L'adversaire doit éliminer toutes vos autres unités avant de pouvoir toucher celle-ci." },
  { name: "Légion", en: "Legion", desc: "Active un bonus si vous avez déjà joué une autre carte ce tour." },
  { name: "Chasse", en: "Hunt", desc: "Quand cette unité conquiert ou contrôle un champ de bataille, vous gagnez de l'XP. L'XP débloque des capacités Niveau." },
  { name: "Répétition", en: "Repeat", desc: "Payez un surcoût pour exécuter l'effet du sort une seconde fois." },
];

export default async function GuideDebuterPage() {
  const t = await tr();
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Guides", href: "/guides" }, { name: "Guide débutant", href: "/guides/debuter" }]} className="mb-6" />
      <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Comment jouer à Riftbound - Guide débutant")}</h1>
      <p className="mt-2 text-lg text-ink-secondary">{t("Riftbound est un jeu de cartes à collectionner dans l’univers de League of Legends. Deux joueurs s’affrontent pour le contrôle de champs de bataille et le premier à")}{" "}<strong>8 points</strong>{" "}{t("gagne. Ce guide vous apprend tout ce qu’il faut savoir pour jouer votre première partie.")}</p>

      <div className="mt-10 space-y-12">

        {/* === 1. BUT DU JEU === */}
        <section>
          <h2 className="text-2xl font-semibold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Quel est le but du jeu ?")}</h2>
          <div className="mt-4 rounded-card border-2 border-gold/30 bg-gold-glow p-6">
            <p className="text-lg font-semibold text-gold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Premier joueur à atteindre 8 points")}</p>
            <p className="mt-2 text-sm text-ink-secondary">{t("Il y a 2 champs de bataille en jeu. Vous marquez des points en y envoyant vos unités :")}</p>
            <div className="mt-4 space-y-3 text-sm text-ink-secondary">
              <div className="flex gap-3">
                <span className="font-bold text-arcane shrink-0">{t("Conquête")}</span>
                <span>{t("Vous gagnez un combat ou occupez un champ sans adversaire =")}{" "}<strong>+1 point</strong>.</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-success shrink-0">{t("Contrôle")}</span>
                <span>{t("Vous commencez votre tour en tenant un champ déjà conquis =")}{" "}<strong>{t("+1 point par champ tenu")}</strong>.</span>
              </div>
              <div className="mt-2 rounded bg-surface-raised p-2 text-xs text-gold">
                <strong>{t("Règle du dernier point :")}</strong>{" "}{t("pour atteindre 8 par Conquête, vous devez scorer sur les DEUX champs de bataille ce tour-là. Sinon, vous piochez une carte à la place.")}</div>
            </div>
          </div>
        </section>

        {/* === 2. COMPOSITION DU DECK === */}
        <section>
          <h2 className="text-2xl font-semibold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("De quoi est composé un deck ?")}</h2>
          <p className="mt-2 text-sm text-ink-secondary">{t("Pas besoin de tout retenir - les decks de démarrage (Jinx, Viktor, Lee Sin, Fiora, Rumble) sont prêts à jouer. Voici les éléments pour comprendre ce que contient votre deck :")}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { name: "Légende", desc: "Votre carte de leader. Elle définit vos 2 couleurs (domaines) et vous donne une capacité spéciale. Elle ne va jamais sur le champ de bataille." },
              { name: "Champion", desc: "Une unité spéciale que vous choisissez avant la partie. Plus puissante qu'une unité normale. Vous pouvez en avoir jusqu'à 3 copies dans votre deck." },
              { name: "Deck principal (40+ cartes)", desc: "Vos unités (créatures), sorts (effets ponctuels) et équipements (objets permanents). Minimum 40 cartes, on recommande de rester à 40." },
              { name: "Deck de runes (12 cartes)", desc: "Vos runes produisent les ressources pour jouer vos cartes. Exactement 12, dans les couleurs de votre Légende." },
              { name: "3 Champs de bataille", desc: "Les zones où se déroulent les combats. En match simple, un seul est tiré au hasard." },
              { name: "Réserve", desc: "Cartes de rechange pour adapter votre deck entre les manches (uniquement en match en 3 manches)." },
            ].map((item) => (
              <div key={t(item.name)} className="rounded-lg border border-hairline bg-surface p-4">
                <h3 className="font-semibold text-gold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t(item.name)}</h3>
                <p className="mt-1 text-sm text-ink-secondary">{t(item.desc)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link href="/deckbuilder" className="inline-flex items-center gap-2 rounded-lg bg-violet-dark px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
              <Hammer size={16} />{" "}{t("Essayer le Deckbuilder")}</Link>
          </div>
        </section>

        {/* === 3. DOMAINES === */}
        <section>
          <h2 className="text-2xl font-semibold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Quelles sont les 6 couleurs du jeu ?")}</h2>
          <p className="mt-2 text-sm text-ink-secondary">{t("Chaque Légende appartient à 2")}{" "}<strong>domaines</strong>{" "}{t("(couleurs). Ça détermine quelles cartes vous pouvez mettre dans votre deck.")}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {domains.map((d) => (
              <div key={t(d.name)} className="flex items-center gap-3 rounded-lg border border-hairline bg-surface p-3">
                <div className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center" style={{ backgroundColor: `${d.color}20` }}>
                  {DOMAIN_ICONS[d.name] ? (
                    <img src={DOMAIN_ICONS[d.name]} alt={t(d.name)} className="h-5 w-5" />
                  ) : (
                    <span className="text-xs font-bold text-white">{d.name[0]}</span>
                  )}
                </div>
                <div>
                  <span className="font-semibold" style={{ color: d.color, fontFamily: "var(--font-rubik), sans-serif" }}>{t(d.fr)}</span>
                  <p className="text-xs text-ink-secondary">{t(d.desc)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg bg-surface-raised p-3 text-xs text-ink-muted">
            <strong>{t("Pour débuter :")}</strong>{" "}{t("Furie ou Corps sont les plus simples - vous posez des unités et vous attaquez. Évitez Chaos tant que vous n’êtes pas à l’aise avec les bases.")}</div>
        </section>

        {/* === 4. RESSOURCES === */}
        <section>
          <h2 className="text-2xl font-semibold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Comment payer ses cartes ?")}</h2>
          <p className="mt-2 text-sm text-ink-secondary">{t("Vos runes produisent deux types de ressources :")}</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-hairline bg-surface p-4">
              <h3 className="font-semibold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Énergie - la ressource de base")}</h3>
              <p className="mt-1 text-sm text-ink-secondary">{t("Tournez une rune à l’horizontale (")}<strong>{t("épuiser")}</strong>{t(") pour produire 1 énergie. La rune reste en jeu et sera de nouveau disponible au prochain tour. C’est votre « mana » principal.")}</p>
            </div>
            <div className="rounded-lg border border-hairline bg-surface p-4">
              <h3 className="font-semibold text-gold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Puissance - la ressource avancée")}</h3>
              <p className="mt-1 text-sm text-ink-secondary">{t("Placez une rune sous votre deck de runes (")}<strong>recycler</strong>{t(") pour produire 1 Puissance de sa couleur. Vous perdez la rune pour ce tour, mais certaines cartes puissantes l’exigent.")}</p>
            </div>
          </div>
        </section>

        {/* === 5. DÉROULEMENT D'UN TOUR === */}
        <section>
          <h2 className="text-2xl font-semibold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Comment se déroule un tour ?")}</h2>
          <div className="mt-4 space-y-2">
            {[
              { phase: "Éveil", desc: "Remettez toutes vos cartes épuisées en position verticale. Elles sont de nouveau utilisables." },
              { phase: "Début de tour", desc: "Si vous contrôlez un champ de bataille, vous marquez 1 point par champ tenu (c'est le Contrôle)." },
              { phase: "Canalisation", desc: "Ajoutez 2 runes de votre deck de runes sur le plateau. C'est votre « croissance » de mana. Au tout premier tour, le second joueur en reçoit 3 pour compenser." },
              { phase: "Pioche", desc: "Piochez 1 carte de votre deck." },
              { phase: "Phase principale", desc: "Jouez des unités et des sorts, équipez vos unités et déplacez-les vers les champs de bataille. Quand vos unités rencontrent celles de l'adversaire, un combat se déclenche." },
              { phase: "Fin de tour", desc: "Tous les dégâts sur les unités sont soignés. Vos unités repartent à pleine vie pour le prochain tour." },
            ].map((p, i) => (
              <div key={t(p.phase)} className="flex gap-3 rounded-lg border border-hairline bg-surface p-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-arcane text-xs font-bold text-canvas">{i + 1}</span>
                <div>
                  <h3 className="text-sm font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t(p.phase)}</h3>
                  <p className="text-xs text-ink-secondary">{t(p.desc)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* === 6. COMBAT === */}
        <section>
          <h2 className="text-2xl font-semibold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Comment fonctionne le combat ?")}</h2>
          <p className="mt-2 text-sm text-ink-secondary">{t("Un combat se déclenche quand des unités des deux joueurs se retrouvent sur le même champ de bataille.")}</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-hairline bg-surface p-4">
              <h3 className="font-semibold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("1. Avant les dégâts")}</h3>
              <p className="mt-1 text-sm text-ink-secondary">{t("Certaines unités ont des effets qui se déclenchent en attaque ou en défense. Ensuite, les deux joueurs peuvent jouer des cartes pour renforcer leur camp ou affaiblir l’adversaire. Quand les deux passent, on passe aux dégâts.")}</p>
            </div>
            <div className="rounded-lg border border-hairline bg-surface p-4">
              <h3 className="font-semibold text-gold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("2. Résolution des dégâts")}</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-ink-secondary">
                <li><span className="text-gold">&#x2022;</span>{" "}{t("Chaque camp additionne la")}{" "}<strong>Puissance</strong>{" "}{t("de toutes ses unités")}</li>
                <li><span className="text-gold">&#x2022;</span>{" "}{t("Les deux camps infligent leurs dégâts")}{" "}<strong>{t("en même temps")}</strong></li>
                <li><span className="text-gold">&#x2022;</span>{" "}{t("Vous répartissez vos dégâts sur les unités adverses, mais vous devez")}{" "}<strong>{t("éliminer une unité complètement")}</strong>{" "}{t("avant de passer à la suivante")}</li>
                <li><span className="text-gold">&#x2022;</span>{" "}{t("Une unité est éliminée quand les dégâts reçus ≥ sa Puissance")}</li>
              </ul>
            </div>
            <div className="rounded-lg border border-hairline bg-surface p-4">
              <h3 className="font-semibold text-success" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("3. Résultat")}</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-ink-secondary">
                <li><span className="text-gold">&#x2022;</span> <strong>L&apos;attaquant gagne</strong>{" "}{t("(plus de défenseurs) → il conquiert le champ, +1 point")}</li>
                <li><span className="text-gold">&#x2022;</span> <strong>{t("Le défenseur tient")}</strong>{" "}{t("(au moins une unité survit) → les attaquants sont renvoyés à la base")}</li>
                <li><span className="text-gold">&#x2022;</span> <strong>{t("Tout le monde meurt")}</strong>{" "}{t("→ le champ devient libre")}</li>
                <li><span className="text-gold">&#x2022;</span>{" "}{t("Tous les dégâts sont soignés après chaque combat")}</li>
              </ul>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg bg-surface-raised p-3 text-xs text-ink-muted">
                <strong className="text-gold">{t("Bon à savoir :")}</strong>{" "}{t("une unité épuisée peut quand même défendre. Pas besoin de la redresser pour bloquer.")}</div>
              <div className="rounded-lg bg-surface-raised p-3 text-xs text-ink-muted">
                <strong className="text-gold">{t("Bon à savoir :")}</strong>{" "}{t("si une unité équipée meurt, l’équipement survit et peut être attaché à une autre unité.")}</div>
            </div>
          </div>
        </section>

        {/* === 7. MULLIGAN === */}
        <section>
          <h2 className="text-2xl font-semibold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Comment commence la partie ?")}</h2>
          <div className="mt-4 rounded-lg border border-hairline bg-surface p-4 text-sm text-ink-secondary">
            <p>
              Chaque joueur pioche <strong>4 cartes</strong>{t(". Vous pouvez ensuite remettre jusqu’à")}{" "}<strong>2 cartes</strong>{" "}{t("que vous ne voulez pas, piocher autant de nouvelles cartes, et les cartes remises vont sous votre deck.")}</p>
            <p className="mt-2">{t("C’est le")}{" "}<strong>mulligan</strong>{" "}{t("- l’occasion de chercher une meilleure main de départ. Idéalement, gardez 1-2 unités pas chères que vous pourrez jouer dès les premiers tours.")}</p>
          </div>
        </section>

        {/* === 8. MOTS-CLÉS ESSENTIELS === */}
        <section>
          <h2 className="text-2xl font-semibold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Quels mots-clés faut-il connaître en priorité ?")}</h2>
          <p className="mt-2 text-sm text-ink-secondary">{t("Les cartes Riftbound utilisent des mots-clés pour décrire leurs effets. Voici les 6 les plus courants :")}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {keywordsEssential.map((kw) => (
              <div key={t(kw.name)} className="rounded-lg border border-hairline bg-surface p-3">
                <span className="text-xs font-bold text-gold">{t(kw.name)}</span>
                <span className="ml-1 text-[10px] text-ink-muted">({kw.en})</span>
                <p className="mt-0.5 text-xs text-ink-secondary">{t(kw.desc)}</p>
              </div>
            ))}
          </div>

          <h3 className="mt-6 text-lg font-semibold text-ink-secondary" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Autres mots-clés")}</h3>
          <p className="mt-1 text-xs text-ink-muted">{t("Vous les rencontrerez en jouant. Pas besoin de les apprendre par cœur - ils sont rappelés sur les cartes.")}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {keywordsOther.map((kw) => (
              <div key={t(kw.name)} className="rounded-lg border border-hairline bg-surface p-3">
                <span className="text-xs font-bold text-ink-secondary">{t(kw.name)}</span>
                <span className="ml-1 text-[10px] text-ink-muted">({kw.en})</span>
                <p className="mt-0.5 text-xs text-ink-muted">{t(kw.desc)}</p>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <Link href="/guides/glossaire" className="inline-flex min-h-6 items-center gap-2 text-sm text-arcane hover:underline">
              <BookOpen size={14} />{" "}{t("Voir tous les termes dans le glossaire")}</Link>
          </div>
        </section>

        {/* === 9. CONSEILS === */}
        <section>
          <h2 className="text-2xl font-semibold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Conseils pour votre première partie")}</h2>
          <ul className="mt-3 space-y-2 text-ink-secondary">
            {[
              "Commencez avec un deck de démarrage (Jinx, Viktor, Lee Sin, Fiora ou Rumble) - ils sont prêts à jouer, pas besoin de construire.",
              "Posez des unités dès que possible. Sans unités sur les champs de bataille, vous ne pouvez pas marquer de points.",
              "Gardez toujours un peu d'énergie en réserve. Ça vous permet de jouer un sort en réponse si l'adversaire vous attaque.",
              "Ne jetez pas toutes vos cartes d'un coup. Gérez vos ressources - vous ne piochez qu'une carte par tour.",
              "Défendre un champ de bataille rapporte 1 point automatique à chaque tour. C'est souvent plus rentable que d'attaquer partout.",
              "Lisez les capacités de vos champs de bataille. Elles peuvent faire la différence !",
              "Ne changez pas de deck après une seule défaite. Jouez plusieurs parties pour apprendre les interactions.",
            ].map((tip, i) => (
              <li key={i} className="flex gap-2"><span className="text-gold">&#x2022;</span>{tip}</li>
            ))}
          </ul>
        </section>

        {/* === 10. QUELLE LÉGENDE === */}
        <section>
          <h2 className="text-2xl font-semibold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Par quelle légende commencer ?")}</h2>
          <p className="mt-2 text-sm text-ink-secondary">{t("Une fois à l’aise avec les bases, choisissez une légende dont le style vous parle. Ces légendes offrent des points de départ accessibles pour apprendre le jeu :")}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-hairline bg-surface p-3 text-sm">
              <span className="font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>Irelia, Blade Dancer</span>
              <p className="mt-0.5 text-xs text-ink-secondary">{t("Tempo réactif (Calme/Ordre). La légende la plus constante du méta. Cœur de deck bien établi.")}</p>
            </div>
            <div className="rounded-lg border border-hairline bg-surface p-3 text-sm">
              <span className="font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>Master Yi, Wuju Master</span>
              <p className="mt-0.5 text-xs text-ink-secondary">{t("Corps/Calme. Gagne en puissance avec l’XP. Récompense le jeu patient.")}</p>
            </div>
            <div className="rounded-lg border border-hairline bg-surface p-3 text-sm">
              <span className="font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>Diana, Scorn of the Moon</span>
              <p className="mt-0.5 text-xs text-ink-secondary">{t("Agro-tempo (Esprit/Chaos). Rapide et directe, idéale pour apprendre à mettre la pression.")}</p>
            </div>
            <div className="rounded-lg border border-hairline bg-surface p-3 text-sm">
              <span className="font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>Draven, Glorious Executioner</span>
              <p className="mt-0.5 text-xs text-ink-secondary">{t("Agression pure (Chaos/Furie). Très fort sur le set précédent - parfait si vous aimez foncer.")}</p>
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-surface-raised p-3 text-xs text-ink-muted">
            Pour le détail complet des meilleures légendes par set, consultez le{" "}
            <Link href="/guides/meta" className="inline-flex min-h-6 items-center text-arcane hover:underline">{t("guide Méta & Tier List")}</Link>.
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/guides/deckbuilding" className="inline-flex items-center gap-2 rounded-lg bg-arcane px-4 py-2 text-sm font-semibold text-canvas hover:opacity-90">{t("Guide de deckbuilding")}</Link>
          <Link href="/guides/meta" className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-canvas hover:opacity-90">{t("Méta & Tier List")}</Link>
          <Link href="/guides/domaines" className="inline-flex items-center gap-2 rounded-lg bg-violet-dark px-4 py-2 text-sm font-semibold text-white hover:opacity-90">{t("Les 6 Domaines")}</Link>
          <Link href="/guides/glossaire" className="inline-flex items-center gap-2 rounded-lg bg-surface-raised px-4 py-2 text-sm font-semibold text-ink-secondary hover:opacity-90">
            <BookOpen size={16} /> Glossaire complet
          </Link>
        </div>

      </div>
    </div>
  );
}

export const generateMetadata = () => metaTraduite(metadata);
