export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CardImage } from "@/components/card-image";

export const metadata: Metadata = {
  title: { absolute: "Classeur partagé - Riftbound France" },
  robots: { index: false, follow: false },
};

const SET_ORDER = ["OGN", "OGS", "SFD", "UNL", "PR", "OPP", "JDG"];

export default async function SharedBinderPage({ params }: { params: Promise<{ shareSlug: string }> }) {
  const { shareSlug } = await params;
  const binder = await prisma.binder.findFirst({
    where: { shareSlug, isPublic: true },
    include: {
      user: { select: { username: true } },
      items: {
        where: { quantity: { gt: 0 } },
        include: { card: { select: { id: true, name: true, imageUrl: true, set: true, collectorNumber: true } } },
      },
    },
  });
  if (!binder) notFound();

  const items = [...binder.items].sort((a, b) => {
    const ia = SET_ORDER.indexOf(a.card.set), ib = SET_ORDER.indexOf(b.card.set);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || (a.card.collectorNumber ?? 0) - (b.card.collectorNumber ?? 0);
  });
  const copies = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-rajdhani), sans-serif" }}>{binder.name}</h1>
      <p className="mb-6 mt-1 text-sm text-ink-muted">
        Classeur partagé par {binder.user.username} · {items.length} cartes · {copies} exemplaires
      </p>
      {items.length === 0 ? (
        <p className="py-16 text-center text-ink-muted">Ce classeur est vide.</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {items.map((it) => (
            <div key={it.id} className="group relative">
              <div className="relative overflow-hidden rounded-game-card">
                <CardImage src={it.card.imageUrl} alt={it.card.name} size="sm" />
                {it.quantity > 1 && (
                  <span className="absolute right-1 top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-arcane px-1.5 text-xs font-bold text-canvas shadow">×{it.quantity}</span>
                )}
              </div>
              <div className="mt-0.5 truncate text-center text-[10px] text-ink-muted" title={it.card.name}>{it.card.name}</div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
