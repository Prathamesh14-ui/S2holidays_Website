"use client";

import { useState } from "react";
import { buttonClass } from "@/components/ui/Button";

type Row = { name: string; status: string };

export function KbRunner({ total }: { total: number }) {
  const [password, setPassword] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState<"" | "import" | "publish">("");
  const [msg, setMsg] = useState("");
  const [waiting, setWaiting] = useState<string[]>([]);

  async function call(body: object) {
    const res = await fetch("/api/import-kb", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password, ...body }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  }

  async function runImport() {
    setBusy("import"); setRows([]); setMsg(""); setWaiting([]);
    try {
      let offset = 0;
      for (let i = 0; i < 60; i++) {
        const d = await call({ action: "import", offset });
        setRows((r) => [...r, ...d.results]);
        if (d.done) break;
        offset = d.next;
      }
      setMsg("Step 1 finished. The packages are now in Studio as drafts — review them, then come back for Step 2.");
    } catch (e) { setMsg((e as Error).message); }
    setBusy("");
  }

  async function runPublish() {
    setBusy("publish"); setRows([]); setMsg(""); setWaiting([]);
    try {
      for (let i = 0; i < 20; i++) {
        const d = await call({ action: "publish" });
        setRows((r) => [...r, ...d.results]);
        setWaiting(d.waitingForPhoto || []);
        if (d.done) break;
      }
      setMsg("Step 2 finished. New packages are live; the old-website packages are hidden (kept as drafts in Studio).");
    } catch (e) { setMsg((e as Error).message); }
    setBusy("");
  }

  const count = (s: string) => rows.filter((r) => r.status.startsWith(s)).length;

  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <label htmlFor="pw" className="mb-2 block text-sm font-medium text-ink">Password (same as before)</label>
        <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-line px-4 py-3" autoComplete="off" />
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button type="button" disabled={!password || !!busy} onClick={runImport} className={buttonClass("gold")}>
            {busy === "import" ? `Importing… ${rows.length} / ${total}` : "Step 1 · Import as drafts"}
          </button>
          <button type="button" disabled={!password || !!busy} onClick={runPublish} className={buttonClass("primary")}>
            {busy === "publish" ? "Publishing…" : "Step 2 · Publish & hide old"}
          </button>
        </div>
        <p className="mt-3 text-xs text-muted">Prices are imported but hidden (“Price on request”) until the owner approves them.</p>
      </div>
      {msg && <p role="status" className="rounded-xl bg-sand-deep/60 p-4 text-sm text-ink">{msg}</p>}
      {rows.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <p className="font-medium text-ink">
            {count("created")} created · {count("skipped")} already existed · {count("published")} published · {count("hidden")} hidden · {count("error")} errors
          </p>
          <ul className="mt-3 max-h-96 space-y-1 overflow-auto text-sm">
            {rows.map((r, i) => (
              <li key={i} className={r.status.startsWith("error") ? "text-red-700" : r.status.includes("no photo") ? "text-amber-700" : "text-muted"}>
                {r.name} — {r.status}
              </li>
            ))}
          </ul>
        </div>
      )}
      {waiting.length > 0 && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-50 p-6 text-sm text-amber-900">
          <p className="font-medium">Waiting for a photo (add one in Studio, then Publish there):</p>
          <ul className="mt-2 list-disc pl-5">{waiting.map((w) => <li key={w}>{w}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
