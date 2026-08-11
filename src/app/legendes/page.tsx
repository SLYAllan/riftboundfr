import { promises as fs } from "fs";
import path from "path";
import type { Metadata } from "next";
import Link from "@/components/lien";
import Image from "next/image";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { DOMAIN_COLORS, DOMAIN_LABELS_FR, DOMAIN_ICONS } from "@/lib/domains";
import { getBannerUrl } from "@/lib/banners";
import { legendsWithDecks } from "@/lib/legend-fiche";
import { displayLegendName } from "@/lib/utils";
import { metaTraduite, tr } from "@/lib/i18n-server";

// La liste dépend de la base (Légendes sans fiche) : rendu à la requête, comme les
// autres pages qui lisent la DB, sinon le build Docker la fige à vide.
export const dynamic = "force-dynamic";

const FICHES_DIR = path.join(process.cwd(), "data", "fiches");

const metadata: Metadata = {
  title: { absolute: "Fiches Légendes Riftbound FR : guides & decklists par Légende" },
  description:
    "Toutes les fiches Légendes Riftbound en français : archétype, decklists, plan de jeu, cartes clés, forces et faiblesses, classées par tier.",
  alternates: { canonical: "/legendes" },
  openGraph: {
    type: "website",
    siteName: "Riftbound France",
    locale: "fr_FR",
    title: "Fiches Légendes Riftbound FR : guides & decklists par Légende",
    description:
      "Toutes les fiches Légendes Riftbound : archétype, decklists, plan de jeu, cartes clés, forces et faiblesses, classées par tier.",
    images: ["/img/og-default.png"],
  },
};

interface FicheSummary {
  slug: string;
  legendName: string;
  domains: string[];
  set?: string;
  tier?: number;
  archetype?: string;
}

// Fiches rédigées, plus les Légendes qui ont des decks publiés sans fiche : elles ont
// une page (rendue depuis la base), elle doit donc être atteignable depuis l'index.
async function loadSummaries(): Promise<FicheSummary[]> {
  const files = (await fs.readdir(FICHES_DIR)).filter((f) => f.endsWith(".json"));
  const out: FicheSummary[] = [];
  for (const file of files) {
    try {
      const raw = await fs.readFile(path.join(FICHES_DIR, file), "utf-8");
      const d = JSON.parse(raw) as Partial<FicheSummary> & { legendName?: string };
      // Le contenu rendu ne doit pas contenir de tiret cadratin (—) : on normalise
      // l'archétype à la lecture, sans modifier le JSON source.
      const noDash = (s?: string) => s?.replace(/\s*[—–]\s*/g, ", ");
      out.push({
        slug: file.replace(/\.json$/, ""),
        legendName: d.legendName ?? file.replace(/\.json$/, ""),
        domains: Array.isArray(d.domains) ? d.domains : [],
        set: d.set,
        tier: typeof d.tier === "number" ? d.tier : undefined,
        archetype: noDash(d.archetype),
      });
    } catch {
      /* fiche illisible : on l'ignore, jamais d'invention. */
    }
  }
  const known = new Set(out.map((f) => f.slug));
  for (const l of await legendsWithDecks()) {
    if (!known.has(l.slug)) {
      out.push({ slug: l.slug, legendName: l.legendName, domains: [] });
    }
  }
  return out;
}

const TIER_GROUPS: { tier: number; label: string; note: string; color: string }[] = [
  { tier: 1, label: "Tier 1", note: "Le haut du méta", color: "#ef4444" },
  { tier: 2, label: "Tier 2", note: "Solides et compétitives", color: "#f97316" },
  { tier: 3, label: "Tier 3", note: "Jouables avec un bon pilote", color: "#22c55e" },
  { tier: 4, label: "Tier 4", note: "De niche ou en retrait", color: "#6b7280" },
];

function LegendCard({ fiche }: { fiche: FicheSummary }) {
  const name = displayLegendName(fiche.legendName);
  const bannerUrl = getBannerUrl(fiche.legendName);
  return (
    <Link
      href={`/legendes/${fiche.slug}`}
      className="group relative block overflow-hidden rounded-card border border-hairline bg-surface-raised transition hover:border-hairline-accent hover:shadow-xl hover:shadow-black/30"
    >
      {bannerUrl ? (
        <Image
          src={bannerUrl}
          alt=""
          width={640}
          height={280}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="aspect-[16/7] w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="aspect-[16/7] w-full bg-surface-raised" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-3">
        {/* L'archétype va toujours SOUS le nom. En flex-wrap il passait à droite
            quand le nom était court (LeBlanc, Ahri) et dessous sinon (Diana) :
            d'une carte à l'autre, plus rien ne s'alignait. */}
        <div
          className="text-base font-bold leading-tight text-white drop-shadow"
          style={{ fontFamily: "var(--font-rubik), sans-serif" }}
        >
          {name}
        </div>
        {fiche.archetype && (
          <div className="mt-0.5 line-clamp-1 text-[11px] text-white/70">{fiche.archetype}</div>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {fiche.domains.map((d) => (
            <span
              key={d}
              className="inline-flex items-center gap-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm"
            >
              {DOMAIN_ICONS[d] && <img src={DOMAIN_ICONS[d]} alt="" className="h-3 w-3" />}
              {DOMAIN_LABELS_FR[d] ?? d}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

export default async function LegendesIndexPage() {
  const t = await tr();
  const fiches = await loadSummaries();
  fiches.sort((a, b) => displayLegendName(a.legendName).localeCompare(displayLegendName(b.legendName), "fr"));

  const grouped = TIER_GROUPS.map((g) => ({
    ...g,
    items: fiches.filter((f) => f.tier === g.tier),
  })).filter((g) => g.items.length > 0);
  const untiered = fiches.filter((f) => !f.tier || !TIER_GROUPS.some((g) => g.tier === f.tier));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Légendes", href: "/legendes" }]} className="mb-6" />
      <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
        {t("Fiches Légendes")}
      </h1>
      <p className="mt-2 text-lg text-ink-secondary">
        {t("Une fiche par Légende du jeu : archétype, decklists, plan de jeu, cartes clés, forces et faiblesses. Les Légendes sont classées par tier.")}
      </p>

      <div className="mt-10 space-y-12">
        {grouped.map((g) => (
          <section key={g.tier}>
            <div className="flex items-center gap-3">
              <span className="h-8 w-1.5 rounded-full" style={{ backgroundColor: g.color }} />
              <div>
                <h2
                  className="text-2xl font-semibold"
                  style={{ color: g.color, fontFamily: "var(--font-rubik), sans-serif" }}
                >
                  {g.label}
                </h2>
                <span className="text-xs text-ink-muted">{g.note}</span>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((f) => (
                <LegendCard key={f.slug} fiche={f} />
              ))}
            </div>
          </section>
        ))}

        {untiered.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-ink-secondary" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
              {t("Autres Légendes")}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {untiered.map((f) => (
                <LegendCard key={f.slug} fiche={f} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export const generateMetadata = () => metaTraduite(metadata);
