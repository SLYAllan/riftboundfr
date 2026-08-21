"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export interface LegendeOverlay {
  id: string;
  name: string;
  imageUrl: string | null;
  domains: string[];
}

export type GenreListe = "legendes" | "terrains" | "champions";
export type ErreursListes = Partial<Record<GenreListe, string>>;

/**
 * Les trois listes que remplissent le tableau de bord et le compagnon : Légendes,
 * champs de bataille, et les champions de la Légende choisie par chaque joueur.
 *
 * Elles étaient chargées des deux côtés, avec deux qualités différentes. Côté
 * tableau de bord, un `.catch(() => {})` avalait tout : une API en panne rendait
 * une liste vide sans un mot, et un corps d'erreur `{ error: … }` passait droit
 * dans `setLegends`, où le `.map` du rendu faisait tomber TOUTE la page en plein
 * direct. D'où les trois règles tenues ici, une fois pour les deux :
 *
 * 1. `r.ok` d'abord, et on refuse ce qui n'est pas un tableau ;
 * 2. l'échec se voit et se retente, il ne disparaît pas ;
 * 3. la requête de champions en cours est annulée quand la Légende change, sinon
 *    la réponse lente arrive en dernier et affiche les champions du mauvais deck.
 */
export function useListesOverlay(legendes: [string, string], messageErreur: string) {
  const [listeLegendes, setListeLegendes] = useState<LegendeOverlay[]>([]);
  const [terrains, setTerrains] = useState<string[]>([]);
  const [champions, setChampions] = useState<[string[], string[]]>([[], []]);
  const [erreurs, setErreurs] = useState<ErreursListes>({});
  const requetes = useRef<[AbortController | null, AbortController | null]>([null, null]);

  const marquer = useCallback((genre: GenreListe, message?: string) => {
    setErreurs((courantes) => ({ ...courantes, [genre]: message }));
  }, []);

  const charger = useCallback(
    async <T,>(url: string, genre: GenreListe, poser: (v: T[]) => void, signal?: AbortSignal) => {
      try {
        const reponse = await fetch(url, { signal });
        if (!reponse.ok) throw new Error(String(reponse.status));
        const corps: unknown = await reponse.json();
        // Une route en panne rend `{ error: … }` avec un 500 ; sans ce garde-fou,
        // l'objet arrivait dans l'état et le `.map` du rendu levait.
        if (!Array.isArray(corps)) throw new Error("réponse inattendue");
        poser(corps as T[]);
        marquer(genre, undefined);
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        marquer(genre, messageErreur);
      }
    },
    [marquer, messageErreur],
  );

  const chargerLegendes = useCallback(
    () => void charger<LegendeOverlay>("/api/legends", "legendes", setListeLegendes),
    [charger],
  );
  const chargerTerrains = useCallback(
    () => void charger<string>("/api/battlefields", "terrains", setTerrains),
    [charger],
  );

  const chargerChampions = useCallback(
    (i: 0 | 1, nom: string) => {
      requetes.current[i]?.abort();
      if (!nom) {
        setChampions((c) => (i === 0 ? [[], c[1]] : [c[0], []]));
        return;
      }
      const controleur = new AbortController();
      requetes.current[i] = controleur;
      void charger<string>(
        `/api/legends/champions?legend=${encodeURIComponent(nom)}`,
        "champions",
        (liste) => setChampions((c) => (i === 0 ? [liste, c[1]] : [c[0], liste])),
        controleur.signal,
      );
    },
    [charger],
  );

  // `queueMicrotask` : vider la liste des champions quand la Légende disparaît est
  // un `setState` synchrone, et `react-hooks/set-state-in-effect` le refuse au corps
  // d'un effet. On sort du corps sans rien changer d'autre.
  useEffect(() => {
    queueMicrotask(() => {
      chargerLegendes();
      chargerTerrains();
    });
  }, [chargerLegendes, chargerTerrains]);

  const [l0, l1] = legendes;
  useEffect(() => {
    queueMicrotask(() => {
      chargerChampions(0, l0);
      chargerChampions(1, l1);
    });
  }, [l0, l1, chargerChampions]);

  return {
    legendes: listeLegendes,
    terrains,
    champions,
    erreurs,
    chargerLegendes,
    chargerTerrains,
    rechargerChampions: () => {
      chargerChampions(0, l0);
      chargerChampions(1, l1);
    },
  };
}
