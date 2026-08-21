"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Upload, Trash2,
  X, Plus, Share2, ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DOMAIN_LABELS_FR } from "@/lib/domains";
import { encodeDeckBase64, decodeDeck } from "@/lib/deck-codec";
import { getSavedDecks, saveDeck, updateDeck, deleteDeck, saveDraft, loadDraft } from "@/lib/deck-storage";
import { entriesToDeckCode, parseDeckCode } from "@/lib/deck-code";
import { deckCoverageItems } from "@/lib/deck-cards";
import { CardBrowserV2 } from "./components/card-browser";
import { DeckPanelV2 } from "./components/deck-panel";
import { ImportModal } from "./components/import-modal";
import { ExportModal } from "./components/export-modal";
import { DeckCoveragePanel } from "@/components/collection/deck-coverage-panel";
import { MetaIndicator } from "./components/meta-indicator";
import { exportAsCardNames, exportAsTTS, parseCardNamesImport, parseTTSImport } from "@/lib/export-formats";
import { generateDeckImage } from "@/lib/export-image";
import { SIDE_SIZE } from "./lib/deck-rules";
import { findMatchingChampion, splitChampion } from "./lib/champion";
import { preferredPrinting } from "@/lib/card-printing";
import { downloadBlob } from "@/lib/download";
import { useDialogA11y } from "@/hooks/use-dialog-a11y";
import type { RuneSuggestion } from "./lib/rune-calculator";
import type { CardData, DeckEntry, DeckState, BuilderTab } from "@/types";
import type { DeckSection } from "@/types";
import type { SavedDeck } from "@/lib/deck-storage";
import { useT } from "@/components/i18n-provider";

const EMPTY_DECK: DeckState = {
  legend: null,
  champion: null,
  main: [],
  rune: [],
  battlefield: [],
  side: [],
};

function cardToEntry(card: CardData, qty = 1): DeckEntry {
  return {
    cardId: card.id,
    name: card.name,
    imageUrl: card.imageUrl,
    type: card.type,
    supertype: card.supertype,
    rarity: card.rarity,
    energy: card.energy,
    might: card.might,
    power: card.power,
    domains: card.domains,
    quantity: qty,
  };
}

function detectSection(card: CardData): DeckSection {
  if (card.type === "Legend") return "legend";
  if (card.type === "Rune") return "rune";
  if (card.type === "Battlefield") return "battlefield";
  return "main";
}

function maxQuantity(section: DeckSection, _type: string): number {
  if (section === "legend") return 1;
  if (section === "battlefield") return 1;
  if (section === "rune") return 12;
  return 3;
}

interface DeckbuilderV2Props {
  initialCards: CardData[];
  idAliases?: Record<string, string>;
  isAdmin?: boolean;
}

