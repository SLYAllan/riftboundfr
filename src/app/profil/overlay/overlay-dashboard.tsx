"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AlertTriangle, ArrowLeftRight, Check, Copy, Eraser, KeyRound, Pause, Play, RefreshCw, RotateCcw, Square, Upload, X,
} from "lucide-react";
import { applyStateUpdate, entrelace, type OverlayStateData } from "@/lib/overlay";
import { parseDeckCode } from "@/lib/deck-code";
import { useT } from "@/components/i18n-provider";

type Legend = { id: string; name: string; imageUrl: string | null; domains: string[] };

/**
 * Un lien de logo qui ne finit pas par une extension d'image.
 *
 * On ne peut pas le vérifier pour de vrai depuis cette page : la politique de
 * sécurité n'autorise les images de n'importe quel hôte que sur `/overlay/`, et
 * le proxy d'images est volontairement limité à un seul domaine. Reste la forme
 * du lien, qui suffit à attraper le cas courant : l'adresse de la PAGE au lieu
 * de celle de l'image.
 */
function lienNonImage(url: string): boolean {
  const u = url.trim();
  if (!u) return false;
  return !/\.(png|jpe?g|webp|gif|avif|svg)([?#]|$)/i.test(u);
}

/**
 * Bouton qui demande un second clic avant d'agir.
 *
 * « Nouveau lien » tue le lien collé dans OBS : un clic de trop en pleine
 * diffusion et l'habillage disparaît jusqu'à ce qu'on recolle la source. Rien
 * n'avertissait. L'armement retombe seul au bout de quatre secondes, pour que le
 * bouton ne reste pas piégé pour le clic suivant.
 */
function BoutonConfirme({
  libelle, confirmation, icone, onConfirme, className,
}: {
  libelle: string;
  confirmation: string;
  icone: ReactNode;
  onConfirme: () => void;
  className: string;
}) {
  const [arme, setArme] = useState(false);

  useEffect(() => {
    if (!arme) return;
    const minuteur = setTimeout(() => setArme(false), 4000);
    return () => clearTimeout(minuteur);
  }, [arme]);

  return (
    <button
      onClick={() => { if (arme) { setArme(false); onConfirme(); } else setArme(true); }}
      className={className}
    >
      {arme ? <Check size={15} aria-hidden /> : icone}
      {arme ? confirmation : libelle}
    </button>
  );
}

export function OverlayDashboard({ token, initial }: { token: string; initial: OverlayStateData }) {
  const t = useT();
  const [state, setState] = useState<OverlayStateData>(initial);
  const [legends, setLegends] = useState<Legend[]>([]);
  const [battlefields, setBattlefields] = useState<string[]>([]);
  const [champs, setChamps] = useState<[string[], string[]]>([[], []]);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aEnvoyer = useRef<OverlayStateData | null>(null);

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

  // On envoie l'état ENTIER, pas le patch. Le minuteur d'attente annule l'envoi
  // précédent : tant qu'on postait le patch, tout ce qui avait été changé moins de
  // 300 ms plus tôt partait à la poubelle sans rien dire. « Échanger les joueurs »
  // suivi d'un clic sur un point ne changeait donc rien à l'écran d'OBS, et les
  // modifications suivantes s'appliquaient à l'ancien ordre. Avec l'état entier,
  // le dernier envoi porte tout ce qui a été fait avant lui.
  function update(patch: Parameters<typeof applyStateUpdate>[1]) {
    setState((s) => {
      const next = applyStateUpdate(s, patch);
      aEnvoyer.current = next;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        fetch("/api/overlay/state", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(aEnvoyer.current) });
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
  // Coercition volontaire : un état sauvé sous l'ANCIENNE forme portait `auto` en
  // tableau et pas de `mode`. Sans ça, `?? false` garde le tableau (truthy), le patch
  // repart avec un `auto` tableau, la validation le refuse (400) et plus rien ne se
  // sauve — c'était la panne « les boutons ne réagissent plus ».
  const cards: OverlayStateData["cards"] = {
    lists: state.cards?.lists ?? [[], []],
    ignored: state.cards?.ignored ?? [[], []],
    mode: (["none", "mixed", "split"] as const).includes(state.cards?.mode as never) ? state.cards.mode : "none",
    auto: state.cards?.auto === true,
    index: state.cards?.index ?? [0, 0],
    seconds: typeof state.cards?.seconds === "number" ? state.cards.seconds : 5,
  };
  const paire = <T,>(t: [T, T], i: 0 | 1, v: T): [T, T] => (i === 0 ? [v, t[1]] : [t[0], v]);
  const majCards = (p: Partial<OverlayStateData["cards"]>) => update({ cards: { ...cards, ...p } } as never);
  // Cliquer une carte = la montrer tout de suite, en manuel. Si rien n'est encore
  // affiché, on passe en « un cadre par joueur ». En « mixed » toutes les cartes vont
  // au cadre de droite (index dans le défilé mêlé) ; en « split » chaque joueur a son
  // cadre. La diapo auto se coupe pour rester sur la carte choisie.
  const montrer = (i: 0 | 1, nom: string) => {
    if (cards.mode === "mixed") {
      const pos = entrelace(cards.lists[0], cards.lists[1]).indexOf(nom);
      majCards({ auto: false, index: paire(cards.index, 1, Math.max(0, pos)) });
    } else {
      majCards({ mode: "split", auto: false, index: paire(cards.index, i, Math.max(0, cards.lists[i].indexOf(nom))) });
    }
  };
  // Carte actuellement à l'écran pour le joueur i (pour surligner). En manuel : la
  // carte à l'index de son cadre (gauche = 0, droite = 1 ; en mixed les deux pointent
  // le cadre droit via le défilé mêlé).
  const carteMontree = (i: 0 | 1): string | null => {
    if (cards.mode === "none" || cards.auto) return null;
    if (cards.mode === "mixed") {
      const combine = entrelace(cards.lists[0], cards.lists[1]);
      return combine.length ? combine[((cards.index[1] % combine.length) + combine.length) % combine.length] : null;
    }
    const liste = cards.lists[i];
    return liste.length ? liste[((cards.index[i] % liste.length) + liste.length) % liste.length] : null;
  };
  const manchesMax = state.format === "BO5" ? 3 : state.format === "BO3" ? 2 : 1;
  const borne = (n: number, max: number) => Math.max(0, Math.min(max, n));
  // `text-base sm:text-sm` : sous 16 px, iOS zoome dès qu'on touche un champ et
  // la page part de travers en plein direct. Le 14 px revient dès l'écran large.
  // `min-h-11` : 44 px, la cible tactile minimale — les champs faisaient 38.
  const inputCls =
    "w-full min-h-11 rounded-lg border border-hairline bg-surface px-3 py-2 text-base transition-colors duration-150 focus:border-arcane focus:outline-none sm:text-sm";
  const selectCls = "min-h-11 rounded-lg border border-hairline bg-surface px-3 py-2 text-base sm:text-sm";
  // Un libellé de case à cocher n'est pas qu'un mot : c'est la zone qu'on vise.
  const caseCls = "flex min-h-11 items-center gap-2 text-sm";
  // `disabled:pointer-events-none` : sans ça un bouton grisé s'éclaire encore au
  // survol et se ratatine au clic. Il a l'air de marcher et ne fait rien.
  // `min-h-11` : 44 px, la cible tactile minimale. On pilote un stream depuis un
  // téléphone posé à côté du tapis, avec des boutons de 36 px on rate.
  const btnStep =
    "flex size-11 items-center justify-center rounded-lg border border-hairline text-base tabular-nums transition-[background-color,scale] duration-150 hover:bg-surface-raised active:scale-[0.96] disabled:pointer-events-none disabled:opacity-30";
  const btnBase =
    "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition-[background-color,scale] duration-150 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-40";
  const btnPlein = `${btnBase} bg-arcane font-medium text-canvas hover:bg-arcane/90`;
  const btnVide = `${btnBase} border border-hairline hover:bg-surface-raised`;
  // Fond neutre, texte rouge : la règle d'interface du dépôt interdit le fond
  // teinté sous un texte de la même couleur. Ce qui casse quelque chose se
  // distingue quand même de ce qui ne casse rien.
  // `error-light` et pas `error` : le rouge plein tombait à 4,16:1 sur ce fond,
  // sous les 4,5:1 exigés. Mesuré en composant le fond translucide, pas déduit.
  const btnDanger = `${btnBase} border border-hairline text-error-light hover:bg-surface-raised`;

  const [minutes, setMinutes] = useState(50);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <header>
        <h1 className="text-balance text-3xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
          {t("Overlay de stream")}
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
          {/* Largeur fixée : « Copier » et « Copié » n'ont pas la même longueur,
              et le bouton sautait sous le curseur au moment du clic. */}
          <button
            onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/overlay/${token}`); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            className={`${btnPlein} min-w-[7.5rem]`}
          >
            {copied ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
            {copied ? t("Copié") : t("Copier")}
          </button>
          <BoutonConfirme
            libelle={t("Nouveau lien")}
            confirmation={t("Confirmer ?")}
            icone={<KeyRound size={15} aria-hidden />}
            onConfirme={() => { fetch("/api/overlay/token", { method: "POST" }).then(() => location.reload()); }}
            className={btnDanger}
          />
        </div>
        <p className="mt-2 text-xs text-ink-muted">
          {t("Gardez ce lien pour vous : qui l’a peut voir votre habillage. « Nouveau lien » rend l’ancien inutilisable.")}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-hairline pt-3">
          <span className="text-sm text-ink-secondary">{t("Pas de caméra ni de cadre ?")}</span>
          <code className="min-w-[220px] flex-1 truncate rounded-lg bg-surface-raised px-3 py-1.5 text-xs">{overlayUrl}?compact=1</code>
          <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/overlay/${token}?compact=1`)} className={btnVide}>
            <Copy size={15} aria-hidden />
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
                      <button aria-label={`${t("Un point de moins")}, ${t("joueur")} ${i + 1}`} onClick={() => update({ points: { [key]: borne(pts - 1, state.maxPoints) } } as never)} disabled={pts <= 0} className={btnStep}>−</button>
                      <span className="w-7 text-center text-base font-bold tabular-nums">{pts}</span>
                      <button aria-label={`${t("Un point de plus")}, ${t("joueur")} ${i + 1}`} onClick={() => update({ points: { [key]: borne(pts + 1, state.maxPoints) } } as never)} disabled={pts >= state.maxPoints} className={btnStep}>+</button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-sm text-ink-secondary">{t("Manches gagnées")}</span>
                    <div className="flex items-center gap-2">
                      <button aria-label={`${t("Une manche de moins")}, ${t("joueur")} ${i + 1}`} onClick={() => setPlayer(i, { gamesWon: borne(p.gamesWon - 1, manchesMax) })} disabled={p.gamesWon <= 0} className={btnStep}>−</button>
                      <span className="w-7 text-center text-base font-bold tabular-nums">{p.gamesWon}</span>
                      <button aria-label={`${t("Une manche de plus")}, ${t("joueur")} ${i + 1}`} onClick={() => setPlayer(i, { gamesWon: borne(p.gamesWon + 1, manchesMax) })} disabled={p.gamesWon >= manchesMax} className={btnStep}>+</button>
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
                      aria-label={`${t("Caméra (lien VDO.Ninja)")}, ${t("joueur")} ${i + 1}`}
                      className={inputCls}
                    />
                    <button onClick={() => setPlayer(i, { camUrl: brouillonCam[i] })} disabled={!brouillonCam[i].trim()} className={btnPlein}>
                      <Upload size={15} aria-hidden />
                      {t("Charger")}
                    </button>
                    {p.camUrl && (
                      <>
                        {/* Un VDO.Ninja qui gèle ne repart pas seul : jusqu'ici il
                            fallait retirer le lien puis le recoller en direct. */}
                        <button onClick={() => setPlayer(i, { camNonce: Date.now() })} className={btnVide}>
                          <RefreshCw size={15} aria-hidden />
                          {t("Relancer")}
                        </button>
                        <button
                          onClick={() => { setPlayer(i, { camUrl: "" }); setBrouillonCam((b) => (i === 0 ? ["", b[1]] : [b[0], ""])); }}
                          className={btnDanger}
                        >
                          <X size={15} aria-hidden />
                          {t("Retirer")}
                        </button>
                      </>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">
                    {t("Le son est coupé d’office. Laissez vide si vous posez la caméra vous-même dans OBS.")}
                  </p>
                  {/* py-1 + size-4 : la case seule faisait 13px, sous le
                      minimum de 24px de WCAG 2.5.8 même en comptant le libellé. */}
                  <label className={"mt-2 " + caseCls}>
                    <input type="checkbox" className="size-4 accent-arcane" checked={p.camBackground ?? false} onChange={(e) => setPlayer(i, { camBackground: e.target.checked })} />
                    {t("Fond de webcam (sans caméra)")}
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
            <select value={state.format} onChange={(e) => update({ format: e.target.value as OverlayStateData["format"] })} className={selectCls}>
              <option>BO1</option><option>BO3</option><option>BO5</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-ink-muted">{t("Points pour gagner")}</span>
            <select value={state.maxPoints} onChange={(e) => update({ maxPoints: Number(e.target.value) })} className={selectCls}>
              <option value={8}>8</option><option value={9}>9</option><option value={10}>10</option>
            </select>
          </label>
          {/* Cacher les points sans les perdre : hors match (démo, deck tech, pause)
              le score n'a rien à faire à l'écran, mais il doit revenir tel quel. */}
          <label className={caseCls}>
            <input type="checkbox" className="size-4 accent-arcane" checked={state.event.pointsVisible !== false} onChange={(e) => update({ event: { pointsVisible: e.target.checked } })} />
            {t("Montrer les points")}
          </label>
          <label className="block min-w-[180px] flex-1">
            <span className="mb-1 block text-xs text-ink-muted">{t("Ronde affichée")}</span>
            <input value={state.event.round} onChange={(e) => update({ event: { round: e.target.value } })} placeholder={t("TOP 8, Finale…")} className={inputCls} />
          </label>
          <button
            onClick={() =>
              update({
                players: [state.players[1], state.players[0]] as never,
                points: { a: state.points.b, b: state.points.a },
                // Les decklists sont rangées par joueur : on les permute aussi, sinon
                // les cartes restent chez l'ancien camp après l'échange.
                cards: { ...cards, lists: [cards.lists[1], cards.lists[0]], ignored: [cards.ignored[1], cards.ignored[0]], index: [cards.index[1], cards.index[0]] },
              })
            }
            className={btnVide}
          >
            <ArrowLeftRight size={15} aria-hidden />
            {t("Échanger les joueurs")}
          </button>
          <button onClick={() => update({ points: { a: 0, b: 0 } })} className={btnVide}>
            <RotateCcw size={15} aria-hidden />
            {t("Remettre les points à zéro")}
          </button>
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
              className="w-28 min-h-11 rounded-lg border border-hairline bg-surface px-3 py-2 text-base tabular-nums sm:text-sm"
            />
          </label>
          <button onClick={() => update({ event: { endsAt: new Date(Date.now() + minutes * 60000).toISOString(), paused: null } })} className={btnPlein}>
            <Play size={15} aria-hidden />
            {t("Lancer le chrono")}
          </button>
          {state.event.paused == null ? (
            <button
              onClick={() => update({ event: { paused: state.event.endsAt ? Math.max(0, Math.floor((new Date(state.event.endsAt).getTime() - Date.now()) / 1000)) : 0 } })}
              disabled={!state.event.endsAt}
              className={btnVide}
            >
              <Pause size={15} aria-hidden />
              {t("Pause")}
            </button>
          ) : (
            <button
              onClick={() => update({ event: { endsAt: new Date(Date.now() + (state.event.paused ?? 0) * 1000).toISOString(), paused: null } })}
              className={btnPlein}
            >
              <Play size={15} aria-hidden />
              {t("Reprendre")}
            </button>
          )}
          <button onClick={() => update({ event: { endsAt: null, paused: null } })} disabled={!state.event.endsAt && state.event.paused == null} className={btnVide}>
            <Square size={15} aria-hidden />
            {t("Arrêter")}
          </button>
          <label className={caseCls}>
            <input type="checkbox" className="size-4 accent-arcane" checked={state.event.timerVisible !== false} onChange={(e) => update({ event: { timerVisible: e.target.checked } })} />
            {t("Montrer le chrono")}
          </label>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("3. Montrer une carte")}</h2>
        <div className="space-y-4 rounded-xl border border-hairline bg-surface p-4 text-sm">
          <p className="text-xs text-ink-muted">
            {t("Colle une decklist par joueur (les terrains sont retirés du défilé). Choisis l’affichage, puis clique une carte pour la montrer. « Diapo auto » les fait tourner tout seul ; sinon tu choisis au clic. « Deux cadres » cache le chrono et le logo à gauche.")}
          </p>

          {/* Tous les réglages ensemble : quel affichage, diapo auto, durée. */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <label className={caseCls}>
              <span className="text-xs text-ink-muted">{t("Affichage")}</span>
              <select
                value={cards.mode}
                onChange={(e) => majCards({ mode: e.target.value as OverlayStateData["cards"]["mode"] })}
                aria-label={t("Affichage des cartes")}
                className={selectCls + " transition-colors duration-150 focus:border-arcane focus:outline-none"}
              >
                <option value="none">{t("Rien")}</option>
                <option value="mixed">{t("Un cadre, les 2 decks à droite")}</option>
                <option value="split">{t("Deux cadres, un par joueur")}</option>
              </select>
            </label>
            <label className={caseCls}>
              <input type="checkbox" className="size-4 accent-arcane" checked={cards.auto} onChange={(e) => majCards({ auto: e.target.checked })} />
              {t("Diapo auto")}
            </label>
            {cards.auto && (
              <label className={caseCls}>
                <span className="text-xs text-ink-muted">{t("Durée par carte")}</span>
                <input
                  type="number" min={1} max={60}
                  value={cards.seconds}
                  onChange={(e) => majCards({ seconds: Math.max(1, Math.min(60, Number(e.target.value) || 5)) })}
                  aria-label={t("Durée par carte")}
                  className="w-16 rounded-lg border border-hairline bg-surface px-2 py-1 tabular-nums transition-colors duration-150 focus:border-arcane focus:outline-none"
                />
                <span className="text-xs text-ink-muted">s</span>
              </label>
            )}
            <BoutonConfirme
              libelle={t("Vider les decklists")}
              confirmation={t("Confirmer ?")}
              icone={<Eraser size={15} aria-hidden />}
              onConfirme={() => { setBrouillonDeck(["", ""]); majCards({ lists: [[], []], ignored: [[], []], index: [0, 0], mode: "none" }); }}
              className={btnDanger + " ml-auto"}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {([0, 1] as const).map((i) => {
              const liste = cards.lists[i];
              const ignorees = cards.ignored[i];
              const montree = carteMontree(i);
              return (
                <div key={i} className="space-y-2 rounded-xl border border-hairline bg-surface p-3">
                  <div className="text-xs font-semibold text-ink-muted">{i === 0 ? t("Joueur 1 (gauche)") : t("Joueur 2 (droite)")}</div>
                  <textarea
                    value={brouillonDeck[i]}
                    onChange={(e) => setBrouillonDeck((b) => (i === 0 ? [e.target.value, b[1]] : [b[0], e.target.value]))}
                    placeholder={t("Collez une decklist")}
                    aria-label={t("Decklist")}
                    rows={3}
                    className={inputCls + " font-mono text-base sm:text-xs"}
                  />
                  <button
                    onClick={() => {
                      // On ne garde que les cartes à montrer. On retire : les terrains
                      // (liste des champs de bataille), la Légende (elle est déjà sur la
                      // bannière) et les runes (une ressource, pas une carte du deck).
                      const legendes = new Set(legends.map((l) => l.name));
                      const noms = [...new Set(parseDeckCode(brouillonDeck[i]).entries.map((e) => e.name))].filter(
                        (n) => !battlefields.includes(n) && !legendes.has(n) && !/ Rune$/i.test(n),
                      );
                      majCards({ lists: paire(cards.lists, i, noms), ignored: paire(cards.ignored, i, []), index: paire(cards.index, i, 0) });
                    }}
                    disabled={!brouillonDeck[i].trim()}
                    className={btnPlein}
                  >
                    <Upload size={15} aria-hidden />
                    {t("Charger")} ({liste.length})
                  </button>

                  {liste.length > 0 && (
                    // Relevé de 208 à 288 px : avec des lignes à 36 px, la hauteur
                    // d'avant coupait un nom en deux au bas du cadre.
                    <div className="max-h-72 space-y-0.5 overflow-y-auto pr-1">
                      {liste.map((c) => {
                        const exclue = ignorees.includes(c);
                        return (
                          <div key={c} className="flex min-h-9 items-center gap-2">
                            {/* En diapo auto seulement : décocher retire la carte du
                                défilé. En manuel on clique le nom pour la montrer. */}
                            {cards.auto && (
                              <input
                                type="checkbox"
                                className="size-4 accent-arcane"
                                checked={!exclue}
                                aria-label={`${t("Garder dans la diapo")} : ${c}`}
                                onChange={(e) => {
                                  const nextIgn = e.target.checked ? ignorees.filter((x) => x !== c) : [...new Set([...ignorees, c])];
                                  majCards({ ignored: paire(cards.ignored, i, nextIgn) });
                                }}
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => montrer(i, c)}
                              // La liste des cartes se clique en plein match : une
                              // ligne de 24 px se rate au doigt. 36 px, et la liste
                              // reste dans son cadre qui défile.
                              className={`min-h-9 flex-1 truncate rounded px-2 py-2 text-left text-xs transition-colors duration-150 ${
                                c === montree ? "bg-arcane/15 font-medium text-ink" : "text-ink-secondary hover:bg-surface-raised"
                              } ${cards.auto && exclue ? "text-ink-muted line-through" : ""}`}
                            >
                              {c}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("4. Le tournoi")}</h2>
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-hairline bg-surface p-4 text-sm">
          <label className="block min-w-[220px] flex-1">
            <span className="mb-1 block text-xs text-ink-muted">{t("Nom du tournoi")}</span>
            {/* Zone de texte plutôt qu'une ligne : le titre s'affiche en gros et peut
                tenir sur deux lignes à l'écran ; un retour à la ligne tapé ici est gardé. */}
            <textarea
              value={state.event.title}
              onChange={(e) => update({ event: { title: e.target.value } })}
              placeholder={t("Nom affiché (deux lignes possibles)")}
              rows={2}
              className={inputCls + " resize-none"}
            />
          </label>
          <div className="min-w-[280px] flex-1">
            <span className="mb-1 block text-xs text-ink-muted">{t("Logo (lien d’image)")}</span>
            <div className="flex gap-2">
              <input value={brouillonLogo} onChange={(e) => setBrouillonLogo(e.target.value)} placeholder="https://…" aria-label={t("Logo (lien d’image)")} className={inputCls} />
              <button onClick={() => update({ event: { logoUrl: brouillonLogo } })} disabled={!brouillonLogo.trim()} className={btnPlein}>
                <Upload size={15} aria-hidden />
                {t("Charger")}
              </button>
              {state.event.logoUrl && (
                <button onClick={() => { update({ event: { logoUrl: "" } }); setBrouillonLogo(""); }} className={btnDanger}>
                  <X size={15} aria-hidden />
                  {t("Retirer")}
                </button>
              )}
            </div>
            {/* Une adresse de PAGE collée ici ne montre rien à l'écran et rien ne le
                disait : le cadre du logo restait vide sans un mot. La règle du dépôt
                est de ne jamais avaler une donnée qui ne passe pas. */}
            {lienNonImage(brouillonLogo.trim() || state.event.logoUrl || "") && (
              <p role="status" className="mt-2 flex items-start gap-1.5 text-xs text-warning">
                <AlertTriangle size={14} className="mt-px shrink-0" aria-hidden />
                {t("Ce lien ne pointe pas vers un fichier image (.png, .jpg, .webp) : rien ne s’affichera. Sur la page de l’image, faites un clic droit puis « Copier l’adresse de l’image ».")}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
