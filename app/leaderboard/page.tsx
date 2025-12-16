"use client";

import { useEffect, useState } from "react";

function short(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

type Row = { address: string; drops: number };
type ApiResp =
  | { ok: true; top: Row[]; totalWallets: number; deployBlock: string }
  | { ok: false; error: string };

export default function LeaderboardPage() {
  const [data, setData] = useState<ApiResp | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/leaderboard", { cache: "no-store" });
        const json = (await res.json()) as ApiResp;
        if (alive) setData(json);
      } catch (e: any) {
        if (alive) setData({ ok: false, error: e?.message || "Fetch failed" });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (!data) {
    return (
      <main style={{ padding: 24, maxWidth: 820, margin: "0 auto" }}>
        <h1 style={{ margin: 0 }}>Leaderboard</h1>
        <div style={{ opacity: 0.8, marginTop: 6 }}>Loading…</div>
      </main>
    );
  }

  if (!data.ok) {
    return (
      <main style={{ padding: 24, maxWidth: 820, margin: "0 auto" }}>
        <h1 style={{ margin: 0 }}>Leaderboard</h1>
        <div style={{ marginTop: 10 }}>❌ Error: {data.error}</div>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 820, margin: "0 auto" }}>
      <h1 style={{ margin: 0 }}>Leaderboard</h1>
      <div style={{ opacity: 0.8, marginTop: 6 }}>
        Top 100 holders (PoH-only by design)
      </div>

      <div
        style={{
          marginTop: 14,
          border: "1px solid #222",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", opacity: 0.85 }}>
              <th style={{ padding: 12, borderBottom: "1px solid #222" }}>#</th>
              <th style={{ padding: 12, borderBottom: "1px solid #222" }}>
                Wallet
              </th>
              <th style={{ padding: 12, borderBottom: "1px solid #222" }}>
                DROPS
              </th>
            </tr>
          </thead>
          <tbody>
            {data.top.map((row, i) => (
              <tr key={row.address}>
                <td style={{ padding: 12, borderBottom: "1px solid #1a1a1a" }}>
                  {i + 1}
                </td>
                <td style={{ padding: 12, borderBottom: "1px solid #1a1a1a" }}>
                  {short(row.address)}
                </td>
                <td style={{ padding: 12, borderBottom: "1px solid #1a1a1a" }}>
                  {row.drops}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12, opacity: 0.7 }}>
        Updated automatically. Contract events only.
      </div>
    </main>
  );
}
