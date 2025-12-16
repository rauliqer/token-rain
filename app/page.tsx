"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useConnect,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { injected } from "wagmi/connectors";

import { TOKEN_RAIN_ADDRESS, tokenRainAbi } from "../lib/contract";
import { fetchPohStatus, fetchPohSignature } from "../lib/poh";

const LINEA_CHAIN_ID = 59144;
const LINEA_CHAIN_ID_HEX = "0x" + LINEA_CHAIN_ID.toString(16);

// 🔐 helpers de red (a prueba de MetaMask despistado)
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

  // detectar red REAL del wallet
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
        eth.removeListener("chainChanged", refresh);
        eth.removeListener("accountsChanged", refresh);
      };
    }
  }, []);

  // leer usuario solo en Linea
  const user = useReadContract({
    address: TOKEN_RAIN_ADDRESS,
    abi: tokenRainAbi,
    functionName: "getUser",
    args: address ? [address] : undefined,
    query: { enabled: !!address && isLinea },
  });

  const totalDrops = user.data ? user.data[0].toString() : "—";
  const dropsToday = user.data ? user.data[1].toString() : "—";

  // PoH
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

  async function onClaim() {
    if (!address) return;

    const current = await getWalletChainId();
    setWalletChainId(current);

    if (current !== LINEA_CHAIN_ID) {
      setStatus("Switching to Linea…");
      await switchWalletToLinea();
      const after = await getWalletChainId();
      setWalletChainId(after);
      if (after !== LINEA_CHAIN_ID) {
        setStatus("Please switch to Linea in your wallet");
        return;
      }
    }

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

  return (
    <div className="tr-bg">
      <div className="tr-wrap">

        {/* HEADER */}
        <div className="tr-header">
          <div className="tr-brand">💧 Token Rain</div>
          <div className="tr-nav">
            <a href="/leaderboard">Leaderboard</a>
            <a href="/how-it-works">How it works</a>
          </div>
        </div>

        {/* HERO */}
        <div className="tr-hero">
          <h1 className="tr-title">Collect DROPS.</h1>
          <div className="tr-subtitle">
            When it rains, tokens fall.<br />
            1 transaction = 1 DROP · Max 20/day · PoH required
          </div>
        </div>

        {/* MAIN CARD */}
        <div className="tr-card pad" style={{ marginTop: 16 }}>
          {!isConnected ? (
            <button
              className="tr-btn"
              onClick={() => connect({ connector: injected() })}
            >
              Connect MetaMask
            </button>
          ) : !isLinea ? (
            <button className="tr-btn" onClick={switchWalletToLinea}>
              Switch to Linea
            </button>
          ) : (
            <>
              <div className="tr-kpi">
                <div className="tr-kpiBox">
                  <div className="tr-muted">Your DROPS</div>
                  <div className="tr-big">💧 {totalDrops}</div>
                  <div className="tr-muted2">
                    Today: {dropsToday} / 20
                  </div>
                </div>

                <div className="tr-kpiBox">
                  <div className="tr-muted">PoH</div>
                  <div className="tr-big">
                    {poh ? "Verified ✅" : "Not verified ❌"}
                  </div>
                  <div className="tr-muted2">Required to claim</div>
                </div>
              </div>

              <button
                className="tr-btn"
                style={{ marginTop: 14 }}
                disabled={!!claimDisabledReason}
                onClick={onClaim}
              >
                💧 Get a DROP
              </button>

              {claimDisabledReason && (
                <div className="tr-muted2" style={{ marginTop: 8 }}>
                  {claimDisabledReason}
                </div>
              )}

              {status && (
                <div className="tr-muted2" style={{ marginTop: 8 }}>
                  {status}
                </div>
              )}
            </>
          )}
        </div>

        {/* FOOTNOTE */}
        <div className="tr-footnote">
          Rewards will be distributed after Linea Exponent rewards are received.
        </div>

      </div>
    </div>
  );
}
