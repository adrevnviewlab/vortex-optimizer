import { createHmac, timingSafeEqual } from "node:crypto";
import { getJwtSecret } from "./env.js";

const TOKEN_TTL_MS = 15 * 60 * 1000;

export type DownloadTokenPayload = {
  orgId: string;
  reportId: string;
  exp: number;
};

function signPayload(payload: string): string {
  return createHmac("sha256", getJwtSecret()).update(payload).digest("base64url");
}

export function createDownloadToken(orgId: string, reportId: string): string {
  const exp = Date.now() + TOKEN_TTL_MS;
  const payload = `${orgId}:${reportId}:${exp}`;
  const sig = signPayload(payload);
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifyDownloadToken(
  token: string,
  orgId: string,
  reportId: string,
): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 4) return false;

    const [tokenOrgId, tokenReportId, expStr, sig] = parts;
    if (tokenOrgId !== orgId || tokenReportId !== reportId) return false;

    const exp = Number(expStr);
    if (!Number.isFinite(exp) || exp < Date.now()) return false;

    const payload = `${tokenOrgId}:${tokenReportId}:${expStr}`;
    const expected = signPayload(payload);
    const sigBuf = Buffer.from(sig ?? "");
    const expectedBuf = Buffer.from(expected);
    if (sigBuf.length !== expectedBuf.length) return false;
    return timingSafeEqual(sigBuf, expectedBuf);
  } catch {
    return false;
  }
}

export function buildSignedDownloadPath(
  apiBaseUrl: string,
  orgId: string,
  reportId: string,
): string {
  const token = createDownloadToken(orgId, reportId);
  return `${apiBaseUrl}/v1/orgs/${orgId}/reports/${reportId}/file?token=${token}`;
}
