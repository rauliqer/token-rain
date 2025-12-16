export async function fetchPohStatus(address: string): Promise<boolean> {
  const r = await fetch(`https://poh-api.linea.build/poh/v2/${address}`, {
    cache: "no-store",
  });
  const t = (await r.text()).trim();
  return t === "true";
}

export async function fetchPohSignature(address: string): Promise<`0x${string}`> {
  const r = await fetch(`https://poh-signer-api.linea.build/poh/v2/${address}`, {
    cache: "no-store",
  });
  const t = (await r.text()).trim();
  if (!t.startsWith("0x")) throw new Error("Invalid PoH signature");
  return t as `0x${string}`;
}
