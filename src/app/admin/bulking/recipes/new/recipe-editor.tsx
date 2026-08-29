"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CardImage } from "@/components/card-image";

type Langue = { id: string; code: string; label: string };
type Carte = { id: string; riftboundId?: string; name: string; set: string; collectorNumber: number | null; rarity?: string | null; imageUrl?: string | null };
type Section = "LEGEND" | "CHAMPION" | "MAIN_DECK" | "BATTLEFIELD" | "SIDEBOARD" | "GENERIC";
type Ligne = { cardId: string; section: Section; quantity: number; card: Carte };

const SECTIONS: { valeur: Section; label: string }[] = [
  { valeur: "GENERIC", label: "Générique" },
  { valeur: "LEGEND", label: "Légende" },
  { valeur: "CHAMPION", label: "Champion" },
  { valeur: "MAIN_DECK", label: "Deck principal" },
  { valeur: "BATTLEFIELD", label: "Champs de bataille" },
  { valeur: "SIDEBOARD", label: "Réserve" },
];

const input = "mt-1 w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-ink";

export function RecipeEditor() {
  const router = useRouter();
  const rechercheRef = useRef<HTMLInputElement>(null);
  const quantiteRef = useRef<HTMLInputElement>(null);
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [langueId, setLangueId] = useState("");
  const [langues, setLangues] = useState<Langue[]>([]);
  const [lignes, setLignes] = useState<Ligne[]>([]);
  const [recherche, setRecherche] = useState("");
  const [resultats, setResultats] = useState<Carte[]>([]);
  const [resultatActif, setResultatActif] = useState(-1);
  const [carte, setCarte] = useState<Carte | null>(null);
  const [derniereCarte, setDerniereCarte] = useState<Carte | null>(null);
  const [quantite, setQuantite] = useState(1);
  const [section, setSection] = useState<Section>("GENERIC");
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");
  const [charge, setCharge] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [envoiEchoue, setEnvoiEchoue] = useState(false);

  useEffect(() => {
    fetch("/api/admin/bulking/languages")
      .then(async (reponse) => {
        const donnees = await reponse.json();
        if (!reponse.ok || !Array.isArray(donnees)) throw new Error(donnees.error ?? "Chargement impossible");
        return donnees as Langue[];
      })
      .then((ls) => {
        setLangues(ls);
        setLangueId(ls[0]?.id ?? "");
      })
      .catch((e) => setErreur(e instanceof Error ? e.message : "Chargement impossible"))
      .finally(() => {
        setCharge(false);
        setTimeout(() => rechercheRef.current?.focus());
      });
  }, []);

  useEffect(() => {
    if (recherche.trim().length < 2 || carte) {
      const nettoyage = setTimeout(() => setResultats([]), 0);
      return () => clearTimeout(nettoyage);
    }
    const controleur = new AbortController();
    const attente = setTimeout(() => {
      fetch(`/api/admin/bulking/cards?q=${encodeURIComponent(recherche.trim())}`, { signal: controleur.signal })
        .then(async (reponse) => {
          const donnees = await reponse.json();
          if (!reponse.ok) throw new Error(donnees.error ?? "Recherche impossible");
          return (Array.isArray(donnees) ? donnees : (donnees.cards ?? [])) as Carte[];
        })
        .then((cards) => {
          setResultats(cards);
          setResultatActif(-1);
        })
        .catch((e) => {
          if (e.name !== "AbortError") setErreur(e instanceof Error ? e.message : "Recherche impossible");
        });
    }, 150);
    return () => {
      clearTimeout(attente);
      controleur.abort();
    };
  }, [recherche, carte]);

  function choisir(c: Carte) {
    setCarte(c);
    setRecherche(c.name);
    setResultats([]);
    setResultatActif(-1);
    setQuantite(1);
    setTimeout(() => {
      quantiteRef.current?.focus();
      quantiteRef.current?.select();
    });
  }

  function ajouter() {
    if (!carte || !langueId || quantite < 1) return;
    const existante = lignes.find((l) => l.cardId === carte.id && l.section === section);
    const nouveauTotal = (existante?.quantity ?? 0) + quantite;
    setLignes((precedentes) => {
      const index = precedentes.findIndex((l) => l.cardId === carte.id && l.section === section);
      if (index < 0) return [...precedentes, { cardId: carte.id, section, quantity: quantite, card: carte }];
      const copie = [...precedentes];
      copie[index] = { ...copie[index], quantity: copie[index].quantity + quantite };
      return copie;
    });
    setMessage(`${carte.name} ×${quantite} ajouté${existante ? ` · total de la ligne : ${nouveauTotal}` : ""}.`);
    setErreur("");
    setDerniereCarte(carte);
    setCarte(null);
    setRecherche("");
    setQuantite(1);
    setTimeout(() => rechercheRef.current?.focus());
  }

  function clavierRecherche(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" && resultats.length) {
      e.preventDefault();
      setResultatActif((i) => Math.min(i + 1, resultats.length - 1));
      return;
    }
    if (e.key === "ArrowUp" && resultats.length) {
      e.preventDefault();
      setResultatActif((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key !== "Enter" || !resultats[0]) return;
    e.preventDefault();
    const exact = resultats.find((c) => c.name.toLowerCase() === recherche.trim().toLowerCase());
    choisir(exact ?? resultats[Math.max(0, resultatActif)]);
  }

  function clavierQuantite(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      ajouter();
    }
    if (e.key === "+") {
      e.preventDefault();
      setQuantite((q) => q + 1);
    }
    if (e.key === "*") {
      e.preventDefault();
      setQuantite(3);
    }
  }

  async function soumettre(e?: FormEvent): Promise<boolean> {
    e?.preventDefault();
    setErreur("");
    setEnvoiEchoue(false);
    setMessage("");
    if (!nom.trim()) {
      setErreur("Donnez un nom à la recette.");
      return false;
    }
    if (!langueId) {
      setErreur("Configurez une langue avant de créer la recette.");
      return false;
    }
    if (lignes.length === 0) {
      setErreur("Ajoutez au moins une carte à la recette.");
      return false;
    }
    setEnregistrement(true);
    try {
      const reponse = await fetch("/api/admin/bulking/recipes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: nom.trim(),
          description: description.trim() || null,
          sourceDeckId: null,
          lines: lignes.map((l) => ({ cardId: l.cardId, languageId: langueId, section: l.section, quantity: l.quantity })),
        }),
      });
      const donnees = await reponse.json();
      if (!reponse.ok) throw new Error(donnees?.error ?? "Enregistrement impossible");
      if (!donnees || typeof donnees !== "object" || Array.isArray(donnees) || typeof donnees.id !== "string") {
        throw new Error("Réponse inattendue du serveur");
      }
      router.replace(`/admin/bulking/recipes/${donnees.id}`);
      return true;
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Enregistrement impossible");
      setEnvoiEchoue(true);
      return false;
    } finally {
      setEnregistrement(false);
    }
  }

  const totalCartes = lignes.reduce((n, l) => n + l.quantity, 0);
  const carteVisible = carte ?? derniereCarte;
  if (charge) return <p className="text-ink-muted">Chargement…</p>;
  return (
    <form onSubmit={soumettre} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-ink">Nouvelle recette</h1>
          <p className="mt-1 text-sm text-ink-secondary tabular-nums">
            {totalCartes} cartes · {lignes.length} ligne{lignes.length > 1 ? "s" : ""}
          </p>
        </div>
        <button type="submit" disabled={enregistrement} className="rounded-lg bg-arcane px-4 py-2 font-medium text-white disabled:opacity-50">
          {enregistrement ? "Enregistrement…" : "Créer la recette"}
        </button>
      </div>

      {erreur && (
        <div role="alert" className="rounded-lg border border-danger/30 p-3 text-sm text-danger">
          <p>{erreur}</p>
          {envoiEchoue && (
            <button type="button" onClick={() => void soumettre()} disabled={enregistrement} className="mt-2 rounded-lg border border-danger/30 px-3 py-1.5 text-danger hover:bg-danger/5 disabled:opacity-50">
              Réessayer
            </button>
          )}
        </div>
      )}
      {message && <p role="status" className="rounded-lg border border-hairline bg-surface p-3 text-sm text-ink">{message}</p>}

      <fieldset className="grid gap-3 rounded-xl border border-hairline bg-surface p-4 sm:grid-cols-2 lg:grid-cols-3">
        <Champ label="Nom" className="sm:col-span-2">
          <input required value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex. Origins EN C/U Playset x3" className={input} />
        </Champ>
        <Champ label="Langue par défaut">
          <select required value={langueId} onChange={(e) => setLangueId(e.target.value)} className={input} disabled={langues.length === 0}>
            {langues.length === 0 ? <option value="">Aucune langue</option> : langues.map((l) => <option key={l.id} value={l.id}>{l.code} · {l.label}</option>)}
          </select>
        </Champ>
        <Champ label="Description" className="sm:col-span-2 lg:col-span-3">
          <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className={input} />
        </Champ>
      </fieldset>

      <fieldset className="rounded-xl border border-hairline bg-surface p-4">
        <h2 className="mb-3 text-lg font-bold text-ink">Ajouter des cartes</h2>
        <div className="grid items-end gap-3 sm:grid-cols-[minmax(220px,1fr)_100px_140px_auto_auto_auto]">
          <div className="relative">
            <Champ label="Carte">
              <input
                ref={rechercheRef}
                value={recherche}
                onChange={(e) => {
                  setRecherche(e.target.value);
                  setCarte(null);
                }}
                onKeyDown={clavierRecherche}
                autoComplete="off"
                placeholder="Nom ou référence de carte"
                className={input}
              />
            </Champ>
            {resultats.length > 0 && (
              <ul role="listbox" className="absolute z-10 mt-1 max-h-80 w-full overflow-auto rounded-lg border border-hairline bg-surface shadow-xl">
                {resultats.map((c, index) => (
                  <li key={c.id}>
                    <button
                      role="option"
                      type="button"
                      aria-selected={index === resultatActif}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => choisir(c)}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-surface-raised ${index === resultatActif ? "bg-surface-raised" : ""}`}
                    >
                      <CardImage src={c.imageUrl ?? null} alt="" size="sm" hoverZoom={false} className="h-16 w-12 shrink-0 object-cover" />
                      <span>
                        <span className="block text-ink">{c.name}</span>
                        <span className="text-ink-muted">{c.riftboundId ?? `${c.set} ${c.collectorNumber}`} · {c.rarity ?? "Rareté inconnue"}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Champ label="Quantité">
            <input ref={quantiteRef} type="number" min="1" value={quantite} onChange={(e) => setQuantite(Math.max(1, Number(e.target.value)))} onKeyDown={clavierQuantite} className={input} />
          </Champ>
          <Champ label="Section">
            <select value={section} onChange={(e) => setSection(e.target.value as Section)} className={input}>
              {SECTIONS.map((s) => <option key={s.valeur} value={s.valeur}>{s.label}</option>)}
            </select>
          </Champ>
          <button type="button" onClick={() => setQuantite((q) => q + 1)} className="rounded-lg border border-hairline px-3 py-2 text-ink">+1</button>
          <button type="button" onClick={() => setQuantite(3)} className="rounded-lg border border-hairline px-3 py-2 text-ink">×3</button>
          <button type="button" onClick={ajouter} disabled={!carte || !langueId} className="rounded-lg bg-arcane px-4 py-2 text-white disabled:opacity-50">Ajouter</button>
        </div>
        {carteVisible && (
          <div className="mt-3 flex items-center gap-3 rounded-lg border border-hairline p-3">
            <CardImage src={carteVisible.imageUrl ?? null} alt={carteVisible.name} size="sm" hoverZoom={false} className="h-24 w-16 shrink-0 object-cover" />
            <p className="text-sm text-ink">
              <strong>{carteVisible.name}</strong>
              <span className="block text-ink-muted">{carteVisible.riftboundId ?? `${carteVisible.set} ${carteVisible.collectorNumber}`} · {carteVisible.rarity ?? "Rareté inconnue"}</span>
            </p>
          </div>
        )}
        <p className="mt-2 text-xs text-ink-muted">
          Carte : nom ou référence. {resultats.length > 0 ? `${resultats.length} résultat${resultats.length > 1 ? "s" : ""} · ↑/↓ puis Entrée.` : ""} Quantité : + ajoute 1, * fixe 3, Entrée confirme. Une carte déjà présente voit sa quantité augmenter.
        </p>
      </fieldset>

      <div className="overflow-x-auto rounded-xl border border-hairline bg-surface">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-hairline text-left text-sm text-ink-muted">
              <th className="px-4 py-3">Carte</th>
              <th className="px-4 py-3">Section</th>
              <th className="px-4 py-3">Quantité</th>
              <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((l, i) => (
              <tr key={`${l.cardId}-${l.section}`} className="border-b border-hairline last:border-0">
                <td className="px-4 py-3 text-sm text-ink">
                  {l.card.name}
                  <span className="ml-2 text-ink-muted">{l.card.set} {l.card.collectorNumber}</span>
                </td>
                <td className="px-4 py-3">
                  <select
                    aria-label={`Section de ${l.card.name}`}
                    value={l.section}
                    onChange={(e) => {
                      const copie = [...lignes];
                      copie[i] = { ...l, section: e.target.value as Section };
                      setLignes(copie);
                    }}
                    className="rounded border border-hairline bg-canvas px-2 py-1 text-ink"
                  >
                    {SECTIONS.map((s) => <option key={s.valeur} value={s.valeur}>{s.label}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input
                    aria-label={`Quantité de ${l.card.name}`}
                    type="number"
                    min="1"
                    value={l.quantity}
                    onChange={(e) => {
                      const copie = [...lignes];
                      copie[i] = { ...l, quantity: Math.max(1, Number(e.target.value)) };
                      setLignes(copie);
                    }}
                    className="w-20 rounded border border-hairline bg-canvas px-2 py-1 text-ink"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => setLignes(lignes.filter((_, j) => j !== i))} className="text-sm text-danger">Retirer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </form>
  );
}

function Champ({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block text-sm text-ink-secondary ${className ?? ""}`}>{label}{children}</label>;
}
