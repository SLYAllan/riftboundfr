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
export default function Lien({ href, ...reste }: Props) {
  const langue = useLangue();
  return <NextLink href={typeof href === "string" ? prefixerLien(href, langue) : href} {...reste} />;
}
