"use client";
import { useEffect, useRef, useState } from "react";
import { applyStateUpdate, type OverlayStateData } from "@/lib/overlay";
import { parseDeckCode } from "@/lib/deck-code";
import { useT } from "@/components/i18n-provider";

type Legend = { id: string; name: string; imageUrl: string | null; domains: string[] };

export function OverlayDashboard({ token, initial }: { token: string; initial: OverlayStateData }) {
  const t = useT();
  const [state, setState] = useState<OverlayStateData>(initial);
  const [legends, setLegends] = useState<Legend[]>([]);
  const [battlefields, setBattlefields] = useState<string[]>([]);
  const [champs, setChamps] = useState<[string[], string[]]>([[], []]);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    queueMicrotask(() => setOrigin(window.location.origin));
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
  const [brouillonLogo, setBrouillonLogo] = useState("");
  const [brouillonDeck, setBrouillonDeck] = useState<[string, string]>(["", ""]);
  const cards: OverlayStateData["cards"] = {
    lists: state.cards?.lists ?? [[], []],
    ignored: state.cards?.ignored ?? [[], []],
    visible: state.cards?.visible ?? [false, false],
    auto: state.cards?.auto ?? [false, false],
    index: state.cards?.index ?? [0, 0],
    seconds: state.cards?.seconds ?? 5,
  };
  const paire = <T,>(t: [T, T], i: 0 | 1, v: T): [T, T] => (i === 0 ? [v, t[1]] : [t[0], v]);
  const majCards = (p: Partial<OverlayStateData["cards"]>) => update({ cards: { ...cards, ...p } } as never);
  const manchesMax = state.format === "BO5" ? 3 : state.format === "BO3" ? 2 : 1;
  const borne = (n: number, max: number) => Math.max(0, Math.min(max, n));
  const inputCls =
    "w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm transition-colors duration-150 focus:border-arcane focus:outline-none";
  const btnStep =
    "flex h-9 w-9 items-center justify-center rounded-lg border border-hairline text-base transition-[background-color,scale] duration-150 hover:bg-surface-raised active:scale-[0.96] disabled:opacity-30";
  const btnPlein =
    "shrink-0 rounded-lg bg-arcane px-3 py-2 text-sm font-medium text-canvas transition-[background-color,scale] duration-150 hover:bg-arcane/90 active:scale-[0.96]";
  const btnVide =
    "shrink-0 rounded-lg border border-hairline px-3 py-2 text-sm transition-[background-color,scale] duration-150 hover:bg-surface-raised active:scale-[0.96]";

  const [minutes, setMinutes] = useState(50);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <header>
        <h1 className="text-balance text-3xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
          {t("Habillage de stream")}
        </h1>
        <p className="mt-2 max-w-2xl text-pretty text-sm text-ink-secondary">
          {t("Cette page pilote ce qui s’affiche à l’écran pendant votre diffusion. Tout ce que vous changez ici part en direct, sans rien relancer.")}
        </p>
      </header>

      <section className="rounded-xl border border-arcane/30 bg-arcane/5 p-4">
        <h2 className="font-semibold text-ink">{t("Première fois ? Trois étapes.")}</h2>
        <ol className="mt-2 space-y-1.5 text-sm text-ink-secondary">
          <li><strong className="text-ink">1.</strong> {t("Copiez le lien ci-dessous.")}</li>
          <li>
            <strong className="text-ink">2.</strong> {t("Dans OBS :")} <em>{t("Sources")}</em> → <em>+</em> → <em>{t("Navigateur")}</em>.{" "}
            {t("Collez le lien, mettez")} <strong className="text-ink">1920</strong> {t("de largeur et")}{" "}
            <strong className="text-ink">1080</strong> {t("de hauteur, puis validez.")}
          </li>
          <li><strong className="text-ink">3.</strong> {t("Revenez ici et remplissez les cases. L’écran suit tout seul.")}</li>
        </ol>
        <p className="mt-2 text-xs text-ink-muted">
          {t("Si un changement ne s’affiche pas : clic droit sur la source dans OBS →")} <em>{t("Actualiser")}</em>.
        </p>
      </section>

      <section className="rounded-xl border border-hairline bg-surface p-4">
        <label className="text-sm font-semibold">{t("Lien à coller dans OBS")}</label>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className="min-w-[240px] flex-1 truncate rounded-lg bg-surface-raised px-3 py-2 text-sm">{overlayUrl}</code>
          <button
            onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/overlay/${token}`); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            className={btnPlein}
          >
            {copied ? t("Copié ✓") : t("Copier")}
          </button>
          <button onClick={() => fetch("/api/overlay/token", { method: "POST" }).then(() => location.reload())} className={btnVide}>
            {t("Nouveau lien")}
          </button>
        </div>
        <p className="mt-2 text-xs text-ink-muted">
          {t("Gardez ce lien pour vous : qui l’a peut voir votre habillage. « Nouveau lien » rend l’ancien inutilisable.")}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-hairline pt-3">
          <span className="text-sm text-ink-secondary">{t("Pas de caméra ni de cadre ?")}</span>
          <code className="min-w-[220px] flex-1 truncate rounded-lg bg-surface-raised px-3 py-1.5 text-xs">{overlayUrl}?compact=1</code>
          <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/overlay/${token}?compact=1`)} className={btnVide}>
            {t("Copier la version simple")}
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("1. Les joueurs")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {([0, 1] as const).map((i) => {
            const p = state.players[i];
            const pts = i === 0 ? state.points.a : state.points.b;
            const key = i === 0 ? "a" : "b";
            return (
              <div key={i} className="space-y-3 rounded-xl border border-hairline bg-surface p-4">
                <h3 className="text-sm font-semibold text-ink-secondary">{t("Joueur")} {i + 1}</h3>

                <label className="block">
                  <span className="mb-1 block text-xs text-ink-muted">{t("Pseudo")}</span>
                  <input value={p.name} onChange={(e) => setPlayer(i, { name: e.target.value })} placeholder={t("Son pseudo")} className={inputCls} />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs text-ink-muted">{t("Légende")}</span>
                  <select
                    value={p.legendId ?? ""}
                    onChange={(e) => { const l = legends.find((x) => x.id === e.target.value); setPlayer(i, { legendId: l?.id ?? null, legendName: l?.name ?? "", championName: "" }); }}
                    className={inputCls}
                  >
                    <option value="">{t("À choisir…")}</option>
                    {legends.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs text-ink-muted">{t("Champion élu")}</span>
                  <select value={p.championName} onChange={(e) => setPlayer(i, { championName: e.target.value })} className={inputCls} disabled={!p.legendName}>
                    <option value="">{p.legendName ? t("À choisir…") : t("Choisissez d’abord une Légende")}</option>
                    {champs[i].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs text-ink-muted">{t("Champ de bataille en jeu")}</span>
                  <select
                    value={p.battlefields[0] ?? ""}
                    onChange={(e) => setPlayer(i, { battlefields: e.target.value ? [e.target.value] : [] })}
                    className={inputCls}
                  >
                    <option value="">{t("Aucun")}</option>
                    {battlefields.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </label>

                <div className="rounded-lg bg-surface-raised/50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-ink-secondary">{t("Points")}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => update({ points: { [key]: borne(pts - 1, state.maxPoints) } } as never)} disabled={pts <= 0} className={btnStep}>−</button>
                      <span className="w-7 text-center text-base font-bold tabular-nums">{pts}</span>
                      <button onClick={() => update({ points: { [key]: borne(pts + 1, state.maxPoints) } } as never)} disabled={pts >= state.maxPoints} className={btnStep}>+</button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-sm text-ink-secondary">{t("Manches gagnées")}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setPlayer(i, { gamesWon: borne(p.gamesWon - 1, manchesMax) })} disabled={p.gamesWon <= 0} className={btnStep}>−</button>
                      <span className="w-7 text-center text-base font-bold tabular-nums">{p.gamesWon}</span>
                      <button onClick={() => setPlayer(i, { gamesWon: borne(p.gamesWon + 1, manchesMax) })} disabled={p.gamesWon >= manchesMax} className={btnStep}>+</button>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="mb-1 block text-xs text-ink-muted">{t("Caméra (lien VDO.Ninja)")}</span>
                  <div className="flex gap-2">
                    <input
                      value={brouillonCam[i]}
                      onChange={(e) => setBrouillonCam((b) => (i === 0 ? [e.target.value, b[1]] : [b[0], e.target.value]))}
                      placeholder="https://vdo.ninja/?view=..."
                      aria-label={`${t("Caméra (lien VDO.Ninja)")} — ${t("joueur")} ${i + 1}`}
                      className={inputCls}
                    />
                    <button onClick={() => setPlayer(i, { camUrl: brouillonCam[i] })} className={btnPlein}>{t("Charger")}</button>
                    {p.camUrl && (
                      <button
                        onClick={() => { setPlayer(i, { camUrl: "" }); setBrouillonCam((b) => (i === 0 ? ["", b[1]] : [b[0], ""])); }}
                        className={btnVide}
                      >
                        {t("Retirer")}
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">
                    {t("Le son est coupé d’office. Laissez vide si vous posez la caméra vous-même dans OBS.")}
                  </p>
                  {/* py-1 + size-4 : la case seule faisait 13px, sous le
                      minimum de 24px de WCAG 2.5.8 même en comptant le libellé. */}
                  <label className="mt-2 flex items-center gap-2 py-1 text-sm">
                    <input type="checkbox" className="size-4 accent-arcane" checked={p.camEnabled} onChange={(e) => setPlayer(i, { camEnabled: e.target.checked })} />
                    {t("Montrer le cadre caméra")}
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("2. Le match")}</h2>
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-hairline bg-surface p-4 text-sm">
          <label className="block">
            <span className="mb-1 block text-xs text-ink-muted">{t("Format")}</span>
            <select value={state.format} onChange={(e) => update({ format: e.target.value as OverlayStateData["format"] })} className="rounded-lg border border-hairline bg-surface px-3 py-2">
              <option>BO1</option><option>BO3</option><option>BO5</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-ink-muted">{t("Points pour gagner")}</span>
            <select value={state.maxPoints} onChange={(e) => update({ maxPoints: Number(e.target.value) })} className="rounded-lg border border-hairline bg-surface px-3 py-2">
              <option value={8}>8</option><option value={9}>9</option>
            </select>
          </label>
          <label className="block min-w-[180px] flex-1">
            <span className="mb-1 block text-xs text-ink-muted">{t("Ronde affichée")}</span>
            <input value={state.event.round} onChange={(e) => update({ event: { round: e.target.value } })} placeholder={t("TOP 8, Finale…")} className={inputCls} />
          </label>
          <button onClick={() => update({ players: [state.players[1], state.players[0]] as never, points: { a: state.points.b, b: state.points.a } })} className={btnVide}>
            {t("Échanger les joueurs")}
          </button>
          <button onClick={() => update({ points: { a: 0, b: 0 } })} className={btnVide}>{t("Remettre les points à zéro")}</button>
        </div>

        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-hairline bg-surface p-4 text-sm">
          <label className="block">
            <span className="mb-1 block text-xs text-ink-muted">{t("Durée en minutes")}</span>
            <input
              type="number"
              min={1}
              max={180}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="w-28 rounded-lg border border-hairline bg-surface px-3 py-2 tabular-nums"
            />
          </label>
          <button onClick={() => update({ event: { endsAt: new Date(Date.now() + minutes * 60000).toISOString() } })} className={btnPlein}>
            {t("Lancer le chrono")}
          </button>
          <button onClick={() => update({ event: { endsAt: null } })} className={btnVide}>{t("Arrêter")}</button>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="size-4 accent-arcane" checked={state.event.timerVisible !== false} onChange={(e) => update({ event: { timerVisible: e.target.checked } })} />
            {t("Montrer le chrono")}
          </label>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("3. Montrer une carte")}</h2>
        <div className="space-y-3 rounded-xl border border-hairline bg-surface p-4 text-sm">
          <p className="text-xs text-ink-muted">
            {t("Une affiche à gauche, une à droite. Collez une decklist, cochez les cartes à montrer (décochées = ignorées), puis « Afficher ». « Diapo auto » fait tourner les cartes ; sinon les flèches font défiler à la main. Quand une affiche est visible, le chrono et le logo se cachent.")}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {([0, 1] as const).map((i) => {
              const liste = cards.lists[i];
              const ignorees = cards.ignored[i];
              const actives = liste.filter((c) => !ignorees.includes(c));
              const idx = actives.length ? ((cards.index[i] % actives.length) + actives.length) % actives.length : 0;
              return (
                <div key={i} className="space-y-2 rounded-xl border border-hairline bg-surface p-3">
                  <div className="text-xs font-semibold text-ink-muted">{i === 0 ? t("Affiche gauche") : t("Affiche droite")}</div>
                  <textarea
                    value={brouillonDeck[i]}
                    onChange={(e) => setBrouillonDeck((b) => (i === 0 ? [e.target.value, b[1]] : [b[0], e.target.value]))}
                    placeholder={t("Collez une decklist")}
                    aria-label={t("Decklist")}
                    rows={3}
                    className={inputCls + " font-mono text-xs"}
                  />
                  <button
                    onClick={() => {
                      const noms = [...new Set(parseDeckCode(brouillonDeck[i]).entries.map((e) => e.name))];
                      majCards({ lists: paire(cards.lists, i, noms), ignored: paire(cards.ignored, i, []), index: paire(cards.index, i, 0) });
                    }}
                    className={btnPlein}
                  >
                    {t("Charger")} ({liste.length})
                  </button>

                  {liste.length > 0 && (
                    <>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
                        <label className="flex items-center gap-1.5">
                          <input type="checkbox" className="size-4 accent-arcane" checked={cards.visible[i]} onChange={(e) => majCards({ visible: paire(cards.visible, i, e.target.checked) })} />
                          {t("Afficher")}
                        </label>
                        <label className="flex items-center gap-1.5">
                          <input type="checkbox" className="size-4 accent-arcane" checked={cards.auto[i]} onChange={(e) => majCards({ auto: paire(cards.auto, i, e.target.checked) })} />
                          {t("Diapo auto")}
                        </label>
                        {!cards.auto[i] && actives.length > 1 && (
                          <span className="ml-auto flex items-center gap-1">
                            <button onClick={() => majCards({ index: paire(cards.index, i, idx - 1) })} className={btnStep}>‹</button>
                            <span className="tabular-nums text-ink-muted">{idx + 1}/{actives.length}</span>
                            <button onClick={() => majCards({ index: paire(cards.index, i, idx + 1) })} className={btnStep}>›</button>
                          </span>
                        )}
                      </div>
                      <div className="max-h-40 space-y-0.5 overflow-y-auto pr-1">
                        {liste.map((c) => {
                          const coche = !ignorees.includes(c);
                          return (
                            <label key={c} className="flex items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                className="size-3.5 accent-arcane"
                                checked={coche}
                                onChange={(e) => {
                                  const nextIgn = e.target.checked ? ignorees.filter((x) => x !== c) : [...new Set([...ignorees, c])];
                                  majCards({ ignored: paire(cards.ignored, i, nextIgn) });
                                }}
                              />
                              <span className={coche ? "" : "text-ink-muted line-through"}>{c}</span>
                            </label>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <label className="flex items-center gap-2">
              <span className="text-xs text-ink-muted">{t("Durée par carte (diapo auto)")}</span>
              <input
                type="number" min={1} max={60}
                value={cards.seconds}
                onChange={(e) => majCards({ seconds: Math.max(1, Math.min(60, Number(e.target.value) || 5)) })}
                aria-label={t("Durée par carte")}
                className="w-16 rounded-lg border border-hairline bg-surface px-2 py-1"
              />
              <span className="text-xs text-ink-muted">s</span>
            </label>
            <button onClick={() => majCards({ visible: [false, false] })} className={btnVide}>
              {t("Tout masquer")}
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("4. Le tournoi")}</h2>
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-hairline bg-surface p-4 text-sm">
          <label className="block min-w-[180px] flex-1">
            <span className="mb-1 block text-xs text-ink-muted">{t("Nom du tournoi")}</span>
            <input value={state.event.title} onChange={(e) => update({ event: { title: e.target.value } })} placeholder={t("Nom affiché")} className={inputCls} />
          </label>
          <div className="min-w-[280px] flex-1">
            <span className="mb-1 block text-xs text-ink-muted">{t("Logo (lien d’image)")}</span>
            <div className="flex gap-2">
              <input value={brouillonLogo} onChange={(e) => setBrouillonLogo(e.target.value)} placeholder="https://…" aria-label={t("Logo (lien d’image)")} className={inputCls} />
              <button onClick={() => update({ event: { logoUrl: brouillonLogo } })} className={btnPlein}>{t("Charger")}</button>
              {state.event.logoUrl && (
                <button onClick={() => { update({ event: { logoUrl: "" } }); setBrouillonLogo(""); }} className={btnVide}>{t("Retirer")}</button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
