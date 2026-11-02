"use client";

import { useState } from "react";
import { buttonClass } from "@/components/ui/Button";

export function PublishRunner() {
  const [password, setPassword] = useState("");
  const [rows, setRows] = useState<{ name: string; status: string }[]>([]);
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [error, setError] = useState("");

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setState("running");
    setError("");
    const res = await fetch("/api/publish-imported", {
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

  const ok = rows.filter((r) => r.status === "published").length;
  return (
    <div className="mt-8">
      <form onSubmit={run} className="rounded-2xl bg-white p-6 shadow-card">
        <label htmlFor="pw" className="mb-2 block text-sm font-medium text-ink">Password (same as for the import)</label>
        <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-line px-4 py-3" autoComplete="off" required />
        <button type="submit" disabled={state === "running"} className={buttonClass("gold", "mt-4 w-full")}>
          {state === "running" ? "Publishing…" : "Publish all"}
        </button>
      </form>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {state === "done" && (
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-card">
          <p className="font-medium text-ink">
            {rows.length === 0 ? "Nothing to publish — no imported drafts were found." : `Published ${ok} of ${rows.length}.`}
          </p>
          <ul className="mt-3 max-h-96 space-y-1 overflow-auto text-sm">
            {rows.map((r, i) => (
              <li key={i} className={r.status === "published" ? "text-muted" : "text-red-700"}>
                {r.status === "published" ? "✓" : "✗"} {r.name}{r.status !== "published" && ` — ${r.status}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
