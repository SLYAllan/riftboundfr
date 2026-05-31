import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-surface">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5 text-xs text-ink-muted">
          <Link href="/cartes" className="hover:text-ink transition-colors">Cartes</Link>
          <span className="text-hairline">·</span>
          <Link href="/decks" className="hover:text-ink transition-colors">Decks</Link>
          <span className="text-hairline">·</span>
          <Link href="/tier-list" className="hover:text-ink transition-colors">Tier List</Link>
          <span className="text-hairline">·</span>
          <Link href="/guides/debuter" className="hover:text-ink transition-colors">Guides</Link>
          <span className="text-hairline">·</span>
          <Link href="/tournois" className="hover:text-ink transition-colors">Tournois</Link>
          <span className="text-hairline">·</span>
          <Link href="/articles" className="hover:text-ink transition-colors">Articles</Link>
          <span className="text-hairline">·</span>
          <Link href="/deckbuilder" className="hover:text-ink transition-colors">Deckbuilder</Link>
          <span className="text-hairline">·</span>
          <Link href="/a-propos" className="hover:text-ink transition-colors">À propos</Link>
          <span className="text-hairline">·</span>
          <a href="mailto:contact@riftboundfrance.fr" className="hover:text-ink transition-colors">Contact</a>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-t border-hairline py-3">
          <div className="flex items-center gap-3">
            <Image src="/logorbfr.png" alt="Riftbound France" width={80} height={28} className="h-7 w-auto" />
          </div>
          <p className="text-[11px] leading-snug text-ink-disabled sm:ml-auto sm:max-w-3xl sm:text-right">
            &copy; {new Date().getFullYear()} Riftbound France &middot; riftboundfrance.fr. Site non approuv&eacute; par Riot Games. Riot Games et toutes les propri&eacute;t&eacute;s associ&eacute;es sont des marques de Riot Games, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
