import { readFileSync } from "fs";
import { join } from "path";
import { VARIANT_SUFFIX } from "./card-printing";

// Passage unique vers CardNexus : prix des cartes et liens d'achat affiliés.
//
// Deux choses vivent ici et nulle part ailleurs :
//   - le choix du prix affiché (quelle source, quelle finition) ;
//   - la fabrication des liens, qui portent l'identifiant de partenaire et sont
//     la seule raison pour laquelle ce travail rapporte quelque chose. Un lien
//     écrit à la main ailleurs dans le code serait un lien non tracké, donc une
//     vente perdue en silence.

/** Identifiant de partenaire Impact d'Allan, lu dans le lien de parrainage fourni. */
const MP_ID = "7595319";

// Lien profond Impact : les deux nombres viennent du lien de parrainage
// (go.cardnexus.link/oNJoLY redirige vers .../c/7595319/3770197/48046?u=...).
// Le paramètre `u` accepte n'importe quelle page de cardnexus.com, vérifié à la
// main : le tracking (irpid=7595319) survit à la redirection.
const LIEN_PROFOND = `https://go.cardnexus.link/c/${MP_ID}/3770197/48046?u=`;

/** Page d'un produit, tracké. Le nom en fin d'URL sert de repli si l'id ne résout plus. */
export function lienProduit(productId: number, nom: string): string {
  return `https://af.cardnexus.link/${MP_ID}/cn/${productId}/${encodeURIComponent(nom)}`;
}

/**
 * Le « Cart Wizard » pré-rempli avec une liste : CardNexus compare tous les
 * vendeurs et compose le panier le moins cher, frais de port compris. C'est la
 * seule façon de remplir le panier d'un visiteur — l'API panier ne remplit que
 * celui du porteur de la clé.
 */
export function lienPanier(listId: string): string {
  return LIEN_PROFOND + encodeURIComponent(`https://cardnexus.com/cart-wizard?list=${listId}`);
}

/** La boutique Riftbound, tracké. Sert de repli quand un deck n'a pas de liste. */
export function lienBoutique(recherche?: string): string {
  return recherche
    ? `https://af.cardnexus.link/${MP_ID}/${encodeURIComponent(recherche)}`
    : `https://af.cardnexus.link/${MP_ID}`;
}

export interface BlocPrix {
  cardmarket?: { currency: string; low?: number; mid?: number; marketValue?: number };
  cardnexus?: { regions?: Record<string, { currency: string; low: number }> };
}

/**
 * Les clés possibles d'une carte dans le catalogue CardNexus, dans l'ordre.
 *
 * Nos identifiants s'écrivent `ogn-091-298` (extension, numéro, taille du set) ;
 * CardNexus indexe par code d'extension et `printNumber`. Le zéro de tête n'est
 * pas écrit pareil selon les sets (`ARC-001` mais `OGN-202a`), d'où plusieurs
 * candidats. Le suffixe de variante (`a`, `*`) est conservé : CardNexus le porte
 * aussi et c'est lui qui distingue une alt-art de la carte de base.
 */
export function cleCatalogue(riftboundId: string): string[] {
  const m = /^([a-z]+)-(\d+)([a-z*]?)-/i.exec(riftboundId);
  if (!m) return [];
  const [, set, numero, suffixe] = m;
  const nu = numero.replace(/^0+/, "") || "0";
  const suf = suffixe === "*" ? "*" : suffixe;
  return [...new Set([numero, nu, nu.padStart(3, "0")])].map((n) => `${set}-${n}${suf}`.toUpperCase());
}

/**
 * Le prix à afficher pour une carte : le moins cher parmi ses finitions.
 *
 * Deux sources en euros, dans cet ordre : le plancher réel du marché européen de
 * CardNexus (ce que le visiteur paiera en suivant notre lien), puis Cardmarket.
 * Les prix TCGPlayer sont ignorés : ils sont en dollars et sur un autre marché,
 * les convertir donnerait un chiffre inventé.
 */
