"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useConnect, useReadContract, useWriteContract } from "wagmi";
import { injected } from "wagmi/connectors";

import { TOKEN_RAIN_ADDRESS, tokenRainAbi } from "../lib/contract";
import { fetchPohStatus, fetchPohSignature } from "../lib/poh";

const LINEA_CHAIN_ID = 59144;
const LINEA_CHAIN_ID_HEX = "0x" + LINEA_CHAIN_ID.toString(16);

async function getWalletChainId(): Promise<number | null> {
  const eth = (window as any).ethereum;
  if (!eth?.request) return null;
  const hex = await eth.request({ method: "eth_chainId" });
  return parseInt(hex, 16);
}

async function switchWalletToLinea(): Promise<void> {
  const eth = (window as any).ethereum;
  if (!eth?.request) throw new Error("Wallet not found");

  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: LINEA_CHAIN_ID_HEX }],
    });
  } catch (e: any) {
    if (e?.code === 4902) {
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: LINEA_CHAIN_ID_HEX,
            chainName: "Linea",
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: ["https://rpc.linea.build"],
            blockExplorerUrls: ["https://lineascan.build"],
          },
        ],
      });
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: LINEA_CHAIN_ID_HEX }],
      });
    } else {
      throw e;
    }
  }
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { writeContractAsync } = useWriteContract();

  const [walletChainId, setWalletChainId] = useState<number | null>(null);
  const [poh, setPoh] = useState<null | boolean>(null);
  const [status, setStatus] = useState("");

  const isLinea = walletChainId === LINEA_CHAIN_ID;

  // Track real wallet chain
  useEffect(() => {
    async function refresh() {
      const id = await getWalletChainId();
      setWalletChainId(id);
    }
    refresh();

    const eth = (window as any).ethereum;
    if (eth?.on) {
      eth.on("chainChanged", refresh);
      eth.on("accountsChanged", refresh);
      return () => {
        eth.removeListener?.("chainChanged", refresh);
        eth.removeListener?.("accountsChanged", refresh);
      };
    }
  }, []);

  const user = useReadContract({
    address: TOKEN_RAIN_ADDRESS,
    abi: tokenRainAbi,
    functionName: "getUser",
    args: address ? [address] : undefined,
    query: { enabled: !!address && isLinea },
  });

  const totalDrops = user.data ? user.data[0].toString() : "—";
  const dropsToday = user.data ? user.data[1].toString() : "—";

  // PoH check
  useEffect(() => {
    let alive = true;
    async function run() {
      if (!address) {
        setPoh(null);
        return;
      }
      try {
        const ok = await fetchPohStatus(address);
        if (alive) setPoh(ok);
      } catch {
        if (alive) setPoh(null);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [address]);

  const claimDisabledReason = useMemo(() => {
    if (!isConnected) return "Connect wallet";
    if (walletChainId === null) return "Detecting network…";
    if (!isLinea) return "Wrong network";
    if (poh === null) return "Checking PoH…";
    if (poh === false) return "PoH required";
    return null;
  }, [isConnected, walletChainId, isLinea, poh]);

  async function onPrimaryAction() {
    // Not connected → connect
    if (!isConnected) {
      connect({ connector: injected() });
      return;
    }

    // Connected but wrong network → switch
    const current = await getWalletChainId();
    setWalletChainId(current);
    if (current !== LINEA_CHAIN_ID) {
      setStatus("Switching to Linea…");
      try {
        await switchWalletToLinea();
        const after = await getWalletChainId();
        setWalletChainId(after);
        setStatus(after === LINEA_CHAIN_ID ? "" : "Please switch to Linea in your wallet");
      } catch (e: any) {
        setStatus(e?.message || "Could not switch to Linea");
      }
      return;
    }

    // Connected + Linea → claim
    if (!address) return;

    try {
      setStatus("Checking PoH…");
      const ok = await fetchPohStatus(address);
      if (!ok) {
        setStatus("PoH required");
        return;
      }

      setStatus("Fetching PoH signature…");
      const sig = await fetchPohSignature(address);

      setStatus("Claiming DROP… confirm in wallet");
      await writeContractAsync({
        chainId: LINEA_CHAIN_ID,
        address: TOKEN_RAIN_ADDRESS,
        abi: tokenRainAbi,
        functionName: "claimDrop",
        args: [sig],
      });

      setStatus("✅ DROP claimed");
      setTimeout(() => window.location.reload(), 900);
    } catch (e: any) {
      setStatus(e?.shortMessage || e?.message || "Claim failed");
    }
  }

  const primaryLabel = !isConnected
    ? "Connect MetaMask"
    : !isLinea
    ? "Switch to Linea"
    : "💧 Get a DROP";

  return (
    <div className="tr-bg">
      <div className="tr-home">
        {/* HEADER */}
        <div className="tr-header">
          <div className="tr-brand">💧 Token Rain</div>
          <div className="tr-nav">
            <a href="/leaderboard">Leaderboard</a>
            <a href="/how-it-works">How it works</a>
          </div>
        </div>

        {/* CARD 1: Big hero */}
        <div className="tr-card tr-heroCard">
          <h1 className="tr-heroTitle">Collect DROPS.</h1>
          <div className="tr-heroSub">When it rains, tokens fall.</div>
          <div className="tr-heroMeta">
            1 transaction = 1 DROP · Max 20/day · PoH required
          </div>

          <div className="tr-heroBtnRow">
            <button
              className="tr-btn"
              onClick={onPrimaryAction}
              disabled={isConnected && isLinea && !!claimDisabledReason}
              title={claimDisabledReason ?? ""}
            >
              {primaryLabel}
            </button>
          </div>

          {status && <div className="tr-heroStatus">{status}</div>}
        </div>

        {/* Cards 2 & 3: stats row */}
        <div className="tr-bottomGrid">
          <div className="tr-card pad">
            <div className="tr-muted">Your DROPS</div>
            <div className="tr-big">💧 {totalDrops}</div>
            <div className="tr-muted2">Today: {dropsToday} / 20</div>
          </div>

          <div className="tr-card pad">
            <div className="tr-muted">PoH</div>
            <div className="tr-big">
              {poh === null ? "Checking…" : poh ? "Verified ✅" : "Not verified ❌"}
            </div>
            <div className="tr-muted2">
              Required to claim{" "}
              {poh === false && (
                <>
                  —{" "}
                  <a href="https://linea.build/hub" target="_blank" rel="noreferrer">
                    verify
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="tr-footnote">
          Rewards will be distributed after Linea Exponent rewards are received.
        </div>
      </div>
    </div>
  );
}
