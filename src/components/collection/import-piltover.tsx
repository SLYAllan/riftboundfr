"use client";

import { useState } from "react";
import { useT } from "@/components/i18n-provider";

interface Report {
  imported: number;
  rows: number;
  unmatched: { variantNumber: string; name: string; raison: string }[];
}

export function ImportPiltover({ binderId }: { binderId?: string }) {
  const t = useT();
  const [report, setReport] = useState<Report | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    setReport(null);
    try {
      const text = await file.text();
      const url = binderId ? `/api/collection/import?binderId=${binderId}` : "/api/collection/import";
      const res = await fetch(url, { method: "POST", body: text });
      if (!res.ok) {
        setError(res.status === 401 ? "Connecte-toi avec Discord d'abord." : "Échec de l'import.");
        return;
      }
      const data: Report = await res.json();
      setReport(data);
      // Recharge pour rafraîchir les barres de complétion depuis le serveur.
      setTimeout(() => location.reload(), 1200);
    } catch {
      setError("Fichier illisible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-line bg-surface-raised/40 p-4">
      <h2 className="mb-1 font-semibold">Importer depuis Piltover Archive</h2>
      <p className="mb-3 text-sm text-ink-muted">{t("Exporte ta collection en CSV depuis Piltover Archive, puis dépose le fichier ici. Les quantités existantes seront remplacées par celles du fichier.")}</p>
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={onFile}
        disabled={busy}
        className="text-sm"
      />
      {busy && <p className="mt-2 text-sm text-ink-muted">{t("Import en cours…")}</p>}
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      {report && (
        <div className="mt-3 text-sm">
          <p className="text-arcane">
            {report.imported} carte(s) importée(s) sur {report.rows} ligne(s).
          </p>
          {report.unmatched.length > 0 && (
            <details className="mt-1">
              <summary className="cursor-pointer text-ink-muted">
                {report.unmatched.length} non reconnue(s)
              </summary>
              <ul className="mt-1 list-disc pl-5 text-ink-muted">
                {report.unmatched.map((u) => (
                  <li key={u.variantNumber}>
                    {u.variantNumber} - {u.name} ({u.raison})
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
