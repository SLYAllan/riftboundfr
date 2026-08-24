"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/i18n-provider";

interface Report {
  imported: number;
  rows: number;
  unmatched: { variantNumber: string; name: string; raison: string }[];
}

export function ImportPiltover({ binderId }: { binderId?: string }) {
  const t = useT();
  const router = useRouter();
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
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        if (Array.isArray(data?.unmatched)) setReport(data as Report);
        setError(res.status === 401 ? "Connectez-vous avec Discord pour importer votre collection." : "L’import a échoué. Réessayez.");
        return;
      }
      if (!Array.isArray(data?.unmatched) || typeof data?.imported !== "number" || typeof data?.rows !== "number") {
        throw new Error("réponse invalide");
      }
      setReport(data as Report);
    } catch {
      setError("Fichier illisible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-line bg-surface-raised/40 p-4">
      <h2 className="mb-1 font-semibold">Importer depuis Piltover Archive</h2>
      <p className="mb-3 text-sm text-ink-muted">{t("Exportez votre collection en CSV depuis Piltover Archive, puis déposez le fichier ici. Les quantités du fichier remplaceront celles du site.")}</p>
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={onFile}
        disabled={busy}
        aria-label="Fichier CSV Piltover Archive"
        className="text-sm"
      />
      {busy && <p role="status" className="mt-2 text-sm text-ink-muted">{t("Import en cours…")}</p>}
      {error && <p role="alert" className="mt-2 text-sm text-red-400">{error}</p>}
      {report && (
        <div role="status" className="mt-3 text-sm">
          <p className="text-arcane">
            {report.imported} carte(s) importée(s) sur {report.rows} ligne(s).
          </p>
          <button type="button" onClick={() => router.refresh()} className="mt-2 text-arcane underline">
            {t("Actualiser la collection")}
          </button>
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