export function DeckbuilderV2({ initialCards, idAliases = {}, isAdmin = false }: DeckbuilderV2Props) {
  const t = useT();
  const searchParams = useSearchParams();
  const [cards] = useState(initialCards);
  const [deck, setDeck] = useState<DeckState>(EMPTY_DECK);
  const [deckTitle, setDeckTitle] = useState("Nouveau deck");
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<BuilderTab>("legend");
  const [addToSide, setAddToSide] = useState(false);
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([]);
  const [showSavedList, setShowSavedList] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  // Sous sm le panneau de deck est masqué : ce tiroir est le seul moyen de voir sa liste.
  const [showDeckSheet, setShowDeckSheet] = useState(false);
  // Code de partage du deck communautaire en cours de modification (?maj=).
  const [updateShareCode] = useState<string | null>(() => searchParams.get("maj"));
  const [erreurMaj, setErreurMaj] = useState<string | null>(null);
  const isCompetitive = true;
  const initialized = useRef(false);

  const cardMap = useMemo(() => {
    const m = new Map<string, CardData>();
    for (const c of cards) m.set(c.id, c);
    return m;
  }, [cards]);



  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    queueMicrotask(() => {
      setSavedDecks(getSavedDecks());

      // ?maj=<shareCode> : on revient d'un deck communautaire pour le modifier. On
      // recharge sa liste depuis l'API, plus besoin de coller un code à la main.
      const majParam = searchParams.get("maj");
      if (majParam) {
        fetch(`/api/community-decks/${majParam}`)
          .then(async (r) => {
            if (!r.ok) {
              const corps: { error?: string } = await r.json().catch(() => ({}));
              throw new Error(corps.error ?? "Impossible de charger le deck à modifier.");
            }
            return r.json();
          })
          .then((d) => {
            if (!d?.deckCode) {
              setErreurMaj("Ce deck n'a pas de liste à modifier.");
              return;
            }
            handleCardNamesImport(d.deckCode);
            if (d.title) setDeckTitle(d.title);
          })
          .catch((cause) => {
            setErreurMaj(cause instanceof Error ? cause.message : "Impossible de charger le deck à modifier.");
          });
        return;
      }

      const deckParam = searchParams.get("deck");
      if (deckParam) {
        const decoded = decodeDeck(deckParam);
        if (decoded) {
          loadFromCodeData(decoded);
          return;
        }
      }

      // Pas de deck dans l'URL : on reprend le brouillon local, s'il y en a un.
      const draft = loadDraft<DeckState>();
      if (draft?.deck) {
        setDeck(draft.deck);
        setDeckTitle(draft.title || "Nouveau deck");
        if (draft.deck.legend) setActiveTab("main");
      }
    });
  }, [searchParams]);

  // Sauvegarde du brouillon à chaque changement, pour survivre à un F5.
  // On saute le tout premier passage : il a lieu avant que l'effet ci-dessus
  // n'ait posé son état, et écraserait le brouillon avec un deck vide.
  const draftReady = useRef(false);
  useEffect(() => {
    if (!draftReady.current) {
      draftReady.current = true;
      return;
    }
    saveDraft(deckTitle, deck);
  }, [deck, deckTitle]);

  function resolveCard(id: string): CardData | undefined {
    return cardMap.get(id) ?? cardMap.get(idAliases[id]);
  }

  function loadFromCodeData(data: ReturnType<typeof decodeDeck>) {
    if (!data) return;
    const newDeck: DeckState = { ...EMPTY_DECK, main: [], rune: [], battlefield: [], side: [] };

    if (data.legend) {
      const c = resolveCard(data.legend.cardId);
      if (c) newDeck.legend = cardToEntry(c);
    }
    for (const section of ["main", "rune", "battlefield", "side"] as const) {
      for (const entry of data[section]) {
        const c = resolveCard(entry.cardId);
        if (c) {
          const actualSection = c.type === "Rune" ? "rune"
            : c.type === "Battlefield" ? "battlefield"
            : section;
          // Deux éditions différentes d'une même carte (riftboundId distincts)
          // résolvent vers la même carte canonique → on fusionne les quantités au
          // lieu de créer 2 entrées (sinon doublon de clé React dans le panel).
          const existing = newDeck[actualSection].find((e) => e.cardId === c.id);
          if (existing) existing.quantity += entry.quantity;
          else newDeck[actualSection].push(cardToEntry(c, entry.quantity));
        }
      }
    }
    // Le champion (encodé en C:) est une carte réelle du main deck. On l'ajoute
    // TOUJOURS au main. S'il y figure déjà (codes page deck/article qui l'incluent
    // aussi en M: à sa quantité réelle), on incrémente la quantité (+1) au lieu de
    // créer une 2e entrée - ça évite le doublon de clé React tout en gardant le
    // compte exact (ex. 40/40 = 39 cartes main + le champion de la section légende).
    if (data.champion) {
      const c = resolveCard(data.champion.cardId);
      if (c) {
        const qty = data.champion.quantity || 1; // respecte les copies multiples (2-3) du champion
        const existing = newDeck.main.find((e) => e.cardId === c.id);
        if (existing) existing.quantity += qty;
        else newDeck.main.push(cardToEntry(c, qty));
      }
    }

    setDeck(newDeck);
    if (newDeck.legend) setActiveTab("main");
  }

  const legendDomains = useMemo(() => deck.legend?.domains ?? [], [deck.legend]);

  const deckCardCounts = useMemo(() => {
    const counts = new Map<string, number>();
    const all = [...deck.main, ...deck.rune, ...deck.battlefield, ...deck.side];
    if (deck.legend) all.push(deck.legend);
    for (const e of all) {
      counts.set(e.cardId, (counts.get(e.cardId) ?? 0) + e.quantity);
    }
    return counts;
  }, [deck]);

  const mainTotal = deck.main.reduce((s, e) => s + e.quantity, 0);
  const sideTotal = deck.side.reduce((s, e) => s + e.quantity, 0);
  const runeTotal = deck.rune.reduce((s, e) => s + e.quantity, 0);
  const bfTotal = deck.battlefield.reduce((s, e) => s + e.quantity, 0);

  // Items pour le calcul « cartes manquantes ». La réserve en fait partie : elle
  // était oubliée ici, donc le compteur annonçait moins de manquantes qu'en vrai.
  const coverageItems = useMemo(
    () =>
      deckCoverageItems({
        legend: deck.legend ? { cardId: deck.legend.cardId, quantity: 1 } : null,
        champion: deck.champion ? { cardId: deck.champion.cardId, quantity: 1 } : null,
        main: deck.main.map((e) => ({ cardId: e.cardId, quantity: e.quantity })),
        rune: deck.rune.map((e) => ({ cardId: e.cardId, quantity: e.quantity })),
        battlefield: deck.battlefield.map((e) => ({ cardId: e.cardId, quantity: e.quantity })),
        side: deck.side.map((e) => ({ cardId: e.cardId, quantity: e.quantity })),
      }),
    [deck],
  );

  const addCard = useCallback((card: CardData, toSide?: boolean) => {
    setDeck((prev) => {
      let section = detectSection(card);

      if (section === "main" && (toSide || addToSide)) section = "side";

      if (section === "legend" && card.type === "Legend") {
        if (prev.legend?.cardId === card.id) return prev;
        const newLegendFirstName = card.name.split(",")[0].toLowerCase();
        const keepEntry = (e: DeckEntry) => {
          if (e.supertype !== "Signature") return true;
          const full = cardMap.get(e.cardId);
          return full?.tags.some((t) => t.toLowerCase() === newLegendFirstName) ?? false;
        };
        return {
          ...prev,
          legend: cardToEntry(card),
          champion: null,
          main: prev.main.filter(keepEntry),
          side: prev.side.filter(keepEntry),
        };
      }

      if (section === "side") {
        const sideTotal = prev.side.reduce((s, e) => s + e.quantity, 0);
        if (sideTotal >= SIDE_SIZE) return prev;
      }

      const arr = [...(prev[section] as DeckEntry[])];
      const existing = arr.findIndex((e) => e.cardId === card.id);
      const max = maxQuantity(section, card.type);

      const mainQty = prev.main.find((e) => e.cardId === card.id)?.quantity ?? 0;
      const sideQty = prev.side.find((e) => e.cardId === card.id)?.quantity ?? 0;
      const crossTotal = mainQty + sideQty;
      if ((section === "main" || section === "side") && crossTotal >= max) return prev;

      if (existing >= 0) {
        if (arr[existing].quantity >= max) return prev;
        arr[existing] = { ...arr[existing], quantity: arr[existing].quantity + 1 };
      } else {
        arr.push(cardToEntry(card, 1));
      }

      arr.sort((a, b) => (a.energy ?? 0) - (b.energy ?? 0) || a.name.localeCompare(b.name));
      return { ...prev, [section]: arr };
    });

    const section = detectSection(card);
    if (section === "legend" && card.type === "Legend") {
      setActiveTab("main");
    }
  }, [addToSide, cardMap]);

  const removeCard = useCallback((section: DeckSection, cardId: string) => {
    setDeck((prev) => {
      if (section === "legend") {
        if (prev.legend?.cardId === cardId) return { ...prev, legend: null, champion: null };
        return prev;
      }
      return { ...prev, [section]: prev[section].filter((e) => e.cardId !== cardId) };
    });
  }, []);

  const updateQuantity = useCallback((section: DeckSection, cardId: string, delta: number) => {
    setDeck((prev) => {
      if (section === "legend") return prev;
      const arr = prev[section].map((e) => {
        if (e.cardId !== cardId) return e;
        const max = maxQuantity(section, e.type);
        if (delta > 0 && (section === "main" || section === "side")) {
          const otherSection = section === "main" ? "side" : "main";
          const otherQty = prev[otherSection].find((o) => o.cardId === cardId)?.quantity ?? 0;
          if (e.quantity + otherQty >= max) return e;
        }
        const newQty = Math.max(0, Math.min(e.quantity + delta, max));
        return { ...e, quantity: newQty };
      }).filter((e) => e.quantity > 0);
      return { ...prev, [section]: arr };
    });
  }, []);

  const moveCard = useCallback((from: DeckSection, to: DeckSection, cardId: string) => {
    setDeck((prev) => {
      const fromSection = prev[from];
      if (!Array.isArray(fromSection)) return prev;
      const entry = fromSection.find((e) => e.cardId === cardId);
      if (!entry) return prev;
      const fromArr = fromSection.filter((e) => e.cardId !== cardId);
      const toArr = [...(prev[to] as DeckEntry[])];
      const existing = toArr.findIndex((e) => e.cardId === cardId);
      if (existing >= 0) {
        toArr[existing] = { ...toArr[existing], quantity: toArr[existing].quantity + entry.quantity };
      } else {
        toArr.push(entry);
      }
      toArr.sort((a, b) => (a.energy ?? 0) - (b.energy ?? 0) || a.name.localeCompare(b.name));
      return { ...prev, [from]: fromArr, [to]: toArr };
    });
  }, []);

  const applyRuneSuggestions = useCallback((suggestions: RuneSuggestion[]) => {
    setDeck((prev) => {
      const runeCards = cards.filter((c) => c.type === "Rune");
      const newRunes: DeckEntry[] = [];

      for (const suggestion of suggestions) {
        const runeCard = runeCards.find((c) =>
          c.domains.some((d) => d.toLowerCase() === suggestion.domain.toLowerCase()) &&
          legendDomains.some((ld) => c.domains.includes(ld))
        );
        if (runeCard) {
          newRunes.push(cardToEntry(runeCard, suggestion.count));
        }
      }

      return { ...prev, rune: newRunes };
    });
  }, [cards, legendDomains]);

  function clearDeck() {
    setDeck(EMPTY_DECK);
    setDeckTitle("Nouveau deck");
    setActiveDeckId(null);
    setActiveTab("legend");
  }

  function handleSave() {
    // Un exemplaire du champion est rangé dans la section "legend" ; il est retiré du
    // main sauvegardé pour ne pas être compté deux fois au rechargement.
    const { champion: championEntry, rest: mainRest } = splitChampion(deck.main, deck.legend?.name);
    const data = {
      title: deckTitle,
      legendId: deck.legend?.cardId ?? null,
      legendName: deck.legend?.name ?? null,
      legendDomains,
      sections: {
        legend: deck.legend ? [deckEntryToSaved(deck.legend)] : [],
        main: mainRest.map(deckEntryToSaved),
        rune: deck.rune.map(deckEntryToSaved),
        battlefield: deck.battlefield.map(deckEntryToSaved),
        side: deck.side.map(deckEntryToSaved),
      },
    };

    if (championEntry) {
      data.sections.legend.push(deckEntryToSaved(championEntry));
    }

    if (activeDeckId) {
      updateDeck(activeDeckId, data);
    } else {
      const saved = saveDeck(data);
      setActiveDeckId(saved.id);
    }
    setSavedDecks(getSavedDecks());
  }

  function deckEntryToSaved(e: DeckEntry) {
    return {
      cardId: e.cardId,
      name: e.name,
      imageUrl: e.imageUrl,
      type: e.type,
      rarity: e.rarity,
      energy: e.energy,
      domains: e.domains,
      quantity: e.quantity,
    };
  }

  function loadSaved(saved: SavedDeck) {
    const newDeck: DeckState = { legend: null, champion: null, main: [], rune: [], battlefield: [], side: [] };

    // Le champion sauvegardé revient au main. Depuis qu'on n'en détache qu'un
    // exemplaire, ses copies sont aussi dans la section main : sans fusion on
    // obtiendrait deux entrées pour la même carte (clé React en double).
    const add = (section: DeckSection, card: CardData, qty: number) => {
      const list = newDeck[section] as DeckEntry[];
      const existing = list.find((e) => e.cardId === card.id);
      if (existing) existing.quantity += qty;
      else list.push(cardToEntry(card, qty));
    };

    for (const entry of saved.sections.legend ?? []) {
      const card = cardMap.get(entry.cardId);
      if (!card) continue;
      if (card.type === "Legend") newDeck.legend = cardToEntry(card, entry.quantity);
      else if (card.supertype === "Champion") add("main", card, entry.quantity);
    }

    for (const section of ["main", "rune", "battlefield", "side"] as const) {
      for (const entry of saved.sections[section] ?? []) {
        const card = cardMap.get(entry.cardId);
        if (card) add(section, card, entry.quantity);
      }
    }

    setDeck(newDeck);
    setDeckTitle(saved.title);
    setActiveDeckId(saved.id);
    setShowSavedList(false);
    if (newDeck.legend) setActiveTab("main");
  }

  function handleDeleteSaved(id: string) {
    deleteDeck(id);
    setSavedDecks(getSavedDecks());
    if (activeDeckId === id) setActiveDeckId(null);
  }

  // Le code base64 seul, sans l'URL autour : c'est ce que /api/decklist-image
  // attend en ?code=.
  function getDeckCode(): string {
    return getShareUrl().split("deck=")[1] ?? "";
  }

  function getShareUrl(): string {
    const { champion: championInMain, rest: mainRest } = splitChampion(deck.main, deck.legend?.name);
    const codeData = {
      legend: deck.legend ? { cardId: deck.legend.cardId, quantity: 1 } : null,
      champion: championInMain ? { cardId: championInMain.cardId, quantity: 1 } : null,
      main: mainRest.map((e) => ({ cardId: e.cardId, quantity: e.quantity })),
      rune: deck.rune.map((e) => ({ cardId: e.cardId, quantity: e.quantity })),
      battlefield: deck.battlefield.map((e) => ({ cardId: e.cardId, quantity: e.quantity })),
      side: deck.side.map((e) => ({ cardId: e.cardId, quantity: e.quantity })),
    };
    const code = encodeDeckBase64(codeData);
    return `${window.location.origin}/deckbuilder?deck=${code}`;
  }

  function getTextCode(): string {
    const fmt = (n: string) => n;
    const entries: { quantity: number; name: string; section: "legend" | "champion" | "main" | "rune" | "battlefield" | "side" }[] = [];
    if (deck.legend) entries.push({ quantity: 1, name: fmt(deck.legend.name), section: "legend" });
    const { champion: championInMain, rest: mainRest } = splitChampion(deck.main, deck.legend?.name);
    if (championInMain) entries.push({ quantity: 1, name: fmt(championInMain.name), section: "champion" });
    for (const e of mainRest) entries.push({ quantity: e.quantity, name: fmt(e.name), section: "main" });
    for (const e of deck.rune) entries.push({ quantity: e.quantity, name: fmt(e.name), section: "rune" });
    for (const e of deck.battlefield) entries.push({ quantity: e.quantity, name: fmt(e.name), section: "battlefield" });
    for (const e of deck.side) entries.push({ quantity: e.quantity, name: fmt(e.name), section: "side" });
    return entriesToDeckCode(entries);
  }

  function getTTSCode(): string {
    const allCards = [
      ...(deck.legend ? [{ cardId: deck.legend.cardId, name: deck.legend.name, quantity: 1, section: "legend" as const }] : []),
      ...deck.main.map((e) => ({ cardId: e.cardId, name: e.name, quantity: e.quantity, section: "main" as const })),
      ...deck.rune.map((e) => ({ cardId: e.cardId, name: e.name, quantity: e.quantity, section: "rune" as const })),
      ...deck.battlefield.map((e) => ({ cardId: e.cardId, name: e.name, quantity: e.quantity, section: "battlefield" as const })),
      ...deck.side.map((e) => ({ cardId: e.cardId, name: e.name, quantity: e.quantity, section: "side" as const })),
    ];
    return exportAsTTS(allCards);
  }

  function handleImport(text: string, format: string) {
    if (format === "tts") {
      const ttsEntries = parseTTSImport(text);
      const newDeck: DeckState = { legend: null, champion: null, main: [], rune: [], battlefield: [], side: [] };
      for (const entry of ttsEntries) {
        const card = cardMap.get(entry.cardId);
        if (!card) continue;
        if (card.type === "Legend") newDeck.legend = cardToEntry(card);
        else {
          const section = detectSection(card);
          const arr = newDeck[section];
          if (Array.isArray(arr)) arr.push(cardToEntry(card, entry.quantity));
        }
      }
      setDeck(newDeck);
      if (newDeck.legend) setActiveTab("main");
    } else if (format === "cardnames") {
      handleCardNamesImport(text);
    } else {
      const decoded = decodeDeck(text.trim());
      if (decoded) {
        loadFromCodeData(decoded);
      } else {
        handleCardNamesImport(text);
      }
    }
    setShowImport(false);
  }

  function handleCardNamesImport(text: string) {
    const parsed = parseDeckCode(text);
    if (parsed.entries.length === 0) return;

    const newDeck: DeckState = { legend: null, champion: null, main: [], rune: [], battlefield: [], side: [] };

    for (const entry of parsed.entries) {
      const nameLower = entry.name.toLowerCase();
      const nameDash = nameLower.replace(",", " -");
      const nameNoApostrophe = nameLower.replace(/'/g, "");
      // Plusieurs impressions portent le même nom : on prend l'ordinaire, pas la
      // première venue (souvent une promo ou une showcase).
      const card = cards
        .filter((c) => {
          const n = c.name.toLowerCase();
          const nNoApostrophe = n.replace(/'/g, "");
          return n === nameLower || n === nameDash || nNoApostrophe === nameNoApostrophe;
        })
        .reduce<CardData | undefined>((best, c) => (best ? preferredPrinting(best, c) : c), undefined);
      if (!card) continue;

      if (card.type === "Legend") {
        newDeck.legend = cardToEntry(card);
      } else {
        const section = card.type === "Rune" ? "rune"
          : card.type === "Battlefield" ? "battlefield"
          : entry.section === "side" ? "side" : "main";
        // Le champion apparaît deux fois dans un code texte (section Champion + ses
        // copies du deck principal). Sans fusion, deux lignes pour la même carte :
        // clé React en double, et un compte faux à la ré-export.
        const list = newDeck[section] as DeckEntry[];
        const existing = list.find((e) => e.cardId === card.id);
        if (existing) existing.quantity += entry.quantity;
        else list.push(cardToEntry(card, entry.quantity));
      }
    }

    setDeck(newDeck);
    if (newDeck.legend) setActiveTab("main");
  }

  async function handlePublish(isPublic: boolean, opts: { tags: string[]; description: string }): Promise<string | null> {
    try {
      const res = await fetch("/api/community-decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: deckTitle,
          legendId: deck.legend?.cardId,
          legendName: deck.legend?.name,
          deckCode: getTextCode(),
          description: opts.description || undefined,
          tags: opts.tags,
          domains: legendDomains,
          isPublic,
          mainCount: mainTotal,
          runeCount: runeTotal,
          bfCount: bfTotal,
        }),
      });
      const data = await res.json();
      if (data.error) return data.error;
      if (data.shareCode) {
        return `${window.location.origin}/d/${data.shareCode}`;
      }
    } catch { /* ignore */ }
    return null;
  }

  // Renvoie null si tout va bien, sinon le message d'erreur à afficher.
  async function handleUpdatePublished(changelog: string): Promise<string | null> {
    if (!updateShareCode) return "Aucun deck à mettre à jour";
    try {
      const res = await fetch(`/api/community-decks/${updateShareCode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckCode: getTextCode(), changelog: changelog || undefined }),
      });
      const data = await res.json();
      if (!res.ok) return data.error ?? "Erreur lors de la mise à jour";
    } catch {
      return "Erreur lors de la mise à jour";
    }
    return null;
  }

  function handleSectionClick(section: string) {
    const tabMap: Record<string, BuilderTab> = {
      legend: "legend",
      main: "main",
      rune: "rune",
      battlefield: "battlefield",
      side: "main",
    };
    setActiveTab(tabMap[section] ?? "main");
  }

  async function handleExportImage() {
    const champion = findMatchingChampion(deck.main, deck.legend?.name);
    const blob = await generateDeckImage({
      title: deckTitle,
      legend: deck.legend,
      champion,
      main: deck.main,
      rune: deck.rune,
      battlefield: deck.battlefield,
      side: deck.side,
      legendDomains,
    });
    if (!blob) throw new Error("Génération de l'image impossible");
    downloadBlob(blob, `${deckTitle.replace(/[^a-zA-Z0-9_-]/g, "_")}.png`);
  }

  const isEmpty = !deck.legend && deck.main.length === 0 && deck.rune.length === 0;

  // `short` évite que les onglets passent sur deux lignes sur un téléphone.
  const tabs: { key: BuilderTab; label: string; short: string; done: boolean }[] = [
    { key: "legend", label: "Légende", short: "Légende", done: !!deck.legend },
    { key: "main", label: `Deck/Réserve (${mainTotal + sideTotal})`, short: `Deck (${mainTotal + sideTotal})`, done: mainTotal >= 40 },
    { key: "rune", label: `Runes (${runeTotal}/12)`, short: `Runes (${runeTotal}/12)`, done: runeTotal === 12 },
    { key: "battlefield", label: `Champs de bataille (${bfTotal}/3)`, short: `Champs (${bfTotal}/3)`, done: bfTotal === 3 },
  ];

  return (
    <div className="flex flex-col h-[calc(100dvh-57px)]">
      {erreurMaj && (
        <div role="alert" className="flex items-center gap-2 border-b border-hairline bg-surface px-4 py-2 text-sm text-error">
          <span className="min-w-0 flex-1">{erreurMaj}</span>
          <button onClick={() => setErreurMaj(null)} aria-label="Fermer" className="text-ink-muted hover:text-ink">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="shrink-0 border-b border-hairline">
        <div className="flex items-center gap-2 px-4 py-3 flex-wrap">
          <h1 className="text-sm sm:text-lg font-bold shrink-0" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
            Deckbuilder<span className="hidden sm:inline"> Riftbound</span>
          </h1>
          <input
            type="text"
            value={deckTitle}
            onChange={(e) => setDeckTitle(e.target.value)}
            aria-label={t("Nom du deck")}
            className="h-9 min-w-0 flex-1 sm:h-8 sm:w-48 sm:flex-none rounded-lg border border-hairline-strong bg-surface px-3 text-base sm:text-sm font-semibold focus:border-arcane"
            style={{ fontFamily: "var(--font-rubik), sans-serif" }}
          />
          <div className="hidden sm:flex items-center gap-1">
            <button onClick={() => setShowExport(true)} disabled={isEmpty} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-violet-light hover:bg-violet/10 transition-colors disabled:opacity-30">
              <Share2 size={13} /> Exporter
            </button>
            <button onClick={() => setShowImport(true)} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-ink-secondary hover:text-ink hover:bg-surface-raised transition-colors">
              <Upload size={13} /> Importer
            </button>
            <button onClick={clearDeck} disabled={isEmpty} aria-label={t("Vider le deck")} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-ink-muted hover:text-error hover:bg-error/10 transition-colors disabled:opacity-30">
              <X size={13} />
            </button>
          </div>

        </div>

        {/* Selected legend + domains + meta */}
        {deck.legend && (
          <div className="px-4 pb-2 flex items-center gap-2 text-sm">
            <span className="text-ink-muted">{t("Légende :")}</span>
            <span className="font-semibold text-ink">{deck.legend.name.split(",")[0]}</span>
            <span className="text-ink-muted">&middot;</span>
            {legendDomains.map((d) => (
              <span key={d} className="text-sm font-medium" style={{ color: `var(--color-domain-${d.toLowerCase()}, var(--color-arcane))` }}>
                {DOMAIN_LABELS_FR[d] ?? d}
              </span>
            ))}
            <MetaIndicator legendName={deck.legend?.name.split(",")[0] ?? null} />
          </div>
        )}

        {/* Tab bar */}
        <div className="flex border-t border-hairline">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 py-2.5 text-xs font-semibold transition-colors relative",
                activeTab === tab.key
                  ? "text-arcane"
                  : tab.done
                    ? "text-success/70 hover:text-success"
                    : "text-ink-muted hover:text-ink",
              )}
              style={{ fontFamily: "var(--font-rubik), sans-serif" }}
            >
              {tab.done && tab.key !== activeTab && "✓ "}
              <span className="sm:hidden">{tab.short}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-arcane" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile action bar */}
      <div className="shrink-0 flex sm:hidden items-center gap-1 border-b border-hairline px-3 py-1.5 overflow-x-auto">
        <button onClick={() => setShowExport(true)} disabled={isEmpty} className="min-h-11 shrink-0 rounded px-2 text-[10px] text-violet-light disabled:opacity-30">Exporter</button>
        <button onClick={() => setShowImport(true)} className="min-h-11 shrink-0 rounded px-2 text-[10px] text-ink-secondary">Importer</button>
        <button onClick={clearDeck} disabled={isEmpty} className="min-h-11 shrink-0 rounded px-2 text-[10px] text-ink-muted disabled:opacity-30">Vider</button>
      </div>

      {/* Main content - 2 column */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left - Card browser */}
        <div
          className="flex-1 overflow-hidden border-r border-hairline"
          onDragOver={(e) => {
            if (e.dataTransfer.types.includes("remove-card")) {
              e.preventDefault();
              e.currentTarget.classList.add("ring-2", "ring-error/30", "ring-inset");
            }
          }}
          onDragLeave={(e) => { e.currentTarget.classList.remove("ring-2", "ring-error/30", "ring-inset"); }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("ring-2", "ring-error/30", "ring-inset");
            const data = e.dataTransfer.getData("remove-card");
            if (data) {
              const [section, cardId] = data.split("|");
              removeCard(section as DeckSection, cardId);
            }
          }}
        >
          <CardBrowserV2
            cards={cards}
            onAddCard={addCard}
            deckCardCounts={deckCardCounts}
            legendDomains={legendDomains}
            hasLegend={!!deck.legend}
            activeTab={activeTab}
            legendFirstName={deck.legend?.name.split(",")[0] ?? null}
          />
        </div>

        {/* Right - Deck panel */}
        <div
          className="hidden sm:flex w-96 xl:w-[27rem] flex-col overflow-hidden"
          onDragOver={(e) => {
            if (e.dataTransfer.types.includes("card-id")) {
              e.preventDefault();
              e.currentTarget.classList.add("ring-2", "ring-arcane/30");
            }
          }}
          onDragLeave={(e) => { e.currentTarget.classList.remove("ring-2", "ring-arcane/30"); }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("ring-2", "ring-arcane/30");
            const cardId = e.dataTransfer.getData("card-id");
            if (cardId) {
              const card = cardMap.get(cardId);
              if (card) addCard(card);
            }
          }}
        >
          <div className="flex-1 overflow-hidden">
            <DeckPanelV2
              deck={deck}
              onRemoveCard={removeCard}
              onUpdateQuantity={updateQuantity}
              onMoveCard={moveCard}
              onApplyRunes={applyRuneSuggestions}
              onSectionClick={handleSectionClick}
              legendDomains={legendDomains}
              isCompetitive={isCompetitive}
            />
          </div>
          {!isEmpty && (
            <div className="shrink-0 border-t border-hairline p-2">
              <DeckCoveragePanel items={coverageItems} />
            </div>
          )}
        </div>
      </div>

      {/* Barre de deck mobile : le panneau de droite est masqué sous sm, sans elle on
          construit un deck sans jamais voir sa liste. */}
      <button
        onClick={() => setShowDeckSheet(true)}
        className="shrink-0 sm:hidden flex items-center justify-between gap-2 border-t border-hairline bg-surface px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>Mon deck</span>
        <span className="flex items-center gap-1.5 text-xs tabular-nums">
          <span className={mainTotal >= 40 ? "text-success" : "text-ink-secondary"}>{mainTotal}/40</span>
          <span className="text-ink-muted">&middot;</span>
          <span className={runeTotal === 12 ? "text-success" : "text-ink-secondary"}>{runeTotal}/12</span>
          <span className="text-ink-muted">&middot;</span>
          <span className={bfTotal === 3 ? "text-success" : "text-ink-secondary"}>{bfTotal}/3</span>
          {sideTotal > 0 && <><span className="text-ink-muted">&middot;</span><span className="text-ink-secondary">{sideTotal} rés.</span></>}
          <ChevronUp size={14} className="text-ink-muted" />
        </span>
      </button>

      {/* Tiroir de deck mobile */}
      {showDeckSheet && (
        <ModalShell onClose={() => setShowDeckSheet(false)} labelledBy="mobile-deck-title" className="w-full max-w-md h-[85dvh] flex flex-col">
          <div className="flex shrink-0 items-center justify-between border-b border-hairline p-3">
            <h2 id="mobile-deck-title" className="text-base font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>Mon deck</h2>
            <button onClick={() => setShowDeckSheet(false)} aria-label="Fermer" className="p-2 text-ink-muted hover:text-ink"><X size={18} /></button>
          </div>
          <div className="flex-1 overflow-hidden">
            <DeckPanelV2
              deck={deck}
              onRemoveCard={removeCard}
              onUpdateQuantity={updateQuantity}
              onMoveCard={moveCard}
              onApplyRunes={applyRuneSuggestions}
              onSectionClick={(section) => { handleSectionClick(section); setShowDeckSheet(false); }}
              legendDomains={legendDomains}
              isCompetitive={isCompetitive}
            />
          </div>
          {!isEmpty && (
            <div className="shrink-0 border-t border-hairline p-2">
              <DeckCoveragePanel items={coverageItems} />
            </div>
          )}
        </ModalShell>
      )}

      {/* Saved decks modal */}
      {showSavedList && (
        <ModalShell onClose={() => setShowSavedList(false)} labelledBy="saved-decks-title" className="w-full max-w-md max-h-[70vh]">
            <div className="flex items-center justify-between border-b border-hairline p-4">
              <h2 id="saved-decks-title" className="text-lg font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Decks sauvegardés")}</h2>
              <button onClick={() => setShowSavedList(false)} aria-label="Fermer" className="text-ink-muted hover:text-ink"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto p-4 space-y-2">
              {savedDecks.length === 0 ? (
                <p className="text-sm text-ink-muted text-center py-8">{t("Aucun deck sauvegardé")}</p>
              ) : (
                savedDecks.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-lg border border-hairline p-4 hover:border-hairline-accent transition-colors">
                    <button onClick={() => loadSaved(s)} className="flex-1 text-left">
                      <div className="text-base font-semibold">{s.title}</div>
                      <div className="text-sm text-ink-secondary">{s.legendName ?? "Pas de légende"}</div>
                    </button>
                    <button onClick={() => handleDeleteSaved(s.id)} aria-label={`Supprimer ${s.title}`} className="text-ink-muted hover:text-error p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-hairline p-3">
              <button
                onClick={() => { clearDeck(); setShowSavedList(false); }}
                className="flex items-center gap-1.5 text-sm text-arcane hover:text-arcane-light"
              >
                <Plus size={14} /> Nouveau deck
              </button>
            </div>
        </ModalShell>
      )}

      {/* Import modal */}
      {showImport && (
        <ImportModal
          onImport={handleImport}
          onClose={() => setShowImport(false)}
        />
      )}

      {/* Export modal */}
      {showExport && (
        <ExportModal
          shareUrl={getShareUrl()}
          deckCode={getDeckCode()}
          isAdmin={isAdmin}
          textCode={getTextCode()}
          ttsCode={getTTSCode()}
          deckTitle={deckTitle}
          isEmpty={isEmpty}
          isDeckValid={!!deck.legend && mainTotal >= 40 && runeTotal === 12 && bfTotal >= 1 && bfTotal <= 3}
          onPublish={handlePublish}
          updateShareCode={updateShareCode}
          onUpdatePublished={handleUpdatePublished}
          onExportImage={handleExportImage}
          onClose={() => setShowExport(false)}
        />
      )}

    </div>
  );
}

// Enveloppe une modale pour que useDialogA11y (focus, Escape, piège de tabulation) se
// monte avec elle et pas avec toute la page.
function ModalShell({ onClose, labelledBy, className, children }: {
  onClose: () => void; labelledBy: string; className: string; children: React.ReactNode;
}) {
  const dialogRef = useDialogA11y(onClose);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={cn("rounded-card border border-hairline bg-surface overflow-hidden", className)}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
