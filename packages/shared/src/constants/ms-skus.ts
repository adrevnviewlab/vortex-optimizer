/** Microsoft 365 / Entra SKU catalog — GUID → friendly name for Graph sync. */
export type MsSkuEntry = {
  skuId: string;
  partNumber: string;
  displayName: string;
  category: "productivity" | "security" | "power-platform" | "teams" | "azure" | "other";
};

export const MS_SKU_CATALOG: MsSkuEntry[] = [
  {
    skuId: "6fd2c87f-b296-42f0-b197-1e91e994b900",
    partNumber: "SPE_E3",
    displayName: "Microsoft 365 E3",
    category: "productivity",
  },
  {
    skuId: "c7df2760-2c81-4ef7-b578-5dbc539d71e4",
    partNumber: "SPE_E5",
    displayName: "Microsoft 365 E5",
    category: "productivity",
  },
  {
    skuId: "66b9902c-bfad-493e-a0e1-cbb74c694d66",
    partNumber: "SPE_F1",
    displayName: "Microsoft 365 F3",
    category: "productivity",
  },
  {
    skuId: "18159a87-0728-42fb-b2a2-e1f3032a5899",
    partNumber: "O365_BUSINESS_PREMIUM",
    displayName: "Microsoft 365 Business Premium",
    category: "productivity",
  },
  {
    skuId: "f245ecc8-75af-4f8e-b61f-27d8114de5f3",
    partNumber: "O365_BUSINESS",
    displayName: "Microsoft 365 Apps for Business",
    category: "productivity",
  },
  {
    skuId: "f8a1db68-be16-40ed-86d5-cb42fd832e4e",
    partNumber: "POWER_BI_PRO",
    displayName: "Power BI Pro",
    category: "power-platform",
  },
  {
    skuId: "41781fb2-bc02-4f7e-854f-3973ce6b66e9",
    partNumber: "AAD_PREMIUM_P2",
    displayName: "Microsoft Entra ID P2",
    category: "security",
  },
  {
    skuId: "79f2392c-3d83-418c-9767-c4051059a7c7",
    partNumber: "AAD_PREMIUM",
    displayName: "Microsoft Entra ID P1",
    category: "security",
  },
  {
    skuId: "57ff2da0-773e-42df-d2b7-8121b054576f",
    partNumber: "MCOEV",
    displayName: "Microsoft Teams Phone Standard",
    category: "teams",
  },
  {
    skuId: "0dabac87-d355-424b-aa1d-5e35b6a3d6ea",
    partNumber: "MCOPSTN2",
    displayName: "Domestic Calling Plan",
    category: "teams",
  },
  {
    skuId: "73718436-2e9e-4e7c-8d5a-f43fbbe011ae",
    partNumber: "MCOMEETADV",
    displayName: "Audio Conferencing",
    category: "teams",
  },
  {
    skuId: "e5a30349-27ed-480b-b47b-9df1a8f3c1b0",
    partNumber: "EMS_E5",
    displayName: "Enterprise Mobility + Security E5",
    category: "security",
  },
  {
    skuId: "c1ec4a95-1f05-45b3-a911-aa3fa010154f",
    partNumber: "EXCHANGEENTERPRISE",
    displayName: "Exchange Online Plan 2",
    category: "productivity",
  },
  {
    skuId: "4a82b400-a79f-41a4-b4e2-e5241485cc02",
    partNumber: "EXCHANGESTANDARD",
    displayName: "Exchange Online Plan 1",
    category: "productivity",
  },
];

const bySkuId = new Map(MS_SKU_CATALOG.map((e) => [e.skuId.toLowerCase(), e]));
const byPartNumber = new Map(MS_SKU_CATALOG.map((e) => [e.partNumber.toUpperCase(), e]));

export function resolveSkuById(skuId: string): MsSkuEntry | undefined {
  return bySkuId.get(skuId.toLowerCase());
}

export function resolveSkuByPartNumber(partNumber: string): MsSkuEntry | undefined {
  return byPartNumber.get(partNumber.toUpperCase());
}

export function resolveSkuDisplayName(skuId: string, partNumber?: string): string {
  const byId = resolveSkuById(skuId);
  if (byId) return byId.displayName;
  if (partNumber) {
    const byPart = resolveSkuByPartNumber(partNumber);
    if (byPart) return byPart.displayName;
    return partNumber.replace(/_/g, " ");
  }
  return skuId;
}

export function normalizeAssignedLicense(skuId: string): {
  skuId: string;
  displayName: string;
  partNumber: string | null;
} {
  const entry = resolveSkuById(skuId);
  return {
    skuId: skuId.toLowerCase(),
    displayName: entry?.displayName ?? skuId,
    partNumber: entry?.partNumber ?? null,
  };
}
