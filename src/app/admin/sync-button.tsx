"use client";

import { useState } from "react";

export function SyncButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSync() {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/sync-cards", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        setResult(`Synchronisation terminee : ${data.sets} sets, ${data.cards} cartes`);
      } else {
        setResult(`Erreur : ${data.error}`);
      }
    } catch {
      setResult("Erreur de connexion");
    }

    setLoading(false);
  }

  return (
    <div>
      <button
        onClick={handleSync}
        disabled={loading}
        className="px-6 py-3 rounded-lg bg-arcane text-white font-semibold hover:bg-arcane-dark transition-colors disabled:opacity-50"
      >
        {loading ? "Synchronisation en cours..." : "Synchroniser les cartes"}
      </button>
      {result && <p className="mt-3 text-sm text-ink-secondary">{result}</p>}
    </div>
  );
}
