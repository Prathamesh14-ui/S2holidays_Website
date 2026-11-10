"use client";

import { useState } from "react";
import { buttonClass } from "@/components/ui/Button";

type Row = { name: string; status: string };

export function NewTripsRunner({ total }: { total: number }) {
  const [password, setPassword] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function run() {
    setBusy(true);
    setRows([]);
    setMsg("");
    try {
      let offset = 0;
      for (let i = 0; i < 30; i++) {
        const res = await fetch("/api/import-new-trips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, offset }),
        });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(d.error || `Request failed (${res.status})`);
        setRows((r) => [...r, ...d.results]);
        if (d.done) break;
        offset = d.next;
      }
      setMsg("Finished. The new trips are live on the website with prices hidden. Next: add a photo to each one in Studio.");
    } catch (e) {
      setMsg((e as Error).message);
    }
    setBusy(false);
  }

  const pkgs = rows.filter((r) => !r.name.startsWith("Destination:"));
  const count = (s: string) => pkgs.filter((r) => r.status.startsWith(s)).length;

  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <label htmlFor="pw" className="mb-2 block text-sm font-medium text-ink">Password (same as before)</label>
        <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-line px-4 py-3" autoComplete="off" />
        <button type="button" disabled={!password || busy} onClick={run} className={`${buttonClass("gold")} mt-5 w-full`}>
          {busy ? `Adding… ${pkgs.length} / ${total}` : "Add the new trips"}
        </button>
        <p className="mt-3 text-xs text-muted">Prices are saved but hidden (“Price on request”) until the owner approves them.</p>
      </div>
      {msg && <p role="status" className="rounded-xl bg-sand-deep/60 p-4 text-sm text-ink">{msg}</p>}
      {rows.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <p className="font-medium text-ink">
            {count("published")} added · {count("skipped")} already existed · {count("error")} errors
          </p>
          <ul className="mt-3 max-h-96 space-y-1 overflow-auto text-sm">
            {rows.map((r, i) => (
              <li key={i} className={r.status.startsWith("error") ? "text-red-700" : "text-muted"}>
                {r.name} — {r.status}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
