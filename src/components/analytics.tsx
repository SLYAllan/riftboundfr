"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { useT } from "@/components/i18n-provider";

// Measurement ID hardcoded as the default (a GA4 ID is a public, client-side
// value, not a secret). NEXT_PUBLIC_GA_ID can still override it if needed.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-J8D0P8V55Q";

function getConsent(): boolean | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem("cookie-consent");
  if (v === "accepted") return true;
  if (v === "refused") return false;
  return null;
}

export function Analytics() {
  const [consent, setConsent] = useState<boolean | null>(null);

  useEffect(() => {
    setConsent(getConsent());
  }, []);

  if (!GA_ID || consent !== true) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
      </Script>
    </>
  );
}

export function CookieBanner() {
  const t = useT();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getConsent() === null) setVisible(true);
  }, []);

  if (!visible) return null;

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
    if (GA_ID && typeof window !== "undefined") {
      const s = document.createElement("script");
      s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      s.async = true;
      document.head.appendChild(s);
      const w = window as typeof window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
      w.dataLayer = w.dataLayer || [];
      w.gtag = function (...args: unknown[]) { w.dataLayer!.push(args); };
      w.gtag("js", new Date());
      w.gtag("config", GA_ID, { anonymize_ip: true });
    }
  };

  const refuse = () => {
    localStorage.setItem("cookie-consent", "refused");
    setVisible(false);
  };

  return (
    <div data-chrome="cookies" className="fixed bottom-0 inset-x-0 z-50 p-4">
      <div className="mx-auto max-w-2xl rounded-card border border-hairline bg-surface p-4 shadow-xl backdrop-blur-sm">
        <p className="text-sm text-ink-secondary">{t("Ce site utilise des cookies pour analyser le trafic et améliorer votre expérience. Aucune donnée personnelle n’est partagée avec des tiers.")}</p>
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={accept}
            className="rounded-lg bg-arcane px-4 py-2 text-sm font-semibold text-canvas hover:bg-arcane/90 transition-colors"
          >
            Accepter
          </button>
          <button
            onClick={refuse}
            className="rounded-lg bg-surface-raised px-4 py-2 text-sm font-semibold text-ink-secondary hover:text-ink transition-colors"
          >
            Refuser
          </button>
        </div>
      </div>
    </div>
  );
}
