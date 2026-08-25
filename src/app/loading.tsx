import { tr } from "@/lib/i18n-server";

export default async function Loading() {
  const t = await tr();
  return (
    <div role="status" aria-live="polite" className="mx-auto max-w-7xl px-4 py-12 text-sm text-ink-muted sm:px-6">
      {t("Chargement…")}
    </div>
  );
}
