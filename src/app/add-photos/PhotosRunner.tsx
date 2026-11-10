"use client";

import { useState } from "react";
import { buttonClass } from "@/components/ui/Button";

type Row = { name: string; status: string };

export function PhotosRunner({ total }: { total: number }) {
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
        const res = await fetch("/api/add-photos", {
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
      setMsg("Finished. The photos are on the website (it can take a minute to refresh). You can still change any photo in Studio.");
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
          {busy ? `Adding photos… ${pkgs.length} / ${total}` : "Add the photos"}
        </button>
        <p className="mt-3 text-xs text-muted">Only trips and destinations without a photo get one – photos you added in Studio are kept.</p>
      </div>
      {msg && <p role="status" className="rounded-xl bg-sand-deep/60 p-4 text-sm text-ink">{msg}</p>}
      {rows.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <p className="font-medium text-ink">
            {count("photo added")} added · {count("skipped")} already had a photo · {count("not found")} not found · {count("error")} errors
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
