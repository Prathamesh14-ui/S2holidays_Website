"use client";

import { useState } from "react";
import { buttonClass } from "@/components/ui/Button";

export function FixRunner() {
  const [password, setPassword] = useState("");
  const [rows, setRows] = useState<{ name: string; status: string }[]>([]);
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [error, setError] = useState("");

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setState("running");
    setError("");
    const res = await fetch("/api/fix-imported", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || `Request failed (${res.status})`);
      setState("idle");
      return;
    }
    setRows(data.results);
    setState("done");
  }

  return (
    <div className="mt-8">
      <form onSubmit={run} className="rounded-2xl bg-white p-6 shadow-card">
        <label htmlFor="pw" className="mb-2 block text-sm font-medium text-ink">Password (same as before)</label>
        <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-line px-4 py-3" autoComplete="off" required />
        <button type="submit" disabled={state === "running"} className={buttonClass("gold", "mt-4 w-full")}>
          {state === "running" ? "Fixing…" : "Fix packages"}
        </button>
      </form>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {state === "done" && (
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-card">
          <p className="font-medium text-ink">
            {rows.length === 0 ? "No imported packages were found." : `Done: ${rows.filter((r) => r.status.startsWith("fixed")).length} fixed, ${rows.filter((r) => r.status === "already fine").length} already fine.`}
          </p>
          <ul className="mt-3 max-h-96 space-y-1 overflow-auto text-sm">
            {rows.map((r, i) => (
              <li key={i} className={r.status.startsWith("error") ? "text-red-700" : "text-muted"}>
                {r.status.startsWith("error") ? "✗" : "✓"} {r.name} — {r.status}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
