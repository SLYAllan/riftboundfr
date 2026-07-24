// Errata officiel du 23 juillet 2026 (publié avec les règles Vendetta) :
// https://playriftbound.com/en-us/news/announcements/vendetta-errata-updates/
// Source unique : la page /guides/ban-list affiche before/after + explication,
// et scripts/apply-errata-2026-07.ts applique before -> after dans la DB.
// `before`/`after` = le fragment de texte qui change (codes :rb_...: rendus en
// icônes par CardTextRenderer). NE PAS retoucher : le script matche `before` à
// l'identique dans textPlain.
export interface ErrataEntry {
  name: string; // nom de carte (EN, tel qu'en DB)
  set: string; // libellé de set affiché
  before: string;
  after: string;
  change: string; // explication en français
}

// Retrouve l'errata d'une carte par son nom. Les variantes (alt-art, overnumbered,
// « (Metal) »…) partagent le texte de l'impression de base -> même errata.
export function getErrata(cardName: string): ErrataEntry | undefined {
  return ERRATA_2026_07.find((e) => cardName === e.name || cardName.startsWith(e.name + " ("));
}

export const ERRATA_2026_07: ErrataEntry[] = [
  {
    name: "Draven, Vanquisher",
    set: "Spiritforged",
    before: "When I attack or defend, you may pay :rb_rune_fury:. If you do, give me +2 :rb_might: this turn.",
    after: "When I attack or defend, you may pay :rb_rune_fury: to give me +2 :rb_might: this turn.",
    change: "Payer la rune de Furie devient un vrai coût : on paie en jouant la capacité, plus à sa résolution.",
  },
  {
    name: "Emperor's Dais",
    set: "Spiritforged",
    before: "return a unit you control here to its owner's hand. If you do, play a 2 :rb_might: Sand Soldier unit token here.",
    after: "return a unit you control here to its owner's hand to play a 2 :rb_might: Sand Soldier unit token here.",
    change: "Même logique : le retour en main fait partie du coût, plus moyen d'y échapper en réponse.",
  },
  {
    name: "Fizz, Trickster",
    set: "Spiritforged",
    before: "Recycle that spell after you play it.",
    after: "Then recycle it.",
    change: "Le sort choisi est recyclé même s'il est contré. Le texte confirme la ruling appliquée depuis Unleashed.",
  },
  {
    name: "Diana, Lunari",
    set: "Unleashed",
    before: "you may pay :rb_energy_1:. If you do, [Predict], then reveal",
    after: "you may pay :rb_energy_1: to [Predict], then reveal",
    change: "Payer 1 énergie devient un coût : une fois payé, le Predict se fait, pas de retour en arrière.",
  },
  {
    name: "Stalking Wolf",
    set: "Unleashed",
    before: "You may play me to its battlefield (even if you don't have other units there).",
    after: "You may [Ambush] me to its battlefield, even if you don't have other units there.",
    change: "On peut sacrifier son seul allié au champ de bataille et garder la permission d'Ambush. C'est maintenant écrit noir sur blanc.",
  },
  {
    name: "Astral Heron",
    set: "Vendetta",
    before: "your next card costs :rb_energy_2::rb_rune_rainbow::rb_rune_rainbow: less.",
    after: "the next card you play this turn costs :rb_energy_2::rb_rune_rainbow::rb_rune_rainbow: less.",
    change: "La réduction de coût ne vaut que pour une carte jouée ce tour, elle ne se garde pas pour plus tard.",
  },
  {
    name: "Gangplank, Naval",
    set: "Vendetta",
    before: "give me +3 :rb_might: instead.",
    after: "give me +3 :rb_might: this turn instead.",
    change: "Le +3 de puissance est limité au tour. Une coquille d'impression, rien de plus.",
  },
  {
    name: "Resonating Strike",
    set: "Vendetta",
    before: "[Reaction] (Play on your turn or in showdowns.)",
    after: "[Reaction] (Play any time, even before spells and abilities resolve.)",
    change: "La Réaction se joue à tout moment, même avant la résolution des sorts et capacités, pas seulement à ton tour.",
  },
];
