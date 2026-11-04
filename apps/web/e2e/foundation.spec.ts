import { test, expect } from "@playwright/test";

for (const [route, label] of [
  ["/client/reflection", "Your private answer"],
  ["/client/summary", "Your letter draft"],
  ["/therapist/tasks", "Topic"],
]) {
  test(`keyboard skip preserves route and input on ${route}`, async ({
    page,
  }) => {
    await page.goto(`/#${route}`);
    await page.getByLabel(label, { exact: true }).fill("Keep my input");
    await page.getByRole("link", { name: "Skip to content" }).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`#${route}$`));
    await expect(page.getByRole("main")).toBeFocused();
    await expect(page.getByLabel(label, { exact: true })).toHaveValue(
      "Keep my input",
    );
  });
}

test("skip focuses the SOS main without changing the route", async ({
  page,
}) => {
  await page.goto("/#/sos");
  await page.getByRole("link", { name: "Skip to content" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#\/sos$/);
  await expect(page.getByRole("main")).toBeFocused();
  await expect(page.locator('[id="main"]')).toHaveCount(1);
});

test("real health, failed save, retry, SOS and role isolation", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByText("API connected · /health")).toBeVisible();
  await page.getByRole("link", { name: "Continue reflection" }).click();
  await page.getByLabel("Your private answer").fill("PRIVATE_CANARY");
  await page.getByLabel("Simulate save failure").check();
  await page.getByRole("button", { name: "Save demo draft" }).click();
  await expect(page.getByText(/Save failed/)).toBeVisible();
  await expect(page.getByLabel("Your private answer")).toHaveValue(
    "PRIVATE_CANARY",
  );
  await page.getByLabel("Simulate save failure").uncheck();
  await page.getByRole("button", { name: "Retry demo save" }).click();
  await expect(
    page.getByText("Saved in demo memory only · not sent"),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "SOS resources", exact: true })
    .last()
    .click();
  await expect(
    page.getByRole("heading", { name: "SOS resources" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Return to client home" }).click();
  await page.getByRole("link", { name: "Continue reflection" }).click();
  await expect(page.getByLabel("Your private answer")).toHaveValue(
    "PRIVATE_CANARY",
  );
  await page.getByRole("link", { name: "Therapist demo" }).click();
  await expect(
    page.getByRole("heading", { name: "Good morning, Dr. Lee" }),
  ).toBeVisible();
  await expect(page.locator("body")).not.toContainText("PRIVATE_CANARY");
  await page.getByRole("link", { name: "Client demo" }).click();
  await page.getByRole("link", { name: "Continue reflection" }).click();
  await expect(page.getByLabel("Your private answer")).toHaveValue("");
});

test("manual review preserves exact text and never enables sending", async ({
  page,
}) => {
  await page.goto("/#/client/summary");
  await page
    .getByLabel("Your letter draft")
    .fill("Only share this.\nKeep this exact second line.");
  await page.getByRole("link", { name: "Review letter" }).click();
  await expect(page.locator(".letter p")).toHaveText(
    "Only share this.\nKeep this exact second line.",
  );
  await expect(
    page.getByRole("button", { name: "Send unavailable" }),
  ).toBeDisabled();
});

test("API failures do not become fake successes and SOS remains usable", async ({
  page,
}) => {
  await page.route("**/api/health", (route) =>
    route.fulfill({ status: 503, body: "" }),
  );
  await page.goto("/#/sos");
  await expect(
    page.getByText("API unavailable. Start the backend and retry."),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "SOS resources" }),
  ).toBeVisible();
  await page.unroute("**/api/health");
  await page.getByRole("button", { name: "Retry API" }).click();
  await expect(page.getByText("API connected · /health")).toBeVisible();
});

for (const width of [390, 768, 1440]) {
  test(`role screens fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of [
      "/client",
      "/client/reflection",
      "/therapist",
      "/therapist/tasks",
    ]) {
      await page.goto(`/#${route}`);
      await page.waitForLoadState("networkidle");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await page.goto("/#/therapist");
    await page.screenshot({
      path: `artifacts/therapist-${width}.png`,
      fullPage: true,
    });
    await page.goto("/#/client");
    await page.screenshot({
      path: `artifacts/client-${width}.png`,
      fullPage: true,
    });
  });
}

test("therapist form previews entered values and empty inbox is explicit", async ({
  page,
}) => {
  await page.goto("/#/therapist/tasks");
  await page
    .getByLabel("Topic", { exact: true })
    .fill("A different fictional topic");
  await page
    .getByLabel("Question 1", { exact: true })
    .fill("What would you like to discuss?");
  await page.getByRole("button", { name: "Preview demo assignment" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "A different fictional topic" }),
  ).toContainText("What would you like to discuss?");
  await page.getByRole("link", { name: "Letters", exact: true }).click();
  await page.getByLabel("Preview empty inbox").check();
  await expect(
    page.getByRole("heading", { name: "No letters yet" }),
  ).toBeVisible();
});
