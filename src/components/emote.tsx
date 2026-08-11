import Image from "next/image";
import { decouperEmotes, type Emote as EmoteData } from "@/lib/emotes";

/** Une incrustation, alignée sur la ligne de texte comme un emoji. */
export function Emote({ emote }: { emote: EmoteData }) {
  return (
    <Image
      src={emote.src}
      alt={`:${emote.nom}:`}
      title={emote.label}
      width={20}
      height={20}
      className="inline-block h-[1.15em] w-[1.15em] shrink-0 -translate-y-[0.08em] select-none object-contain align-middle"
      // Le nom reste dans le alt : copier-coller et lecteur d'écran gardent le sens.
      unoptimized
    />
  );
}

/**
 * Texte simple contenant des « :nom: ». Pour les endroits sans markdown
 * (commentaires). Conserve les retours à la ligne.
 */
export function TexteAvecEmotes({ texte, className }: { texte: string; className?: string }) {
  const morceaux = decouperEmotes(texte);
  return (
    <span className={className}>
      {morceaux.map((m, i) =>
        m.type === "texte" ? m.valeur : <Emote key={i} emote={m.emote} />,
      )}
    </span>
  );
}
