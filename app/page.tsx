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

async function getWalletChainId(): Promise<number | null> {
  if (typeof window === "undefined") return null;
  const eth = (window as any).ethereum;
  if (!eth?.request) return null;
  const hex = await eth.request({ method: "eth_chainId" });
  return parseInt(hex, 16);
}

async function switchWalletToLinea(): Promise<void> {
  const eth = (window as any).ethereum;
  if (!eth?.request) throw new Error("MetaMask not found");

  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: LINEA_CHAIN_ID_HEX }],
    });
  } catch (e: any) {
    // 4902 = chain not added
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
      // después de añadir, intenta switch otra vez
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
  const [status, setStatus] = useState<string>("");

  const isLinea = walletChainId === LINEA_CHAIN_ID;

  // Mantener chainId real del wallet actualizado
  useEffect(() => {
    let alive = true;

    async function refresh() {
      const id = await getWalletChainId();
      if (alive) setWalletChainId(id);
    }

    refresh();

    const eth = (window as any).ethereum;
    if (eth?.on) {
      const onChainChanged = () => refresh();
      const onAccountsChanged = () => refresh();
      eth.on("chainChanged", onChainChanged);
      eth.on("accountsChanged", onAccountsChanged);
      return () => {
        alive = false;
        eth.removeListener?.("chainChanged", onChainChanged);
        eth.removeListener?.("accountsChanged", onAccountsChanged);
      };
    }

    return () => {
      alive = false;
    };
  }, []);

  // Leer DROPS solo si estamos en Linea
  const user = useReadContract({
    address: TOKEN_RAIN_ADDRESS,
    abi: tokenRainAbi,
    functionName: "getUser",
    args: address ? [address] : undefined,
    query: { enabled: !!address && isLinea },
  });

  const totalDrops = user.data ? user.data[0].toString() : "—";
  const dropsToday = user.data ? user.data[1].toString() : "—";

  // Comprobar PoH cuando hay address
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
    if (!isConnected) return "Connect wallet first";
    if (walletChainId === null) return "Detecting network…";
    if (!isLinea) return "Wrong network (switch to Linea)";
    if (poh === null) return "Checking PoH…";
    if (poh === false) return "PoH required";
    return null;
  }, [isConnected, walletChainId, isLinea, poh]);

  async function onSwitchToLinea() {
    try {
      setStatus("Switching wallet to Linea…");
      await switchWalletToLinea();
      const id = await getWalletChainId();
      setWalletChainId(id);
      setStatus("");
    } catch (e: any) {
      setStatus(e?.message || "Failed to switch network");
    }
  }

  async function onClaim() {
    if (!address) return;

    // ✅ check REAL del wallet justo antes de enviar
    const current = await getWalletChainId();
    setWalletChainId(current);

    if (current !== LINEA_CHAIN_ID) {
      setStatus("Wrong network. Switching to Linea…");
      try {
        await switchWalletToLinea();
        const after = await getWalletChainId();
        setWalletChainId(after);
        if (after !== LINEA_CHAIN_ID) {
          setStatus("Please switch to Linea in MetaMask.");
          return;
        }
      } catch (e: any) {
        setStatus(e?.message || "Could not switch to Linea");
        return;
      }
    }

    try {
      setStatus("Checking PoH…");
      const ok = await fetchPohStatus(address);
      if (!ok) {
        setStatus("PoH required. Verify first.");
        return;
      }

      setStatus("Fetching PoH signature…");
      const sig = await fetchPohSignature(address);

      setStatus("Claiming DROP… confirm in MetaMask (Linea)");
      await writeContractAsync({
        chainId: LINEA_CHAIN_ID, // ✅ fuerza Linea
        address: TOKEN_RAIN_ADDRESS,
        abi: tokenRainAbi,
        functionName: "claimDrop",
        args: [sig],
      });

      setStatus("✅ DROP claimed. Refreshing…");
      setTimeout(() => window.location.reload(), 900);
    } catch (e: any) {
      setStatus(e?.shortMessage || e?.message || "Claim failed");
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 820, margin: "0 auto" }}>
      <h1 style={{ margin: 0 }}>Token Rain</h1>
      <div style={{ opacity: 0.8, marginTop: 6 }}>
        Collect DROPS on Linea (PoH required). Max 20/day.
      </div>
         <div style={{ marginTop: 8 }}>
      <a
        href="/leaderboard"
        style={{ opacity: 0.85, fontWeight: 700 }}
      >
        View Leaderboard →
      </a>
    </div>

      {!isConnected ? (
        <div style={{ marginTop: 18 }}>
          <button
            onClick={() => connect({ connector: injected() })}
            style={{ padding: "12px 14px", borderRadius: 12, fontWeight: 800 }}
          >
            Connect MetaMask
          </button>
        </div>
      ) : (
        <>
          <div style={{ marginTop: 14, opacity: 0.9 }}>
            Wallet: <b>{address}</b>
          </div>

          {!isLinea ? (
            <div
              style={{
                marginTop: 14,
                padding: 14,
                borderRadius: 14,
                border: "1px solid #aa3333",
              }}
            >
              <div style={{ fontWeight: 900 }}>Wrong network ❌</div>
              <div style={{ opacity: 0.9, marginTop: 6 }}>
                Switch to <b>Linea</b> to view DROPS and claim.
                <div style={{ marginTop: 6, opacity: 0.8 }}>
                  Current chainId: {walletChainId ?? "…"}
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <button
                  onClick={onSwitchToLinea}
                  style={{ padding: "10px 12px", borderRadius: 12, fontWeight: 900 }}
                >
                  Switch to Linea
                </button>
              </div>

              {status && (
                <div style={{ marginTop: 10, opacity: 0.9, whiteSpace: "pre-wrap" }}>
                  {status}
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                marginTop: 14,
                border: "1px solid #222",
                borderRadius: 16,
                padding: 16,
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: 6 }}>
                Network: Linea ✅
              </div>

              <div style={{ opacity: 0.8 }}>Your DROPS</div>
              <div style={{ fontSize: 44, fontWeight: 900 }}>💧 {totalDrops}</div>
              <div style={{ opacity: 0.85 }}>Today: {dropsToday} / 20</div>

              <div style={{ marginTop: 10, opacity: 0.9 }}>
                PoH:{" "}
                {poh === null ? "Checking…" : poh ? "Verified ✅" : "Not verified ❌"}{" "}
                {poh === false && (
                  <>
                    —{" "}
                    <a href="https://linea.build/hub" target="_blank" rel="noreferrer">
                      verify
                    </a>
                  </>
                )}
              </div>

              <button
                style={{
                  marginTop: 14,
                  width: "100%",
                  padding: 12,
                  borderRadius: 12,
                  fontWeight: 900,
                  cursor: claimDisabledReason ? "not-allowed" : "pointer",
                  opacity: claimDisabledReason ? 0.6 : 1,
                }}
                onClick={onClaim}
                disabled={!!claimDisabledReason}
                title={claimDisabledReason ?? "Claim a DROP"}
              >
                💧 Get a DROP
              </button>

              {claimDisabledReason && (
                <div style={{ marginTop: 10, opacity: 0.85 }}>{claimDisabledReason}</div>
              )}

              {status && (
                <div style={{ marginTop: 10, opacity: 0.9, whiteSpace: "pre-wrap" }}>
                  {status}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div style={{ marginTop: 14, opacity: 0.75 }}>
        Contract:{" "}
        <a
          href="https://lineascan.build/address/0x544dc9418f6a6a73B0Cbcad356Abd2c88fA8d890"
          target="_blank"
          rel="noreferrer"
        >
          Lineascan
        </a>
      </div>
    </main>
  );
}
