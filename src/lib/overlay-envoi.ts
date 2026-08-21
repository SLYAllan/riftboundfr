export type EtatEnvoi = "envoi" | "a-jour" | "hors-ligne";

/**
 * File d'envoi vers l'habillage, pour le tableau de bord comme pour le compagnon.
 *
 * Elle existait en deux exemplaires, écrits à un jour d'intervalle : mêmes
 * variables, mêmes fonctions, et déjà deux noms pour le même bouton. Elles avaient
 * commencé à diverger sur la reprise après échec. La seule différence qui comptait
 * est ici en paramètre : comment combiner deux envois qui attendent. Le tableau de
 * bord poste l'état entier, le dernier gagne ; le compagnon poste des patchs et les
 * fusionne, sinon un champ modifié entre deux envois disparaîtrait.
 *
 * Un seul envoi à la fois : deux POST en vol peuvent arriver dans le désordre, et
 * l'ancien écraserait le neuf en base.
 */
export function creerFileEnvoi<T>(
  envoyer: (valeur: T) => Promise<void>,
  options: { combiner?: (attente: T, nouveau: T) => T; surEtat?: (etat: EtatEnvoi) => void } = {},
) {
  const combiner = options.combiner ?? ((_attente: T, nouveau: T) => nouveau);
  const surEtat = options.surEtat ?? (() => {});

  let attente: T | undefined;
  let enCours = false;
  // Après un refus, on garde la valeur et on n'insiste pas tout seul : rien ne dit
  // que le serveur sera revenu une seconde plus tard. Le geste suivant relance.
  let bloquee = false;
  let calme: Array<() => void> = [];
  let vide: Array<() => void> = [];

  function notifier() {
    if (!enCours) {
      calme.forEach((resoudre) => resoudre());
      calme = [];
    }
    if (!enCours && attente === undefined) {
      vide.forEach((resoudre) => resoudre());
      vide = [];
    }
  }

  async function vider() {
    if (enCours || bloquee || attente === undefined) {
      notifier();
      return;
    }
    const valeur = attente;
    attente = undefined;
    enCours = true;
    surEtat("envoi");
    try {
      await envoyer(valeur);
      surEtat("a-jour");
    } catch {
      attente = attente === undefined ? valeur : combiner(valeur, attente);
      bloquee = true;
      surEtat("hors-ligne");
    } finally {
      enCours = false;
      notifier();
      if (!bloquee && attente !== undefined) void vider();
    }
  }

  return {
    ajouter(valeur: T) {
      attente = attente === undefined ? valeur : combiner(attente, valeur);
      // Une action de plus vaut un nouvel essai. Sans ça, un seul envoi refusé
      // gelait la file : le téléphone continuait de compter, l'écran du stream
      // restait figé, et rien ne repartait tant que personne ne lisait la
      // bannière pour cliquer « Réessayer ».
      bloquee = false;
      void vider();
    },
    renvoyer() {
      bloquee = false;
      void vider();
    },
    quandCalme: () => (enCours ? new Promise<void>((resoudre) => calme.push(resoudre)) : Promise.resolve()),
    quandVide: () => (!enCours && attente === undefined ? Promise.resolve() : new Promise<void>((resoudre) => vide.push(resoudre))),
    prendreEnAttente(): T | null {
      // Un second POST pendant celui qui tourne pourrait arriver le premier en base,
      // puis se faire écraser par l'ancien. Mieux vaut laisser keepalive finir l'envoi.
      if (enCours || attente === undefined) return null;
      const valeur = attente;
      attente = undefined;
      notifier();
      return valeur;
    },
  };
}
