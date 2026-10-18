/**
 * Import d'un set depuis la galerie OFFICIELLE de Riot, quand Riftcodex ne l'a pas
 * encore (Radiance, en octobre 2026 : Riot l'affichait dès les avant-premières,
 * Riftcodex s'arrêtait à Vendetta).
 *
 *   npx tsx --env-file=.env scripts/sync-set-riot.mts RAD --sec   # dit ce qui serait écrit
 *   npx tsx --env-file=.env scripts/sync-set-riot.mts RAD         # écrit en base
 *
 * Rejouable : upsert par `riftboundId`, le même identifiant que chez Riftcodex. Un
 * import Riftcodex passé plus tard retrouvera donc les mêmes cartes.
 *
 * SOURCE : le `__NEXT_DATA__` de playriftbound.com/en-us/card-gallery, toutes les
 * cartes de tous les sets d'un coup. Riftcodex recopie ces mêmes champs : le texte
 * riche et l'image sont identiques au caractère près. Ce qui diffère, le script le
 * rattrape, et chaque règle a été recoupée sur les 1 135 cartes déjà en base :
 *   - le nom : Riot range le champion d'une Légende dans ses tags et le titre d'un
 *     champion dans `subtitle`, la base écrit « Champion, Titre » ;
 *   - la puissance d'un équipement (son bonus) reste vide, comme dans la base ;
 *   - un art alternatif garde la rareté de sa carte de base (Riot écrit Showcase,
 *     la règle d'Allan du 24 juillet dit l'inverse) ; seul un surnuméroté passe en
 *     Showcase ;
 *   - une carte dont Riot n'a pas encore rempli le type le prend au figurier chinois
 *     officiel, au même numéro. Sans les deux, elle est écartée et nommée.
 *
 * La galerie montre le texte IMPRIMÉ, pas l'errata : le 18 octobre 2026, Elnuk Herd,
 * Last Caress, Forbidden Technique et Neeko y gardaient l'ancien texte de Radiance.
 * Relancer ce script défait donc un errata posé en base : le reposer après.
 */
import { PrismaClient } from "@prisma/client";
import { figurierOfficiel } from "./figurier-chinois";

const GALERIE = "https://playriftbound.com/en-us/card-gallery/";
const SET = process.argv[2]?.toUpperCase();
const sec = process.argv.includes("--sec");
if (!SET || SET.startsWith("-")) throw new Error("Préciser le set : sync-set-riot.mts RAD [--sec]");

type Valeur = { value?: { id: string | number; label: string } };
type CarteRiot = {
  id: string;
  collectorNumber: number;
  name: string;
  subtitle?: string;
  set: { value: { id: string; label: string } };
  cardType: { type: { id: string; label: string }[]; superType?: { label: string }[] };
  rarity: Valeur;
  domain?: { values: { label: string }[] };
  cardImage?: { url: string };
  illustrator?: { values: { label: string }[] };
  text?: { richText?: { body: string } };
  energy?: Valeur;
  might?: Valeur;
  power?: Valeur;
  tags?: { tags: string[] };
};

const TYPE_CHINOIS: Record<string, string> = {
  unit: "Unit", hero_unit: "Unit", exclusive_unit: "Unit",
  spell: "Spell", exclusive_spell: "Spell",
  equipment: "Gear", exclusive_equipment: "Gear",
  legendary: "Legend", battlefield: "Battlefield", rune: "Rune",
};

