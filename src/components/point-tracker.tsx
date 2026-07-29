"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Minus, Plus, RotateCcw, Undo2, Search, ChevronLeft } from "lucide-react";
import { DOMAIN_COLORS, DOMAIN_ICONS } from "@/lib/domains";

interface Legend {
  id: string;
  name: string;
  imageUrl: string | null;
  domains: string[];
}

interface Player {
  name: string;
  score: number;
  legend: Legend | null;
}

type Phase = "setup" | "legend-select" | "game";

interface HistoryEntry {
  players: { score: number }[];
}

export function PointTracker() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [playerCount, setPlayerCount] = useState(2);
  const [maxPoints, setMaxPoints] = useState(0);
  const [players, setPlayers] = useState<Player[]>(() =>
    Array.from({ length: 2 }, (_, i) => ({ name: `Joueur ${i + 1}`, score: 0, legend: null }))
  );
  const [legends, setLegends] = useState<Legend[]>([]);
  const [legendSearch, setLegendSearch] = useState("");
  const [selectingFor, setSelectingFor] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    fetch("/api/legends")
      .then((r) => r.json())
      .then((data: Legend[]) => setLegends(data));
  }, []);

  useEffect(() => {
    setPlayers((prev) => {
      if (playerCount === prev.length) return prev;
      if (playerCount > prev.length) {
        return [
          ...prev,
          ...Array.from({ length: playerCount - prev.length }, (_, i) => ({
            name: `Joueur ${prev.length + i + 1}`,
            score: maxPoints,
            legend: null,
          })),
        ];
      }
      return prev.slice(0, playerCount);
    });
  }, [playerCount, maxPoints]);

  const filteredLegends = legends.filter((l) =>
    l.name.toLowerCase().includes(legendSearch.toLowerCase())
  );

  const startGame = () => {
    setPlayers((prev) => prev.map((p) => ({ ...p, score: maxPoints })));
    setHistory([]);
    setPhase("game");
  };

  const pushHistory = useCallback(() => {
    setHistory((prev) => [...prev, { players: players.map((p) => ({ score: p.score })) }]);
  }, [players]);

  const changeScore = (index: number, delta: number) => {
    pushHistory();
    setPlayers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, score: p.score + delta } : p))
    );
  };

  const undo = () => {
    const last = history[history.length - 1];
    if (!last) return;
    setPlayers((prev) => prev.map((p, i) => ({ ...p, score: last.players[i]?.score ?? p.score })));
    setHistory((prev) => prev.slice(0, -1));
  };

  const reset = () => {
    setPlayers((prev) => prev.map((p) => ({ ...p, score: maxPoints })));
    setHistory([]);
  };

  const openLegendSelect = (playerIndex: number) => {
    setSelectingFor(playerIndex);
    setLegendSearch("");
    setPhase("legend-select");
  };

  const selectLegend = (legend: Legend) => {
    if (selectingFor === null) return;
    setPlayers((prev) =>
      prev.map((p, i) => (i === selectingFor ? { ...p, legend } : p))
    );
    setSelectingFor(null);
    setPhase(history.length > 0 || players.some((p) => p.legend) ? "game" : "setup");
  };

  // --- SETUP PHASE ---
  if (phase === "setup") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-rubik)" }}>
              Compteur de points
            </h1>
            <p className="mt-2 text-ink-secondary text-sm">Configurez votre partie</p>
          </div>

          {/* Player count */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-ink-secondary">Nombre de joueurs</label>
            <div className="flex gap-2">
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => setPlayerCount(n)}
                  className={`flex-1 rounded-xl py-3 text-lg font-bold transition-colors ${
                    playerCount === n
                      ? "bg-arcane text-canvas shadow-lg shadow-arcane/25"
                      : "bg-surface-raised text-ink-secondary hover:bg-surface-overlay"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Max points */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-ink-secondary">Points de départ</label>
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => setMaxPoints((v) => Math.max(0, v - 1))}
                aria-label="Retirer un point de départ"
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-raised text-ink-secondary hover:bg-surface-overlay transition-colors"
              >
                <Minus size={20} />
              </button>
              <span className="text-4xl font-bold tabular-nums w-16 text-center" style={{ fontFamily: "var(--font-rubik)" }}>
                {maxPoints}
              </span>
              <button
                onClick={() => setMaxPoints((v) => v + 1)}
                aria-label="Ajouter un point de départ"
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-raised text-ink-secondary hover:bg-surface-overlay transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Player names + legend select */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-ink-secondary">Joueurs</label>
            <div className="space-y-2">
              {players.map((player, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    onClick={() => openLegendSelect(i)}
                    className="relative h-10 w-10 flex-shrink-0 rounded-lg bg-surface-raised border border-hairline overflow-hidden hover:border-arcane/50 transition-colors"
                  >
                    {player.legend?.imageUrl ? (
                      <Image src={player.legend.imageUrl} alt={player.legend.name} fill className="object-cover object-top" sizes="40px" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-ink-muted text-xs">?</span>
                    )}
                  </button>
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) =>
                      setPlayers((prev) => prev.map((p, j) => (j === i ? { ...p, name: e.target.value } : p)))
                    }
                    aria-label={`Nom du joueur ${i + 1}`}
                    className="flex-1 rounded-lg bg-surface-raised border border-hairline px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-arcane/50"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Start */}
          <button
            onClick={startGame}
            className="w-full rounded-xl bg-gold py-4 text-lg font-bold text-canvas transition hover:bg-gold-light shadow-lg shadow-gold/25"
            style={{ fontFamily: "var(--font-rubik)" }}
          >
            Lancer la partie
          </button>
        </div>
      </div>
    );
  }

  // --- LEGEND SELECT PHASE ---
  if (phase === "legend-select") {
    return (
      <div className="min-h-screen px-4 py-6">
        <div className="mx-auto max-w-2xl">
          <button
            onClick={() => {
              setSelectingFor(null);
              setPhase(history.length > 0 ? "game" : "setup");
            }}
            className="mb-4 flex items-center gap-1 text-sm text-ink-secondary hover:text-ink transition-colors"
          >
            <ChevronLeft size={16} />
            Retour
          </button>

          <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-rubik)" }}>
            Choisir une Légende
          </h2>
          {selectingFor !== null && (
            <p className="text-sm text-ink-secondary mb-4">
              pour {players[selectingFor]?.name}
            </p>
          )}

          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              value={legendSearch}
              onChange={(e) => setLegendSearch(e.target.value)}
              placeholder="Rechercher une légende..."
              autoFocus
              className="w-full rounded-lg bg-surface-raised border border-hairline pl-9 pr-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-arcane/50"
            />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {filteredLegends.map((legend) => (
              <button
                key={legend.id}
                onClick={() => selectLegend(legend)}
                className="group relative aspect-[3/4] rounded-lg overflow-hidden border border-hairline hover:border-arcane/50 transition hover:scale-[1.03]"
              >
                {legend.imageUrl ? (
                  <Image src={legend.imageUrl} alt={legend.name} fill className="object-cover object-top" sizes="(max-width: 640px) 33vw, 25vw" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-surface-raised text-ink-muted text-xs">
                    {legend.name}
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-1.5 pb-1.5 pt-6">
                  <p className="text-xs font-medium text-white leading-tight truncate">{legend.name}</p>
                  <div className="flex gap-0.5 mt-0.5">
                    {legend.domains.map((d) =>
                      DOMAIN_ICONS[d] ? (
                        <Image key={d} src={DOMAIN_ICONS[d]} alt={d} width={14} height={14} />
                      ) : null
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredLegends.length === 0 && (
            <p className="mt-8 text-center text-ink-muted text-sm">Aucune légende trouvée</p>
          )}
        </div>
      </div>
    );
  }

  // --- GAME PHASE ---
  const gridCols =
    playerCount === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : playerCount === 3
        ? "grid-cols-1 sm:grid-cols-3"
        : "grid-cols-2 grid-rows-2";

  return (
    <div className="h-[100dvh] flex flex-col bg-canvas">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-hairline bg-surface/80 backdrop-blur-sm">
        <button
          onClick={() => setPhase("setup")}
          className="flex items-center gap-1 text-sm text-ink-secondary hover:text-ink transition-colors"
        >
          <ChevronLeft size={16} />
          Config
        </button>
        <span className="text-xs text-ink-muted font-medium">Max : {maxPoints}</span>
        <div className="flex gap-2">
          <button
            onClick={undo}
            disabled={history.length === 0}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Undo2 size={14} />
            Annuler
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink transition-colors"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>

      {/* Player grid */}
      <div className={`flex-1 grid ${gridCols} gap-px bg-hairline`}>
        {players.map((player, i) => {
          const primaryDomain = player.legend?.domains[0];
          const domainColor = primaryDomain ? DOMAIN_COLORS[primaryDomain] : "#64748b";
          const isZero = player.score <= 0;

          return (
            <div
              key={i}
              className="relative flex flex-col items-center justify-center bg-canvas overflow-hidden"
            >
              {/* Legend background */}
              {player.legend?.imageUrl && (
                <div className="absolute inset-0">
                  <Image
                    src={player.legend.imageUrl}
                    alt=""
                    fill
                    className="object-cover object-top opacity-20 blur-[2px]"
                    sizes="50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-canvas/60 via-canvas/40 to-canvas/80" />
                </div>
              )}

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center gap-2 w-full px-4">
                {/* Player name + legend */}
                <div className="text-center">
                  <p className="text-sm font-medium text-ink/80 truncate max-w-[140px]">{player.name}</p>
                  {player.legend && (
                    <button
                      onClick={() => openLegendSelect(i)}
                      className="text-xs text-ink-muted hover:text-arcane transition-colors"
                    >
                      {player.legend.name}
                    </button>
                  )}
                  {!player.legend && (
                    <button
                      onClick={() => openLegendSelect(i)}
                      className="text-xs text-arcane/70 hover:text-arcane transition-colors"
                    >
                      + Légende
                    </button>
                  )}
                </div>

                {/* Score row */}
                <div className="flex items-center gap-6 sm:gap-8">
                  <button
                    onClick={() => changeScore(i, -1)}
                    className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-surface-raised/80 border border-hairline text-ink-secondary hover:bg-error/20 hover:text-error hover:border-error/30 active:scale-90 transition"
                  >
                    <Minus size={28} />
                  </button>

                  <span
                    className={`text-7xl sm:text-8xl font-black tabular-nums transition-colors min-w-[80px] text-center ${
                      isZero ? "text-error animate-pulse" : ""
                    }`}
                    style={{
                      fontFamily: "var(--font-rubik)",
                      color: isZero ? undefined : domainColor,
                      textShadow: `0 0 30px ${domainColor}33`,
                    }}
                  >
                    {player.score}
                  </span>

                  <button
                    onClick={() => changeScore(i, 1)}
                    className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-surface-raised/80 border border-hairline text-ink-secondary hover:bg-success/20 hover:text-success hover:border-success/30 active:scale-90 transition"
                  >
                    <Plus size={28} />
                  </button>
                </div>

                {/* Domain icons */}
                {player.legend && (
                  <div className="flex gap-1.5 mt-1">
                    {player.legend.domains.map((d) =>
                      DOMAIN_ICONS[d] ? (
                        <Image key={d} src={DOMAIN_ICONS[d]} alt={d} width={20} height={20} className="opacity-70" />
                      ) : null
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
