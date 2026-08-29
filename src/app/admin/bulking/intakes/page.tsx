"use client";

import Link from "@/components/lien";
import { useEffect, useState } from "react";

type Entree = { id: string; sellerSource: string; acquisitionDate: string; declaredCardCount: number; status: "DRAFT" | "POSTED"; language?: { code: string }; _count?: { lines: number } };

export default function IntakesPage() {
  const [entrees, setEntrees] = useState<Entree[]>([]);
  const [erreur, setErreur] = useState("");
  useEffect(() => { fetch("/api/admin/bulking/intakes").then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error ?? "Chargement impossible"); setEntrees(Array.isArray(d) ? d : d.intakes); }).catch(e => setErreur(e.message)); }, []);
  return <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-bold text-ink">Entrées</h1><Link href="/admin/bulking/intakes/new" className="rounded-lg bg-arcane px-4 py-2 font-medium text-white">Nouvelle entrée</Link></div>
    {erreur && <p role="alert" className="text-sm text-danger">{erreur}</p>}
    <div className="overflow-x-auto rounded-xl border border-hairline bg-surface"><table className="w-full min-w-[650px]"><thead><tr className="border-b border-hairline text-left text-sm text-ink-muted"><th className="px-4 py-3">Source</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Langue</th><th className="px-4 py-3">Cartes annoncées</th><th className="px-4 py-3">État</th></tr></thead><tbody>{entrees.map(e => <tr key={e.id} className="border-b border-hairline last:border-0 hover:bg-surface-raised"><td className="px-4 py-3"><Link href={`/admin/bulking/intakes/${e.id}`} className="text-ink hover:text-arcane">{e.sellerSource}</Link></td><td className="px-4 py-3 text-sm text-ink-secondary">{new Date(e.acquisitionDate).toLocaleDateString("fr-FR")}</td><td className="px-4 py-3 text-sm text-ink-secondary">{e.language?.code ?? "-"}</td><td className="px-4 py-3 text-sm text-ink-secondary">{e.declaredCardCount}</td><td className="px-4 py-3 text-sm text-ink-secondary">{e.status === "DRAFT" ? "Brouillon" : "Comptabilisée"}</td></tr>)}</tbody></table></div>
  </div>;
}
