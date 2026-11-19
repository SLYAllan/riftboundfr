// La règle vit dans `src/lib/apres-ban.ts` depuis que la page après-ban du site la
// lit aussi : deux copies auraient fini par compter des tournois différents.
// Réexport nommé, pas `export *` : un .mts qui importe ce fichier ne voyait aucun
// des noms, et `maj:stats` s'arrêtait à l'étape 3.
export { DERNIER_BAN, dernierBan, setEnCours, tournoisApresBan } from "../src/lib/apres-ban";
