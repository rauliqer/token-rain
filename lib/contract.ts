export const TOKEN_RAIN_ADDRESS =
  "0x67956C442aa8511cBA296eDE48574F77e5b0F5b9" as const;

export const tokenRainAbi = [
  {
    type: "function",
    name: "getUser",
    stateMutability: "view",
    inputs: [{ name: "userAddr", type: "address" }],
    outputs: [
      { name: "totalDrops", type: "uint256" },
      { name: "dropsToday", type: "uint16" },
    ],
  },
  {
    type: "function",
    name: "claimDrop",
    stateMutability: "nonpayable",
    inputs: [{ name: "pohSignature", type: "bytes" }],
    outputs: [],
  },
] as const;
