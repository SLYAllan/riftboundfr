export function creerFileEtats<T>(envoyer: (etat: T) => Promise<void>) {
  let attente: T | undefined;
  let enCours = false;
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
    if (enCours || attente === undefined) return;
    const etat = attente;
    attente = undefined;
    enCours = true;
    try {
      await envoyer(etat);
    } catch {
      attente ??= etat;
    } finally {
      enCours = false;
      notifier();
      if (attente !== undefined && attente !== etat) void vider();
    }
  }

  return {
    ajouter(etat: T) {
      attente = etat;
      void vider();
    },
    relancer() {
      void vider();
    },
    quandCalme: () => (enCours ? new Promise<void>((resoudre) => calme.push(resoudre)) : Promise.resolve()),
    quandVide: () => (!enCours && attente === undefined ? Promise.resolve() : new Promise<void>((resoudre) => vide.push(resoudre))),
  };
}
