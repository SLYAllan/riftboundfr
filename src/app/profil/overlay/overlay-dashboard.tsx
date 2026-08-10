"use client";
import { useEffect, useRef, useState } from "react";
import { applyStateUpdate, type OverlayStateData } from "@/lib/overlay";

type Legend = { id: string; name: string; imageUrl: string | null; domains: string[] };

export function OverlayDashboard({ token, initial }: { token: string; initial: OverlayStateData }) {
  const [state, setState] = useState<OverlayStateData>(initial);
  const [legends, setLegends] = useState<Legend[]>([]);
  const [battlefields, setBattlefields] = useState<string[]>([]);
  const [champs, setChamps] = useState<[string[], string[]]>([[], []]);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
    fetch("/api/legends").then((r) => r.json()).then(setLegends).catch(() => {});
    fetch("/api/battlefields").then((r) => r.json()).then(setBattlefields).catch(() => {});
  }, []);

  // Charge les champions de chaque légende sélectionnée
  useEffect(() => {
    [0, 1].forEach((i) => {
      const ln = state.players[i].legendName;
      if (!ln) { setChamps((c) => { const n: [string[], string[]] = [c[0], c[1]]; n[i] = []; return n; }); return; }
      fetch(`/api/legends/champions?legend=${encodeURIComponent(ln)}`)
        .then((r) => r.json())
        .then((list: string[]) => setChamps((c) => { const n: [string[], string[]] = [c[0], c[1]]; n[i] = list; return n; }))
        .catch(() => {});
    });
  }, [state.players[0].legendName, state.players[1].legendName]);

  function update(patch: Parameters<typeof applyStateUpdate>[1]) {
    setState((s) => {
      const next = applyStateUpdate(s, patch);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        fetch("/api/overlay/state", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
      }, 300);
      return next;
    });
  }

  const overlayUrl = `${origin}/overlay/${token}`;

  function setPlayer(i: 0 | 1, p: Partial<OverlayStateData["players"][0]>) {
    update({ players: i === 0 ? [p, {}] : [{}, p] } as never);
  }

  const [brouillonCam, setBrouillonCam] = useState<[string, string]>(["", ""]);
  const manchesMax = state.format === "BO5" ? 3 : state.format === "BO3" ? 2 : 1;
  const borne = (n: number, max: number) => Math.max(0, Math.min(max, n));
  const inputCls = "w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm focus:border-arcane focus:outline-none";
  const btnStep = "flex h-7 w-7 items-center justify-center rounded-lg border border-hairline hover:bg-surface-raised";

  return (
    <div className="mx-auto max-w-5xl p-4 space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🎥</span>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>Overlay de stream</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-hairline bg-surface p-3 text-sm">
        <span className="font-medium">Lien OBS</span>
        <code className="flex-1 min-w-[200px] truncate rounded-lg bg-surface-raised px-3 py-2">{overlayUrl}</code>
        <button onClick={() => { navigator.clipboard.writeText(overlayUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="rounded-lg bg-arcane px-3 py-2 font-medium text-white hover:bg-arcane/90">{copied ? "Copié ✓" : "Copier"}</button>
        <button onClick={() => fetch("/api/overlay/token", { method: "POST" }).then(() => location.reload())} className="rounded-lg border border-hairline px-3 py-2 hover:bg-surface-raised">Régénérer</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {([0, 1] as const).map((i) => {
          const p = state.players[i];
          const pts = i === 0 ? state.points.a : state.points.b;
          const key = i === 0 ? "a" : "b";
          return (
            <div key={i} className="space-y-3 rounded-xl border border-hairline bg-surface p-4">
              <h2 className="font-semibold text-ink-secondary">Joueur {i + 1}</h2>
              <input value={p.name} onChange={(e) => setPlayer(i, { name: e.target.value })} placeholder="Nom du joueur" className={inputCls} />
              <select value={p.legendId ?? ""} onChange={(e) => { const l = legends.find((x) => x.id === e.target.value); setPlayer(i, { legendId: l?.id ?? null, legendName: l?.name ?? "", championName: "" }); }} className={inputCls}>
                <option value="">— Légende —</option>
                {legends.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <select value={p.championName} onChange={(e) => setPlayer(i, { championName: e.target.value })} className={inputCls} disabled={!p.legendName}>
                <option value="">— Champion —</option>
                {champs[i].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>

              <div>
                <select
                  value={p.battlefields[0] ?? ""}
                  onChange={(e) => setPlayer(i, { battlefields: e.target.value ? [e.target.value] : [] })}
                  className={inputCls}
                >
                  <option value="">Champ de bataille en jeu…</option>
                  {battlefields.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-ink-muted">Lien caméra VDO.Ninja (https://vdo.ninja/?view=…)</label>
                <div className="flex gap-2">
                  <input
                    value={brouillonCam[i]}
                    onChange={(e) => setBrouillonCam((b) => (i === 0 ? [e.target.value, b[1]] : [b[0], e.target.value]))}
                    placeholder="https://vdo.ninja/?view=..."
                    className={inputCls}
                  />
                  <button
                    onClick={() => setPlayer(i, { camUrl: brouillonCam[i] })}
                    className="shrink-0 rounded-lg bg-arcane px-3 py-2 text-sm font-medium text-white transition-[background-color,scale] duration-150 hover:bg-arcane/90 active:scale-[0.96]"
                  >
                    Charger
                  </button>
                  {p.camUrl && (
                    <button
                      onClick={() => { setPlayer(i, { camUrl: "" }); setBrouillonCam((b) => (i === 0 ? ["", b[1]] : [b[0], ""])); }}
                      className="shrink-0 rounded-lg border border-hairline px-3 py-2 text-sm transition-[background-color,scale] duration-150 hover:bg-surface-raised active:scale-[0.96]"
                    >
                      Retirer
                    </button>
                  )}
                </div>
                <p className="mt-1 text-xs text-ink-muted">Le son est coupé d&apos;office. Vide, ou autre chose que vdo.ninja en https : le cadre reste transparent, la caméra se pose dessous dans OBS.</p>
              </div>

              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.camEnabled} onChange={(e) => setPlayer(i, { camEnabled: e.target.checked })} /> Cam visible</label>

              <div className="flex items-center justify-between gap-2 rounded-lg bg-surface-raised/50 px-3 py-2 text-sm">
                <span className="text-ink-secondary">Points</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => update({ points: { [key]: borne(pts - 1, state.maxPoints) } } as never)} disabled={pts <= 0} className={btnStep}>−</button>
                  <span className="w-6 text-center font-bold tabular-nums">{pts}</span>
                  <button onClick={() => update({ points: { [key]: borne(pts + 1, state.maxPoints) } } as never)} disabled={pts >= state.maxPoints} className={btnStep}>+</button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 rounded-lg bg-surface-raised/50 px-3 py-2 text-sm">
                <span className="text-ink-secondary">Manches gagnées</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPlayer(i, { gamesWon: borne(p.gamesWon - 1, manchesMax) })} disabled={p.gamesWon <= 0} className={btnStep}>−</button>
                  <span className="w-6 text-center font-bold tabular-nums">{p.gamesWon}</span>
                  <button onClick={() => setPlayer(i, { gamesWon: borne(p.gamesWon + 1, manchesMax) })} disabled={p.gamesWon >= manchesMax} className={btnStep}>+</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-hairline bg-surface p-4 text-sm">
        <label className="flex items-center gap-2">Format
          <select value={state.format} onChange={(e) => update({ format: e.target.value as OverlayStateData["format"] })} className="rounded-lg border border-hairline bg-surface px-2 py-1.5">
            <option>BO1</option><option>BO3</option><option>BO5</option>
          </select>
        </label>
        <label className="flex items-center gap-2">Points max
          <select value={state.maxPoints} onChange={(e) => update({ maxPoints: Number(e.target.value) })} className="rounded-lg border border-hairline bg-surface px-2 py-1.5">
            <option value={8}>8</option><option value={9}>9</option>
          </select>
        </label>
        <input value={state.event.title} onChange={(e) => update({ event: { title: e.target.value } })} placeholder="Titre event" className="rounded-lg border border-hairline bg-surface px-3 py-1.5" />
        <input value={state.event.round} onChange={(e) => update({ event: { round: e.target.value } })} placeholder="Ronde (TOP 8…)" className="rounded-lg border border-hairline bg-surface px-3 py-1.5" />
        <input value={state.event.logoUrl ?? ""} onChange={(e) => update({ event: { logoUrl: e.target.value } })} placeholder="Lien du logo du tournoi" className="min-w-[220px] flex-1 rounded-lg border border-hairline bg-surface px-3 py-1.5" />
        <label className="flex items-center gap-2">Chrono
          <select
            value=""
            onChange={(e) => {
              const min = Number(e.target.value);
              if (!min) return;
              update({ event: { endsAt: new Date(Date.now() + min * 60000).toISOString() } });
            }}
            className="rounded-lg border border-hairline bg-surface px-2 py-1.5"
          >
            <option value="">Lancer…</option>
            {[10, 20, 25, 30, 40, 50, 60, 75].map((m) => <option key={m} value={m}>{m} min</option>)}
          </select>
        </label>
        <button onClick={() => update({ event: { endsAt: null } })} className="rounded-lg border border-hairline px-3 py-1.5 hover:bg-surface-raised">Arrêter le chrono</button>
        <button onClick={() => update({ players: [state.players[1], state.players[0]] as never, points: { a: state.points.b, b: state.points.a } })} className="rounded-lg border border-hairline px-3 py-1.5 hover:bg-surface-raised">Swap joueurs</button>
        <button onClick={() => update({ points: { a: 0, b: 0 } })} className="rounded-lg border border-hairline px-3 py-1.5 hover:bg-surface-raised">Reset game</button>
        <button onClick={() => update({ points: { a: 0, b: 0 }, players: [{ gamesWon: 0 }, { gamesWon: 0 }] as never })} className="rounded-lg border border-hairline px-3 py-1.5 hover:bg-surface-raised">Reset match</button>
      </div>

    </div>
  );
}
