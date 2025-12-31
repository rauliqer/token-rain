export const TOKEN_RAIN_ADDRESS =
  "0x99e357a02cD5Cc2F33d5d23e1FC8eF30356611d2" as const;

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
