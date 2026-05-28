export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";
import { getLegendIconUrl } from "@/lib/banners";
import { TierListEditor } from "./tier-list-editor";

export default async function AdminTierListPage() {
  await verifyAdmin();

  const [tierLists, legendCards, allLegendCards] = await Promise.all([
    prisma.tierList.findMany({
      include: { entries: { orderBy: { position: "asc" } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.card.findMany({
      where: { type: "Legend", alternateArt: false, overnumbered: false, signature: false, set: { notIn: ["OPP"] } },
      select: {
        riftboundId: true,
        name: true,
        set: true,
        setName: true,
        imageUrl: true,
        domains: true,
      },
      orderBy: [{ set: "asc" }, { name: "asc" }],
    }),
    prisma.card.findMany({
      where: { type: "Legend", alternateArt: false },
      select: { riftboundId: true, name: true },
    }),
  ]);

  const seen = new Set<string>();
  const legends = legendCards
    .filter((l) => {
      if (seen.has(l.name)) return false;
      seen.add(l.name);
      return true;
    })
    .map((l) => ({
      riftboundId: l.riftboundId,
      name: l.name,
      set: l.set,
      setName: l.setName,
      imageUrl: l.imageUrl,
      iconUrl: getLegendIconUrl(l.name),
      domains: l.domains,
    }));

  const canonicalIdByName = new Map(legends.map((l) => [l.name, l.riftboundId]));
  const idAliases: Record<string, string> = {};
  for (const c of allLegendCards) {
    const canonical = canonicalIdByName.get(c.name);
    if (canonical && c.riftboundId !== canonical) {
      idAliases[c.riftboundId] = canonical;
    }
  }

  return (
    <div className="space-y-6">
      <h1
        className="text-3xl font-bold text-ink"
        style={{ fontFamily: "var(--font-rubik)" }}
      >
        Tier Lists
      </h1>
      <TierListEditor
        initialTierLists={JSON.parse(JSON.stringify(tierLists))}
        allLegends={legends}
        idAliases={idAliases}
      />
    </div>
  );
}
