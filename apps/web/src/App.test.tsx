import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToString } from "react-dom/server";
import App from "./App";

test("App renders the product heading", () => {
  assert.match(renderToString(<App />), /<h1>Between Sessions<\/h1>/);
});
