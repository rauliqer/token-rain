export const TOKEN_RAIN_ADDRESS =
  "0x6a79cE9D17dC4d7154Db51c64544B87167C2520B" as const;

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
