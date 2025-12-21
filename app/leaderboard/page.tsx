"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";

function short(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

type Row = { address: string; drops: number };
type ApiResp =
  | { ok: true; top: Row[]; totalWallets: number; deployBlock: string }
  | { ok: false; error: string };

const TOP_PRIZES = 10;

function formatInt(n: number) {
  return n.toLocaleString("en-US");
}

function pct(n: number, decimals = 1) {
  return `${n.toFixed(decimals)}%`;
}

// Chance to be selected at least once among 10 picks (estimate)
// chance = 1 - (1 - d/T)^10
function chanceTop10(d: number, T: number) {
  if (T <= 0 || d <= 0) return 0;
  const p = d / T;
  const chance = 1 - Math.pow(1 - p, TOP_PRIZES);
  return Math.max(0, Math.min(1, chance)) * 100;
}

// Exact share of the 45% community pool
function communityShare45(d: number, T: number) {
  if (T <= 0 || d <= 0) return 0;
  return (d / T) * 45;
}

export default function LeaderboardPage() {
  const { address, isConnected } = useAccount();
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

  const computed = useMemo(() => {
    if (!data || !data.ok) return null;

    const totalDropsAll = data.top.reduce((sum, r) => sum + Number(r.drops || 0), 0);

    const myRow =
      address
        ? data.top.find((r) => String(r.address).toLowerCase() === address.toLowerCase())
        : undefined;

    const myDrops = myRow ? Number(myRow.drops || 0) : 0;

    const myRank =
      myRow && address
        ? data.top.findIndex((r) => r.address.toLowerCase() === address.toLowerCase()) + 1
        : null;

    return { totalDropsAll, myDrops, myRank, myRow };
  }, [data, address]);

  return (
    <div className="tr-bg">
      <div className="tr-wrap">
        {/* HEADER */}
        <div className="tr-header">
          <div className="tr-brand">
            <img className="tr-dropImg md" src="/drop.png" alt="drop" />
            Token Rain
          </div>

          <div className="tr-nav">
            <a href="/">Home</a>
            <a href="/leaderboard">Leaderboard</a>
            <a href="/the-rain">The Rain</a>
            <a href="/how-it-works">How it works</a>

            <a
              href="https://x.com/T0kenRain"
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
          <div className="tr-subtitle">Top 100 wallets by DROPS (PoH-only by design).</div>
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
              {/* Total DROPS */}
              <div className="tr-cardBody" style={{ marginBottom: 14 }}>
                <div className="tr-subLine">
                  <b>Total DROPS:</b> {formatInt(computed?.totalDropsAll ?? 0)}{" "}
                  <img className="tr-dropImg sm" src="/drop.png" alt="drop" />
                </div>

                <div className="tr-muted2" style={{ marginTop: 8 }}>
                  Chance is an estimate based on current DROPS. Community share is proportional (45% pool).
                </div>
              </div>

              <table className="tr-table">
                <thead>
                  <tr>
                    <th style={{ width: 70 }}>#</th>
                    <th>Wallet</th>
                    <th style={{ width: 110 }}>DROPS</th>
                    <th style={{ width: 150 }}>Chance (Top 10)</th>
                    <th style={{ width: 190 }}>Community share (45%)</th>
                  </tr>
                </thead>

                <tbody>
                  {/* YOU row (duplicated above leaderboard) */}
                  {isConnected && computed?.myRow && (
                    <tr key="you-row" className="tr-youRow">
                      <td>{computed.myRank ?? "—"}</td>
                     <td>
  <span className="tr-youBadge">You</span>
</td>

                      <td>
                        <span className="tr-dropsCell">
                          {Number(computed.myDrops)}
                          <img className="tr-dropImg sm" src="/drop.png" alt="drop" />
                        </span>
                      </td>

                      <td>
                        {computed.totalDropsAll > 0
                          ? `≈ ${pct(
                              chanceTop10(Number(computed.myDrops), computed.totalDropsAll),
                              1
                            )}`
                          : "—"}
                      </td>

                      <td>
                        {computed.totalDropsAll > 0
                          ? pct(communityShare45(Number(computed.myDrops), computed.totalDropsAll), 2)
                          : "—"}
                      </td>
                    </tr>
                  )}

                  {/* Leaderboard rows */}
                  {data.top.map((row, i) => {
                    const T = computed?.totalDropsAll ?? 0;
                    const d = Number(row.drops || 0);

                    return (
                      <tr key={row.address}>
                        <td>{i + 1}</td>
                        <td>{short(row.address)}</td>

                        <td>
                          <span className="tr-dropsCell">
                            {d}
                            <img className="tr-dropImg sm" src="/drop.png" alt="drop" />
                          </span>
                        </td>

                        <td>{T > 0 ? `≈ ${pct(chanceTop10(d, T), 1)}` : "—"}</td>

                        <td>{T > 0 ? pct(communityShare45(d, T), 2) : "—"}</td>
                      </tr>
                    );
                  })}
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
