"use client";

import { FormEvent, useEffect, useState } from "react";

type Reference = { id: string; code: string; label?: string | null; notes?: string | null };

export function SimpleReferences({ endpoint, titre, avecNotes = false, libelleRequis = false }: { endpoint: string; titre: string; avecNotes?: boolean; libelleRequis?: boolean }) {
  const [items, setItems] = useState<Reference[]>([]);
  const [erreur, setErreur] = useState("");
  const [charge, setCharge] = useState(false);

  async function charger() {
    const reponse = await fetch(endpoint);
    const donnees = await reponse.json();
    if (!reponse.ok) throw new Error(donnees.error ?? "Chargement impossible");
    const liste = Array.isArray(donnees) ? donnees : donnees.languages ?? donnees.locations;
    if (!Array.isArray(liste)) throw new Error("Réponse invalide");
    setItems(liste);
  }

  useEffect(() => {
    const attente = setTimeout(() => { void charger().catch((e: Error) => setErreur(e.message)); }, 0);
    return () => clearTimeout(attente);
  }, [endpoint]);

  async function ajouter(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setCharge(true); setErreur("");
    const form = e.currentTarget;
    const formulaire = new FormData(form);
    const corps = Object.fromEntries(formulaire.entries());
    try {
      const reponse = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(corps) });
      const donnees = await reponse.json();
      if (!reponse.ok) throw new Error(donnees.error ?? "Ajout impossible");
      form.reset(); await charger();
    } catch (e) { setErreur(e instanceof Error ? e.message : "Ajout impossible"); }
    finally { setCharge(false); }
  }

  async function modifier(item: Reference) {
    const code = window.prompt("Code", item.code);
    if (!code) return;
    const label = window.prompt("Libellé", item.label ?? "");
    const notes = avecNotes ? window.prompt("Notes", item.notes ?? "") : undefined;
    setErreur("");
    const reponse = await fetch(`${endpoint}/${item.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ code, label, notes }) });
    const donnees = await reponse.json();
    if (!reponse.ok) { setErreur(donnees.error ?? "Modification impossible"); return; }
    await charger();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-ink">{titre}</h1>
      <form onSubmit={ajouter} className="grid gap-3 rounded-xl border border-hairline bg-surface p-4 sm:grid-cols-2">
        <label className="text-sm text-ink-secondary">Code<input name="code" required autoFocus className="mt-1 w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-ink" /></label>
        <label className="text-sm text-ink-secondary">Libellé<input name="label" required={libelleRequis} className="mt-1 w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-ink" /></label>
        {avecNotes && <label className="text-sm text-ink-secondary sm:col-span-2">Notes<textarea name="notes" rows={2} className="mt-1 w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-ink" /></label>}
        <div className="sm:col-span-2"><button disabled={charge} className="rounded-lg bg-arcane px-4 py-2 font-medium text-white disabled:opacity-50">Ajouter</button></div>
      </form>
      {erreur && <p role="alert" className="text-sm text-danger">{erreur}</p>}
      <div className="overflow-x-auto rounded-xl border border-hairline bg-surface">
        <table className="w-full min-w-[420px]"><thead><tr className="border-b border-hairline"><th className="px-4 py-3 text-left text-sm text-ink-muted">Code</th><th className="px-4 py-3 text-left text-sm text-ink-muted">Libellé</th>{avecNotes && <th className="px-4 py-3 text-left text-sm text-ink-muted">Notes</th>}<th className="px-4 py-3"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>{items.map(item => <tr key={item.id} className="border-b border-hairline last:border-0"><td className="px-4 py-3 font-mono text-sm text-ink">{item.code}</td><td className="px-4 py-3 text-sm text-ink-secondary">{item.label || "-"}</td>{avecNotes && <td className="px-4 py-3 text-sm text-ink-secondary">{item.notes || "-"}</td>}<td className="px-4 py-3 text-right"><button type="button" onClick={() => void modifier(item)} className="text-sm text-arcane hover:underline">Modifier</button></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
