"use client";

import { DOMAIN_COLORS, DOMAIN_LABELS_FR, TYPE_LABELS_FR } from "@/lib/domains";
import type { DecklistCard } from "@/types";
import { useT } from "@/components/i18n-provider";

// Les trois graphiques d'un deck, pour la page deck et pour le deckbuilder.
// Ils vivaient en double : même comptage, seules les tailles changeaient.
// `compact` garde le rendu serré du panneau du deckbuilder.

/** Ce que les graphiques lisent d'une carte : la partie commune à `DecklistCard` et `DeckEntry`. */
interface CarteStat {
  type: string;
  quantity: number;
  energy?: number | null;
  domains?: string[];
}

interface PropsGraphique {
  cartes: CarteStat[];
  compact?: boolean;
}

const COULEURS_TYPE: Record<string, string> = {
  Unit: "#0ea5e9",
  Spell: "#8b5cf6",
  Gear: "#f59e0b",
  Signature: "#ec4899",
};

export function EnergyCurve({ cartes, compact = false }: PropsGraphique) {
  const t = useT();
  const curve = new Map<number, { total: number; byDomain: Map<string, number> }>();

  for (const c of cartes) {
    if (c.energy == null) continue;
    const cost = Math.min(c.energy, 8);
    if (!curve.has(cost)) curve.set(cost, { total: 0, byDomain: new Map() });
    const bucket = curve.get(cost)!;
    bucket.total += c.quantity;
    const domain = c.domains?.[0] ?? "neutral";
    bucket.byDomain.set(domain, (bucket.byDomain.get(domain) ?? 0) + c.quantity);
  }

  const maxCount = Math.max(1, ...Array.from(curve.values()).map((b) => b.total));
  const hauteurMax = compact ? 64 : 72;
  const Titre = compact ? "h5" : "p";
  const chiffre = compact ? "text-[9px] text-ink-muted" : "text-[10px] text-ink-muted";

  return (
    <div>
      <Titre className={compact ? "text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-2" : "text-xs font-bold uppercase tracking-wider text-ink-muted mb-3"}>
        {t("Courbe d’énergie")}
      </Titre>
      <div className={compact ? "flex items-end gap-1" : "flex items-end gap-1.5"}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((cost) => {
          const bucket = curve.get(cost);
          const total = bucket?.total ?? 0;
          const barH = total ? Math.max((total / maxCount) * hauteurMax, 4) : 0;

          return (
            <div key={cost} className="flex-1 flex flex-col items-center gap-0.5">
              <span className={compact ? chiffre : `${chiffre} font-medium`}>{total || ""}</span>
              <div className="w-full flex flex-col-reverse rounded-t overflow-hidden" style={{ height: barH }}>
                {Array.from(bucket?.byDomain ?? []).map(([domain, count]) => (
                  <div
                    key={domain}
                    className="w-full"
                    style={{
                      height: `${(count / total) * 100}%`,
                      backgroundColor: DOMAIN_COLORS[domain] ?? "#0ea5e9",
                      opacity: compact ? 0.8 : 0.85,
                    }}
                  />
                ))}
              </div>
              <span className={chiffre}>{cost === 8 ? "8+" : cost}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface Ligne {
  cle: string;
  libelle: string;
  couleur: string;
  n: number;
}

/** Les barres horizontales, communes aux types et aux domaines. */
function Barres({ titre, lignes, total, compact, largeur, libelleColore = false }: {
  titre: string;
  lignes: Ligne[];
  total: number;
  compact: boolean;
  /** Largeur de la colonne des libellés, en classe entière : Tailwind ne génère pas une classe concaténée. */
  largeur: string;
  libelleColore?: boolean;
}) {
  return (
    <div>
      {!compact && <p className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-3">{titre}</p>}
      <div className={compact ? "space-y-1.5" : "space-y-2"}>
        {lignes.map((l) => (
          <div key={l.cle} className="flex items-center gap-2">
            <span
              className={`${compact ? "text-[11px]" : "text-xs"} ${largeur} shrink-0${libelleColore ? "" : " text-ink-secondary"}`}
              style={libelleColore ? { color: l.couleur } : undefined}
            >
              {l.libelle}
            </span>
            <div className={`flex-1 ${compact ? "h-3" : "h-4"} bg-surface-raised rounded-full overflow-hidden`}>
              <div
                className="h-full rounded-full transition-colors duration-300"
                style={{ width: `${(l.n / total) * 100}%`, backgroundColor: l.couleur }}
              />
            </div>
            <span className={`${compact ? "text-[10px]" : "text-xs"} text-ink-muted w-8 text-right`}>{l.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function compter(cartes: CarteStat[], cles: (c: CarteStat) => string[]): [string, number][] {
  const comptes = new Map<string, number>();
  for (const c of cartes) {
    for (const cle of cles(c)) comptes.set(cle, (comptes.get(cle) ?? 0) + c.quantity);
  }
  return Array.from(comptes.entries()).sort((a, b) => b[1] - a[1]);
}

const exemplaires = (cartes: CarteStat[]) => cartes.reduce((somme, c) => somme + c.quantity, 0);

export function TypeDistribution({ cartes, compact = false }: PropsGraphique) {
  const t = useT();
  const lignes = compter(cartes, (c) => [c.type]).map(([type, n]) => ({
    cle: type,
    // Le deckbuilder a toujours montré le type tel qu'en base ; la page deck le traduit.
    libelle: compact ? type : TYPE_LABELS_FR[type] ?? type,
    couleur: COULEURS_TYPE[type] ?? "#64748b",
    n,
  }));
  return (
    <Barres titre={t("Répartition par type")} lignes={lignes} total={exemplaires(cartes)} compact={compact} largeur={compact ? "w-16" : "w-20"} />
  );
}

export function DomainDistribution({ cartes, compact = false }: PropsGraphique) {
  const t = useT();
  // Une carte à deux domaines compte dans les deux barres, mais une seule fois dans le total.
  const lignes = compter(cartes, (c) => (c.domains?.length ? c.domains : ["Neutre"])).map(([domaine, n]) => ({
    cle: domaine,
    libelle: DOMAIN_LABELS_FR[domaine] ?? domaine,
    couleur: DOMAIN_COLORS[domaine] ?? "#64748b",
    n,
  }));
  return (
    <Barres titre={t("Répartition par domaine")} lignes={lignes} total={exemplaires(cartes)} compact={compact} largeur={compact ? "w-14" : "w-16"} libelleColore />
  );
}

export function DeckStatsPanel({ cards }: { cards: DecklistCard[] }) {
  const principal = cards.filter((c) => c.section === "main");
  if (principal.length === 0) return null;

  return (
    <div className="rounded-xl border border-hairline bg-surface p-5 space-y-5">
      <EnergyCurve cartes={principal} />
      <TypeDistribution cartes={principal} />
      <DomainDistribution cartes={principal} />
    </div>
  );
}
