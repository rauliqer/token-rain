import { NextResponse } from "next/server";
import { createPublicClient, http, parseAbiItem } from "viem";
import { linea } from "viem/chains";

const CONTRACT = "0xf1E634f385345eA76aecfC0bCC80AA09527FEF98" as const;

// 👇 pon aquí el bloque de deploy cuando lo tengas (recomendado)
const DEPLOY_BLOCK = BigInt(process.env.DEPLOY_BLOCK ?? "0");

// Evento del contrato
const DropClaimed = parseAbiItem(
  "event DropClaimed(address indexed user, uint32 indexed day, uint16 dropsToday, uint256 totalDropsUser)"
);

const client = createPublicClient({
  chain: linea,
  transport: http("https://rpc.linea.build"),
});

// Cachea la respuesta (reduce llamadas a RPC)
export const revalidate = 30;

export async function GET() {
  try {
    const logs = await client.getLogs({
      address: CONTRACT,
      event: DropClaimed,
      fromBlock: DEPLOY_BLOCK,
      toBlock: "latest",
    });

    // Sumamos 1 DROP por cada evento DropClaimed
    const counts = new Map<string, number>();
    for (const l of logs) {
      const user = (l.args as any).user as string;
      counts.set(user, (counts.get(user) ?? 0) + 1);
    }

    const rows = Array.from(counts.entries())
  .map(([address, drops]) => ({
    address,              // completa (para lógica)
    wallet: maskAddress(address), // enmascarada (para UI)
    drops,
  }))
  .sort((a, b) => b.drops - a.drops)
  .slice(0, 100);
function maskAddress(addr: string) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

    return NextResponse.json({
      ok: true,
      deployBlock: DEPLOY_BLOCK.toString(),
      totalWallets: counts.size,
      top: rows,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || String(e) },
      { status: 500 }
    );
  }
}
