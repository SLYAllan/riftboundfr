export const BANNER_MAP: Record<string, string> = {
  irelia: "irelia",
  sivir: "sivir",
  diana: "diana",
  vex: "vex",
  "master yi": "maitreyi_1",
  leblanc: "leblanc",
  fiora: "fiora",
  "miss fortune": "missfortune",
  sett: "sett",
  draven: "draven",
  rengar: "rengar",
  azir: "azir",
  poppy: "poppy",
  annie: "annie",
  viktor: "viktor",
  ezreal: "ezreal",
  "kha'zix": "khazix",
  khazix: "khazix",
  "kai'sa": "kaisa",
  kaisa: "kaisa",
  lillia: "lillia",
  teemo: "teemo",
  lucian: "lucian",
  ornn: "ornn",
  pyke: "pyke",
  darius: "darius",
  jax: "jax",
  "rek'sai": "reksai",
  reksai: "reksai",
  jhin: "Jhin",
  "renata glasc": "renataglasc",
  volibear: "volibear",
  vi: "vi",
  jinx: "jinx",
  ahri: "ahri",
  leona: "leona",
  lux: "lux",
  "lee sin": "leesin",
  yasuo: "yasuo",
  rumble: "rumble",
  ivern: "ivern",
  garen: "garen",
  akali: "akali",
  ambessa: "ambessa",
  jayce: "jayce",
  kennen: "kennen",
  mel: "mel",
  nasus: "nasus",
  renekton: "renekton",
  shen: "shen",
  zed: "zed",
};

/**
 * La clé des deux tables : le nom du champion seul, avant la virgule.
 * « Annie, Dark Child » et « Annie - Fiery » cherchent tous deux « annie ».
 *
 * Exportée pour que la routine `maj:overlay` inventorie les Légendes sans habillage
 * avec CETTE règle et pas une copie : une copie finit par diverger, et l'inventaire
 * déclarerait alors complet un cadre qui reste vide à l'écran.
 */
export function cleLegende(legendName: string): string {
  return legendName.toLowerCase().split(",")[0].split(" -")[0].trim();
}

export function getBannerUrl(legendName: string): string | null {
  const file = BANNER_MAP[cleLegende(legendName)];
  return file ? `/bannieres/${file}.webp` : null;
}

export const ICON_MAP: Record<string, string> = {
  irelia: "irelia",
  sivir: "sivir",
  diana: "diana",
  vex: "vex",
  "master yi": "masteryi_1",
  leblanc: "leblanc",
  fiora: "fiora",
  "miss fortune": "missfortune",
  sett: "sett",
  draven: "draven",
  rengar: "rengar",
  azir: "azir",
  poppy: "poppy",
  annie: "annie",
  viktor: "viktor",
  ezreal: "ezreal",
  "kha'zix": "khazix",
  khazix: "khazix",
  "kai'sa": "kaisa",
  kaisa: "kaisa",
  lillia: "lillia",
  teemo: "teemo",
  lucian: "lucian",
  ornn: "ornn",
  pyke: "pyke",
  darius: "darius",
  jax: "jax",
  "rek'sai": "reksai",
  reksai: "reksai",
  jhin: "jhin",
  "renata glasc": "renataglasc",
  volibear: "volibear",
  vi: "vi",
  jinx: "jinx",
  ahri: "ahri",
  leona: "leona",
  lux: "lux",
  "lee sin": "leesin",
  yasuo: "yasuo",
  rumble: "rumble",
  ivern: "ivern",
  garen: "garen",
  akali: "akali",
  ambessa: "ambessa",
  jayce: "jayce",
  kennen: "kennen",
  mel: "mel",
  nasus: "nasus",
  renekton: "renekton",
  shen: "shen",
  zed: "zed",
};

export function getLegendIconUrl(legendName: string): string | null {
  // Deux Légendes Master Yi : le Wuju Master a sa propre icône, le Bladesman garde
  // celle de la table. Sans ce test, les deux tombaient sur la même image.
  if (legendName.toLowerCase().includes("wuju master")) return "/img/legend_icon/masteryi_2.webp";
  const file = ICON_MAP[cleLegende(legendName)];
  return file ? `/img/legend_icon/${file}.webp` : null;
}

export function getMasterYiIconUrl(variant: "bladesman" | "master"): string {
  return variant === "master" ? "/img/legend_icon/masteryi_2.webp" : "/img/legend_icon/masteryi_1.webp";
}