export function prixRetenu(
  parFinition: Record<string, BlocPrix> | undefined,
): { eur: number; source: string; finition: string } | null {
  let retenu: { eur: number; source: string; finition: string } | null = null;
  for (const [finition, bloc] of Object.entries(parFinition ?? {})) {
    const eu = bloc.cardnexus?.regions?.eu;
    const candidat =
      eu && eu.currency === "EUR" && eu.low > 0
        ? { eur: eu.low, source: "cardnexus", finition }
        : bloc.cardmarket?.currency === "EUR" && (bloc.cardmarket.low || bloc.cardmarket.marketValue)
          ? { eur: (bloc.cardmarket.low || bloc.cardmarket.marketValue)!, source: "cardmarket", finition }
          : null;
    if (candidat && (!retenu || candidat.eur < retenu.eur)) retenu = candidat;
  }
  return retenu;
}

export interface PrixCarte {
  eur: number;
  productId: number;
  nom: string;
  source: string;
  /** La finition qui porte ce prix. Une liste CardNexus l'exige pour chaque ligne. */
  finition: string;
}

interface FichierPrix {
  fetchedAt: string;
  cards: Record<string, PrixCarte>;
}

let cache: FichierPrix | null = null;

/**
 * Le relevé de prix produit par `scripts/sync-prices.mts`.
 *
 * Lu une fois par processus : les prix ne bougent pas pendant la vie d'un
 * conteneur, et une page deck ne doit pas attendre un appel réseau pour afficher
 * un montant. Un relevé absent n'est pas une erreur : le site rend sans prix.
 */
export function chargerPrix(): FichierPrix | null {
  if (cache) return cache;
  try {
    cache = JSON.parse(readFileSync(join(process.cwd(), "data", "prices", "card-prices.json"), "utf-8"));
    return cache;
  } catch {
    return null;
  }
}

export interface LigneChiffree {
  riftboundId: string;
  /** Le nom tel que notre base l'écrit, pour recouper avec la couverture de collection. */
  nom: string;
  quantite: number;
  /** Prix de la ligne entière. */
  eur: number | null;
  /** Prix d'un exemplaire, pour chiffrer ce qui manque à un joueur. */
  eurUnitaire: number | null;
  lien: string | null;
}

export interface DeckChiffre {
  total: number;
  lignes: LigneChiffree[];
  /** Exemplaires sans prix connu. Affiché : un total muet serait un total faux. */
  exemplairesSansPrix: number;
  releveLe: string | null;
}

export interface LigneListe {
  productId: number;
  finish: string;
  language: string;
  quantity: number;
}

export interface Carte {
  riftboundId: string;
  name: string;
  quantity: number;
}

interface Regroupee extends Carte {
  prix: PrixCarte | null;
}

/**
 * Pour chaque nom de catalogue, l'impression la moins chère.
 *
 * Une carte est souvent imprimée plusieurs fois : l'édition ordinaire, et une
 * édition « overnumbered » ou alt-art numérotée au-delà du set. À la table elles
 * sont la MÊME carte, et le règlement les accepte toutes ; au marché, l'écart est
 * énorme (Kennen, Heart of the Tempest : 1280 EUR contre 0,05 EUR).
 *
 * Une decklist de tournoi note l'impression que le joueur a enregistrée. Chiffrer
 * dessus affichait un prix que personne ne paie, et le panier envoyait acheter la
 * carte à 1280 EUR. Relevé sur la base : 410 decks affichaient un prix trop haut,
 * de 225 EUR en moyenne pour un deck qui en vaut 114.
 *
 * CardNexus ajoute parfois le type d'impression au nom. On retire ces suffixes
 * cosmétiques avant le choix : une Légende et son Champion restent distincts.
 */
function nomSansVariante(nom: string): string {
  return nom.replace(VARIANT_SUFFIX, "");
}

function parNomMoinsCher(prix: FichierPrix): Map<string, PrixCarte> {
  const index = new Map<string, PrixCarte>();
  for (const p of Object.values(prix.cards)) {
    const nom = nomSansVariante(p.nom);
    const deja = index.get(nom);
    if (!deja || p.eur < deja.eur) index.set(nom, p);
  }
  return index;
}

/** Les impressions connues et celle à conseiller pour chaque carte. */
export function impressionsAchat(prix: FichierPrix | null = chargerPrix()): { connues: string[]; conseillees: string[] } {
  if (!prix) return { connues: [], conseillees: [] };
  const moinsCheres = new Set(parNomMoinsCher(prix).values());
  const connues = Object.keys(prix.cards);
  return {
    connues,
    conseillees: connues.filter((id) => moinsCheres.has(prix.cards[id])),
  };
}

