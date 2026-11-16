import { test, expect, type Page } from "@playwright/test";

async function prepare(page: Page) {
  await page.goto("/#/client/summary");
  await page.getByLabel("Previous session date").fill("2026-11-09");
  await page.getByLabel("Next session date").fill("2026-11-16");
  await page.getByLabel("What I want to express this interval").fill("I want to discuss feeling supported.");
  await page.getByLabel("Your letter draft").fill("My original letter.");
  await page.getByRole("button", { name: "Preview interval content" }).click();
}

async function mockSuccess(page: Page) {
  await page.route("**/api/demo/ai-summary", async (route) => {
    const body = route.request().postDataJSON();
    await route.fulfill({ json: {
      sourceDraftVersion: body.sourceDraftVersion,
      period: body.period,
      taskProgress: body.tasks.map(({ id, title, completed }: { id: string; title: string; completed: boolean }) => ({ id, title, completed })),
      sections: [{ kind: "personal_expression", items: [{ text: "I want to discuss feeling supported.", sourceIds: ["personal-message"] }] }],
    } });
  });
}

test("interval summary includes personal expression and tasks without reflection answers", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/demo/ai-summary", async (route) => {
    calls++;
    const body = route.request().postDataJSON();
    expect(body.kind).toBe("treatment_interval");
    expect(body.tasks[0].completed).toBe(false);
    expect(body.tasks[0].answers).toEqual([]);
    expect(body.personalMessage).toBe("I want to discuss feeling supported.");
    await route.fulfill({ json: { sourceDraftVersion: body.sourceDraftVersion, period: body.period,
      taskProgress: body.tasks.map(({ id, title, completed }: { id: string; title: string; completed: boolean }) => ({ id, title, completed })),
      sections: [{ kind: "personal_expression", items: [{ text: "I want to discuss feeling supported.", sourceIds: ["personal-message"] }] }],
    } });
  });
  await prepare(page);
  expect(calls).toBe(0);
  await page.getByRole("button", { name: "Generate summary" }).click();
  await expect(page.getByRole("heading", { name: "Suggested interval summary" })).toBeVisible();
  await expect(page.getByLabel("Your letter draft")).toHaveValue("My original letter.");
  await page.getByRole("button", { name: "Use suggestion" }).click();
  const text = await page.getByLabel("Your letter draft").inputValue();
  expect(text).toContain("I want to discuss feeling supported.");
  expect(text).toContain("0 of 1");
  expect(text).toContain("not marked complete");
});

test("all assigned tasks and saved checkmarks enter the interval summary", async ({ page }) => {
  await page.goto("/#/therapist/tasks");
  await page.getByLabel("List title").fill("This interval");
  await page.getByLabel("To-do item 1", { exact: true }).fill("Take a walk");
  await page.getByRole("button", { name: "Add item" }).click();
  await page.getByLabel("To-do item 2", { exact: true }).fill("Practice breathing");
  await page.getByRole("button", { name: "Preview to-do list" }).click();
  await page.getByRole("button", { name: "Assign demo list" }).click();
  await page.getByRole("link", { name: "Client demo" }).click();
  await page.getByRole("link", { name: "View to-do lists" }).click();
  const list = page.getByRole("heading", { name: "This interval" }).locator("..");
  await list.getByRole("checkbox", { name: "Take a walk", exact: true }).check();
  await list.getByRole("button", { name: "Save demo progress" }).click();
  await expect(list.getByText("Progress saved privately in demo memory.")).toBeVisible();
  await page.getByRole("link", { name: "Write your summary" }).click();
  await page.getByLabel("Previous session date").fill("2026-11-09");
  await page.getByLabel("Next session date").fill("2026-11-16");
  await page.route("**/api/demo/ai-summary", async (route) => {
    const body = route.request().postDataJSON();
    expect(body.tasks).toHaveLength(3);
    expect(body.tasks.find((task: { title: string }) => task.title === "Take a walk").completed).toBe(true);
    expect(body.tasks.find((task: { title: string }) => task.title === "Practice breathing").completed).toBe(false);
    await route.fulfill({ status: 503, json: {} });
  });
  await page.getByRole("button", { name: "Preview interval content" }).click();
  await expect(page.getByText("1 of 3 tasks marked complete")).toBeVisible();
  await page.getByRole("button", { name: "Generate summary" }).click();
  await expect(page.getByText(/Summary generation failed/)).toBeVisible();
});

test("personal message alone works when tasks are excluded", async ({ page }) => {
  await mockSuccess(page);
  await prepare(page);
  await page.getByRole("checkbox", { name: "A stressful moment at work" }).uncheck();
  await page.getByRole("button", { name: "Preview interval content" }).click();
  await expect(page.getByText("0 of 0 tasks marked complete")).toBeVisible();
  await page.getByRole("button", { name: "Generate summary" }).click();
  await page.getByRole("button", { name: "Discard suggestion" }).click();
  await expect(page.getByLabel("Your letter draft")).toHaveValue("My original letter.");
});

test("editing personal expression cancels a stale generation", async ({ page }) => {
  await page.route("**/api/demo/ai-summary", async () => {});
  await prepare(page);
  await page.getByRole("button", { name: "Generate summary" }).click();
  await expect(page.getByRole("button", { name: "Generating…", exact: true })).toBeDisabled();
  await page.getByLabel("What I want to express this interval").fill("My newer message.");
  await expect(page.getByRole("button", { name: "Generate summary", exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Your letter draft")).toHaveValue("My original letter.");
});

test("interval timeout preserves writing and allows retry", async ({ page }) => {
  await page.clock.install();
  await page.route("**/api/demo/ai-summary", async () => {});
  await prepare(page);
  await page.getByRole("button", { name: "Generate summary" }).click();
  await expect(page.getByRole("button", { name: "Generating…", exact: true })).toBeDisabled();
  await page.clock.fastForward(40_001);
  await expect(page.getByText(/Summary generation timed out/)).toBeVisible();
  await expect(page.getByLabel("Your letter draft")).toHaveValue("My original letter.");
});
