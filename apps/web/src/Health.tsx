import { useEffect, useState } from "react";
export async function checkHealth(signal?: AbortSignal): Promise<void> {
  const response = await fetch("/api/health", { signal });
  if (!response.ok || (await response.json()).status !== "ok")
    throw new Error("Health check failed");
}
export function Health() {
  const [state, setState] = useState("Checking API…");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setState("Checking API…");
    const timeout = setTimeout(() => controller.abort(), 5000);
    checkHealth(controller.signal)
      .then(() => {
        if (active) setState("API connected · /health");
      })
      .catch(() => {
        if (active) setState("API unavailable. Start the backend and retry.");
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);
  return (
    <div className="health">
      <span role="status">{state}</span>
      <button className="text-button" onClick={() => setAttempt((n) => n + 1)}>
        Retry API
      </button>
    </div>
  );
}
