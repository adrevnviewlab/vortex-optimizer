import { describe, expect, it } from "vitest";
import type { GraphSubscribedSku, GraphUser } from "./graph-transform.js";
import {
  transformGraphSubscribedSku,
  transformGraphSubscribedSkus,
  transformGraphUser,
  transformGraphUsers,
} from "./graph-transform.js";

const mockUsers: GraphUser[] = [
  {
    id: "user-1",
    userPrincipalName: "alex@contoso.com",
    displayName: "Alex Consultant",
    assignedLicenses: [
      { skuId: "6fd2c87f-b296-42f0-b197-1e91e994b900" },
      { skuId: "f8a1db68-be16-40ed-86d5-cb42fd832e4e" },
    ],
  },
  {
    id: "user-2",
    userPrincipalName: "inactive@contoso.com",
    displayName: "Inactive User",
    assignedLicenses: [],
  },
  {
    id: "user-3",
    displayName: "Missing UPN",
  },
];

const mockSkus: GraphSubscribedSku[] = [
  {
    skuId: "6fd2c87f-b296-42f0-b197-1e91e994b900",
    skuPartNumber: "SPE_E3",
    capabilityStatus: "Enabled",
    consumedUnits: 420,
    prepaidUnits: { enabled: 500, suspended: 0, warning: 0 },
  },
  {
    skuId: "c7df2760-2c81-4ef7-b578-5dbc539d71e4",
    skuPartNumber: "SPE_E5",
    capabilityStatus: "Enabled",
    consumedUnits: 180,
    prepaidUnits: { enabled: 200, suspended: 10, warning: 5 },
  },
  {
    skuId: "dead-sku",
    skuPartNumber: "DELETED_SKU",
    capabilityStatus: "Deleted",
    consumedUnits: 0,
    prepaidUnits: { enabled: 0 },
  },
];

describe("graph-transform", () => {
  it("transforms Graph users with resolved license names", () => {
    const user = transformGraphUser(mockUsers[0]!);
    expect(user).toMatchObject({
      graphId: "user-1",
      upn: "alex@contoso.com",
      displayName: "Alex Consultant",
    });
    expect(user?.assignedLicenses).toHaveLength(2);
    expect(user?.assignedLicenses[0]?.displayName).toBe("Microsoft 365 E3");
    expect(user?.assignedLicenses[1]?.displayName).toBe("Power BI Pro");
  });

  it("skips users without UPN", () => {
    expect(transformGraphUser(mockUsers[2]!)).toBeNull();
  });

  it("transforms user batches", () => {
    const users = transformGraphUsers(mockUsers);
    expect(users).toHaveLength(2);
  });

  it("transforms subscribed SKUs with totals and consumption", () => {
    const e3 = transformGraphSubscribedSku(mockSkus[0]!);
    expect(e3).toMatchObject({
      skuPartNumber: "SPE_E3",
      skuName: "Microsoft 365 E3",
      total: 500,
      consumed: 420,
    });

    const e5 = transformGraphSubscribedSku(mockSkus[1]!);
    expect(e5?.total).toBe(215);
  });

  it("filters deleted SKUs", () => {
    const licenses = transformGraphSubscribedSkus(mockSkus);
    expect(licenses).toHaveLength(2);
    expect(licenses.every((l) => l.skuPartNumber !== "DELETED_SKU")).toBe(true);
  });
});
