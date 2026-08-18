import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import Link from "@/components/lien";
import { TrendingUp, AlertTriangle } from "lucide-react";
import { CardRef } from "@/components/card-ref";
import { metaTraduite, tr } from "@/lib/i18n-server";

const metadata: Metadata = {
  title: "Méta & Tier List Riftbound",
  description:
    "Le méta compétitif Riftbound set par set (Origins, Spiritforged, Unleashed) : meilleures Légendes, archétypes et cartes clés. Basé sur 88 tournois.",
  alternates: { canonical: "/guides/meta" },
  openGraph: {
    type: "article",
    siteName: "Riftbound France",
    locale: "fr_FR",
    title: "Méta & Tier List Riftbound",
    description:
      "Le méta Riftbound set par set : meilleures Légendes, archétypes et cartes clés, sur 88 tournois.",
    images: ["/img/og-default.png"],
  },
};

type Tier = "S" | "A" | "B" | "C";

const TIER_STYLE: Record<Tier, { bg: string; label: string }> = {
  S: { bg: "bg-gold", label: "Domine le format" },
  A: { bg: "bg-arcane", label: "Top cut régulier" },
  B: { bg: "bg-emerald-600", label: "Viable avec un bon pilote" },
  C: { bg: "bg-ink-muted", label: "Niche ou en déclin" },
};

type Entry = { tier: Tier; name: string; note: string };

const origins: Entry[] = [
  { tier: "S", name: "Kai'Sa, Daughter of the Void", note: "27,6 % du field, 10 victoires. A gagné le Shanghai National Open (2048 joueurs). La reine du set." },
  { tier: "S", name: "Master Yi, Wuju Bladesman", note: "23 % du field, 6 victoires. Deck de Hold Corps/Calme qui gagne en force tour après tour." },
  { tier: "A", name: "Viktor, Herald of the Arcane", note: "Contrôle pur (11,5 %). Toujours présent, mais ne gagne presque jamais le tournoi." },
  { tier: "A", name: "Sett, The Boss", note: "Sous-représenté (5,4 %) mais surperforme : 4 victoires. Résistant et difficile à retirer." },
  { tier: "A", name: "Annie, Dark Child", note: "Faible part du field mais excellente conversion. L'agro qui punit le contrôle." },
  { tier: "B", name: "Miss Fortune · Teemo · Ahri · Darius", note: "Présents en top cut occasionnellement, sans dominer." },
];

const spiritforged: Entry[] = [
  { tier: "S", name: "Draven, Glorious Executioner", note: "1 deck sur 5 (21 %), 88 top 8, 15 victoires. Aucune autre légende n'approche. Le roi du set." },
  { tier: "A", name: "Irelia, Blade Dancer", note: "2e légende la plus jouée (12 %). Tempo réactif. A gagné le Shenzhen National Open." },
  { tier: "A", name: "Kai'Sa, Daughter of the Void", note: "Reste forte (11,9 %) mais en net recul par rapport à Origines." },
  { tier: "A", name: "Viktor, Herald of the Arcane", note: "Meilleure conversion du haut du tableau (6,1 %). 4e à Bologna." },
  { tier: "B", name: "Annie, Dark Child", note: "Le sleeper : 2 % du field mais la meilleure conversion top 8 / deck du set. Le counter du méta." },
  { tier: "B", name: "Azir · Ezreal · Fiora · Rek'Sai", note: "Azir a gagné Lille (14-0-2), Ezreal a gagné Bologna. Solides avec le bon pilote." },
  { tier: "C", name: "Lucian · Yasuo · Sivir", note: "Pièges : très joués mais convertissent très mal. Populaires ≠ bons." },
];

