"use client";

import * as React from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { linea } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";

import "@rainbow-me/rainbowkit/styles.css";

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;

if (!projectId) {
  console.warn("Missing NEXT_PUBLIC_WC_PROJECT_ID (WalletConnect Project ID).");
}

const config = getDefaultConfig({
  appName: "Token Rain",
  projectId: projectId || "MISSING_PROJECT_ID",
  chains: [linea],
  transports: {
    [linea.id]: http("https://rpc.linea.build"),
  },
  ssr: true,
autoConnect: false,
});

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          theme={darkTheme({ borderRadius: "large" })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
