import type { Metadata } from "next";
import Link from "@/components/lien";
import { ExternalLink } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { metaTraduite, tr } from "@/lib/i18n-server";

const metadata: Metadata = {
  title: "Jouer en ligne",
  description: "Comment jouer à Riftbound en ligne gratuitement avec TCG Arena et RiftAtlas.",
  alternates: { canonical: "/guides/jouer-en-ligne" },
  openGraph: {
    type: "article",
    siteName: "Riftbound France",
    locale: "fr_FR",
    title: "Jouer à Riftbound en ligne - TCG Arena & RiftAtlas",
    description: "Comment jouer à Riftbound en ligne gratuitement avec TCG Arena et RiftAtlas.",
    images: ["/img/og-default.png"],
  },
};

const platforms = [
  {
    name: "TCG Arena",
    url: "https://tcgarena.app",
    color: "#0ea5e9",
    description: "Plateforme web pour jouer à Riftbound en temps réel contre d'autres joueurs. Elle propose le glisser-déposer, une discussion et une recherche d'adversaire automatique.",
    steps: [
      "Rendez-vous sur tcgarena.app et créez un compte gratuit",
      "Cliquez sur « Riftbound » dans la liste des jeux disponibles",
      "Importez votre deck : copiez votre code de deck depuis le Deckbuilder et collez-le dans l'importeur",
      "Rejoignez le salon public ou créez une partie privée pour inviter un ami",
      "Sélectionnez votre Légende et votre Champion, puis lancez la partie",
      "L'interface gère automatiquement les règles : phases, runes, énergie et résolution des combats",
    ],
    tips: [
      "Activez les notifications sonores pour ne pas rater votre tour",
      "Utilisez le mode « Reveal Hidden » pour poser vos cartes face cachée",
      "Le chronomètre par tour est de 90 secondes par défaut - demandez un allongement pour vos premières parties",
      "Rejoignez le Discord de TCG Arena pour trouver des adversaires francophones",
    ],
  },
  {
    name: "RiftAtlas",
    url: "https://riftatlas.com",
    color: "#a78bfa",
    description: "Simulateur de parties Riftbound qui gère les règles. Vous pouvez y tester des decks en solo ou jouer contre des amis.",
    steps: [
      "Allez sur riftatlas.com et créez un compte (gratuit)",
      "Dans la section « Decks », créez ou importez votre deck via code de deck",
      "Cliquez sur « New Game » pour créer une partie",
      "Choisissez le mode : Solo (test), 1v1 privé (lien d'invitation) ou recherche d'adversaire",
      "Configurez la partie : format (Bo1/Bo3), chronomètre, et sélection du champ de bataille",
      "Partagez le lien avec votre adversaire et commencez à jouer",
    ],
    tips: [
      "Le mode Solo permet de tester votre deck sans adversaire - parfait pour s'entraîner au mulligan",
      "RiftAtlas supporte le Bo3 avec Réserve automatique entre les manches",
      "Utilisez le journal de partie pour revoir vos actions et analyser vos erreurs",
      "L'outil de statistiques intégré montre votre taux de victoire par légende et par face-à-face",
    ],
  },
];

export default async function JouerEnLignePage() {
  const t = await tr();
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Guides", href: "/guides" }, { name: "Jouer en ligne", href: "/guides/jouer-en-ligne" }]} className="mb-6" />
      <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Jouer en ligne")}</h1>
      <p className="mt-2 text-lg text-ink-secondary">{t("Vous pouvez jouer gratuitement à Riftbound en ligne, même sans cartes physiques. Voici deux plateformes et la marche à suivre.")}</p>

      <div className="mt-4 rounded-lg border border-gold/20 bg-gold/5 px-4 py-3 text-sm text-ink-secondary">
        <strong className="text-gold">{t("Prérequis :")}</strong> un deck Riftbound prêt à jouer.{" "}
        <Link href="/deckbuilder" className="inline-flex min-h-6 items-center text-arcane hover:underline">{t("Créez-en un avec le Deckbuilder")}</Link>{" "}
        ou{" "}
        <Link href="/decks" className="inline-flex min-h-6 items-center text-arcane hover:underline">{t("copiez un deck existant")}</Link>.
      </div>

      <div className="mt-10 space-y-14">
        {platforms.map((platform) => (
          <section key={t(platform.name)}>
            <div className="flex items-center gap-3">
              <h2
                className="text-2xl font-semibold"
                style={{ fontFamily: "var(--font-rubik), sans-serif", color: platform.color }}
              >
                {t(platform.name)}
              </h2>
              <a
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-ink-muted hover:text-arcane transition-colors border border-hairline"
              >
                Visiter <ExternalLink size={12} />
              </a>
            </div>

            <p className="mt-2 text-ink-secondary">{t(platform.description)}</p>

            <h3 className="mt-6 text-lg font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
              Comment commencer
            </h3>
            <ol className="mt-3 space-y-3">
              {platform.steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-canvas"
                    style={{ backgroundColor: platform.color }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm text-ink/90 pt-0.5">{step}</span>
                </li>
              ))}
            </ol>

            <h3 className="mt-6 text-lg font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
              Astuces
            </h3>
            <ul className="mt-3 space-y-2">
              {platform.tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm text-ink-secondary">
                  <span className="text-gold">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-14 rounded-card border border-hairline bg-surface p-6">
        <h2 className="text-xl font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Quelle plateforme choisir pour jouer à Riftbound en ligne ?")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-arcane/20 bg-arcane/5 p-4">
            <h3 className="font-semibold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
              TCG Arena
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-ink-secondary">
              <li>{t("+ Recherche d’adversaire intégrée")}</li>
              <li>{t("+ Interface plus fluide")}</li>
              <li>{t("+ Discussion en jeu")}</li>
              <li>{t("− Moins de formats supportés")}</li>
            </ul>
          </div>
          <div className="rounded-lg border border-violet/20 bg-violet/5 p-4">
            <h3 className="font-semibold text-violet-light" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
              RiftAtlas
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-ink-secondary">
              <li>{t("+ Mode solo pour tester")}</li>
              <li>{t("+ Bo3 avec Réserve")}</li>
              <li>{t("+ Statistiques avancées")}</li>
              <li>{t("− Nécessite un lien d’invitation")}</li>
            </ul>
          </div>
        </div>
        <p className="mt-4 text-sm text-ink-muted">{t("Les deux plateformes sont gratuites. Choisissez TCG Arena pour chercher un adversaire, ou RiftAtlas pour tester un deck en solo avant une partie.")}</p>
      </section>

      <div className="mt-8 text-center">
        <Link
          href="/guides"
          className="inline-flex min-h-6 items-center text-sm text-ink-muted hover:text-arcane transition-colors"
        >{t("← Retour aux guides")}</Link>
      </div>
    </div>
  );
}

export const generateMetadata = () => metaTraduite(metadata);
