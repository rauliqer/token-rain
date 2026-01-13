import { NextResponse } from "next/server";
import { createPublicClient, http, parseAbiItem } from "viem";
import { linea } from "viem/chains";

export const runtime = "nodejs";        // importante: no Edge
export const dynamic = "force-dynamic"; // evita cache en Next
export const revalidate = 0;            // sin cache

const CONTRACT = "0x67956C442aa8511cBA296eDE48574F77e5b0F5b9" as const;
const DEPLOY_BLOCK = BigInt(process.env.DEPLOY_BLOCK ?? "0");

// Evento del contrato
const DropClaimed = parseAbiItem(
  "event DropClaimed(address indexed user, uint32 indexed day, uint16 dropsToday, uint256 totalDropsUser)"
);

const client = createPublicClient({
  chain: linea,
  transport: http("https://rpc.linea.build"),
});

// Tamaño de chunk. Si sigue fallando, baja a 20_000n o 10_000n
const CHUNK = BigInt("50000");

function maskAddress(addr: string) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export async function GET() {
  try {
    const latest = await client.getBlockNumber();

    const counts = new Map<string, number>();

    let from = DEPLOY_BLOCK;
    while (from <= latest) {
      const to = from + CHUNK > latest ? latest : from + CHUNK;

      const logs = await client.getLogs({
        address: CONTRACT,
        event: DropClaimed,
        fromBlock: from,
        toBlock: to,
      });

      for (const l of logs) {
        const user = (l.args as any).user as string;
        counts.set(user, (counts.get(user) ?? 0) + 1);
      }

      from = to + 1n;
    }

    const rows = Array.from(counts.entries())
      .map(([address, drops]) => ({
        address, // completa
        wallet: maskAddress(address), // enmascarada
        drops,
      }))
      .sort((a, b) => b.drops - a.drops)
      .slice(0, 100);

    const totalDropsAll = Array.from(counts.values()).reduce((a, b) => a + b, 0);

    const res = NextResponse.json({
      ok: true,
      deployBlock: DEPLOY_BLOCK.toString(),
      latestBlock: latest.toString(),
      totalWallets: counts.size,
      totalDropsAll,
      top: rows,
    });

    // fuerza no cache (Vercel)
    res.headers.set("Cache-Control", "no-store, max-age=0");
    return res;
  } catch (e: any) {
    const res = NextResponse.json(
      { ok: false, error: e?.message || String(e) },
      { status: 500 }
    );
    res.headers.set("Cache-Control", "no-store, max-age=0");
    return res;
  }
}
