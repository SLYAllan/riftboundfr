import { headers } from "next/headers";
import type { Metadata } from "next";
import { traduire, traduireCanonical, type Langue } from "./i18n";

/**
 * Fichier separe de `i18n.ts` : `next/headers` n'existe que cote serveur, et
 * les composants client importent `traduire`/`prefixerLien` du meme module.
 * Les melanger casse tout le site au chargement.
 */

/** Langue de la requete en cours, posee par le middleware. */
export async function langueCourante(): Promise<Langue> {
  const h = await headers();
  const posee = h.get("x-langue");
  return posee === "en" || posee === "zh" ? posee : "fr";
}

/** Chemin demande, sans le prefixe de langue. Sert aux liens hreflang. */
export async function cheminCourant(): Promise<string> {
  const h = await headers();
  return h.get("x-chemin") || "/";
}

/** Traducteur pret a l'emploi dans un composant serveur : `const t = await tr()`. */
export async function tr(): Promise<(texte: string) => string> {
  const langue = await langueCourante();
  return (texte: string) => traduire(texte, langue);
}

/**
 * Fait passer titre et description d'une page par le dictionnaire. Evite
 * d'ecrire deux objets Metadata dans chacune des 44 pages : le texte anglais
 * vit au meme endroit que le reste des traductions.
 *
 * Usage : `export const generateMetadata = () => metaTraduite(metadata);`
 */
export async function metaTraduite(m: Metadata): Promise<Metadata> {
  const langue = await langueCourante();
  if (langue === "fr") return m;
  const t = (v: unknown) => (typeof v === "string" ? traduire(v, langue) : v);

  const titre =
    typeof m.title === "string"
      ? traduire(m.title, langue)
      : m.title && typeof m.title === "object" && "absolute" in m.title
        ? { absolute: traduire(String(m.title.absolute), langue) }
        : m.title;

  return {
    ...m,
    title: titre as Metadata["title"],
    description: t(m.description) as string | undefined,
    alternates: m.alternates
      ? {
          ...m.alternates,
          canonical: m.alternates.canonical
            ? traduireCanonical(m.alternates.canonical, langue)
            : m.alternates.canonical,
        }
      : m.alternates,
    openGraph: m.openGraph
      ? {
          ...m.openGraph,
          locale: langue === "zh" ? "zh_TW" : "en_GB",
          title: t(m.openGraph.title) as never,
          description: t(m.openGraph.description) as string | undefined,
        }
      : m.openGraph,
    twitter: m.twitter
      ? {
          ...m.twitter,
          title: t(m.twitter.title) as never,
          description: t(m.twitter.description) as string | undefined,
        }
      : m.twitter,
  };
}
