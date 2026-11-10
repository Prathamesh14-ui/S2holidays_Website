"use client";

import { useState } from "react";
import { buttonClass } from "@/components/ui/Button";

export function PricesRunner() {
  const [password, setPassword] = useState("");
  const [rows, setRows] = useState<{ name: string; status: string }[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setBusy(true); setError(""); setRows(null);
    const res = await fetch("/api/show-new-prices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setError(data.error || `Request failed (${res.status})`);
    else setRows(data.results);
    setBusy(false);
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <label htmlFor="pw" className="mb-2 block text-sm font-medium text-ink">Password (same as before)</label>
        <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-line px-4 py-3" autoComplete="off" />
        <button type="button" disabled={!password || busy} onClick={run} className={buttonClass("gold", "mt-5 w-full")}>
          {busy ? "Updating…" : "Show new trip prices"}
        </button>
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {rows && (
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <p className="font-medium text-ink">{rows.length === 0 ? "All new trip prices were already shown." : `Done: ${rows.length} packages now show their price.`}</p>
          <ul className="mt-3 max-h-96 space-y-1 overflow-auto text-sm text-muted">
            {rows.map((r, i) => <li key={i}>✓ {r.name} — {r.status}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
