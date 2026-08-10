import Link from "@/components/lien";
import { tr } from "@/lib/i18n-server";

export default async function NotFound() {
  const t = await tr();
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <span
        className="text-7xl font-black text-arcane/30"
        style={{ fontFamily: "var(--font-rubik), sans-serif" }}
      >
        404
      </span>
      <h1
        className="mt-2 text-2xl font-bold"
        style={{ fontFamily: "var(--font-rubik), sans-serif" }}
      >
        {t("Page introuvable")}
      </h1>
      <p className="mt-2 text-sm text-ink-secondary">
        {t("Cette page n’existe pas ou a été déplacée.")}
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-arcane px-6 py-2.5 text-sm font-semibold text-canvas transition-colors hover:bg-arcane/80"
      >
        {t("Retour à l’accueil")}
      </Link>
    </div>
  );
}
