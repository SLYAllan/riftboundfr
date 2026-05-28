import Link from "next/link";
import { isAdmin } from "@/lib/auth";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/decks", label: "Decks" },
  { href: "/admin/tier-list", label: "Tier List" },
  { href: "/admin/events", label: "Événements" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();

  if (!admin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-canvas">
      <aside className="w-60 bg-surface border-r border-hairline p-6 flex flex-col gap-2">
        <Link href="/" className="text-lg font-bold text-arcane mb-6" style={{ fontFamily: "var(--font-rubik)" }}>
          Riftbound France
        </Link>
        <p className="text-xs text-ink-muted uppercase tracking-wider mb-2">Administration</p>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-3 py-2 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface-raised transition-colors text-sm"
          >
            {item.label}
          </Link>
        ))}
        <div className="mt-auto">
          <Link href="/" className="px-3 py-2 text-ink-muted hover:text-ink text-sm">
            Retour au site
          </Link>
        </div>
      </aside>
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
