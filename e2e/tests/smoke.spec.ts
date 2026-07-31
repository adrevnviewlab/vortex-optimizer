import { test, expect } from "@playwright/test";

const DEMO_EMAIL = process.env.E2E_DEMO_EMAIL ?? "admin@vortexoptimizer.com";
const DEMO_PASSWORD = process.env.E2E_DEMO_PASSWORD ?? "demo-password";

test.describe("smoke", () => {
  test("marketing welcome loads", async ({ page }) => {
    await page.goto("/welcome");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in|get started|dashboard/i }).first()).toBeVisible();
  });

  test("login → dashboard shows KPIs", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(DEMO_EMAIL);
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText("Total clients")).toBeVisible();
    await expect(page.getByText("Identified savings")).toBeVisible();
  });

  test("clients list loads", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(DEMO_EMAIL);
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.goto("/clients");

    await expect(page.getByRole("heading", { name: "Clients" })).toBeVisible();
    await expect(page.getByText("Contoso Ltd")).toBeVisible();
  });

  test("audits list loads", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(DEMO_EMAIL);
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.goto("/audits");

    await expect(page.getByRole("heading", { name: "Audits" })).toBeVisible();
    await expect(page.getByText(/Contoso|FY26/i).first()).toBeVisible();
  });
});
