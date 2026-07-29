"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

const TIERS = ["P", "S", "A", "B"] as const;

const EXAMPLE_CODE = `Legend:
1 Poppy, Keeper of the Hammer

Champion:
1 Poppy, Paragon

MainDeck:
3 Challenge
3 Demacian Diplomat
2 Punch First

Battlefields:
1 Sunken Temple

Runes:
6 Body Rune
6 Order Rune

Sideboard:
2 Unyielding Spirit`;

export default function ImportDeckPage() {
  const router = useRouter();
  const [deckCode, setDeckCode] = useState("");
  const [title, setTitle] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [placement, setPlacement] = useState("");
  const [tournamentName, setTournamentName] = useState("");
  const [tournamentTier, setTournamentTier] = useState("");
  const [date, setDate] = useState("");
  const [record, setRecord] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ slug: string; matched: number; notFound: string[]; errors: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!deckCode.trim() || !title.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/admin/decks/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckCode, title, playerName, placement, tournamentName, tournamentTier, date: date || undefined, record, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de l'import");
        if (data.errors?.length) setError((prev) => `${prev}\n${data.errors.join("\n")}`);
      } else {
        setResult(data);
      }
    } catch {
      setError("Erreur reseau");
    }
    setLoading(false);
  }

  function handleReset() {
    setDeckCode("");
    setTitle("");
    setPlayerName("");
    setPlacement("");
    setTournamentName("");
    setTournamentTier("");
    setDate("");
    setRecord("");
    setDescription("");
    setResult(null);
    setError(null);
  }

  const inputClass = "w-full h-9 rounded-lg border border-hairline-strong bg-surface-raised px-3 text-sm text-ink placeholder:text-ink-muted focus:border-arcane";

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/decks" aria-label="Retour aux decks" className="text-ink-muted hover:text-ink">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-3xl font-bold text-ink" style={{ fontFamily: "var(--font-rubik)" }}>
          Importer un deck
        </h1>
      </div>

      {result ? (
        <div className="rounded-xl bg-surface border border-hairline p-6 space-y-4">
          <div className="flex items-center gap-2 text-success">
            <CheckCircle size={20} />
            <span className="text-lg font-semibold">Deck importe avec succes</span>
          </div>
          <div className="text-sm text-ink-secondary">
            <strong>{result.matched}</strong> cartes matchees et ajoutees.
          </div>
          {result.notFound.length > 0 && (
            <div className="rounded-lg bg-gold/5 border border-gold/20 p-3">
              <div className="text-sm font-semibold text-gold mb-1">
                <AlertCircle size={14} className="inline mr-1" />
                {result.notFound.length} carte{result.notFound.length > 1 ? "s" : ""} non trouvee{result.notFound.length > 1 ? "s" : ""}
              </div>
              <ul className="text-xs text-ink-secondary space-y-0.5">
                {result.notFound.map((name) => (
                  <li key={name}>&bull; {name}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex gap-3">
            <Link href={`/decks/${result.slug}`} className="rounded-lg bg-arcane px-4 py-2 text-sm font-semibold text-canvas hover:brightness-110">
              Voir le deck
            </Link>
            <button onClick={handleReset} className="rounded-lg border border-hairline px-4 py-2 text-sm text-ink-secondary hover:text-ink">
              Importer un autre
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Deck code */}
          <div className="rounded-xl bg-surface border border-hairline p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1">Deck code *</label>
              <p className="text-xs text-ink-muted mb-2">
                Format Riftdecks : sections &quot;Legend:&quot;, &quot;Champion:&quot;, &quot;MainDeck:&quot;, &quot;Battlefields:&quot;, &quot;Runes:&quot;, &quot;Sideboard:&quot;
              </p>
              <textarea
                aria-label="Deck code"
                value={deckCode}
                onChange={(e) => setDeckCode(e.target.value)}
                rows={14}
                className="w-full rounded-lg border border-hairline-strong bg-surface-raised p-3 text-sm font-mono text-ink placeholder:text-ink-muted focus:border-arcane"
                placeholder={EXAMPLE_CODE}
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="rounded-xl bg-surface border border-hairline p-6 space-y-4">
            <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-rubik)" }}>Informations</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-ink-secondary mb-1">Titre du deck *</label>
                <input aria-label="Titre du deck" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Poppy Aurora Aggro" className={inputClass} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">Joueur</label>
                <input aria-label="Joueur" type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Pseudo du joueur" className={inputClass} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">Classement</label>
                <input aria-label="Classement" type="text" value={placement} onChange={(e) => setPlacement(e.target.value)} placeholder="1er, Top 4, Top 8..." className={inputClass} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">Tournoi</label>
                <input aria-label="Tournoi" type="text" value={tournamentName} onChange={(e) => setTournamentName(e.target.value)} placeholder="Sydney Major, EU Weekly..." className={inputClass} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">Tier du tournoi</label>
                <div className="flex gap-2">
                  {TIERS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTournamentTier(tournamentTier === t ? "" : t)}
                      className={`flex-1 h-9 rounded-lg border text-sm font-bold transition-colors ${
                        tournamentTier === t
                          ? t === "P" ? "border-gold bg-gold/10 text-gold"
                            : t === "S" ? "border-arcane bg-arcane/10 text-arcane"
                            : t === "A" ? "border-violet bg-violet/10 text-violet-light"
                            : "border-ink-muted bg-surface-raised text-ink-secondary"
                          : "border-hairline text-ink-muted hover:text-ink hover:border-hairline-strong"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">Date</label>
                <input aria-label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">Resultats (W-L-D)</label>
                <input aria-label="Resultats (W-L-D)" type="text" value={record} onChange={(e) => setRecord(e.target.value)} placeholder="14-1-1" className={inputClass} />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-ink-secondary mb-1">Notes / Description (optionnel)</label>
                <textarea aria-label="Notes / Description (optionnel)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-hairline-strong bg-surface-raised p-3 text-sm text-ink placeholder:text-ink-muted focus:border-arcane"
                  placeholder="Notes sur le deck, meta, choix de cartes..."
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-error/5 border border-error/20 p-3 text-sm text-error whitespace-pre-line">
              <AlertCircle size={14} className="inline mr-1" />
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading || !deckCode.trim() || !title.trim()}
              className="flex items-center gap-2 rounded-lg bg-arcane px-6 py-2.5 text-sm font-semibold text-canvas hover:brightness-110 disabled:opacity-30 transition"
            >
              <Upload size={16} />
              {loading ? "Import en cours..." : "Importer le deck"}
            </button>
            <Link href="/admin/decks" className="text-sm text-ink-muted hover:text-ink">
              Annuler
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
