import { expect, test } from "@playwright/test";

test("the home address sends visitors to the login page", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});

test("the login page shows labelled fields and fits the screen", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test("the health route answers with check results only", async ({ request }) => {
  const res = await request.get("/api/health");
  expect([200, 503]).toContain(res.status());
  const body = await res.json();
  expect(Object.keys(body).sort()).toEqual(["checks", "status"]);
  expect(Object.keys(body.checks).sort()).toEqual(["config", "supabase"]);
  expect(JSON.stringify(body)).not.toMatch(/sb_|supabase\.co|eyJ/);
});