async function galerie(): Promise<CarteRiot[]> {
  const r = await fetch(GALERIE, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130" } });
  if (!r.ok) throw new Error(`Galerie Riot : ${r.status}`);
  const m = /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/.exec(await r.text());
  if (!m) throw new Error("Galerie Riot : __NEXT_DATA__ introuvable, la page a changé de forme");
  const blades = JSON.parse(m[1])?.props?.pageProps?.page?.blades;
  const cartes = Array.isArray(blades) ? blades.find((b) => Array.isArray(b?.cards?.items))?.cards.items : null;
  if (!cartes?.length) throw new Error("Galerie Riot : aucune liste de cartes dans la page");
  return cartes;
}

// Le numéro tel que les deux figuriers l'impriment : « rad-020a-167 » → « 020A ».
const numero = (riftboundId: string) => riftboundId.split("-")[1]?.toUpperCase() ?? "";
const nombre = (v?: Valeur) => (typeof v?.value?.id === "number" ? v.value.id : null);
// Même règle que les cleanName de Riftcodex : tiret → espace, ponctuation retirée.
const nomPropre = (nom: string) => nom.replace(/-/g, " ").replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();

function convertir(c: CarteRiot, type: string, rareteDeBase: string | undefined) {
  const tags = c.tags?.tags ?? [];
  const total = Number(/-(\d+)$/.exec(c.id)?.[1]);
  // Les cartes des decks de départ (`rad-sp1-005`) ont leur propre total : jamais surnumérotées.
  const surnumerote = !c.id.includes("-sp") && c.collectorNumber > total;
  const artAlternatif = /^[a-z]+-r?\d+a(-|$)/.test(c.id);
  // Riot met aussi le champion en sous-titre d'une carte Signature (« Bullet Time, Miss
  // Fortune », « Tibbers, Annie ») : la base ne l'écrit que pour une unité champion.
  const champion = c.cardType.superType?.[0]?.label === "Champion";
  let nom = type === "Legend" ? `${tags.at(-1)}, ${c.name}` : champion && c.subtitle ? `${c.name}, ${c.subtitle}` : c.name;
  if (surnumerote) nom += " (Overnumbered)";
  if (artAlternatif) nom += " (Alternate Art)";
  const texte = c.text?.richText?.body ?? "";
  return {
    name: nom,
    cleanName: nomPropre(nom),
    collectorNumber: c.collectorNumber,
    set: c.set.value.id,
    setName: c.set.value.label,
    type,
    supertype: c.cardType.superType?.[0]?.label ?? null,
    rarity: surnumerote ? "Showcase" : artAlternatif && rareteDeBase ? rareteDeBase : (c.rarity.value?.label ?? ""),
    domains: (c.domain?.values ?? []).map((d) => d.label),
    energy: nombre(c.energy),
    might: type === "Gear" ? null : nombre(c.might),
    power: nombre(c.power),
    textRich: texte,
    textPlain: texte.replace(/<[^>]+>/g, ""),
    imageUrl: c.cardImage?.url ?? null,
    artist: (c.illustrator?.values ?? []).map((a) => a.label).join(" & ") || null,
    tags,
    alternateArt: artAlternatif,
    overnumbered: surnumerote,
    signature: c.id.includes("*"),
  };
}

async function main() {
  const [riot, chinois] = await Promise.all([galerie(), figurierOfficiel()]);
  const prisma = new PrismaClient();
  try {
    const typeRiot = (c: CarteRiot) => c.cardType.type[0]?.label;

    // Recoupement : les cartes déjà en base, converties par les mêmes règles, doivent
    // retomber sur ce qu'on a. Un écart massif veut dire que Riot a changé sa forme.
    const enBase = new Map(
      (await prisma.card.findMany({ select: { riftboundId: true, name: true, type: true, domains: true, energy: true } }))
        .map((c) => [c.riftboundId, c]),
    );
    const ecarts: string[] = [];
    let compares = 0;
    for (const c of riot) {
      const b = enBase.get(c.id);
      const type = typeRiot(c);
      if (!b || !type || c.set.value.id === SET) continue;
      compares++;
      const n = convertir(c, type, undefined);
      if (n.name !== b.name || n.type !== b.type || n.energy !== b.energy || n.domains.join() !== b.domains.join()) {
        ecarts.push(`${c.id} : « ${n.name} » ${n.type} ${n.energy} ≠ base « ${b.name} » ${b.type} ${b.energy}`);
      }
    }
    console.log(`Recoupement sur ${compares} cartes déjà en base : ${ecarts.length} écarts`);
    ecarts.slice(0, 8).forEach((e) => console.log(`  ${e}`));

    const zhParNumero = new Map(
      chinois.filter((z) => z.cardNo?.startsWith(SET)).map((z) => [z.cardNo.replace(/^[A-Z]+[·-]/, "").split("/")[0].toUpperCase(), z]),
    );
    const duSet = riot.filter((c) => c.set.value.id === SET);
    if (!duSet.length) throw new Error(`Aucune carte ${SET} dans la galerie Riot`);
    const rareteParNumero = new Map(duSet.map((c) => [numero(c.id), c.rarity.value?.label]));

    const lignes: ReturnType<typeof convertir>[] = [];
    const ids: string[] = [];
    const ecartees: string[] = [];
    const desaccordsZh: string[] = [];
    for (const c of duSet) {
      const zh = zhParNumero.get(numero(c.id));
      const type = typeRiot(c) ?? TYPE_CHINOIS[zh?.cardCategoryList?.[0] ?? ""];
      if (!type) {
        ecartees.push(`${c.id} ${c.name}`);
        continue;
      }
      const ligne = convertir(c, type, rareteParNumero.get(numero(c.id).replace(/A$/, "")));
      if (zh && (zh.energy !== ligne.energy || (type === "Unit" && zh.power !== ligne.might))) {
        desaccordsZh.push(`${c.id} ${ligne.name} : Riot ${ligne.energy}/${ligne.might}, Chine ${zh.energy}/${zh.power}`);
      }
      lignes.push(ligne);
      ids.push(c.id);
    }

    const parType: Record<string, number> = {};
    for (const l of lignes) parType[l.type] = (parType[l.type] ?? 0) + 1;
    console.log(`\n${SET} : ${lignes.length} cartes à écrire`, parType);
    console.log(`Types repris au figurier chinois : ${duSet.filter((c) => !typeRiot(c)).length - ecartees.length}`);
    console.log("Légendes :", lignes.filter((l) => l.type === "Legend" && !l.overnumbered).map((l) => l.name).join(" · "));
    if (desaccordsZh.length) console.log(`\nÉnergie ou puissance différente du figurier chinois (${desaccordsZh.length}) :\n  ${desaccordsZh.join("\n  ")}`);
    if (ecartees.length) console.log(`\nÉCARTÉES, type inconnu des deux côtés (${ecartees.length}) :\n  ${ecartees.join("\n  ")}`);

    if (sec) {
      console.log("\nEssai à blanc : rien n'a été écrit.");
      return;
    }

    await prisma.cardSet.upsert({
      where: { setId: SET },
      update: { name: duSet[0].set.value.label, cardCount: lignes.length },
      create: { id: SET, setId: SET, name: duSet[0].set.value.label, cardCount: lignes.length },
    });
    for (const [i, ligne] of lignes.entries()) {
      await prisma.card.upsert({
        where: { riftboundId: ids[i] },
        update: ligne,
        create: { id: ids[i], riftboundId: ids[i], ...ligne },
      });
    }
    console.log(`\n${lignes.length} cartes ${SET} écrites.`);
    if (ecartees.length) process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
