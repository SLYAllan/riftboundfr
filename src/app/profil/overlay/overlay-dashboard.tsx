"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AlertTriangle, ArrowLeftRight, ArrowUp, Check, Copy, Download, Eraser, ExternalLink, KeyRound, Pause, Play, RefreshCw, RotateCcw, Square, Upload, X,
} from "lucide-react";
import { applyStateUpdate, entrelace, manchesPourGagner, COTE_MAX_MEDIA, TYPES_IMAGE, type GenreMedia, type OverlayStateData } from "@/lib/overlay";
import { creerFileEtats } from "@/lib/overlay-dashboard-client";
import { normaliserLienCamera } from "@/lib/overlay-cam";
import { parseDeckCode } from "@/lib/deck-code";
import { useLien, useT } from "@/components/i18n-provider";

type Legend = { id: string; name: string; imageUrl: string | null; domains: string[] };

/** Où vit l'adresse du décor envoyé, selon le mode auquel il sert. */
function cleFond(genre: GenreMedia): "backgroundUrl" | "backgroundNocamUrl" {
  return genre === "backgroundNocam" ? "backgroundNocamUrl" : "backgroundUrl";
}

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
  // Un logo envoyé depuis un fichier est servi par notre API, sans extension dans
  // l'adresse. L'avertissement tomberait à tort sur lui.
  if (u.startsWith("/api/overlay/")) return false;
  return !/\.(png|jpe?g|webp|gif|avif|svg)([?#]|$)/i.test(u);
}

/**
 * Réduit une image choisie sur le disque avant de l'envoyer.
 *
 * Le logo s'affiche dans un cadre de 275x184 : une photo de quatre méga-octets
 * n'apporte rien à l'écran. Le décor, lui, garde ses 1920 px : il se pose au pixel
 * près sur les découpes du gabarit, le réduire décalerait tout. On redessine en WebP,
 * qui garde la transparence — un décor sans transparence bouche la zone de jeu.
 * Un fichier déjà léger part tel quel : ça garde un GIF animé animé.
 */
async function preparerImage(fichier: File, cote: number): Promise<Blob> {
  if (fichier.size <= 400 * 1024 && TYPES_IMAGE.includes(fichier.type)) return fichier;
  const image = await createImageBitmap(fichier);
  const facteur = Math.min(1, cote / Math.max(image.width, image.height));
  const largeur = Math.max(1, Math.round(image.width * facteur));
  const hauteur = Math.max(1, Math.round(image.height * facteur));
  const toile = document.createElement("canvas");
  toile.width = largeur;
  toile.height = hauteur;
  const ctx = toile.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(image, 0, 0, largeur, hauteur);
  image.close();
  return new Promise((resoudre, rejeter) => {
    toile.toBlob((b) => (b ? resoudre(b) : rejeter(new Error("blob"))), "image/webp", 0.92);
  });
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
      aria-live="polite"
      className={className}
    >
      {arme ? <Check size={15} aria-hidden /> : icone}
      {arme ? confirmation : libelle}
    </button>
  );
}

