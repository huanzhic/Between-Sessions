import assert from "node:assert/strict";
import { test } from "node:test";
import { inMemoryLinks } from "./links.js";

// Fictional links: Dr. Lee and Maya active, Dr. Lee and Sam ended, Dr. Rivera and Alex unrelated.
const links = inMemoryLinks([
  { id: "link-1", therapistId: "therapist-lee", clientId: "client-maya", status: "active" },
  { id: "link-2", therapistId: "therapist-lee", clientId: "client-sam", status: "inactive" },
  { id: "link-3", therapistId: "therapist-rivera", clientId: "client-alex", status: "active" },
]);

test("an active link is found", async () => {
  assert.deepEqual(await links.findActiveLink("therapist-lee", "client-maya"), { id: "link-1" });
});

test("inactive, unrelated and reversed pairs are not linked", async () => {
  assert.equal(await links.findActiveLink("therapist-lee", "client-sam"), null);
  assert.equal(await links.findActiveLink("therapist-lee", "client-alex"), null);
  assert.equal(await links.findActiveLink("client-maya", "therapist-lee"), null);
});

test("a therapist's client list contains only active links", async () => {
  assert.deepEqual(await links.activeClientIds("therapist-lee"), ["client-maya"]);
  assert.deepEqual(await links.activeClientIds("therapist-nobody"), []);
});
