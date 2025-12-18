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
const [timeLeft, setTimeLeft] = useState<string>("");

useEffect(() => {
  function format(ms: number) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function tick() {
    const now = new Date();
    const next = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0, 0, 0, 0
    ));
    setTimeLeft(format(next.getTime() - now.getTime()));
  }

  tick();
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);

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
  : "Get a DROP";

  return (
    <div className="tr-bg">
      <div className="tr-home">
        {/* HEADER */}
        <div className="tr-header">
  <div className="tr-brand">
    <img className="tr-dropImg md" src="/drop.png" alt="drop" />
    Token Rain
  </div>
 <div className="tr-nav">
  <a href="/">Home</a>
  <a href="/leaderboard">Leaderboard</a>
  <a href="/the-rain">The Rain</a>
  <a href="/how-it-works">How it works</a>
<a
              href="https://x.com/TU_USUARIO"
              target="_blank"
              rel="noreferrer"
              aria-label="Token Rain on X"
              className="tr-xLink"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18.9 2H22.3L14.8 10.3L23.6 22H16.8L11.5 15.1L5.4 22H2L10 13.2L1.6 2H8.6L13.3 8.1L18.9 2Z"
                  fill="currentColor"
                />
              </svg>
            </a>

</div>

</div>


        {/* CARD 1: Big hero */}
        <div className="tr-card tr-heroCard">
          <h1 className="tr-heroTitle">Collect DROPS</h1>
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
              <img className="tr-dropImg sm" src="/drop.png" alt="drop" /> {primaryLabel}
            </button>
          </div>

          {status && <div className="tr-statusPill tr-pop">{status}</div>}
{isConnected && isLinea && (
  <div className="tr-countdownRow">
    <div className="tr-countdownPill">
      Next reset in{" "}
      <span className="tr-countdownTime">{timeLeft}</span> (UTC)
    </div>
  </div>
)}
        </div>

        {/* Cards 2 & 3: stats row */}
        <div className="tr-bottomGrid">
          <div className="tr-card pad">
  <div className="tr-cardTitle">Your DROPS</div>
  <div className="tr-cardDivider" />
  <div className="tr-cardBody">
    <div className="tr-valueRow">
      <img className="tr-dropImg lg" src="/drop.png" alt="drop" />
      <div className="tr-valueBig">{totalDrops}</div>
    </div>
    <div className="tr-subLine">Today: {dropsToday} / 20</div>
  </div>
</div>


          <div className="tr-card pad">
  <div className="tr-cardTitle">PoH</div>
  <div className="tr-cardDivider" />
  <div className="tr-cardBody">
    <div className="tr-statusOk">
      {poh === null ? "Checking…" : poh ? "Verified ✅" : "Not verified ❌"}
    </div>
    <div className="tr-statusSub">
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
</div>
        <div className="tr-footnote">
          Rewards will be distributed after Linea Exponent rewards are received.
        </div>
      </div>
    </div>
  );
}
