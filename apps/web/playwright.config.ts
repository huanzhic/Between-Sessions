import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://127.0.0.1:5173", browserName: "chromium" },
  webServer: [
    {
      command: "node ../../node_modules/vite/bin/vite.js --host 127.0.0.1",
      port: 5173,
    },
    { command: "node --import tsx ../api/src/index.ts", port: 3000 },
  ],
});
