export type BulkCardConditionCode = "NM";
export type BulkCardFinishCode = "NORMAL" | "FOIL";

export type BulkInventoryKey = {
  cardId: string;
  languageId: string;
  condition: BulkCardConditionCode;
  finish: BulkCardFinishCode;
  storageLocationId: string;
};

export type BulkStockBalance = BulkInventoryKey & {
  physicalQuantity: number;
  reservedQuantity: number;
  averageAcquisitionCost: string;
};

export type BulkRecipeRequirement = {
  cardId: string;
  languageId: string;
  section?: "LEGEND" | "CHAMPION" | "MAIN_DECK" | "BATTLEFIELD" | "SIDEBOARD" | "GENERIC";
  quantity: number;
};

export type BulkRecipeAvailability = BulkRecipeRequirement & {
  availableQuantity: number;
  missingQuantity: number;
  buildableQuantity: number;
  averageAcquisitionCost: string;
  limiting: boolean;
};

export type BulkRecipeAnalysis = {
  buildableQuantity: number;
  inventoryCostPerProduct: string;
  lines: BulkRecipeAvailability[];
};
