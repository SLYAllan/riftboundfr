"use client";

export default function OfflinePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <div className="mb-6">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto text-ink-muted"
          aria-hidden="true"
        >
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      </div>

      <h1
        className="mb-4 text-3xl font-bold"
        style={{ fontFamily: "var(--font-rubik), sans-serif" }}
      >
        {"Vous êtes hors ligne"}
      </h1>

      <p className="mb-8 max-w-md text-lg text-ink-secondary">
        {"Impossible de charger cette page. Vérifiez votre connexion internet puis réessayez."}
      </p>

      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-xl bg-arcane px-6 py-3 font-semibold text-canvas transition-colors hover:bg-arcane-light"
      >
        {"Réessayer"}
      </button>
    </div>
  );
}
