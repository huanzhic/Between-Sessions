import { test, expect } from "@playwright/test";

test("therapist assigns a list and only the client sees progress", async ({
  page,
}) => {
  await page.goto("/#/therapist/tasks");
  await page.getByLabel("List title").fill("Before our next session");
  await page
    .getByLabel("To-do item 1", { exact: true })
    .fill("Write down a topic");
  await page.getByRole("button", { name: "Add item" }).click();
  await page.getByLabel("Item 2 type").selectOption("reflection");
  await page
    .getByLabel("To-do item 2", { exact: true })
    .fill("Take a short break");
  await page.getByRole("button", { name: "Preview to-do list" }).click();
  await expect(page.getByText("Take a short break · Reflection")).toBeVisible();
  await page.getByRole("button", { name: "Assign demo list" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Demo list assigned" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Client demo" }).click();
  await page.getByRole("link", { name: "View tasks" }).click();
  const list = page
    .getByRole("heading", { name: "Before our next session" })
    .locator("..");
  const item = list.getByRole("checkbox", { name: "Write down a topic" });
  const failure = list.getByRole("checkbox", {
    name: "Simulate progress save failure",
  });
  await item.check();
  await failure.check();
  await list.getByRole("button", { name: "Save demo progress" }).click();
  await expect(page.getByText(/Save failed/)).toBeVisible();
  await expect(item).toBeChecked();
  await failure.uncheck();
  await page.getByRole("button", { name: "Retry saving progress" }).click();
  await expect(
    page.getByText("Progress saved privately in demo memory."),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Write your summary" }),
  ).toBeEnabled();

  const reflection = list.getByRole("checkbox", { name: "Take a short break" });
  await list
    .getByRole("link", { name: "Open reflection: Take a short break" })
    .click();
  await page
    .getByLabel("Your private answer")
    .fill("A private reflection answer");
  await page.getByRole("button", { name: "Save demo draft" }).click();
  await expect(
    page.getByText("Saved in demo memory only · not sent"),
  ).toBeVisible();
  await page.getByRole("link", { name: "Back to tasks" }).click();
  await expect(reflection).not.toBeChecked();
  await page
    .getByRole("link", { name: "Open reflection: A stressful moment at work" })
    .click();
  await expect(page.getByLabel("Your private answer")).toHaveValue("");
  await page.getByRole("link", { name: "Back to tasks" }).click();
  await list
    .getByRole("link", { name: "Open reflection: Take a short break" })
    .click();
  await expect(page.getByLabel("Your private answer")).toHaveValue(
    "A private reflection answer",
  );
  await page.getByRole("link", { name: "Back to tasks" }).click();
  await reflection.check();
  await list.getByRole("button", { name: "Save demo progress" }).click();
  await expect(
    list.getByText("Progress saved privately in demo memory."),
  ).toBeVisible();

  await page.getByRole("link", { name: "Therapist demo" }).click();
  await page.getByRole("link", { name: "Tasks" }).click();
  await expect(
    page.getByText("Write down a topic", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(/2 of 2 complete|A private reflection answer/),
  ).toHaveCount(0);
  await expect(
    page.getByRole("checkbox", { name: "Write down a topic" }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Client demo" }).click();
  await expect(
    page.getByText(/Before our next session · 2 of 2 complete/),
  ).toBeVisible();
  await page.getByRole("link", { name: "View tasks" }).click();
  await expect(item).toBeChecked();
  await item.uncheck();
  await list.getByRole("button", { name: "Save demo progress" }).click();
  await expect(
    page.getByText("Progress saved privately in demo memory."),
  ).toBeVisible();
  await expect(list.getByText(/1 of 2 complete/)).toBeVisible();
});

for (const [route, label] of [
  ["/client/reflection", "Your private answer"],
  ["/client/summary", "Your letter draft"],
  ["/therapist/tasks", "List title"],
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
  await page.getByRole("link", { name: "View tasks" }).click();
  await page
    .getByRole("link", { name: "Open reflection: A stressful moment at work" })
    .click();
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
  await page.getByRole("link", { name: "View tasks" }).click();
  await page
    .getByRole("link", { name: "Open reflection: A stressful moment at work" })
    .click();
  await expect(page.getByLabel("Your private answer")).toHaveValue(
    "PRIVATE_CANARY",
  );
  await page.getByRole("link", { name: "Therapist demo" }).click();
  await expect(
    page.getByRole("heading", { name: "Good morning, Dr. Lee" }),
  ).toBeVisible();
  await expect(page.locator("body")).not.toContainText("PRIVATE_CANARY");
  await page.getByRole("link", { name: "Client demo" }).click();
  await page.getByRole("link", { name: "View tasks" }).click();
  await page
    .getByRole("link", { name: "Open reflection: A stressful moment at work" })
    .click();
  await expect(page.getByLabel("Your private answer")).toHaveValue(
    "PRIVATE_CANARY",
  );
  await page.reload();
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
      "/client/todos",
      "/client/update",
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

test("therapist empty inbox is explicit", async ({ page }) => {
  await page.goto("/#/therapist/letters");
  await page.getByLabel("Preview empty inbox").check();
  await expect(
    page.getByRole("heading", { name: "No letters yet" }),
  ).toBeVisible();
});

test("shared activity and topic reach Letters as a fixed demo snapshot", async ({
  page,
}) => {
  await page.goto("/#/therapist/tasks");
  await page.getByLabel("List title").fill("This week");
  await page.getByLabel("Item 1 type").selectOption("activity");
  await page.getByLabel("To-do item 1", { exact: true }).fill("Walks");
  await page.getByLabel("Target count (optional)").fill("3");
  await page
    .getByLabel(/What would you like to know before/)
    .fill("What changed your plans?");
  await page.getByRole("button", { name: "Add item" }).click();
  await page.getByLabel("Item 2 type").selectOption("event");
  await page
    .getByLabel("To-do item 2", { exact: true })
    .fill("Schedule change");
  await page.getByRole("button", { name: "Preview to-do list" }).click();
  await expect(
    page.getByText("Walks · Track an activity · Target: 3"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Assign demo list" }).click();

  await page.getByRole("link", { name: "Client demo" }).click();
  await page.getByRole("link", { name: "View tasks" }).click();
  await expect(page.getByText("No event recorded")).toBeVisible();
  await page.getByRole("button", { name: "Didn’t happen this period" }).click();
  await expect(
    page.getByText("Didn’t happen this period", { exact: true }),
  ).toBeVisible();
  for (const note of ["PRIVATE_WALK_NOTE", "SHARED_WALK_NOTE"]) {
    await page.getByRole("button", { name: "Log activity" }).click();
    await page.getByLabel("Note (optional)").fill(note);
    await page.getByRole("button", { name: "Save record" }).click();
  }
  await expect(page.getByText("2 / 3 logged")).toBeVisible();
  await page
    .getByLabel("What would you like to talk about?")
    .fill("Schedule changes");
  await page.getByRole("button", { name: "Save topic" }).click();
  await page.getByRole("link", { name: "Prepare update for Dr. Lee" }).click();
  const walks = page.getByRole("checkbox", {
    name: "Walks — 2026-11-05",
    exact: true,
  });
  await walks.nth(0).check();
  await walks.nth(1).check();
  const firstNote = page.getByRole("checkbox", {
    name: "Share note: PRIVATE_WALK_NOTE",
  });
  await firstNote.check();
  await page
    .getByRole("checkbox", { name: "Share note: SHARED_WALK_NOTE" })
    .check();
  await page
    .getByRole("checkbox", { name: "For the next session: Schedule changes" })
    .check();
  await page.getByRole("button", { name: "Create demo draft" }).click();
  await expect(page.getByLabel("Update text")).toHaveValue(/PRIVATE_WALK_NOTE/);
  await firstNote.uncheck();
  await walks.nth(0).uncheck();
  await expect(
    page.getByRole("button", { name: "Review update" }),
  ).toBeDisabled();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Create demo draft" }).click();
  const expectedBody = await page.getByLabel("Update text").inputValue();
  expect(expectedBody).toContain("1 shared record; 3 planned");
  expect(expectedBody).toContain("SHARED_WALK_NOTE");
  expect(expectedBody).not.toContain("PRIVATE_WALK_NOTE");
  expect(expectedBody).not.toContain("Schedule change —");
  await page.getByRole("button", { name: "Review update" }).click();
  await page.getByRole("button", { name: "Send demo update" }).click();
  await expect(
    page.getByRole("heading", { name: "Demo update sent" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Client demo" }).click();
  await page.getByRole("link", { name: "View tasks" }).click();
  await expect(page.getByText("2 / 3 logged")).toBeVisible();
  await page.getByRole("button", { name: "Remove record" }).nth(1).click();
  await expect(page.getByText("1 / 3 logged")).toBeVisible();
  await page.getByRole("link", { name: "Therapist demo" }).click();
  await page.getByRole("link", { name: "Letters", exact: true }).click();
  const sent = page.getByRole("link", { name: /Between-session update/ });
  await expect(sent).toHaveCount(1);
  await sent.click();
  expect(await page.locator(".brief-body").textContent()).toBe(expectedBody);
});
