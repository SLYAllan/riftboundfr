"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Minus, Plus, Trophy } from "lucide-react";
import { DOMAIN_COLORS } from "@/lib/domains";
import { applyStateUpdate, clampPoints, manchesPourGagner, type OverlayStateData } from "@/lib/overlay";
import { useT } from "@/components/i18n-provider";
import styles from "./compagnon.module.css";

interface Legende {
  id: string;
  name: string;
  imageUrl: string | null;
  domains: string[];
}

type Patch = Parameters<typeof applyStateUpdate>[1];

/**
 * Empile deux patchs en un seul.
 *
 * Le compagnon envoie un PATCH et pas l'état entier : le streamer peut être en
 * train de changer le décor ou les cartes depuis son tableau de bord, et un état
 * entier écraserait son travail. Mais avec un minuteur d'attente, le patch suivant
 * remplaçait le précédent : taper un pseudo puis marquer un point 200 ms plus tard
 * jetait le pseudo sans un mot. Tout s'accumule donc ici jusqu'à l'envoi.
 */
function fusionner(a: Patch, b: Patch): Patch {
  const joueurs = a.players || b.players;
  return {
    ...a,
    ...b,
    event: a.event || b.event ? { ...a.event, ...b.event } : undefined,
    points: a.points || b.points ? { ...a.points, ...b.points } : undefined,
    players: joueurs
      ? [
          { ...a.players?.[0], ...b.players?.[0] },
          { ...a.players?.[1], ...b.players?.[1] },
        ]
      : undefined,
  } as Patch;
}

const champCls =
  "w-full rounded-lg border border-hairline bg-surface-raised px-3 py-2.5 text-base text-ink placeholder:text-ink-muted focus:border-arcane/50 focus:outline-none";

