export const TOKEN_RAIN_ADDRESS =
  "0xf1E634f385345eA76aecfC0bCC80AA09527FEF98" as const;

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
