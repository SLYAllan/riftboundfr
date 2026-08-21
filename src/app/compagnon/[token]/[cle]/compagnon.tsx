"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Minus, Plus, RotateCcw } from "lucide-react";
import { useT } from "@/components/i18n-provider";
import { getBannerUrl, getLegendIconUrl } from "@/lib/banners";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  bornerEtape, fusionnerPatchs, memoriserManche, patchPourRestaurerManche,
  type MemoireManche, type PatchCompagnon,
} from "@/lib/overlay-compagnon-client";
import { creerFileEnvoi, type EtatEnvoi } from "@/lib/overlay-envoi";
import { useListesOverlay } from "@/hooks/use-listes-overlay";
import { applyStateUpdate, clampPoints, manchesPourGagner, type OverlayStateData } from "@/lib/overlay";
import styles from "./compagnon.module.css";

const champCls = "w-full min-h-11 rounded-lg border border-hairline bg-surface-raised px-3 py-2.5 text-base text-ink placeholder:text-ink-muted focus:border-arcane/50 focus:outline-none";
const boutonSecondaire = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-hairline bg-surface-raised px-4 py-2 text-sm font-semibold text-ink-secondary transition-colors hover:text-ink active:scale-[0.96]";

function MessageErreurListe({ message, relancer, libelle }: { message?: string; relancer: () => void; libelle: string }) {
  if (!message) return null;
  return <div className="mt-2 flex items-center justify-between gap-3 rounded-lg bg-error/10 p-2 text-xs text-error-light" role="alert">
    <span>{message}</span><button type="button" onClick={relancer} className="min-h-11 shrink-0 font-semibold underline">{libelle}</button>
  </div>;
}