const unleashed: Entry[] = [
  { tier: "S", name: "Irelia, Blade Dancer", note: "8 % du field, 6 victoires. Toujours la reine, la plus constante du format." },
  { tier: "S", name: "Master Yi, Wuju Bladesman", note: "Le Master Yi dominant du format : deck de Hold Corps/Calme (+2 Might en défense seul). A gagné Suzhou, Tianjin et Hartford. À ne pas confondre avec le Wuju Master (variante XP/Tempered, de niche et bien plus faible)." },
  { tier: "S", name: "LeBlanc, Deceiver", note: "Moteur d'Agonie : tire profit de la mort de ses propres unités. 19 top 8. Se contre en tuant son Karthus tôt (Challenge) plutôt qu'en l'affrontant tard." },
  { tier: "S", name: "Diana, Scorn of the Moon", note: "Agro-tempo qui monte vite : double championne au plus gros Régional du set (Vancouver, ~2000 joueurs), domine les City Challenges." },
  { tier: "A", name: "Fiora · Lillia · Sivir · Sett · Azir · Kai'Sa · Rengar · Annie", note: "Une douzaine de légendes viables. Sett et Annie surperforment en conversion. Azir a gagné le RQ de Lille (invaincu)." },
  { tier: "B", name: "Vex · Draven · Kha'Zix · Viktor · Pyke · Ezreal · Ornn", note: "Présents en top cut sans gagner. Vex est l'une des plus jouées ; Ezreal contrôle a gagné le Triple Win-A-Box en renvoyant la Vex en main pour casser son Hold." },
  { tier: "C", name: "Miss Fortune", note: "Piège du format : 3,3 % du field pour un seul top 8. Le méta a maindecké le retrait d'équipement." },
];

const sets = [
  {
    id: "unleashed",
    name: "Unleashed",
    fr: "Le set actuel",
    decks: "environ 8 600 decks classés · 40 légendes",
    summary:
      "Le méta le plus ouvert de l'histoire du jeu : quatre légendes S quasi à égalité et une douzaine de decks viables. Aucune légende n'écrase le format.",
    entries: unleashed,
    color: "#a78bfa",
  },
  {
    id: "spiritforged",
    name: "Spiritforged",
    fr: "Le 2e set",
    decks: "7 294 decks classés · 29 légendes",
    summary:
      "Le règne de Draven. Une seule légende domine le volume ET les victoires. Le reste du méta s'organise autour d'elle (la contrer ou la copier).",
    entries: spiritforged,
    color: "#ef4444",
  },
  {
    id: "origins",
    name: "Origines",
    fr: "Le 1er set",
    decks: "6 799 decks classés · 16 légendes",
    summary:
      "Un méta à deux têtes : Kai'Sa et Master Yi Bladesman réunissaient à eux seuls la moitié du field. Pool de légendes restreint, méta très concentré.",
    entries: origins,
    color: "#22c55e",
  },
];

const archetypes = [
  {
    name: "Agression",
    desc: "Poser des unités rapides et scorer sur les deux champs de bataille avant que l'adversaire ne se stabilise. Les parties sont courtes.",
    legends: "Draven, Annie, Rengar, Darius, Rek'Sai",
    domains: "Furie, Corps, Chaos",
  },
  {
    name: "Tempo / Midrange",
    desc: "Garder un cran d'avance : échanger efficacement, contester les champs et convertir l'avantage en points. L'archétype le plus polyvalent.",
    legends: "Irelia, Kai'Sa, Fiora, Sett",
    domains: "Calme, Corps, Ordre",
  },
  {
    name: "Contrôle",
    desc: "Survivre au début de partie, neutraliser les menaces adverses, puis prendre le dessus sur la durée grâce à la pioche et aux grosses cartes.",
    legends: "Viktor, Lux, Ezreal, Lillia",
    domains: "Esprit, Ordre",
  },
  {
    name: "Combo / Engine",
    desc: "Assembler un moteur de valeur (Agonie, cartes face cachée, équipements, Dragons) qui prend le dessus si la partie dure. Demande de l'expérience. Vu récemment : un Volibear Dragons qui enchaîne réduction de coût et pioche pour vider son deck en un tour.",
    legends: "LeBlanc, Diana, Vex, Volibear",
    domains: "Esprit, Chaos, Ordre",
  },
  {
    name: "Hold / Défensif",
    desc: "Prendre un champ de bataille et le tenir : chaque tour tenu rapporte +1 point automatique. Des unités qui grandissent et résistent.",
    legends: "Master Yi (Bladesman), Vex",
    domains: "Calme, Corps",
  },
];