// Calculé une fois par relevé, comme les prix eux-mêmes.
const indexParRelevé = new WeakMap<FichierPrix, Map<string, PrixCarte>>();

/** L'impression la moins chère de la même carte, ou celle d'origine si elle est seule. */
function laMoinsChere(p: PrixCarte, prix: FichierPrix): PrixCarte {
  let index = indexParRelevé.get(prix);
  if (!index) {
    index = parNomMoinsCher(prix);
    indexParRelevé.set(prix, index);
  }
  return index.get(nomSansVariante(p.nom)) ?? p;
}

/**
 * Une ligne par article acheté, quantités additionnées.
 *
 * Deux regroupements en un, parce qu'une même carte arrive ici plusieurs fois
 * pour deux raisons distinctes :
 *   - un deck stocke une ligne par carte ET par section, donc la carte jouée au
 *     deck principal et en réserve compte double ;
 *   - notre base porte parfois deux impressions de la même carte sous deux
 *     préfixes (OGS et OPP, 14 cartes concernées), qui pointent sur un seul
 *     produit CardNexus.
 * Le regroupement se fait donc sur le produit dès qu'il est connu. Sans lui,
 * CardNexus — qui REMPLACE la quantité d'une ligne déjà présente au lieu de
 * l'ajouter — ne mettait qu'une partie des exemplaires au panier.
 */
function regrouper(cartes: Carte[], prix: FichierPrix | null): Regroupee[] {
  const parArticle = new Map<string, Regroupee>();
  for (const c of cartes) {
    const brut = prix?.cards[c.riftboundId] ?? null;
    // On chiffre et on vend l'impression la moins chère de la carte, pas celle que
    // la decklist a notée : c'est la même carte, et c'est celle que le lecteur va
    // acheter. C'est aussi ce que promet le « À partir de » affiché au-dessus.
    const p = brut && prix ? laMoinsChere(brut, prix) : brut;
    const cle = p ? `p${p.productId}` : c.riftboundId;
    const deja = parArticle.get(cle);
    if (deja) deja.quantity += c.quantity;
    else parArticle.set(cle, { ...c, prix: p });
  }
  return [...parArticle.values()];
}

// CardNexus exige une langue par ligne, il n'accepte pas « n'importe laquelle ».
// Vendetta n'existe pas encore en français : demander du français rendrait les
// paniers récents incomplets. Repasser à `fr` quand tout le format sera disponible.
const LANGUE = "en";

/**
 * Les lignes d'une liste CardNexus pour un deck, et ce qui n'a pas pu y entrer.
 *
 * Une carte absente du relevé n'a pas d'identifiant produit : elle ne peut pas
 * être achetée et on le dit, plutôt que de livrer un panier incomplet sans le
 * signaler.
 */
export function lignesListe(
  cartes: Carte[],
  prix: FichierPrix | null = chargerPrix(),
): { items: LigneListe[]; absentes: string[] } {
  const items: LigneListe[] = [];
  const absentes: string[] = [];
  for (const c of regrouper(cartes, prix)) {
    if (!c.prix) absentes.push(c.name);
    else items.push({ productId: c.prix.productId, finish: c.prix.finition, language: LANGUE, quantity: c.quantity });
  }
  return { items, absentes };
}

/** Chiffre un deck à partir du relevé. Les cartes sans prix ne sont jamais escamotées. */
export function chiffrerDeck(cartes: Carte[], prix: FichierPrix | null = chargerPrix()): DeckChiffre {
  let total = 0;
  let exemplairesSansPrix = 0;
  const lignes: LigneChiffree[] = regrouper(cartes, prix).map(({ prix: p, ...c }) => {
    if (p) total += p.eur * c.quantity;
    else exemplairesSansPrix += c.quantity;
    return {
      riftboundId: c.riftboundId,
      nom: c.name,
      quantite: c.quantity,
      eur: p ? p.eur * c.quantity : null,
      eurUnitaire: p ? p.eur : null,
      lien: p ? lienProduit(p.productId, p.nom) : null,
    };
  });
  return { total, lignes, exemplairesSansPrix, releveLe: prix?.fetchedAt ?? null };
}
