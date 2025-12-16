export const LINEA_CHAIN_ID = 59144;

export const LINEA_CHAIN = {
  id: LINEA_CHAIN_ID,
  name: "Linea",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.linea.build"] } },
  blockExplorers: { default: { name: "LineaScan", url: "https://lineascan.build" } },
} as const;
