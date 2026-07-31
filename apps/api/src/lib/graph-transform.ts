import { resolveSkuDisplayName } from "@vorzop/shared";

export type GraphAssignedLicense = {
  skuId: string;
  disabledPlans?: Array<{ skuId: string }>;
};

export type GraphUser = {
  id: string;
  userPrincipalName?: string;
  displayName?: string;
  assignedLicenses?: GraphAssignedLicense[];
};

export type GraphSubscribedSku = {
  skuId: string;
  skuPartNumber: string;
  capabilityStatus?: string;
  consumedUnits?: number;
  prepaidUnits?: {
    enabled?: number;
    suspended?: number;
    warning?: number;
  };
};

export type SyncedUserRecord = {
  graphId: string;
  upn: string;
  displayName: string | null;
  assignedLicenses: Array<{
    skuId: string;
    displayName: string;
  }>;
};

export type SyncedLicenseRecord = {
  skuId: string;
  skuPartNumber: string;
  skuName: string;
  total: number;
  consumed: number;
};

export function transformGraphUser(user: GraphUser): SyncedUserRecord | null {
  if (!user.id || !user.userPrincipalName) return null;

  const assignedLicenses = (user.assignedLicenses ?? [])
    .filter((license) => license.skuId)
    .map((license) => ({
      skuId: license.skuId.toLowerCase(),
      displayName: resolveSkuDisplayName(license.skuId),
    }));

  return {
    graphId: user.id,
    upn: user.userPrincipalName,
    displayName: user.displayName ?? null,
    assignedLicenses,
  };
}

export function transformGraphSubscribedSku(sku: GraphSubscribedSku): SyncedLicenseRecord | null {
  if (!sku.skuId || !sku.skuPartNumber) return null;
  if (sku.capabilityStatus === "Deleted") return null;

  const total =
    (sku.prepaidUnits?.enabled ?? 0) +
    (sku.prepaidUnits?.suspended ?? 0) +
    (sku.prepaidUnits?.warning ?? 0);

  return {
    skuId: sku.skuId.toLowerCase(),
    skuPartNumber: sku.skuPartNumber,
    skuName: resolveSkuDisplayName(sku.skuId, sku.skuPartNumber),
    total,
    consumed: sku.consumedUnits ?? 0,
  };
}

export function transformGraphUsers(users: GraphUser[]): SyncedUserRecord[] {
  return users
    .map(transformGraphUser)
    .filter((record): record is SyncedUserRecord => record !== null);
}

export function transformGraphSubscribedSkus(
  skus: GraphSubscribedSku[],
): SyncedLicenseRecord[] {
  return skus
    .map(transformGraphSubscribedSku)
    .filter((record): record is SyncedLicenseRecord => record !== null);
}
