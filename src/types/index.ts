export interface RiftcodexCard {
  id: string;
  name: string;
  riftbound_id: string;
  tcgplayer_id: string;
  collector_number: number;
  attributes: {
    energy: number | null;
    might: number | null;
    power: number | null;
  };
  classification: {
    type: string;
    supertype: string | null;
    rarity: string;
    domain: string[];
  };
  text: {
    rich: string | null;
    plain: string | null;
    flavour: string | null;
  };
  set: {
    set_id: string;
    label: string;
  };
  media: {
    image_url: string;
    artist: string | null;
    accessibility_text: string | null;
  };
  tags: string[];
  orientation: string;
  metadata: {
    clean_name: string;
    updated_on: string;
    alternate_art: boolean;
    overnumbered: boolean;
    signature: boolean;
  };
}

export interface RiftcodexSet {
  id: string;
  name: string;
  set_id: string;
  card_count: number;
  tcgplayer_id: string;
  cardmarket_id: string | string[] | null;
  published_on: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export type CardType = "Unit" | "Spell" | "Gear" | "Rune" | "Battlefield" | "Legend";
export type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Showcase";
export type Domain = "Fury" | "Sorcery" | "Order" | "Calm" | "Mind" | "Body" | "Chaos";
export type Tier = "S" | "A" | "B" | "C" | "D";
export type DeckSection = "legend" | "main" | "rune" | "battlefield" | "side";

export interface CardFilters {
  search?: string;
  set?: string;
  type?: string;
  rarity?: string;
  domain?: string;
  supertype?: string;
  energyMin?: number;
  energyMax?: number;
  powerMin?: number;
  powerMax?: number;
  mightMin?: number;
  mightMax?: number;
  alternateArt?: boolean;
  page?: number;
  perPage?: number;
}

export type ArticleBlock =
  | {
      type: "text";
      id: string;
      content: string;
    }
  | {
      type: "decklist";
      id: string;
      deckCode: string;
      deckName: string;
      legendName: string;
      playerName?: string;
      context?: string;
      deckId?: string;
    }
  | {
      type: "sponsor_link";
      id: string;
      title: string;
      description?: string;
      imageUrl?: string;
      ctaText: string;
      url: string;
      style: "standard" | "highlight" | "minimal";
      isSponsored: boolean;
    }
  | {
      type: "image";
      id: string;
      src: string;
      alt: string;
      caption?: string;
    }
  | {
      type: "separator";
      id: string;
    };

export interface DecklistCard {
  cardId: string;
  name: string;
  artUrl: string | null;
  type: string;
  cost?: number | null;
  power?: number | null;
  energy?: number | null;
  might?: number | null;
  rarity: string;
  domains?: string[];
  description?: string | null;
  quantity: number;
  section: DeckSection;
}

export type ArticleCategory = "actualite" | "guide" | "tournoi" | "meta" | "patch-notes";
export type SponsorStyle = "standard" | "highlight" | "minimal";

export interface CardData {
  id: string;
  name: string;
  type: string;
  supertype: string | null;
  rarity: string;
  domains: string[];
  energy: number | null;
  might: number | null;
  power: number | null;
  imageUrl: string | null;
  set: string;
  setName: string;
  textPlain: string | null;
  tags: string[];
  signature: boolean;
}

export interface DeckEntry {
  cardId: string;
  name: string;
  imageUrl: string | null;
  type: string;
  supertype: string | null;
  rarity: string;
  energy: number | null;
  might: number | null;
  power: number | null;
  domains: string[];
  quantity: number;
}

export interface DeckState {
  legend: DeckEntry | null;
  champion: DeckEntry | null;
  main: DeckEntry[];
  rune: DeckEntry[];
  battlefield: DeckEntry[];
  side: DeckEntry[];
}

export type BuilderTab = "legend" | "main" | "rune" | "battlefield";
