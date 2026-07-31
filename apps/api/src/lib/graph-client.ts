import type { GraphUser, GraphSubscribedSku } from "./graph-transform.js";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

export type GraphPage<T> = {
  value: T[];
  "@odata.nextLink"?: string;
};

async function graphFetch<T>(
  accessToken: string,
  url: string,
  attempt = 0,
): Promise<T> {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (res.status === 429 && attempt < 5) {
    const retryAfter = Number(res.headers.get("Retry-After") ?? "2");
    await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
    return graphFetch<T>(accessToken, url, attempt + 1);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Graph request failed (${res.status}): ${text}`);
  }

  return (await res.json()) as T;
}

export async function paginateGraph<T>(
  accessToken: string,
  initialUrl: string,
): Promise<T[]> {
  const items: T[] = [];
  let nextUrl: string | undefined = initialUrl;

  while (nextUrl) {
    const page: GraphPage<T> = await graphFetch<GraphPage<T>>(accessToken, nextUrl);
    items.push(...page.value);
    nextUrl = page["@odata.nextLink"];
  }

  return items;
}

export async function fetchAllGraphUsers(accessToken: string): Promise<GraphUser[]> {
  const url = `${GRAPH_BASE}/users?$select=id,userPrincipalName,displayName,assignedLicenses&$top=999`;
  return paginateGraph<GraphUser>(accessToken, url);
}

export async function fetchAllSubscribedSkus(
  accessToken: string,
): Promise<GraphSubscribedSku[]> {
  const url = `${GRAPH_BASE}/subscribedSkus`;
  return paginateGraph<GraphSubscribedSku>(accessToken, url);
}

export async function fetchOrganizationTenantId(accessToken: string): Promise<string> {
  const org = await graphFetch<{ value: Array<{ id: string }> }>(
    accessToken,
    `${GRAPH_BASE}/organization?$select=id&$top=1`,
  );
  const tenantId = org.value[0]?.id;
  if (!tenantId) {
    throw new Error("Could not resolve Microsoft tenant ID from Graph");
  }
  return tenantId;
}