export function Compagnon({ token, cle, initial }: { token: string; cle: string; initial: OverlayStateData }) {
  const t = useT();
  const [state, setState] = useState(initial);
  const [etape, setEtape] = useState<0 | 1 | 2>(0);
  const [enMatch, setEnMatch] = useState(false);
  const [demandeGagnant, setDemandeGagnant] = useState(false);
  const [demandeTerrain, setDemandeTerrain] = useState(false);
  const [derniereManche, setDerniereManche] = useState<MemoireManche | null>(null);
  const [etatEnvoi, setEtatEnvoi] = useState<EtatEnvoi>("a-jour");
  const [erreurEnvoi, setErreurEnvoi] = useState(false);
  const [file] = useState(() => creerFileEnvoi<PatchCompagnon>(
    async (patch) => {
      const reponse = await fetch(`/api/overlay/${token}/compagnon`, {
        method: "POST", headers: { "Content-Type": "application/json", "x-cle-compagnon": cle },
        body: JSON.stringify(patch), keepalive: true,
      });
      if (!reponse.ok) { setErreurEnvoi(true); throw new Error("sauvegarde"); }
      setErreurEnvoi(false);
    },
    // Des patchs, donc on fusionne : sans ça un champ changé entre deux envois
    // disparaîtrait au lieu de partir avec le suivant.
    { combiner: fusionnerPatchs, surEtat: setEtatEnvoi },
  ));

  const legende0 = state.players[0].legendName;
  const legende1 = state.players[1].legendName;
  const {
    legendes, terrains, champions, erreurs: erreursListes,
    chargerLegendes, chargerTerrains, rechargerChampions,
  } = useListesOverlay([legende0, legende1], t("Impossible de charger cette liste."));

  useEffect(() => {
    const auDepart = () => {
      const patch = file.prendreEnAttente();
      if (!patch) return;
      void fetch(`/api/overlay/${token}/compagnon`, {
        method: "POST", headers: { "Content-Type": "application/json", "x-cle-compagnon": cle },
        body: JSON.stringify(patch), keepalive: true,
      });
    };
    window.addEventListener("pagehide", auDepart);
    return () => window.removeEventListener("pagehide", auDepart);
  }, [cle, file, token]);

  function envoyer(patch: PatchCompagnon) {
    setState((courant) => applyStateUpdate(courant, patch));
    file.ajouter(patch);
  }
  function setJoueur(i: 0 | 1, patch: Partial<OverlayStateData["players"][0]>) {
    envoyer({ players: i === 0 ? [patch, {}] : [{}, patch] } as PatchCompagnon);
  }

  const manchesMax = manchesPourGagner(state.format);
  function point(i: 0 | 1, delta: number) {
    const cote = i === 0 ? "a" : "b";
    // Compté depuis l'état le plus frais, pas depuis celui du rendu : deux tapes
    // dans la même image auraient compté un seul point.
    setState((courant) => {
      const valeur = clampPoints(courant.points[cote] + delta, courant.maxPoints);
      const patch = { points: { [cote]: valeur } } as PatchCompagnon;
      file.ajouter(patch);
      return applyStateUpdate(courant, patch);
    });
  }
  function finDeManche(gagnant: 0 | 1) {
    setDerniereManche(memoriserManche(state));
    const manches = Math.min(state.players[gagnant].gamesWon + 1, manchesMax);
    envoyer({
      points: { a: 0, b: 0 },
      players: gagnant === 0 ? [{ gamesWon: manches }, {}] : [{}, { gamesWon: manches }],
    } as PatchCompagnon);
    setDemandeGagnant(false);
    // Le champ de bataille change d'une manche à l'autre, et personne ne pense à
    // revenir aux réglages pour le dire. On le demande quand il sert : entre deux
    // manches, jamais quand le match est joué.
    if (manches < manchesMax) setDemandeTerrain(true);
  }
  function annulerDerniereManche() {
    if (!derniereManche) return;
    envoyer(patchPourRestaurerManche(derniereManche));
    setDerniereManche(null);
  }
  function remettreLesScoresAZero() {
    envoyer({ points: { a: 0, b: 0 }, players: [{ gamesWon: 0 }, { gamesWon: 0 }] } as PatchCompagnon);
    setDerniereManche(null);
  }
  function lancerLaPartie() {
    // TOUJOURS repartir de zéro, même quand rien n'a bougé dans les réglages. Deux
    // joueurs qui rejouent l'un contre l'autre ne retouchent ni les pseudos ni les
    // Légendes : le match précédent dormait alors dans l'état de l'habillage, et le
    // stream repartait avec ses points et ses manches.
    remettreLesScoresAZero();
    setEnMatch(true);
  }

  const retourEnvoi = <div className="flex min-w-0 items-center gap-2">
    <p role="status" aria-live="polite" className="shrink-0 text-xs text-ink-secondary">
      {etatEnvoi === "envoi" ? t("Envoi…") : etatEnvoi === "hors-ligne" ? t("Hors ligne") : t("À jour")}
    </p>
    {etatEnvoi === "hors-ligne" && <button type="button" onClick={() => file.renvoyer()} className="min-h-11 text-xs font-semibold text-error-light underline">{t("Réessayer")}</button>}
  </div>;

  if (!enMatch) return <main className={`${styles.page} bg-canvas px-4 py-6`}>
    <div className="mx-auto max-w-lg space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0"><h1 className="text-2xl font-bold font-display">{t("Compagnon de match")}</h1>
          <p className="mt-1 text-sm text-ink-secondary">{t("Vos changements s’affichent sur le stream dès qu’ils sont enregistrés.")}</p></div>
        {retourEnvoi}
      </header>
      {erreurEnvoi && <p role="alert" className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error-light">{t("Modification non envoyée. Vérifiez votre connexion, puis réessayez.")}</p>}
      <ol className="grid grid-cols-3 gap-2" aria-label={t("Création de la partie")}>
        {[t("Partie"), t("Decks"), t("Vérification")].map((libelle, i) => <li key={libelle} aria-current={i === etape ? "step" : undefined} className={`rounded-full px-2 py-2 text-center text-xs font-semibold ${i === etape ? "bg-arcane text-canvas" : "bg-surface text-ink-muted"}`}>{i + 1}. {libelle}</li>)}
      </ol>

      {etape === 0 && <section aria-labelledby="etape-partie" className="space-y-5">
        <h2 id="etape-partie" className="text-xl font-bold">{t("Créer la partie")}</h2>
        <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
          <label><span className="mb-1 block text-sm text-ink-secondary">{t("Format")}</span><select name="format" autoComplete="off" value={state.format} onChange={(e) => envoyer({ format: e.target.value as OverlayStateData["format"] })} className={champCls}><option>BO1</option><option>BO3</option><option>BO5</option></select></label>
          <label><span className="mb-1 block text-sm text-ink-secondary">{t("Points pour gagner")}</span><select name="points" autoComplete="off" value={state.maxPoints} onChange={(e) => envoyer({ maxPoints: Number(e.target.value) })} className={champCls}><option value={8}>8</option><option value={9}>9</option><option value={10}>10</option></select></label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">{([0, 1] as const).map((i) => <label key={i} className="block rounded-xl border border-hairline bg-surface p-4">
          <span className="mb-2 block text-sm font-semibold">{t("Joueur")} {i + 1}</span><span className="mb-1 block text-xs text-ink-muted">{t("Pseudo du joueur")}</span>
          <input name={`joueur-${i + 1}`} autoComplete="off" value={state.players[i].name} onChange={(e) => setJoueur(i, { name: e.target.value })} placeholder={`${t("Joueur")} ${i + 1}`} className={champCls} />
        </label>)}</div>
      </section>}

      {etape === 1 && <section aria-labelledby="etape-decks" className="space-y-4">
        <h2 id="etape-decks" className="text-xl font-bold">{t("Choisir les decks")}</h2>
        <MessageErreurListe message={erreursListes.legendes} relancer={chargerLegendes} libelle={t("Réessayer")} /><MessageErreurListe message={erreursListes.terrains} relancer={chargerTerrains} libelle={t("Réessayer")} />
        {([0, 1] as const).map((i) => { const joueur = state.players[i]; return <div key={i} className="space-y-3 rounded-xl border border-hairline bg-surface p-4">
          <h3 className="truncate text-base font-semibold">{joueur.name || `${t("Joueur")} ${i + 1}`}</h3>
          <label className="block"><span className="mb-1 block text-xs text-ink-muted">{t("Légende")}</span><select name={`legende-${i + 1}`} autoComplete="off" value={joueur.legendId ?? ""} onChange={(e) => { const l = legendes.find((x) => x.id === e.target.value); setJoueur(i, { legendId: l?.id ?? null, legendName: l?.name ?? "", championName: "" }); }} className={champCls}><option value="">{t("Aucune")}</option>{legendes.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></label>
          <label className="block"><span className="mb-1 block text-xs text-ink-muted">{t("Champion élu")}</span><select name={`champion-${i + 1}`} autoComplete="off" aria-describedby={!joueur.legendName ? `aide-champion-${i}` : undefined} value={joueur.championName} onChange={(e) => setJoueur(i, { championName: e.target.value })} disabled={!joueur.legendName} className={champCls}><option value="">{t("Aucun")}</option>{champions[i].map((c) => <option key={c}>{c}</option>)}</select>{!joueur.legendName && <span id={`aide-champion-${i}`} className="mt-1 block text-xs text-ink-muted">{t("Choisissez d’abord une Légende")}</span>}</label>
          <label className="block"><span className="mb-1 block text-xs text-ink-muted">{t("Champ de bataille")}</span><select name={`terrain-${i + 1}`} autoComplete="off" value={joueur.battlefields[0] ?? ""} onChange={(e) => setJoueur(i, { battlefields: e.target.value ? [e.target.value] : [] })} className={champCls}><option value="">{t("Aucun")}</option>{terrains.map((b) => <option key={b}>{b}</option>)}</select></label>
        </div>; })}
        <MessageErreurListe message={erreursListes.champions} relancer={rechargerChampions} libelle={t("Réessayer")} />
      </section>}

      {etape === 2 && <section aria-labelledby="etape-verification" className="space-y-4">
        <h2 id="etape-verification" className="text-xl font-bold">{t("Vérifier la partie")}</h2>
        <div className="grid gap-3 sm:grid-cols-2">{([0, 1] as const).map((i) => { const joueur = state.players[i]; const icone = getLegendIconUrl(joueur.legendName); return <article key={i} className="flex items-center gap-3 rounded-xl border border-hairline bg-surface p-4">
          {icone && <Image src={icone} alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-lg ring-1 ring-white/10" />}
          <div className="min-w-0"><h3 className="truncate text-lg font-bold">{joueur.name || `${t("Joueur")} ${i + 1}`}</h3><p className="truncate text-sm text-ink-secondary">{joueur.legendName || t("Aucune Légende")}</p>{joueur.championName && <p className="truncate text-xs text-ink-muted">{joueur.championName}</p>}{joueur.battlefields[0] && <p className="truncate text-xs text-ink-muted">{joueur.battlefields[0]}</p>}</div>
        </article>; })}</div><p className="text-center text-sm text-ink-secondary">{state.format} · {state.maxPoints} {t("pts")}</p>
      </section>}

      <nav className="flex items-center justify-between gap-3" aria-label={t("Étapes de création")}>
        {etape > 0 ? <button type="button" onClick={() => setEtape(bornerEtape(etape - 1))} className={boutonSecondaire}><ChevronLeft size={18} aria-hidden />{t("Retour")}</button> : <span />}
        {etape < 2 ? <button type="button" onClick={() => setEtape(bornerEtape(etape + 1))} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-arcane px-5 py-2 font-bold text-canvas active:scale-[0.96]">{t("Continuer")}<ChevronRight size={18} aria-hidden /></button> : <button type="button" onClick={lancerLaPartie} className="min-h-12 rounded-xl bg-gold px-6 py-3 text-base font-bold text-canvas active:scale-[0.96]">{t("Lancer la partie")}</button>}
      </nav>
    </div>
  </main>;

  function panneauJoueur(i: 0 | 1, inverse = false) {
    const joueur = state.players[i]; const points = i === 0 ? state.points.a : state.points.b;
    // Le logo carré de la Légende, celui des grilles de tournoi. La carte entière
    // servait de fond : on lisait son texte de règles derrière le score.
    const icone = getLegendIconUrl(joueur.legendName);
    // La bannière en fond, la même que l'habillage : le panneau est bien plus large
    // que haut, une image carrée y perdrait le dessin des deux côtés. Le voile n'est
    // pas décoratif : le score est un chiffre blanc de 72 px, il doit rester lisible
    // sur n'importe quelle illustration.
    const fond = getBannerUrl(joueur.legendName) ?? icone;
    return <section className={`${styles.joueur} ${inverse ? styles.joueurInverse : ""}`} aria-label={`${t("Joueur")} ${i + 1}`}>
      {fond && <>
        <Image src={fond} alt="" fill sizes="100vw" className="absolute inset-0 -z-10 object-cover object-[50%_35%]" />
        <div className="absolute inset-0 -z-10 bg-canvas/70" />
      </>}
      <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-2 px-4 py-3"><div className="flex w-full min-w-0 flex-col items-center gap-1.5 text-center">{icone && <Image src={icone} alt="" width={56} height={56} className="h-14 w-14 rounded-xl ring-1 ring-white/10" />}<h2 className="truncate text-lg font-bold">{joueur.name || `${t("Joueur")} ${i + 1}`}</h2><p className="truncate text-xs text-ink-secondary">{joueur.championName || joueur.legendName || t("Légende non choisie")}</p>{joueur.battlefields[0] && <p className="truncate text-xs text-ink-muted">{joueur.battlefields[0]}</p>}</div>
        <div className="flex items-center justify-center gap-5"><button type="button" onClick={() => point(i, -1)} disabled={points <= 0} aria-label={`${t("Un point de moins")}, ${joueur.name || `${t("joueur")} ${i + 1}`}`} className={styles.boutonPoint}><Minus size={30} aria-hidden /></button><span className="min-w-24 text-center text-7xl font-black tabular-nums text-white font-display">{points}</span><button type="button" onClick={() => point(i, 1)} disabled={points >= state.maxPoints} aria-label={`${t("Un point de plus")}, ${joueur.name || `${t("joueur")} ${i + 1}`}`} className={styles.boutonPoint}><Plus size={30} aria-hidden /></button></div>
      </div>
    </section>;
  }

  return <main className={`${styles.page} ${styles.match} bg-canvas`}>
    {panneauJoueur(1, true)}
    <div className={styles.barreCentrale}>
      <button type="button" onClick={() => setEnMatch(false)} className={styles.actionCentrale}><ChevronLeft size={17} aria-hidden />{t("Réglages")}</button>
      <div className="flex min-w-0 flex-col items-center"><strong className="text-base tabular-nums">{state.players[0].gamesWon} – {state.players[1].gamesWon}</strong><span className="text-[11px] text-ink-muted">{state.format} · {state.maxPoints} {t("pts")}</span>{retourEnvoi}</div>
      <button type="button" onClick={() => setDemandeGagnant(true)} className="min-h-11 rounded-xl bg-arcane px-3 py-2 text-sm font-bold text-canvas active:scale-[0.96]">{t("Fin de la manche")}</button>
      {derniereManche && <button type="button" onClick={annulerDerniereManche} className={styles.actionCentrale}><RotateCcw size={16} aria-hidden />{t("Annuler la dernière manche")}</button>}
    </div>
    {erreurEnvoi && <div role="alert" className={`${styles.erreurEnvoi} flex items-center justify-center gap-3 bg-error/10 px-3 py-2 text-xs text-error-light`}><span>{t("Modification non envoyée. Vérifiez votre connexion, puis réessayez.")}</span><button type="button" onClick={() => file.renvoyer()} className="min-h-11 font-bold underline">{t("Réessayer")}</button></div>}
    {panneauJoueur(0)}

    <Dialog open={demandeTerrain} onOpenChange={setDemandeTerrain}><DialogContent showCloseButton={false} className="gap-3 bg-surface"><DialogTitle className="text-center text-lg">{t("Champ de bataille de la manche suivante")}</DialogTitle><DialogDescription className="text-center">{t("Chacun choisit le sien. Laissez tel quel si vous rejouez le même.")}</DialogDescription>
      {/* Rien de retourné dans une boîte de dialogue : un menu natif ouvre sa liste
          à l'endroit alors que sa boîte est à l'envers, et plus personne ne sait
          quoi lire. Celui qui prend le téléphone répond pour les deux, chaque
          champ porte le nom de son joueur. */}
      {([0, 1] as const).map((i) => <label key={i} className="block">
        <span className="mb-1 block text-xs text-ink-muted">{state.players[i].name || `${t("Joueur")} ${i + 1}`}</span>
        <select name={`terrain-manche-${i + 1}`} autoComplete="off" value={state.players[i].battlefields[0] ?? ""} onChange={(e) => setJoueur(i, { battlefields: e.target.value ? [e.target.value] : [] })} className={champCls}><option value="">{t("Aucun")}</option>{terrains.map((b) => <option key={b}>{b}</option>)}</select>
      </label>)}
      <MessageErreurListe message={erreursListes.terrains} relancer={chargerTerrains} libelle={t("Réessayer")} />
      <button type="button" onClick={() => setDemandeTerrain(false)} className="min-h-12 rounded-xl bg-gold px-6 py-3 text-base font-bold text-canvas active:scale-[0.96]">{t("Continuer")}</button>
    </DialogContent></Dialog>

    <Dialog open={demandeGagnant} onOpenChange={setDemandeGagnant}><DialogContent showCloseButton={false} className="gap-3 bg-surface"><DialogTitle className="text-center text-lg">{t("Qui a gagné la manche ?")}</DialogTitle><DialogDescription className="text-center">{t("Choisissez le gagnant pour mettre à jour le BO.")}</DialogDescription><button type="button" onClick={() => finDeManche(0)} className="min-h-16 rounded-xl border border-hairline bg-surface-raised px-4 text-base font-bold active:scale-[0.96]">{state.players[0].name || `${t("Joueur")} 1`}</button><button type="button" onClick={() => finDeManche(1)} className="min-h-16 rounded-xl border border-hairline bg-surface-raised px-4 text-base font-bold active:scale-[0.96]">{state.players[1].name || `${t("Joueur")} 2`}</button><button type="button" onClick={() => setDemandeGagnant(false)} className="min-h-11 text-sm text-ink-secondary">{t("Annuler")}</button></DialogContent></Dialog>

  </main>;
}
