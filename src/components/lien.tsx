"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { prefixerLien } from "@/lib/i18n";
import { useLangue } from "@/components/i18n-provider";

type Props = ComponentProps<typeof NextLink>;

/**
 * Remplace `next/link` partout dans le site. En français il ne fait rien ; en
 * anglais il ajoute `/en` devant les liens internes, ce qui évite d'avoir à
 * réécrire les centaines de `href` du site — et évite surtout qu'un seul lien
 * oublié renvoie l'anglophone sur une page française.
 */
export default function Lien({ href, prefetch, ...reste }: Props) {
  const langue = useLangue();
  // Une route d'API n'est pas une page. Précharger « Se connecter avec Discord »
  // suivait la redirection de /api/auth/discord jusqu'à discord.com, que la CSP
  // bloque : une erreur console et un passage OAuth pour rien à chaque page de deck.
  const api = typeof href === "string" && href.startsWith("/api/");
  return <NextLink href={typeof href === "string" ? prefixerLien(href, langue) : href} prefetch={api ? false : prefetch} {...reste} />;
}