export function OverlayDashboard({ token, cleCompagnon, initial }: { token: string; cleCompagnon: string; initial: OverlayStateData }) {
  const t = useT();
  // Les trois adresses portent le préfixe de langue de CETTE page. Un streamer
  // anglophone copiait sinon un lien français : son habillage et le compagnon de
  // ses joueurs démarraient en français, sans qu'il puisse rien y faire.
  const lien = useLien();
  const [state, setState] = useState<OverlayStateData>(initial);
  const [legends, setLegends] = useState<Legend[]>([]);
  const [battlefields, setBattlefields] = useState<string[]>([]);
  const [champs, setChamps] = useState<[string[], string[]]>([[], []]);
  const [copied, setCopied] = useState(false);
  const [copieCompagnon, setCopieCompagnon] = useState<"repos" | "copie" | "erreur">("repos");
  const [origin, setOrigin] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const etatDiffere = useRef<OverlayStateData | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [fileSauvegarde] = useState(() => creerFileEtats<OverlayStateData>(async (etat) => {
    try {
      const reponse = await fetch("/api/overlay/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(etat),
        keepalive: true,
      });
      if (!reponse.ok) {
        const corps = await reponse.json().catch(() => ({}) as { error?: string });
        setErreur(corps.error ?? `${t("Le serveur a refusé la sauvegarde.")} (${reponse.status})`);
        throw new Error("sauvegarde");
      }
      setErreur(null);
    } catch (cause) {
      if (cause instanceof Error && cause.message === "sauvegarde") throw cause;
      setErreur(t("Connexion perdue : rien n’est parti à l’écran."));
      throw cause;
    }
  }));

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

  useEffect(() => {
    const auDepart = () => {
      if (!etatDiffere.current) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      fileSauvegarde.ajouter(etatDiffere.current);
      etatDiffere.current = null;
    };
    window.addEventListener("pagehide", auDepart);
    return () => window.removeEventListener("pagehide", auDepart);
  }, [fileSauvegarde]);

  // Le dernier état porte tout ce qui précède, et la file attend la réponse avant
  // d'envoyer le suivant. Deux POST pleins ne peuvent donc plus s'écraser à l'envers.
  function update(patch: Parameters<typeof applyStateUpdate>[1]) {
    setState((s) => {
      const next = applyStateUpdate(s, patch);
      etatDiffere.current = next;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        etatDiffere.current = null;
        fileSauvegarde.ajouter(next);
      }, 300);
      return next;
    });
  }

  const overlayUrl = `${origin}${lien(`/overlay/${token}`)}`;
  const urlCompact = `${overlayUrl}?compact=1`;
  const urlCompagnon = `${origin}${lien(`/compagnon/${token}/${cleCompagnon}`)}`;

  async function copierCompagnon() {
    try {
      await navigator.clipboard.writeText(urlCompagnon);
      setCopieCompagnon("copie");
      setTimeout(() => setCopieCompagnon("repos"), 1500);
    } catch {
      setCopieCompagnon("erreur");
    }
  }

  function setPlayer(i: 0 | 1, p: Partial<OverlayStateData["players"][0]>) {
    update({ players: i === 0 ? [p, {}] : [{}, p] } as never);
  }

  const [brouillonCam, setBrouillonCam] = useState<[string, string]>(["", ""]);
  const [brouillonLogo, setBrouillonLogo] = useState("");
  const fichierLogo = useRef<HTMLInputElement | null>(null);
  const fichierFond = useRef<HTMLInputElement | null>(null);
  const [envoi, setEnvoi] = useState<GenreMedia | null>(null);
  const [erreurMedia, setErreurMedia] = useState<string | null>(null);
  const sansCam = state.event.layout === "nocam";
  const genreFond: GenreMedia = sansCam ? "backgroundNocam" : "background";

  // Envoi d'une image depuis le disque : le logo du tournoi, ou le décor entier. Le
  // fichier est réduit dans le navigateur, puis posé en base ; l'état ne porte que son
  // adresse. Y mettre l'image elle-même ferait repasser des dizaines de kilo-octets à
  // chaque relecture de l'habillage, toutes les 1,5 s, pendant toute la diffusion.
  async function envoyerMedia(genre: GenreMedia, fichier: File) {
    setErreurMedia(null);
    setEnvoi(genre);
    try {
      const corps = await preparerImage(fichier, COTE_MAX_MEDIA[genre]);
      const r = await fetch(`/api/overlay/media?kind=${genre}`, { method: "POST", headers: { "Content-Type": corps.type }, body: corps });
      const corpsReponse = (await r.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!r.ok || !corpsReponse.url) {
        setErreurMedia(corpsReponse.error ?? `${t("L’envoi de l’image a échoué.")} (${r.status})`);
        return;
      }
      if (genre === "logo") {
        setBrouillonLogo("");
        update({ event: { logoUrl: corpsReponse.url } });
      } else {
        update({ event: { [cleFond(genre)]: corpsReponse.url } });
      }
    } catch {
      setErreurMedia(t("L’envoi de l’image a échoué."));
    } finally {
      setEnvoi(null);
      const champ = genre === "logo" ? fichierLogo : fichierFond;
      if (champ.current) champ.current.value = "";
    }
  }

  /** Retire une image envoyée : l'adresse dans l'état, et les octets en base. */
  function retirerMedia(genre: GenreMedia) {
    update({ event: genre === "logo" ? { logoUrl: "" } : { [cleFond(genre)]: "" } });
    if (genre === "logo") setBrouillonLogo("");
    void fetch(`/api/overlay/media?kind=${genre}`, { method: "DELETE" }).catch(() => {});
  }
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
  // Carte actuellement à l'écran pour le joueur i (pour surligner). En manuel : la
  // carte à l'index de son cadre (gauche = 0, droite = 1 ; en mixed les deux pointent
  // le cadre droit via le défilé mêlé). Un index négatif = cadre vidé à la main.
  const carteMontree = (i: 0 | 1): string | null => {
    if (cards.mode === "none" || cards.auto) return null;
    if (cards.mode === "mixed") {
      const combine = entrelace(cards.lists[0], cards.lists[1]);
      return combine.length && cards.index[1] >= 0 ? combine[cards.index[1] % combine.length] : null;
    }
    const liste = cards.lists[i];
    return liste.length && cards.index[i] >= 0 ? liste[cards.index[i] % liste.length] : null;
  };
  // Cliquer une carte = la montrer tout de suite, en manuel. Si rien n'est encore
  // affiché, on passe en « un cadre par joueur ». En « mixed » toutes les cartes vont
  // au cadre de droite (index dans le défilé mêlé) ; en « split » chaque joueur a son
  // cadre. La diapo auto se coupe pour rester sur la carte choisie.
  //
  // RECLIQUER la carte déjà à l'écran la retire : l'index du cadre passe à -1 et
  // l'overlay n'affiche plus rien. Sans ça il fallait laisser la carte en place plus
  // longtemps que voulu, ou changer de mode pour libérer le cadre.
  const montrer = (i: 0 | 1, nom: string) => {
    const cadre: 0 | 1 = cards.mode === "mixed" ? 1 : i;
    if (carteMontree(i) === nom) {
      majCards({ auto: false, index: paire(cards.index, cadre, -1) });
      return;
    }
    if (cards.mode === "mixed") {
      const pos = entrelace(cards.lists[0], cards.lists[1]).indexOf(nom);
      majCards({ auto: false, index: paire(cards.index, 1, Math.max(0, pos)) });
    } else {
      majCards({ mode: "split", auto: false, index: paire(cards.index, i, Math.max(0, cards.lists[i].indexOf(nom))) });
    }
  };

  // Recherche d'une carte à montrer sans coller de decklist : « c'est quoi cette
  // carte ? » pendant un commentaire. On ne charge la base de cartes qu'au premier
  // usage du champ — un tableau de bord ouvert toute la journée n'a pas à la tirer
  // pour rien.
  const [cartes, setCartes] = useState<{ name: string; imageUrl: string | null }[] | null>(null);
  const [chargeCartes, setChargeCartes] = useState(false);
  const [rechCarte, setRechCarte] = useState("");

  function chargerCartes() {
    if (cartes || chargeCartes) return;
    setChargeCartes(true);
    fetch("/api/cards")
      .then((r) => r.json())
      .then((liste: { name: string; imageUrl: string | null }[]) => {
        // Une même carte revient en plusieurs éditions : on garde un nom une fois.
        const parNom = new Map<string, { name: string; imageUrl: string | null }>();
        for (const c of liste) if (!parNom.has(c.name)) parNom.set(c.name, { name: c.name, imageUrl: c.imageUrl });
        setCartes([...parNom.values()]);
      })
      .catch(() => {})
      .finally(() => setChargeCartes(false));
  }

  const resultatsCartes = (() => {
    const q = rechCarte.trim().toLowerCase();
    if (!cartes || q.length < 2) return [];
    return cartes.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 8);
  })();

  // La carte cherchée rejoint la liste du joueur 1 (celle qui alimente le cadre) et
  // passe à l'écran. Tout part en UNE sauvegarde : ajouter puis appeler `montrer`
  // relirait la liste d'avant, et l'index tomberait à côté.
  function montrerCarteCherchee(nom: string) {
    const lists: [string[], string[]] = cards.lists[0].includes(nom)
      ? cards.lists
      : [[...cards.lists[0], nom], cards.lists[1]];
    const mode = cards.mode === "none" ? "mixed" : cards.mode;
    const cadre: 0 | 1 = mode === "mixed" ? 1 : 0;
    const pos = mode === "mixed" ? entrelace(lists[0], lists[1]).indexOf(nom) : lists[0].indexOf(nom);
    majCards({ lists, mode, auto: false, index: paire(cards.index, cadre, Math.max(0, pos)) });
    setRechCarte("");
  }

  const manchesMax = manchesPourGagner(state.format);
  const borne = (n: number, max: number) => Math.max(0, Math.min(max, n));
  // `text-base sm:text-sm` : sous 16 px, iOS zoome dès qu'on touche un champ et
  // la page part de travers en plein direct. Le 14 px revient dès l'écran large.
  // `min-h-11` : 44 px, la cible tactile minimale — les champs faisaient 38.
  const inputCls =
    "w-full min-h-11 rounded-lg border border-hairline bg-surface px-3 py-2 text-base transition-colors duration-150 focus:border-arcane focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane sm:text-sm";
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

      {/* Fond neutre, texte rouge : la règle d'interface interdit le fond teinté sous
          un texte de la même couleur. */}
      {erreur && (
        <div role="alert" className="flex flex-wrap items-center gap-2 rounded-xl border border-hairline bg-surface p-4 text-sm text-error-light">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden />
          <span>
            <strong className="font-semibold">{t("Rien n’est enregistré.")}</strong> {erreur}{" "}
            {t("L’écran d’OBS montre toujours l’état d’avant.")}
          </span>
          <button type="button" onClick={() => fileSauvegarde.relancer()} className={`${btnVide} ml-auto`}>
            <RefreshCw size={15} aria-hidden />{t("Réessayer")}
          </button>
        </div>
      )}

      {/* `open` : ce bloc porte le mode d'emploi de la première fois, le lien à coller
          dans OBS et le lien du compagnon. Replié d'office, un nouveau venu ouvrait la
          page et n'y trouvait rien à faire. Il se replie une fois le stream monté. */}
      <details open className="group rounded-xl border border-hairline bg-surface">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-semibold">
          <span>{t("Liens et affichage OBS")}</span>
          <span className="text-sm font-normal text-ink-muted group-open:hidden">{t("Ouvrir")}</span>
          <span className="hidden text-sm font-normal text-ink-muted group-open:inline">{t("Fermer")}</span>
        </summary>
        <div className="space-y-4 border-t border-hairline p-4">
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
        <h2 className="text-sm font-semibold">{t("Lien à coller dans OBS")}</h2>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className="min-w-[240px] flex-1 truncate rounded-lg bg-surface-raised px-3 py-2 text-sm">{overlayUrl}</code>
          {/* Largeur fixée : « Copier » et « Copié » n'ont pas la même longueur,
              et le bouton sautait sous le curseur au moment du clic. */}
          <button
            onClick={() => { navigator.clipboard.writeText(overlayUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
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

        <p role="status" aria-live="polite" className="sr-only">{copied ? t("Copié") : ""}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-hairline pt-3">
          <span className="text-sm text-ink-secondary">{t("Décor")}</span>
          <select
            value={sansCam ? "nocam" : "cams"}
            onChange={(e) => update({ event: { layout: e.target.value as "cams" | "nocam" } })}
            aria-label={t("Décor")}
            className={selectCls}
          >
            <option value="cams">{t("Avec cadres caméra")}</option>
            <option value="nocam">{t("Sans cadres caméra")}</option>
          </select>
          <p className="w-full text-xs text-ink-muted">
            {t("Prenez « sans cadres » si vous n’avez qu’une caméra de plateau : les deux cadres portrait disparaissent et la Légende prend la place.")}
          </p>
          {/* Décor maison. Le gabarit est fourni juste à côté : sans lui, une image
              quelconque décale tout, parce que les découpes doivent tomber au pixel
              près sur les cases que le code remplit. */}
          {/* Le décor envoyé vaut pour le mode CHOISI juste au-dessus : les deux
              gabarits n'ont pas les mêmes découpes, un seul fond pour les deux
              tomberait à côté. On garde donc les deux, et on montre celui du mode
              courant. */}
          <div className="flex w-full flex-wrap items-center gap-2 border-t border-hairline pt-3">
            <span className="text-sm text-ink-secondary">
              {sansCam ? t("Votre propre décor (sans cadres caméra)") : t("Votre propre décor (avec cadres caméra)")}
            </span>
            <input
              ref={fichierFond}
              type="file"
              accept={TYPES_IMAGE.join(",")}
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void envoyerMedia(genreFond, f); }}
            />
            <button onClick={() => fichierFond.current?.click()} disabled={envoi !== null} className={btnVide}>
              <Upload size={15} aria-hidden />
              {envoi === genreFond ? t("Envoi…") : t("Depuis un fichier")}
            </button>
            <a href="/stream/layout.psd" download className={btnVide}>
              <Download size={15} aria-hidden />
              {t("Gabarit Photoshop")}
            </a>
            {state.event[cleFond(genreFond)] && (
              <button onClick={() => retirerMedia(genreFond)} className={btnDanger}>
                <X size={15} aria-hidden />
                {t("Reprendre le décor du site")}
              </button>
            )}
            <p className="w-full text-xs text-ink-muted">
              {t("1920 x 1080, PNG ou WebP, transparent là où le jeu doit se voir. Partez du gabarit : les découpes doivent tomber au pixel près.")}
            </p>
            <p className="w-full text-xs text-ink-muted">
              {t("Ce décor ne sert qu’au mode choisi ci-dessus. L’autre mode garde le sien.")}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-hairline bg-surface p-4">
        <h2 className="text-sm font-semibold">{t("Lien compagnon (téléphone)")}</h2>
        <p className="mt-1 text-xs text-ink-secondary">
          {t("C’est la version des joueurs, à tenir pendant qu’ils jouent. Un téléphone posé entre eux, coupé en deux : chacun voit sa moitié à l’endroit de son côté et marque ses points sans lâcher ses cartes. Vous n’avez rien à faire pendant ce temps, et eux n’ont aucun compte à créer.")}
        </p>
        <ol className="mt-2 space-y-1.5 text-xs text-ink-secondary">
          <li><strong className="text-ink">1.</strong> {t("Envoyez ce lien aux joueurs, ou posez le téléphone entre eux, à plat sur la table.")}</li>
          <li><strong className="text-ink">2.</strong> {t("Avant de commencer, ils remplissent la partie : pseudos, format, points pour gagner, puis Légende, champion et champ de bataille de chacun.")}</li>
          <li><strong className="text-ink">3.</strong> {t("Pendant la partie, chacun compte ses points de son côté. En fin de manche, ils désignent le gagnant et le BO avance tout seul.")}</li>
          <li><strong className="text-ink">4.</strong> {t("Tout ce qu’ils touchent part à l’écran du stream. Vos réglages à vous, ici, ne sont pas écrasés.")}</li>
        </ol>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className="min-w-[240px] flex-1 truncate rounded-lg bg-surface-raised px-3 py-2 text-sm">{urlCompagnon}</code>
          <button
            onClick={() => void copierCompagnon()}
            className={`${btnPlein} min-w-[7.5rem]`}
          >
            {copieCompagnon === "copie" ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
            {copieCompagnon === "copie" ? t("Copié") : t("Copier")}
          </button>
          {/* Un lien, pas un bouton : on l'ouvre dans un autre onglet pour garder
              ce tableau de bord sous la main pendant la diffusion. */}
          <a href={urlCompagnon} target="_blank" rel="noopener noreferrer" className={btnVide}>
            <ExternalLink size={15} aria-hidden />
            {t("Lancer le compagnon")}
          </a>
        </div>
        {/* La mise en garde reste à l'écran en permanence : quand « Copié » prenait
            sa place, la seule phrase qui dit de ne pas montrer ce lien en direct
            disparaissait au moment précis où on venait de le copier. */}
        <p className="mt-2 text-xs text-ink-muted">
          {t("Celui qui a ce lien change ce qui est à l’écran : ne le montrez pas en direct. « Nouveau lien » le remplace lui aussi.")}
        </p>
        <p role="status" aria-live="polite" className="sr-only">
          {copieCompagnon === "copie" ? t("Copié") : ""}
        </p>
        {copieCompagnon === "erreur" && (
          <p role="alert" className="mt-2 text-xs text-error-light">
            {t("Copie impossible. Sélectionnez le lien et copiez-le.")}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-hairline bg-surface p-4">
        <h2 className="text-sm font-semibold">{t("Version simple (sans caméra ni cadre)")}</h2>
        <p className="mt-1 text-xs text-ink-muted">
          {t("La version simple n’affiche ni le chrono, ni le tournoi, ni le logo, ni les caméras, ni votre décor.")}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className="min-w-[220px] flex-1 truncate rounded-lg bg-surface-raised px-3 py-2 text-sm">{urlCompact}</code>
          <button onClick={() => navigator.clipboard.writeText(urlCompact)} className={btnVide}>
            <Copy size={15} aria-hidden />
            {t("Copier la version simple")}
          </button>
        </div>
      </section>
        </div>
      </details>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Joueurs et score")}</h2>
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
                      <span aria-live="polite" aria-atomic="true" className="w-7 text-center text-base font-bold tabular-nums">{pts}</span>
                      <button aria-label={`${t("Un point de plus")}, ${t("joueur")} ${i + 1}`} onClick={() => update({ points: { [key]: borne(pts + 1, state.maxPoints) } } as never)} disabled={pts >= state.maxPoints} className={btnStep}>+</button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-sm text-ink-secondary">{t("Manches gagnées")}</span>
                    <div className="flex items-center gap-2">
                      <button aria-label={`${t("Une manche de moins")}, ${t("joueur")} ${i + 1}`} onClick={() => setPlayer(i, { gamesWon: borne(p.gamesWon - 1, manchesMax) })} disabled={p.gamesWon <= 0} className={btnStep}>−</button>
                      <span aria-live="polite" aria-atomic="true" className="w-7 text-center text-base font-bold tabular-nums">{p.gamesWon}</span>
                      <button aria-label={`${t("Une manche de plus")}, ${t("joueur")} ${i + 1}`} onClick={() => setPlayer(i, { gamesWon: borne(p.gamesWon + 1, manchesMax) })} disabled={p.gamesWon >= manchesMax} className={btnStep}>+</button>
                    </div>
                  </div>
                </div>

                {/* Décor sans cadres : plus rien où poser une caméra. On enlève les
                    champs plutôt que de les laisser sans effet visible. */}
                {!sansCam && (
                <details className="rounded-lg border border-hairline bg-surface-raised/40">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-sm text-ink-secondary">
                    <span>{t("Caméra du joueur")}</span><span className="text-xs text-ink-muted">{t("Optionnel")}</span>
                  </summary>
                  <div className="border-t border-hairline p-3">
                  <span className="mb-1 block text-xs text-ink-muted">{t("Lien VDO.Ninja")}</span>
                  {/* `flex-wrap` + `min-w-full` : avec une caméra chargée il y a trois
                      boutons sur la ligne, et sur un téléphone le champ tombait à 26 px.
                      On ne pouvait plus ni lire ni corriger le lien. Le champ prend
                      toute la ligne sous 640 px, les boutons passent dessous. */}
                  <div className="flex flex-wrap gap-2">
                    <input
                      value={brouillonCam[i]}
                      onChange={(e) => setBrouillonCam((b) => (i === 0 ? [e.target.value, b[1]] : [b[0], e.target.value]))}
                      placeholder="https://vdo.ninja/?view=..."
                      aria-label={`${t("Caméra (lien VDO.Ninja)")}, ${t("joueur")} ${i + 1}`}
                      className={inputCls + " min-w-full flex-1 sm:min-w-[12rem]"}
                    />
                    <button
                      onClick={() => setPlayer(i, { camUrl: normaliserLienCamera(brouillonCam[i]) ?? "" })}
                      disabled={!normaliserLienCamera(brouillonCam[i])}
                      className={btnPlein}
                    >
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
                  {brouillonCam[i].trim() && !normaliserLienCamera(brouillonCam[i]) && (
                    <p role="alert" className="mt-1 text-xs text-error-light">
                      {t("Utilisez un lien HTTPS fourni par VDO.Ninja.")}
                    </p>
                  )}
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
                </details>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Match et chrono")}</h2>
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
          {/* Points ET manches : le bouton ne servait qu'entre deux manches, alors
              qu'on s'en sert surtout entre deux matchs. Les manches de la paire
              précédente restaient à l'écran. */}
          <button onClick={() => update({ points: { a: 0, b: 0 }, players: [{ gamesWon: 0 }, { gamesWon: 0 }] as never })} className={btnVide}>
            <RotateCcw size={15} aria-hidden />
            {t("Remettre le score à zéro")}
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-hairline bg-surface p-4 text-sm">
          <label className="block">
            <span className="mb-1 block text-xs text-ink-muted">{t("Durée en minutes")}</span>
            <input
              type="number"
              min={0}
              max={180}
              value={minutes}
              // 0 accepté : lancé à zéro avec « Continuer après zéro », le chrono
              // monte au lieu de descendre. C'est le chrono libre, sans autre code.
              onChange={(e) => setMinutes(Math.max(0, Math.min(180, Number(e.target.value) || 0)))}
              className="w-28 min-h-11 rounded-lg border border-hairline bg-surface px-3 py-2 text-base tabular-nums sm:text-sm"
            />
          </label>
          <button onClick={() => update({ event: { endsAt: new Date(Date.now() + minutes * 60000).toISOString(), paused: null, timerMonte: false } })} className={btnPlein}>
            <Play size={15} aria-hidden />
            {t("Lancer le chrono")}
          </button>
          {/* Le chrono qui monte n'a pas de durée : il part de maintenant et ne
              s'arrête pas. Un bouton plutôt qu'une case, parce que c'est une façon
              de LANCER le chrono, pas un réglage qu'on laisse coché. */}
          <button onClick={() => update({ event: { endsAt: new Date().toISOString(), paused: null, timerMonte: true } })} className={btnVide}>
            <ArrowUp size={15} aria-hidden />
            {t("Chrono qui monte")}
          </button>
          {state.event.paused == null ? (
            <button
              // Sans borne basse : en prolongation, la pause figeait 00:00 et le
              // dépassement repartait de zéro à la reprise.
              onClick={() => update({ event: { paused: state.event.endsAt ? Math.floor((new Date(state.event.endsAt).getTime() - Date.now()) / 1000) : 0 } })}
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
          <button onClick={() => update({ event: { endsAt: null, paused: null, timerMonte: false } })} disabled={!state.event.endsAt && state.event.paused == null} className={btnVide}>
            <Square size={15} aria-hidden />
            {t("Arrêter")}
          </button>
          <label className={caseCls}>
            <input type="checkbox" className="size-4 accent-arcane" checked={state.event.timerVisible !== false} onChange={(e) => update({ event: { timerVisible: e.target.checked } })} />
            {t("Montrer le chrono")}
          </label>
          <label className={caseCls}>
            <input type="checkbox" className="size-4 accent-arcane" checked={state.event.timerDepassement === true} onChange={(e) => update({ event: { timerDepassement: e.target.checked } })} />
            {t("Continuer après zéro")}
          </label>
          <p className="w-full text-xs text-ink-muted">
            {t("« Continuer après zéro » empêche le décompte de s’arrêter sur 00:00 : il passe en négatif et affiche le dépassement en rouge, ce qu’il faut pour un tour de mort subite. « Chrono qui monte » part de zéro et ne s’arrête pas, sans durée à saisir.")}
          </p>
        </div>
      </section>

      <details className="group rounded-xl border border-hairline bg-surface">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-lg font-semibold">
          <span>{t("Cartes à l’écran")}</span><span className="text-sm font-normal text-ink-muted">{t("Optionnel")}</span>
        </summary>
      <section className="space-y-3 border-t border-hairline p-4">
        <div className="space-y-4 rounded-xl border border-hairline bg-surface p-4 text-sm">
          <p className="text-xs text-ink-muted">
            {t("Colle une decklist par joueur (les terrains sont retirés du défilé). Choisis l’affichage, puis clique une carte pour la montrer, et reclique-la pour la retirer de l’écran. « Diapo auto » les fait tourner tout seul ; sinon tu choisis au clic. « Deux cadres » cache le chrono et le logo à gauche.")}
          </p>

          {/* Tous les réglages ensemble : quel affichage, diapo auto, durée. */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {/* Un menu se dimensionne sur sa plus longue option. En anglais, « One
                frame, both decks » dépassait de 17 px et TOUTE la page se décalait
                sur le côté. Sous 640 px le menu prend la ligne entière : aucune
                traduction ne peut plus faire déborder la page. */}
            <label className={caseCls + " w-full sm:w-auto"}>
              <span className="text-xs text-ink-muted">{t("Affichage")}</span>
              <select
                value={cards.mode}
                onChange={(e) => majCards({ mode: e.target.value as OverlayStateData["cards"]["mode"] })}
                aria-label={t("Affichage des cartes")}
                className={selectCls + " w-full min-w-0 flex-1 transition-colors duration-150 focus:border-arcane focus:outline-none sm:w-auto sm:flex-none"}
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

          {/* Montrer une carte sans rien coller : on tape son nom, on clique, elle
              est à l'écran. Jusqu'ici il fallait une decklist pour ça. */}
          <div className="rounded-xl border border-hairline bg-surface p-3">
            <span className="mb-1 block text-xs text-ink-muted">{t("Montrer une carte sans decklist")}</span>
            <input
              value={rechCarte}
              onFocus={chargerCartes}
              onChange={(e) => setRechCarte(e.target.value)}
              placeholder={t("Chercher une carte…")}
              aria-label={t("Montrer une carte sans decklist")}
              className={inputCls}
            />
            <p role="status" aria-live="polite" className="sr-only">
              {rechCarte.trim().length >= 2 && cartes ? `${resultatsCartes.length} ${t("résultats")}` : ""}
            </p>
            {resultatsCartes.length > 0 && (
              <ul className="mt-2 space-y-1">
                {resultatsCartes.map((c) => (
                  <li key={c.name}>
                    <button
                      onClick={() => montrerCarteCherchee(c.name)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-surface-raised"
                    >
                      {c.imageUrl && <img src={c.imageUrl} alt="" className="h-9 w-7 shrink-0 rounded object-cover" />}
                      <span className="truncate">{c.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {rechCarte.trim().length >= 2 && cartes && resultatsCartes.length === 0 && (
              <p className="mt-2 text-xs text-ink-muted">{t("Aucune carte à ce nom.")}</p>
            )}
            <p className="mt-1 text-xs text-ink-muted">
              {t("La carte rejoint la liste du joueur 1 et passe à l’écran tout de suite.")}
            </p>
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
                    aria-label={`${t("Decklist")}, ${t("joueur")} ${i + 1}`}
                    rows={3}
                    className={inputCls + " font-mono text-base sm:text-xs"}
                  />
                  <button
                    aria-label={`${t("Charger la decklist")}, ${t("joueur")} ${i + 1}`}
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
                              // La case fait 16 px et le nom de carte commence 8 px
                              // plus loin : sous les 24 px de la WCAG, et sans marge
                              // pour rattraper. On vise la case, on décoche la carte
                              // d'à côté. Le libellé porte la zone de 36 px.
                              <label className="flex size-9 shrink-0 items-center justify-center">
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
                              </label>
                            )}
                            <button
                              type="button"
                              onClick={() => montrer(i, c)}
                              aria-pressed={c === montree}
                              aria-label={c === montree ? `${t("Retirer de l’écran")} : ${c}` : `${t("Montrer à l’écran")} : ${c}`}
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
      </details>

      <details className="group rounded-xl border border-hairline bg-surface">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-lg font-semibold">
          <span>{t("Tournoi et logo")}</span><span className="text-sm font-normal text-ink-muted">{t("Optionnel")}</span>
        </summary>
      <section className="space-y-3 border-t border-hairline p-4">
        {/* `items-start`, pas `items-end` : les deux colonnes n'ont plus la même
            hauteur depuis que le logo porte un bouton d'envoi et sa ligne d'aide.
            Alignées par le bas, « Nom du tournoi » tombait au milieu du cadre, sous
            le champ d'en face. On aligne les deux étiquettes en haut. */}
        <div className="flex flex-wrap items-start gap-3 rounded-xl border border-hairline bg-surface p-4 text-sm">
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
            {/* Même raison que la caméra : à deux boutons, le champ tombait à 98 px
                sur un téléphone. On ne colle pas une adresse dans 98 px.
                Les boutons sont dans leur propre boîte : à trois, « Retirer » partait
                seul à la ligne pendant que les deux autres restaient en haut. */}
            <div className="flex flex-wrap items-start gap-2">
              <input value={brouillonLogo} onChange={(e) => setBrouillonLogo(e.target.value)} placeholder="https://…" aria-label={t("Logo (lien d’image)")} className={inputCls + " min-w-full flex-1 sm:min-w-[12rem]"} />
              <div className="flex flex-wrap gap-2">
              <button onClick={() => update({ event: { logoUrl: brouillonLogo } })} disabled={!brouillonLogo.trim()} className={btnPlein}>
                <Upload size={15} aria-hidden />
                {t("Charger")}
              </button>
              {/* Le vrai besoin : personne n'héberge d'images. Le fichier part chez
                  nous et l'état ne garde qu'une adresse. */}
              <input
                ref={fichierLogo}
                type="file"
                accept={TYPES_IMAGE.join(",")}
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void envoyerMedia("logo", f); }}
              />
              <button onClick={() => fichierLogo.current?.click()} disabled={envoi !== null} className={btnVide}>
                <Upload size={15} aria-hidden />
                {envoi === "logo" ? t("Envoi…") : t("Depuis un fichier")}
              </button>
              {state.event.logoUrl && (
                <button onClick={() => retirerMedia("logo")} className={btnDanger}>
                  <X size={15} aria-hidden />
                  {t("Retirer")}
                </button>
              )}
              </div>
            </div>
            <p className="mt-1 text-xs text-ink-muted">
              {t("PNG, JPEG, WebP ou GIF, 512 Kio au plus. L’image est réduite dans le navigateur avant l’envoi.")}
            </p>
            {erreurMedia && (
              <p role="alert" className="mt-2 flex items-start gap-1.5 text-xs text-error-light">
                <AlertTriangle size={14} className="mt-px shrink-0" aria-hidden />
                {erreurMedia}
              </p>
            )}
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
      </details>
    </div>
  );
}