async function TierRow({ e }: { e: Entry }) {
  const t = await tr();
  const s = TIER_STYLE[e.tier];
  return (
    <div className="flex gap-3 rounded-lg border border-hairline bg-surface p-3">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-black text-canvas ${s.bg}`}
        style={{ fontFamily: "var(--font-rubik), sans-serif" }}
      >
        {e.tier}
      </span>
      <div className="flex-1">
        <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
          {t(e.name)}
        </span>
        <p className="mt-0.5 text-xs text-ink-secondary">{t(e.note)}</p>
      </div>
    </div>
  );
}

export default async function GuideMetaPage() {
  const t = await tr();
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Guides", href: "/guides" }, { name: "Méta", href: "/guides/meta" }]} className="mb-6" />
      <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Méta & Tier List")}</h1>
      <p className="mt-2 text-lg text-ink-secondary">{t("Quelles légendes gagnent vraiment les tournois ? Ce guide résume le méta compétitif set par set, les grands archétypes et les cartes qui définissent le format.")}</p>

      <div className="mt-4 rounded-lg border-2 border-gold/20 bg-gold-glow p-3 text-sm text-gold">
        <strong>{t("D’où viennent ces données ?")}</strong>{" "}{t("De l’analyse de")}{" "}<strong>88 tournois</strong>{" "}{t("et plus de 21 000 decklists classées (Chine, Europe, États-Unis, Océanie). Les tiers ci-dessous mesurent la part du field, le nombre de top 8, les victoires et le taux de conversion - pas une opinion.")}</div>

      <div className="mt-10 space-y-12">
        <section>
          <h2 className="text-2xl font-semibold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("C’est quoi le « méta » ?")}</h2>
          <p className="mt-2 text-sm text-ink-secondary">{t("Le méta (pour")}{" "}<em>metagame</em>{t(") désigne l’ensemble des decks les plus joués et les plus performants à un instant donné. Il évolue à chaque nouveau set et à chaque gros tournoi. Connaître le méta vous aide à choisir une légende solide, à anticiper ce que joueront vos adversaires et à préparer votre Réserve en Bo3.")}</p>
          <p className="mt-2 text-sm text-ink-secondary">
            Riftbound compte aujourd&apos;hui <strong>trois sets</strong>{t(". Chacun a son propre méta, car le pool de cartes légales change. Le format actuel est")}{" "}<strong>Unleashed</strong>.
          </p>
        </section>

        {sets.map((set) => (
          <section key={set.id} id={set.id}>
            <div className="flex items-center gap-3">
              <span className="h-8 w-1.5 rounded-full" style={{ backgroundColor: set.color }} />
              <div>
                <h2 className="text-2xl font-semibold" style={{ color: set.color, fontFamily: "var(--font-rubik), sans-serif" }}>
                  {t(set.name)}
                </h2>
                <span className="text-xs text-ink-muted">{t(set.fr)} · {set.decks}</span>
              </div>
            </div>
            <p className="mt-3 text-sm text-ink-secondary">{t(set.summary)}</p>
            <div className="mt-4 space-y-2">
              {set.entries.map((e) => (
                <TierRow key={t(e.name)} e={e} />
              ))}
            </div>
          </section>
        ))}

        <section>
          <h2 className="text-2xl font-semibold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Les grands archétypes")}</h2>
          <p className="mt-2 text-sm text-ink-secondary">{t("Au-delà des légendes, chaque deck appartient à une grande famille de stratégie. Identifier l’archétype adverse en quelques tours vous dit comment jouer la partie.")}</p>
          <div className="mt-4 space-y-2">
            {archetypes.map((a) => (
              <div key={t(a.name)} className="rounded-lg border border-hairline bg-surface p-4">
                <h3 className="font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t(a.name)}</h3>
                <p className="mt-1 text-sm text-ink-secondary">{t(a.desc)}</p>
                <div className="mt-2 flex flex-col gap-1 text-xs text-ink-muted sm:flex-row sm:gap-6">
                  <span><strong className="text-ink-secondary">{t("Légendes :")}</strong> {a.legends}</span>
                  <span><strong className="text-ink-secondary">Domaines :</strong> {a.domains}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-2xl font-semibold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
            <TrendingUp size={20} />{" "}{t("Les cartes qui définissent le format")}</h2>
          <p className="mt-2 text-sm text-ink-secondary">{t("Une poignée de cartes oriente la construction de tous les decks. Les connaître, c’est comprendre pourquoi le méta ressemble à ce qu’il est.")}</p>
          <div className="mt-4 space-y-2">
            <div className="rounded-lg border border-hairline bg-surface p-3 text-sm text-ink-secondary">
              <CardRef name="Dazzling Aurora">Dazzling Aurora</CardRef>{" "}{t("- l’équipement à 9 énergie qui portait Sivir, Miss Fortune et Poppy.")}{" "}<strong>{t("En net déclin")}</strong>{" "}{t(": le field a réagi.")}</div>
            <div className="rounded-lg border border-hairline bg-surface p-3 text-sm text-ink-secondary">
              <CardRef name="Salvage">Salvage</CardRef>, <CardRef name="Turn to Dust">Turn to Dust</CardRef> et{" "}
              <CardRef name="Adaptatron">Adaptatron</CardRef>{" "}{t("- du")}{" "}<strong>{t("retrait d’équipement joué en deck principal")}</strong>{" "}
              pour punir Aurora. C&apos;est ce qui a fait chuter Sivir et Poppy.
            </div>
            <div className="rounded-lg border border-hairline bg-surface p-3 text-sm text-ink-secondary">
              <CardRef name="Defy">Defy</CardRef>{" "}{t("- le retrait universel à 1 énergie, présent dans presque tous les decks réactifs.")}</div>
            <div className="rounded-lg border border-hairline bg-surface p-3 text-sm text-ink-secondary">
              <CardRef name="Vex">Vex</CardRef>{" "}{t("(version à 4 coût) - un quasi verrou : Déviation, et chaque unité posée par l’adversaire arrive étourdie. Très jouée, souvent citée comme candidate au bannissement.")}</div>
            <div className="rounded-lg border border-hairline bg-surface p-3 text-sm text-ink-secondary">
              <CardRef name="Unchecked Power">Unchecked Power</CardRef>{" "}{t("- la réponse aux decks de Hold (Vex, Master Yi) : elle balaye un champ de bataille même très chargé et remet la partie à zéro.")}</div>
            <div className="rounded-lg border border-hairline bg-surface p-3 text-sm text-ink-secondary">
              <CardRef name="Akshan">Akshan</CardRef>{" "}{t("- la réponse en unité à l’archétype Aurora : il vole ou détruit l’équipement adverse, donc l’Aurora elle-même.")}</div>
          </div>
          <div className="mt-3 rounded-lg bg-surface-raised p-3 text-xs text-ink-muted">{t("Leçon de méta : quand une carte devient trop forte (Aurora), le field s’adapte en intégrant sa réponse en deck principal. C’est le cycle naturel du jeu compétitif.")}</div>
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-2xl font-semibold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
            <AlertTriangle size={20} />{" "}{t("Attention aux pièges de représentation")}</h2>
          <p className="mt-2 text-sm text-ink-secondary">{t("Une légende beaucoup jouée n’est pas forcément forte. Certaines sont populaires mais convertissent mal en top 8 (Lucian, Yasuo et Sivir à Spiritforged, Miss Fortune à Unleashed). À l’inverse, des sleepers comme")}<strong> Annie</strong> {t("ou")} <strong>Sett</strong>{" "}{t("sont peu joués mais gagnent au-dessus de leur poids. Regardez toujours le")}{" "}<strong>{t("taux de conversion")}</strong>{t(", pas seulement la part du field.")}</p>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/tier-list" className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-canvas hover:opacity-90">{t("Voir la Tier List complète")}</Link>
          <Link href="/guides/deckbuilding" className="inline-flex items-center gap-2 rounded-lg bg-arcane px-4 py-2 text-sm font-semibold text-canvas hover:opacity-90">{t("Guide de deckbuilding")}</Link>
          <Link href="/tournois" className="inline-flex items-center gap-2 rounded-lg bg-violet-dark px-4 py-2 text-sm font-semibold text-white hover:opacity-90">{t("Résultats de tournois")}</Link>
        </div>
      </div>
    </div>
  );
}

export const generateMetadata = () => metaTraduite(metadata);