export function Compagnon({ token, cle, initial }: { token: string; cle: string; initial: OverlayStateData }) {
  const t = useT();
  const [state, setState] = useState<OverlayStateData>(initial);
  const [enMatch, setEnMatch] = useState(false);
  const [demandeGagnant, setDemandeGagnant] = useState(false);
  const [legendes, setLegendes] = useState<Legende[]>([]);
  const [champions, setChampions] = useState<[string[], string[]]>([[], []]);
  const [terrains, setTerrains] = useState<string[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const minuteur = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enAttente = useRef<Patch>({});

  useEffect(() => {
    fetch("/api/legends").then((r) => r.json()).then(setLegendes).catch(() => {});
    fetch("/api/battlefields").then((r) => r.json()).then(setTerrains).catch(() => {});
  }, []);

  const legende0 = state.players[0].legendName;
  const legende1 = state.players[1].legendName;
  useEffect(() => {
    [legende0, legende1].forEach((nom, i) => {
      if (!nom) {
        setChampions((c) => (i === 0 ? [[], c[1]] : [c[0], []]));
        return;
      }
      fetch(`/api/legends/champions?legend=${encodeURIComponent(nom)}`)
        .then((r) => r.json())
        .then((liste: string[]) => setChampions((c) => (i === 0 ? [liste, c[1]] : [c[0], liste])))
        .catch(() => {});
    });
  }, [legende0, legende1]);

  function envoyer(patch: Patch) {
    setState((s) => applyStateUpdate(s, patch));
    enAttente.current = fusionner(enAttente.current, patch);
    if (minuteur.current) clearTimeout(minuteur.current);
    minuteur.current = setTimeout(() => {
      const corps = enAttente.current;
      enAttente.current = {};
      fetch(`/api/overlay/${token}/compagnon`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-cle-compagnon": cle },
        body: JSON.stringify(corps),
      })
        .then(async (r) => {
          if (r.ok) return setErreur(null);
          const rep = (await r.json().catch(() => ({}))) as { error?: string };
          setErreur(rep.error ?? `${t("Le serveur a refusé la sauvegarde.")} (${r.status})`);
        })
        .catch(() => setErreur(t("Connexion perdue : rien n’est parti à l’écran.")));
    }, 300);
  }

  function setJoueur(i: 0 | 1, p: Partial<OverlayStateData["players"][0]>) {
    envoyer({ players: i === 0 ? [p, {}] : [{}, p] } as Patch);
  }

  const manchesMax = manchesPourGagner(state.format);
  const vainqueur =
    state.players[0].gamesWon >= manchesMax ? 0 : state.players[1].gamesWon >= manchesMax ? 1 : null;

  function point(i: 0 | 1, delta: number) {
    const cote = i === 0 ? "a" : "b";
    const valeur = clampPoints(state.points[cote] + delta, state.maxPoints);
    envoyer({ points: { [cote]: valeur } } as Patch);
  }

  function finDeManche(gagnant: 0 | 1) {
    const manches = Math.min(state.players[gagnant].gamesWon + 1, manchesMax);
    envoyer({
      points: { a: 0, b: 0 },
      players: gagnant === 0 ? [{ gamesWon: manches }, {}] : [{}, { gamesWon: manches }],
    } as Patch);
    setDemandeGagnant(false);
  }

  function nouveauMatch() {
    envoyer({ points: { a: 0, b: 0 }, players: [{ gamesWon: 0 }, { gamesWon: 0 }] } as Patch);
    setEnMatch(false);
  }

  const barreErreur = erreur ? (
    <p role="status" className="bg-error/15 px-4 py-2 text-center text-sm text-error">{erreur}</p>
  ) : null;

  // --- PRÉPARATION DU MATCH ---
  if (!enMatch) {
    const commence = state.players[0].gamesWon + state.players[1].gamesWon > 0 && vainqueur === null;
    return (
      <div className={`${styles.page} bg-canvas px-4 py-6`}>
        {barreErreur}
        <div className="mx-auto max-w-md space-y-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-rubik)" }}>{t("Compagnon de match")}</h1>
            <p className="mt-1 text-sm text-ink-secondary">
              {t("Tout ce que vous tapez ici part sur l’habillage de stream.")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs text-ink-muted">{t("Format")}</span>
              <select
                value={state.format}
                onChange={(e) => envoyer({ format: e.target.value as OverlayStateData["format"] })}
                className={champCls}
              >
                <option value="BO1">BO1</option>
                <option value="BO3">BO3</option>
                <option value="BO5">BO5</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-ink-muted">{t("Points pour gagner")}</span>
              <select
                value={state.maxPoints}
                onChange={(e) => envoyer({ maxPoints: Number(e.target.value) })}
                className={champCls}
              >
                <option value={8}>8</option>
                <option value={9}>9</option>
                <option value={10}>10</option>
              </select>
            </label>
          </div>

          {([0, 1] as const).map((i) => {
            const p = state.players[i];
            return (
              <div key={i} className="space-y-3 rounded-xl border border-hairline bg-surface p-4">
                <h2 className="text-sm font-semibold text-ink-secondary">{t("Joueur")} {i + 1}</h2>
                <label className="block">
                  <span className="mb-1 block text-xs text-ink-muted">{t("Pseudo")}</span>
                  <input
                    value={p.name}
                    onChange={(e) => setJoueur(i, { name: e.target.value })}
                    placeholder={t("Son pseudo")}
                    className={champCls}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-ink-muted">{t("Légende")}</span>
                  <select
                    value={p.legendId ?? ""}
                    onChange={(e) => {
                      const l = legendes.find((x) => x.id === e.target.value);
                      setJoueur(i, { legendId: l?.id ?? null, legendName: l?.name ?? "", championName: "" });
                    }}
                    className={champCls}
                  >
                    <option value="">{t("À choisir…")}</option>
                    {legendes.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-ink-muted">{t("Champion élu")}</span>
                  <select
                    value={p.championName}
                    onChange={(e) => setJoueur(i, { championName: e.target.value })}
                    disabled={!p.legendName}
                    className={champCls}
                  >
                    <option value="">{p.legendName ? t("À choisir…") : t("Choisissez d’abord une Légende")}</option>
                    {champions[i].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-ink-muted">{t("Champ de bataille en jeu")}</span>
                  <select
                    value={p.battlefields[0] ?? ""}
                    onChange={(e) => setJoueur(i, { battlefields: e.target.value ? [e.target.value] : [] })}
                    className={champCls}
                  >
                    <option value="">{t("Aucun")}</option>
                    {terrains.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </label>
              </div>
            );
          })}

          <button
            onClick={() => {
              if (vainqueur !== null) nouveauMatch();
              setEnMatch(true);
            }}
            className="w-full rounded-xl bg-gold py-4 text-lg font-bold text-canvas shadow-lg shadow-gold/25 transition hover:bg-gold-light"
          >
            {commence ? t("Reprendre le match") : t("Lancer le match")}
          </button>
        </div>
      </div>
    );
  }

  // --- MATCH EN COURS ---
  return (
    <div className={`${styles.page} flex h-[100dvh] flex-col bg-canvas`}>
      {barreErreur}
      <div className="flex items-center justify-between border-b border-hairline bg-surface/80 px-4 py-2 backdrop-blur-sm">
        <button
          onClick={() => setEnMatch(false)}
          className="flex items-center gap-1 text-sm text-ink-secondary transition-colors hover:text-ink"
        >
          <ChevronLeft size={16} aria-hidden />
          {t("Réglages")}
        </button>
        <span className="text-sm font-bold tabular-nums">
          {state.players[0].gamesWon} – {state.players[1].gamesWon}
        </span>
        <span className="text-xs text-ink-muted">{state.format} · {state.maxPoints} {t("pts")}</span>
      </div>

      <div className="grid flex-1 grid-rows-2 gap-px bg-hairline">
        {([0, 1] as const).map((i) => {
          const p = state.players[i];
          const pts = i === 0 ? state.points.a : state.points.b;
          const domaine = legendes.find((l) => l.id === p.legendId)?.domains[0];
          const couleur = domaine ? DOMAIN_COLORS[domaine] : "#64748b";
          return (
            <div key={i} className="flex flex-col items-center justify-center gap-2 bg-canvas px-4">
              <div className="text-center">
                <p className="truncate text-base font-medium text-ink/80">{p.name || `${t("Joueur")} ${i + 1}`}</p>
                {p.legendName && <p className="text-xs text-ink-muted">{p.legendName}</p>}
              </div>
              <div className="flex items-center gap-6">
                <button
                  onClick={() => point(i, -1)}
                  disabled={pts <= 0}
                  aria-label={`${t("Un point de moins")}, ${t("joueur")} ${i + 1}`}
                  className="flex h-16 w-16 items-center justify-center rounded-full border border-hairline bg-surface-raised/80 text-ink-secondary transition active:scale-90 disabled:opacity-30"
                >
                  <Minus size={30} aria-hidden />
                </button>
                <span
                  className="min-w-[86px] text-center text-7xl font-black tabular-nums"
                  style={{ fontFamily: "var(--font-rubik)", color: couleur, textShadow: `0 0 30px ${couleur}33` }}
                >
                  {pts}
                </span>
                <button
                  onClick={() => point(i, 1)}
                  disabled={pts >= state.maxPoints}
                  aria-label={`${t("Un point de plus")}, ${t("joueur")} ${i + 1}`}
                  className="flex h-16 w-16 items-center justify-center rounded-full border border-hairline bg-surface-raised/80 text-ink-secondary transition active:scale-90 disabled:opacity-30"
                >
                  <Plus size={30} aria-hidden />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-hairline bg-surface/80 p-3 backdrop-blur-sm">
        <button
          onClick={() => setDemandeGagnant(true)}
          className="w-full rounded-xl bg-arcane py-4 text-base font-bold text-canvas transition active:scale-[0.99]"
        >
          {t("Fin de la manche")}
        </button>
      </div>

      {/* Qui a gagné : la question ne se pose qu'au clic, jamais toute seule. Un
          joueur qui atteint le score peut concéder, se tromper de bouton, ou finir
          la manche au temps ; l'habillage ne doit pas trancher à sa place. */}
      {demandeGagnant && vainqueur === null && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 p-4">
          <div className="space-y-3 rounded-2xl border border-hairline bg-surface p-4">
            <p className="text-center text-base font-semibold">{t("Qui a gagné la manche ?")}</p>
            {([0, 1] as const).map((i) => (
              <button
                key={i}
                onClick={() => finDeManche(i)}
                className="w-full rounded-xl border border-hairline bg-surface-raised py-4 text-base font-bold transition active:scale-[0.99]"
              >
                {state.players[i].name || `${t("Joueur")} ${i + 1}`}
              </button>
            ))}
            <button onClick={() => setDemandeGagnant(false)} className="w-full py-2 text-sm text-ink-secondary">
              {t("Annuler")}
            </button>
          </div>
        </div>
      )}

      {vainqueur !== null && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-canvas/95 p-6 text-center">
          <Trophy size={48} className="text-gold" aria-hidden />
          <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-rubik)" }}>
            {state.players[vainqueur].name || `${t("Joueur")} ${vainqueur + 1}`}
          </p>
          <p className="text-sm text-ink-secondary">
            {t("remporte le match")} {state.players[0].gamesWon} – {state.players[1].gamesWon}
          </p>
          <button onClick={nouveauMatch} className="mt-2 w-full max-w-xs rounded-xl bg-gold py-4 text-base font-bold text-canvas">
            {t("Nouveau match")}
          </button>
        </div>
      )}
    </div>
  );
}
