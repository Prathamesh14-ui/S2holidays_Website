"use client";

import { useState } from "react";
import { buttonClass } from "@/components/ui/Button";

type Row = { name: string; status: string };

export function AndamanRunner({ total }: { total: number }) {
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
      for (let i = 0; i < 40; i++) {
        const res = await fetch("/api/add-andaman", {
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
      setMsg("Finished. The Andaman section is live with photos and prices (refresh the website in a minute).");
    } catch (e) {
      setMsg((e as Error).message);
    }
    setBusy(false);
  }

  const pkgs = rows;
  const count = (s: string) => pkgs.filter((r) => r.status.startsWith(s)).length;

  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <label htmlFor="pw" className="mb-2 block text-sm font-medium text-ink">Password (same as before)</label>
        <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-line px-4 py-3" autoComplete="off" />
        <button type="button" disabled={!password || busy} onClick={run} className={`${buttonClass("gold")} mt-5 w-full`}>
          {busy ? `Working… ${pkgs.length} / ${total}` : "Complete the Andaman section"}
        </button>
        <p className="mt-3 text-xs text-muted">If you see an error, wait a minute and press again – it continues where it stopped.</p>
      </div>
      {msg && <p role="status" className="rounded-xl bg-sand-deep/60 p-4 text-sm text-ink">{msg}</p>}
      {rows.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <p className="font-medium text-ink">
            {rows.filter((r) => !r.status.startsWith("error")).length} done · {count("error")} errors
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
