"use client";

import { useState } from "react";
import { buttonClass } from "@/components/ui/Button";

type Row = { title: string; status: string };

export function ImportRunner({ total }: { total: number }) {
  const [password, setPassword] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [state, setState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setState("running");
    setRows([]);
    setError("");
    let offset = 0;
    for (let guard = 0; guard < 50; guard++) {
      const res = await fetch("/api/import-old-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, offset }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Request failed (${res.status})`);
        setState("error");
        return;
      }
      setRows((r) => [...r, ...data.results]);
      if (data.done) break;
      offset = data.next;
    }
    setState("done");
  }

  const created = rows.filter((r) => r.status === "created").length;
  const skipped = rows.filter((r) => r.status === "skipped").length;
  const failed = rows.filter((r) => r.status.startsWith("error")).length;

  return (
    <div className="mt-8">
      <form onSubmit={run} className="rounded-2xl bg-white p-6 shadow-card">
        <label htmlFor="pw" className="mb-2 block text-sm font-medium text-ink">
          Password (the SANITY_REVALIDATE_SECRET value saved in Vercel)
        </label>
        <input
          id="pw"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-line px-4 py-3"
          autoComplete="off"
          required
        />
        <button type="submit" disabled={state === "running"} className={buttonClass("gold", "mt-4 w-full")}>
          {state === "running" ? `Importing… ${rows.length} / ${total}` : "Import"}
        </button>
      </form>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {rows.length > 0 && (
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-card">
          <p className="font-medium text-ink">
            {state === "done" ? "Finished: " : "Progress: "}
            {created} created, {skipped} already existed{failed ? `, ${failed} failed` : ""}.
          </p>
          <ul className="mt-3 max-h-96 space-y-1 overflow-auto text-sm">
            {rows.map((r, i) => (
              <li key={i} className={r.status.startsWith("error") ? "text-red-700" : "text-muted"}>
                {r.status === "created" ? "✓" : r.status === "skipped" ? "–" : "✗"} {r.title}
                {r.status.startsWith("error") && ` — ${r.status}`}
              </li>
            ))}
          </ul>
          {state === "done" && (
            <p className="mt-4 text-sm text-ink">
              Now open the Studio → Holiday packages → All packages. Imported packages are drafts: review each one and click Publish.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
