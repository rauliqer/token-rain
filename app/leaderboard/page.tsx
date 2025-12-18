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

  return (
    <div className="tr-bg">
      <div className="tr-wrap">
        {/* HEADER */}
        <div className="tr-header">
          <div className="tr-brand">💧 Token Rain</div>
          <div className="tr-nav">
  <a href="/leaderboard">Leaderboard</a>
  <a href="/how-it-works">How it works</a>

  <a
    href="https://x.com/TU_USUARIO"
    target="_blank"
    rel="noreferrer"
    aria-label="Token Rain on X"
    className="tr-xLink"
  >
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18.9 2H22.3L14.8 10.3L23.6 22H16.8L11.5 15.1L5.4 22H2L10 13.2L1.6 2H8.6L13.3 8.1L18.9 2Z"
        fill="currentColor"
      />
    </svg>
  </a>
</div>

        </div>

        {/* HERO */}
        <div className="tr-hero">
          <h1 className="tr-title">Leaderboard</h1>
          <div className="tr-subtitle">
            Top 100 wallets by DROPS (PoH-only by design).
          </div>
        </div>

        {/* CONTENT */}
        <div className="tr-card pad" style={{ marginTop: 16 }}>
          {!data ? (
            <div className="tr-muted">Loading…</div>
          ) : !data.ok ? (
            <div>
              <div style={{ fontWeight: 900 }}>❌ Error</div>
              <div className="tr-muted2" style={{ marginTop: 6 }}>
                {data.error}
              </div>
            </div>
          ) : (
            <>
              <table className="tr-table">
                <thead>
                  <tr>
                    <th style={{ width: 70 }}>#</th>
                    <th>Wallet</th>
                    <th style={{ width: 110 }}>DROPS</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top.map((row, i) => (
                    <tr key={row.address}>
                      <td>{i + 1}</td>
                      <td>{short(row.address)}</td>
                      <td>
  <span className="tr-dropsCell">
    {row.drops}
    <img className="tr-dropImg sm" src="/drop.png" alt="drop" />
  </span>
</td>

                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="tr-footnote" style={{ marginTop: 12 }}>
                Updated automatically. Contract events only.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
