import { describe, expect, it } from "vitest";
import {
  MS_SKU_CATALOG,
  normalizeAssignedLicense,
  resolveSkuById,
  resolveSkuByPartNumber,
  resolveSkuDisplayName,
} from "./ms-skus.js";

describe("ms-skus catalog", () => {
  it("resolves known SKU GUIDs to friendly names", () => {
    expect(resolveSkuById("6fd2c87f-b296-42f0-b197-1e91e994b900")?.displayName).toBe(
      "Microsoft 365 E3",
    );
    expect(resolveSkuById("c7df2760-2c81-4ef7-b578-5dbc539d71e4")?.displayName).toBe(
      "Microsoft 365 E5",
    );
    expect(resolveSkuDisplayName("f8a1db68-be16-40ed-86d5-cb42fd832e4e")).toBe("Power BI Pro");
  });

  it("resolves part numbers when GUID is unknown", () => {
    expect(resolveSkuByPartNumber("SPE_E3")?.displayName).toBe("Microsoft 365 E3");
    expect(resolveSkuDisplayName("unknown-guid", "SPE_E5")).toBe("Microsoft 365 E5");
  });

  it("falls back to part number text for unknown SKUs", () => {
    expect(resolveSkuDisplayName("00000000-0000-0000-0000-000000000000", "CUSTOM_SKU")).toBe(
      "CUSTOM SKU",
    );
  });

  it("normalizes assigned licenses for Graph sync", () => {
    const normalized = normalizeAssignedLicense("6fd2c87f-b296-42f0-b197-1e91e994b900");
    expect(normalized.displayName).toBe("Microsoft 365 E3");
    expect(normalized.partNumber).toBe("SPE_E3");
  });

  it("has unique SKU IDs in catalog", () => {
    const ids = MS_SKU_CATALOG.map((e) => e.skuId.toLowerCase());
    expect(new Set(ids).size).toBe(ids.length);
  });
});
