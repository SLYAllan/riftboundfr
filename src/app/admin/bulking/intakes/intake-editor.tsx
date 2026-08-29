"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CardImage } from "@/components/card-image";
import Link from "@/components/lien";
import { lireReferenceCollection } from "@/lib/bulking-card-search";
import type { Brouillon, Carte, Emplacement, Langue, Ligne } from "./types";

const vide: Brouillon = { sellerSource: "", acquisitionDate: new Date().toISOString().slice(0, 10), totalPrice: "0", costAllocationMethod: "UNIFORM", languageId: "", defaultCondition: "NM", defaultFinish: "NORMAL", knownSet: "", declaredCardCount: 1, notes: "", lines: [] };

export function IntakeEditor({ id }: { id?: string }) {
  const router = useRouter();
  const rechercheRef = useRef<HTMLInputElement>(null);
  const quantiteRef = useRef<HTMLInputElement>(null);
  const sauvegardeRef = useRef(JSON.stringify(vide));
  const [brouillon, setBrouillon] = useState(vide);
  const [langues, setLangues] = useState<Langue[]>([]);
  const [emplacements, setEmplacements] = useState<Emplacement[]>([]);
  const [recherche, setRecherche] = useState("");
  const [resultats, setResultats] = useState<Carte[]>([]);
  const [resultatActif, setResultatActif] = useState(-1);
  const [carte, setCarte] = useState<Carte | null>(null);
  const [derniereCarte, setDerniereCarte] = useState<Carte | null>(null);
  const [quantite, setQuantite] = useState(1);
  const [emplacementId, setEmplacementId] = useState("");
  const [finition, setFinition] = useState<"NORMAL" | "FOIL">("NORMAL");
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");
  const [charge, setCharge] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [comptabilisation, setComptabilisation] = useState(false);
  const [poste, setPoste] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/bulking/languages").then(lire),
      fetch("/api/admin/bulking/locations").then(lire),
      id ? fetch(`/api/admin/bulking/intakes/${id}`).then(lire) : Promise.resolve(null),
    ]).then(([ls, es, detail]) => {
      setLangues(ls); setEmplacements(es);
      setEmplacementId(es[0]?.id ?? "");
      if (detail) {
        const intake = detail.intake;
        setPoste(intake.status === "POSTED");
        const charge = {
          sellerSource: intake.sellerSource,
          acquisitionDate: String(intake.acquisitionDate).slice(0, 10),
          totalPrice: String(intake.totalPrice),
          costAllocationMethod: intake.costAllocationMethod,
          languageId: intake.languageId,
          defaultCondition: "NM",
          defaultFinish: intake.defaultFinish,
          knownSet: intake.knownSet ?? "",
          declaredCardCount: intake.declaredCardCount,
          notes: intake.notes ?? "",
          lines: detail.lines.map((ligne: Ligne) => ({ ...ligne, acquisitionUnitCost: ligne.acquisitionUnitCost === null ? null : String(ligne.acquisitionUnitCost) })),
        } satisfies Brouillon;
        setBrouillon(charge);
        setFinition(intake.defaultFinish);
        setEmplacementId(charge.lines.at(-1)?.storageLocationId ?? es[0]?.id ?? "");
        sauvegardeRef.current = JSON.stringify(charge);
      } else setBrouillon(b => {
        const initial = { ...b, languageId: ls[0]?.id ?? "" };
        sauvegardeRef.current = JSON.stringify(initial);
        return initial;
      });
    }).catch(e => setErreur(e.message)).finally(() => { setCharge(false); setTimeout(() => rechercheRef.current?.focus()); });
  }, [id]);

  useEffect(() => {
    if (recherche.trim().length < 2 || carte) {
      const nettoyage = setTimeout(() => setResultats([]), 0);
      return () => clearTimeout(nettoyage);
    }
    const attente = setTimeout(() => {
      const params = new URLSearchParams({ q: recherche.trim() });
      if (brouillon.knownSet) params.set("set", brouillon.knownSet);
      fetch(`/api/admin/bulking/cards?${params}`, { signal: controleur.signal }).then(lire).then(d => { setResultats(Array.isArray(d) ? d : d.cards); setResultatActif(-1); }).catch(e => { if (e.name !== "AbortError") setErreur(e.message); });
    }, 150);
    const controleur = new AbortController();
    return () => { clearTimeout(attente); controleur.abort(); };
  }, [recherche, brouillon.knownSet, carte]);

  useEffect(() => {
    const prevenir = (event: BeforeUnloadEvent) => {
      if (!poste && JSON.stringify(brouillon) !== sauvegardeRef.current) event.preventDefault();
    };
    window.addEventListener("beforeunload", prevenir);
    return () => window.removeEventListener("beforeunload", prevenir);
  }, [brouillon, poste]);

  function choisir(c: Carte) { setCarte(c); setRecherche(c.name); setResultats([]); setResultatActif(-1); setQuantite(1); setTimeout(() => { quantiteRef.current?.focus(); quantiteRef.current?.select(); }); }

  function ajouter() {
    if (!carte || !emplacementId || quantite < 1) return;
    const existante = brouillon.lines.find(l => l.cardId === carte.id && l.finish === finition && l.storageLocationId === emplacementId);
    const nouveauTotal = (existante?.quantity ?? 0) + quantite;
    setBrouillon(b => {
      const index = b.lines.findIndex(l => l.cardId === carte.id && l.finish === finition && l.storageLocationId === emplacementId);
      if (index < 0) return { ...b, lines: [...b.lines, { cardId: carte.id, quantity: quantite, condition: "NM", finish: finition, storageLocationId: emplacementId, acquisitionUnitCost: null, card: carte }] };
      const lines = [...b.lines]; lines[index] = { ...lines[index], quantity: lines[index].quantity + quantite }; return { ...b, lines };
    });
    setMessage(`${carte.name} ×${quantite} ajouté${existante ? ` · total de la ligne : ${nouveauTotal}` : ""}.`);
    setErreur("");
    setDerniereCarte(carte);
    setCarte(null); setRecherche(""); setQuantite(1); setTimeout(() => rechercheRef.current?.focus());
  }

  function clavierRecherche(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" && resultats.length) { e.preventDefault(); setResultatActif(index => Math.min(index + 1, resultats.length - 1)); return; }
    if (e.key === "ArrowUp" && resultats.length) { e.preventDefault(); setResultatActif(index => Math.max(index - 1, 0)); return; }
    if (e.key !== "Enter" || !resultats[0]) return;
    e.preventDefault();
    const referenceAmbigue = lireReferenceCollection(recherche, brouillon.knownSet) && resultats.length > 1 && resultatActif < 0;
    if (!referenceAmbigue) choisir(resultats[Math.max(0, resultatActif)]);
  }
  function clavierQuantite(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); ajouter(); }
    if (e.key === "+") { e.preventDefault(); setQuantite(q => q + 1); }
    if (e.key === "*") { e.preventDefault(); setQuantite(3); }
  }
  function clavierFormulaire(e: KeyboardEvent<HTMLFormElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      void sauver();
    }
  }

  async function sauver(e?: FormEvent): Promise<boolean> {
    e?.preventDefault(); setEnregistrement(true); setErreur(""); setMessage("");
    try {
      const lignes = brouillon.lines.map(ligne => ({ cardId: ligne.cardId, quantity: ligne.quantity, condition: ligne.condition, finish: ligne.finish, storageLocationId: ligne.storageLocationId, acquisitionUnitCost: ligne.acquisitionUnitCost }));
      const reponse = await fetch(id ? `/api/admin/bulking/intakes/${id}` : "/api/admin/bulking/intakes", { method: id ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...brouillon, knownSet: brouillon.knownSet || null, notes: brouillon.notes || null, lines: lignes }) });
      const donnees = await reponse.json(); if (!reponse.ok) throw new Error(donnees.error ?? "Enregistrement impossible");
      sauvegardeRef.current = JSON.stringify(brouillon);
      if (!id) router.replace(`/admin/bulking/intakes/${donnees.id}`); else router.refresh();
      return true;
    } catch (e) { setErreur(e instanceof Error ? e.message : "Enregistrement impossible"); return false; }
    finally { setEnregistrement(false); }
  }

  async function comptabiliser() {
    if (!id) return;
    if (compte !== brouillon.declaredCardCount) { setErreur(`Le lot contient ${compte} cartes sur ${brouillon.declaredCardCount} annoncées.`); return; }
    if (!confirm(`Comptabiliser ${compte} cartes pour ${brouillon.totalPrice} € ? Cette action est définitive.`)) return;
    setComptabilisation(true); setErreur(""); setMessage("");
    try { if (!await sauver()) return; setEnregistrement(true); const r = await fetch(`/api/admin/bulking/intakes/${id}/post`, { method: "POST" }); const d = await r.json(); if (!r.ok) throw new Error(d.error ?? "Comptabilisation impossible"); sauvegardeRef.current = JSON.stringify(brouillon); setPoste(true); setMessage(`${compte} cartes ajoutées au stock. ${brouillon.lines.length} mouvements créés.`); router.refresh(); }
    catch (e) { setErreur(e instanceof Error ? e.message : "Comptabilisation impossible"); }
    finally { setComptabilisation(false); setEnregistrement(false); }
  }

  const compte = brouillon.lines.reduce((n, l) => n + l.quantity, 0);
  const coutUniforme = compte > 0 ? (Number(brouillon.totalPrice) / compte).toFixed(4) : null;
  const totalManuel = brouillon.lines.reduce((total, ligne) => total + ligne.quantity * Number(ligne.acquisitionUnitCost ?? 0), 0);
  const ecartManuel = Number(brouillon.totalPrice) - totalManuel;
  const carteVisible = carte ?? derniereCarte;
  if (charge) return <p className="text-ink-muted">Chargement…</p>;
  return (
    <form onSubmit={sauver} onKeyDown={clavierFormulaire} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-3xl font-bold text-ink">{id ? "Entrée" : "Nouvelle entrée"}</h1><p className="mt-1 text-sm text-ink-secondary tabular-nums">{compte} / {brouillon.declaredCardCount} cartes saisies{poste ? " · comptabilisée" : " · brouillon"}</p></div>{!poste && <div className="flex gap-2"><button type="submit" disabled={enregistrement || comptabilisation} className="rounded-lg border border-hairline bg-surface px-4 py-2 text-ink disabled:opacity-50">Enregistrer le brouillon</button>{id && <button type="button" onClick={comptabiliser} disabled={enregistrement || comptabilisation || compte === 0} className="rounded-lg bg-arcane px-4 py-2 font-medium text-white disabled:opacity-50">{comptabilisation ? "Comptabilisation…" : "Comptabiliser"}</button>}</div>}</div>
      {erreur && <p role="alert" className="rounded-lg border border-danger/30 p-3 text-sm text-danger">{erreur}</p>}
      {message && <p role="status" className="rounded-lg border border-hairline bg-surface p-3 text-sm text-ink">{message}</p>}
      {poste && <Link href="/admin/bulking/inventory" className="inline-flex rounded-lg bg-arcane px-4 py-2 text-sm font-medium text-white">Voir le stock et les mouvements</Link>}
      <p className="text-sm text-ink-secondary">{brouillon.costAllocationMethod === "UNIFORM" ? `Coût estimé : ${coutUniforme ?? "-"} € par carte` : `Total des lignes : ${totalManuel.toFixed(2)} € · écart : ${ecartManuel.toFixed(2)} €`}</p>
      <fieldset disabled={poste} className="grid gap-3 rounded-xl border border-hairline bg-surface p-4 disabled:opacity-70 sm:grid-cols-2 lg:grid-cols-4">
        <Champ label="Source"><input required value={brouillon.sellerSource} onChange={e => setBrouillon({ ...brouillon, sellerSource: e.target.value })} placeholder="Ex. vendeur local" className={input} /></Champ>
        <Champ label="Date"><input type="date" required value={brouillon.acquisitionDate} onChange={e => setBrouillon({ ...brouillon, acquisitionDate: e.target.value })} className={input} /></Champ>
        <Champ label="Prix total (€)"><input type="number" min="0" step="0.01" required value={brouillon.totalPrice} onChange={e => setBrouillon({ ...brouillon, totalPrice: e.target.value })} className={input} /></Champ>
        <Champ label="Nombre annoncé"><input type="number" min="1" required value={brouillon.declaredCardCount} onChange={e => setBrouillon({ ...brouillon, declaredCardCount: Number(e.target.value) })} className={input} /></Champ>
        <Champ label="Langue"><select required value={brouillon.languageId} onChange={e => setBrouillon({ ...brouillon, languageId: e.target.value })} className={input}>{langues.map(l => <option key={l.id} value={l.id}>{l.code} · {l.label}</option>)}</select></Champ>
        <Champ label="Set connu"><input value={brouillon.knownSet} onChange={e => setBrouillon({ ...brouillon, knownSet: e.target.value.toUpperCase() })} placeholder="Ex. OGN" className={input} /></Champ>
        <Champ label="Finition par défaut"><select value={brouillon.defaultFinish} onChange={e => { const f = e.target.value as "NORMAL" | "FOIL"; setBrouillon({ ...brouillon, defaultFinish: f }); setFinition(f); }} className={input}><option value="NORMAL">Normale</option><option value="FOIL">Foil</option></select></Champ>
        <Champ label="Répartition du coût"><select value={brouillon.costAllocationMethod} onChange={e => setBrouillon({ ...brouillon, costAllocationMethod: e.target.value as "UNIFORM" | "MANUAL" })} className={input}><option value="UNIFORM">Uniforme</option><option value="MANUAL">Manuelle</option></select></Champ>
        <label className="text-sm text-ink-secondary sm:col-span-2 lg:col-span-4">Notes<textarea rows={2} value={brouillon.notes} onChange={e => setBrouillon({ ...brouillon, notes: e.target.value })} className={input} /></label>
      </fieldset>
      <fieldset disabled={poste} className="rounded-xl border border-hairline bg-surface p-4 disabled:opacity-70"><h2 className="mb-3 text-lg font-bold text-ink">Ajouter des cartes</h2>
        <div className="grid items-end gap-3 sm:grid-cols-[minmax(220px,1fr)_100px_120px_160px_auto_auto_auto]">
          <div className="relative"><Champ label="Carte"><input ref={rechercheRef} value={recherche} onChange={e => { setRecherche(e.target.value); setCarte(null); }} onKeyDown={clavierRecherche} autoComplete="off" placeholder="Ex. Demacian Diplomat, ogn-042 ou OGN 042" className={input} /></Champ>{resultats.length > 0 && <ul role="listbox" className="absolute z-10 mt-1 max-h-80 w-full overflow-auto rounded-lg border border-hairline bg-surface shadow-xl">{resultats.map((c, index) => <li key={c.id}><button role="option" type="button" aria-selected={index === resultatActif} onMouseDown={e => e.preventDefault()} onClick={() => choisir(c)} className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-surface-raised ${index === resultatActif ? "bg-surface-raised" : ""}`}><CardImage src={c.imageUrl ?? null} alt="" size="sm" hoverZoom={false} className="h-16 w-12 shrink-0 object-cover" /><span><span className="block text-ink">{c.name}</span><span className="text-ink-muted">{c.riftboundId ?? `${c.set} ${c.collectorNumber}`} · {c.rarity ?? "Rareté inconnue"}</span></span></button></li>)}</ul>}</div>
          <Champ label="Quantité"><input ref={quantiteRef} type="number" min="1" value={quantite} onChange={e => setQuantite(Math.max(1, Number(e.target.value)))} onKeyDown={clavierQuantite} className={input} /></Champ>
          <Champ label="Finition"><select value={finition} onChange={e => setFinition(e.target.value as "NORMAL" | "FOIL")} className={input}><option value="NORMAL">Normale</option><option value="FOIL">Foil</option></select></Champ>
          <Champ label="Emplacement"><select value={emplacementId} onChange={e => setEmplacementId(e.target.value)} className={input}>{emplacements.map(e => <option key={e.id} value={e.id}>{e.code}</option>)}</select></Champ>
          <button type="button" onClick={() => setQuantite(q => q + 1)} className="rounded-lg border border-hairline px-3 py-2 text-ink">+1</button><button type="button" onClick={() => setQuantite(3)} className="rounded-lg border border-hairline px-3 py-2 text-ink">×3</button><button type="button" onClick={ajouter} disabled={!carte || !emplacementId} className="rounded-lg bg-arcane px-4 py-2 text-white disabled:opacity-50">Ajouter</button>
        </div>{carteVisible && <div className="mt-3 flex items-center gap-3 rounded-lg border border-hairline p-3"><CardImage src={carteVisible.imageUrl ?? null} alt={carteVisible.name} size="sm" hoverZoom={false} className="h-24 w-16 shrink-0 object-cover" /><p className="text-sm text-ink"><strong>{carteVisible.name}</strong><span className="block text-ink-muted">{carteVisible.riftboundId ?? `${carteVisible.set} ${carteVisible.collectorNumber}`} · {carteVisible.rarity ?? "Rareté inconnue"}</span></p></div>}<p className="mt-2 text-xs text-ink-muted">Set : OGN. Carte : nom, ID complet, OGN 042, ou 042 si le set est renseigné. {resultats.length > 0 ? `${resultats.length} résultat${resultats.length > 1 ? "s" : ""} · ↑/↓ puis Entrée.` : ""} Quantité : + ajoute 1, * fixe 3, Entrée confirme. {compte} / {brouillon.declaredCardCount} cartes.</p>
      </fieldset>
      <div className="overflow-x-auto rounded-xl border border-hairline bg-surface">
        <table className="w-full min-w-[760px]"><thead><tr className="border-b border-hairline text-left text-sm text-ink-muted"><th className="px-4 py-3">Carte</th><th className="px-4 py-3">Finition</th><th className="px-4 py-3">Emplacement</th><th className="px-4 py-3">Quantité</th>{brouillon.costAllocationMethod === "MANUAL" && <th className="px-4 py-3">Coût unitaire</th>}<th className="px-4 py-3"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>{brouillon.lines.map((l, i) => <tr key={`${l.cardId}-${l.finish}-${l.storageLocationId}`} className="border-b border-hairline last:border-0"><td className="px-4 py-3 text-sm text-ink">{l.card.name}<span className="ml-2 text-ink-muted">{l.card.set} {l.card.collectorNumber}</span></td><td className="px-4 py-3"><select disabled={poste} aria-label={`Finition de ${l.card.name}`} value={l.finish} onChange={e => { const lines = [...brouillon.lines]; lines[i] = { ...l, finish: e.target.value as "NORMAL" | "FOIL" }; setBrouillon({ ...brouillon, lines }); }} className="rounded border border-hairline bg-canvas px-2 py-1 text-ink"><option value="NORMAL">Normale</option><option value="FOIL">Foil</option></select></td><td className="px-4 py-3"><select disabled={poste} aria-label={`Emplacement de ${l.card.name}`} value={l.storageLocationId} onChange={e => { const lines = [...brouillon.lines]; lines[i] = { ...l, storageLocationId: e.target.value }; setBrouillon({ ...brouillon, lines }); }} className="rounded border border-hairline bg-canvas px-2 py-1 text-ink">{emplacements.map(emplacement => <option key={emplacement.id} value={emplacement.id}>{emplacement.code}</option>)}</select></td><td className="px-4 py-3"><input disabled={poste} aria-label={`Quantité de ${l.card.name}`} type="number" min="1" value={l.quantity} onChange={e => { const lines = [...brouillon.lines]; lines[i] = { ...l, quantity: Math.max(1, Number(e.target.value)) }; setBrouillon({ ...brouillon, lines }); }} className="w-20 rounded border border-hairline bg-canvas px-2 py-1 text-ink" /></td>{brouillon.costAllocationMethod === "MANUAL" && <td className="px-4 py-3"><input disabled={poste} aria-label={`Coût unitaire de ${l.card.name}`} type="number" min="0" step="0.00000001" required value={l.acquisitionUnitCost ?? ""} onChange={e => { const lines = [...brouillon.lines]; lines[i] = { ...l, acquisitionUnitCost: e.target.value }; setBrouillon({ ...brouillon, lines }); }} className="w-28 rounded border border-hairline bg-canvas px-2 py-1 text-ink" /></td>}<td className="px-4 py-3 text-right"><button disabled={poste} type="button" onClick={() => setBrouillon({ ...brouillon, lines: brouillon.lines.filter((_, j) => j !== i) })} className="text-sm text-danger disabled:opacity-50">Retirer</button></td></tr>)}</tbody>
        </table>
      </div>
    </form>
  );
}

async function lire(reponse: Response) { const donnees = await reponse.json(); if (!reponse.ok) throw new Error(donnees.error ?? "Requête impossible"); return donnees; }
function Champ({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm text-ink-secondary">{label}{children}</label>; }
const input = "mt-1 w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-ink";
