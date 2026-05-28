"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <span
        className="text-7xl font-black text-red-500/30"
        style={{ fontFamily: "var(--font-rubik), sans-serif" }}
      >
        500
      </span>
      <h1
        className="mt-2 text-2xl font-bold"
        style={{ fontFamily: "var(--font-rubik), sans-serif" }}
      >
        Erreur serveur
      </h1>
      <p className="mt-2 text-sm text-ink-secondary">
        Quelque chose s&apos;est mal passé. Réessayez ou revenez plus tard.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-full bg-arcane px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-arcane/80"
      >
        Réessayer
      </button>
    </div>
  );
}
