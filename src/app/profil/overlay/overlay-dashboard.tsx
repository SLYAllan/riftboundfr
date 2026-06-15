"use client";
import { useEffect, useRef, useState } from "react";
import { applyStateUpdate, type OverlayStateData } from "@/lib/overlay";

type Legend = { id: string; name: string; imageUrl: string | null; domains: string[] };

export function OverlayDashboard({ token, initial }: { token: string; initial: OverlayStateData }) {
  const [state, setState] = useState<OverlayStateData>(initial);
  const [legends, setLegends] = useState<Legend[]>([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/legends").then((r) => r.json()).then(setLegends).catch(() => {});
  }, []);

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

  const overlayUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/overlay/${token}`;

  function setPlayer(i: 0 | 1, p: Partial<OverlayStateData["players"][0]>) {
    update({ players: i === 0 ? [p, {}] : [{}, p] } as never);
  }

  return (
    <div className="mx-auto max-w-5xl p-4 space-y-6">
      <h1 className="text-2xl font-bold">Overlay de stream</h1>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-hairline p-3 text-sm">
        <span className="font-medium">Lien OBS :</span>
        <code className="rounded bg-surface-raised px-2 py-1">{overlayUrl}</code>
        <button onClick={() => navigator.clipboard.writeText(overlayUrl)} className="rounded bg-arcane px-3 py-1 text-white">Copier</button>
        <button onClick={() => fetch("/api/overlay/token", { method: "POST" }).then(() => location.reload())} className="rounded border border-hairline px-3 py-1">Régénérer</button>
      </div>

      <div className="flex flex-wrap gap-4">
        {([0, 1] as const).map((i) => {
          const p = state.players[i];
          const pts = i === 0 ? state.points.a : state.points.b;
          const key = i === 0 ? "a" : "b";
          return (
            <div key={i} className="flex-1 min-w-[280px] space-y-2 rounded-lg border border-hairline p-3">
              <h2 className="font-semibold">Joueur {i + 1}</h2>
              <input value={p.name} onChange={(e) => setPlayer(i, { name: e.target.value })} placeholder="Nom" className="w-full rounded border border-hairline bg-surface px-2 py-1" />
              <select value={p.legendId ?? ""} onChange={(e) => { const l = legends.find((x) => x.id === e.target.value); setPlayer(i, { legendId: l?.id ?? null, legendName: l?.name ?? "" }); }} className="w-full rounded border border-hairline bg-surface px-2 py-1">
                <option value="">— Légende —</option>
                {legends.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <input value={p.championName} onChange={(e) => setPlayer(i, { championName: e.target.value })} placeholder="Champion" className="w-full rounded border border-hairline bg-surface px-2 py-1" />
              <input value={p.battlefields.join(", ")} onChange={(e) => setPlayer(i, { battlefields: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} placeholder="Battlefields (séparés par ,)" className="w-full rounded border border-hairline bg-surface px-2 py-1" />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.camEnabled} onChange={(e) => setPlayer(i, { camEnabled: e.target.checked })} /> Cam visible</label>
              <div className="flex items-center gap-3 text-sm">
                <span>Points</span>
                <button onClick={() => update({ points: { [key]: pts - 1 } } as never)} className="rounded border px-2">−</button>
                <span>{pts}</span>
                <button onClick={() => update({ points: { [key]: pts + 1 } } as never)} className="rounded border px-2">+</button>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span>Manches</span>
                <button onClick={() => setPlayer(i, { gamesWon: Math.max(0, p.gamesWon - 1) })} className="rounded border px-2">−</button>
                <span>{p.gamesWon}</span>
                <button onClick={() => setPlayer(i, { gamesWon: p.gamesWon + 1 })} className="rounded border px-2">+</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-hairline p-3 text-sm">
        <label>Format
          <select value={state.format} onChange={(e) => update({ format: e.target.value as OverlayStateData["format"] })} className="ml-2 rounded border border-hairline bg-surface px-2 py-1">
            <option>BO1</option><option>BO3</option><option>BO5</option>
          </select>
        </label>
        <label>Points max
          <select value={state.maxPoints} onChange={(e) => update({ maxPoints: Number(e.target.value) })} className="ml-2 rounded border border-hairline bg-surface px-2 py-1">
            <option value={8}>8</option><option value={9}>9</option>
          </select>
        </label>
        <input value={state.event.title} onChange={(e) => update({ event: { title: e.target.value } })} placeholder="Titre event" className="rounded border border-hairline bg-surface px-2 py-1" />
        <input value={state.event.round} onChange={(e) => update({ event: { round: e.target.value } })} placeholder="Round (TOP 8…)" className="rounded border border-hairline bg-surface px-2 py-1" />
        <button onClick={() => update({ players: [state.players[1], state.players[0]] as never, points: { a: state.points.b, b: state.points.a } })} className="rounded border px-3 py-1">Swap joueurs</button>
        <button onClick={() => update({ points: { a: 0, b: 0 } })} className="rounded border px-3 py-1">Reset game</button>
        <button onClick={() => update({ points: { a: 0, b: 0 }, players: [{ gamesWon: 0 }, { gamesWon: 0 }] as never })} className="rounded border px-3 py-1">Reset match</button>
      </div>

      <div>
        <h2 className="mb-2 font-semibold">Aperçu</h2>
        <iframe src={`/overlay/${token}`} className="h-[360px] w-[640px] rounded border border-hairline" style={{ background: "#111" }} />
      </div>
    </div>
  );
}
