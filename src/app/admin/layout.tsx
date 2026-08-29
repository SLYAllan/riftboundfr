import Link from "@/components/lien";
import { isAdmin } from "@/lib/auth";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/decks", label: "Decks" },
  { href: "/admin/tier-list", label: "Tier List" },
  { href: "/admin/events", label: "Événements" },
  { href: "/admin/bulking", label: "Bulking" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();

  if (!admin) {
    return <>{children}</>;
  }

  return (
    // Colonne sur mobile, deux colonnes à partir de md : la barre latérale figée à
    // 240px plus p-8 faisait déborder l'écran jusqu'à 722px de large à 390px.
    <div className="min-h-dvh flex flex-col md:flex-row bg-canvas">
      <aside className="w-full md:w-60 shrink-0 bg-surface border-b md:border-b-0 md:border-r border-hairline p-4 md:p-6 flex flex-row md:flex-col flex-wrap gap-2">
        <Link href="/" className="w-full text-lg font-bold text-arcane md:mb-6" style={{ fontFamily: "var(--font-rubik)" }}>
          Riftbound France
        </Link>
        <p className="hidden md:block text-xs text-ink-muted uppercase tracking-wider mb-2">Administration</p>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-3 py-2 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface-raised transition-colors text-sm"
          >
            {item.label}
          </Link>
        ))}
        <div className="md:mt-auto">
          <Link href="/" className="block px-3 py-2 text-ink-muted hover:text-ink text-sm">
            Retour au site
          </Link>
        </div>
      </aside>
      <div className="min-w-0 flex-1 p-4 sm:p-6 md:p-8">{children}</div>
    </div>
  );
}
