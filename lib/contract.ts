export const TOKEN_RAIN_ADDRESS =
  "0x544dc9418f6a6a73B0Cbcad356Abd2c88fA8d890" as const;

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
