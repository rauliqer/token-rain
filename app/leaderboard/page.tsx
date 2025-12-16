export const revalidate = 30;

function short(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export default async function LeaderboardPage() {
  const res = await fetch("http://localhost:3000/api/leaderboard", {
    // en producción Next reescribe esto bien; en local funciona
    cache: "no-store",
  });

  const data = await res.json();

  if (!data.ok) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Leaderboard</h1>
        <p>❌ Error: {data.error}</p>
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
            {data.top.map((row: any, i: number) => (
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

      {/* Nota: NO mostramos totalDrops global */}
      <div style={{ marginTop: 12, opacity: 0.7 }}>
        Updated automatically. Contract events only.
      </div>
    </main>
  );
}
