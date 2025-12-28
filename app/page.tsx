"use client";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useChainId,
  useSwitchChain,
  useDisconnect,
} from "wagmi";

import { TOKEN_RAIN_ADDRESS, tokenRainAbi } from "../lib/contract";
import { fetchPohStatus, fetchPohSignature } from "../lib/poh";

const LINEA_CHAIN_ID = 59144;
export default function Home() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();

  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  const isLinea = chainId === LINEA_CHAIN_ID;

  const { writeContractAsync } = useWriteContract();
  const walletReady = isConnected && !!address;

  // ---- State (ALL state first) ----
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [poh, setPoh] = useState<null | boolean>(null);
  const [status, setStatus] = useState("");

  // ---- Effects ----
  useEffect(() => {
    // Countdown to 00:00 UTC
    function format(ms: number) {
      const total = Math.max(0, Math.floor(ms / 1000));
      const h = Math.floor(total / 3600);
      const m = Math.floor((total % 3600) / 60);
      const s = total % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }

    function tick() {
      const now = new Date();
      const next = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0)
      );
      setTimeLeft(format(next.getTime() - now.getTime()));
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
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
const dailyLimitReached = Number(dropsToday) >= 20;

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
  if (dailyLimitReached) return "Daily limit reached";
  if (isConnected && isLinea && poh === null) return "Checking PoH…";
  if (isConnected && isLinea && poh === false) return "PoH required";
  return null;
}, [dailyLimitReached, isConnected, isLinea, poh]);

const primaryLabel = !walletReady
  ? "Connect wallet"
  : !isLinea
  ? "Switch to Linea"
  : dailyLimitReached
  ? "Daily limit reached"
  : poh === false
  ? "PoH required"
  : "Get a DROP";

async function onPrimaryAction() {
  // Not connected (or reconnecting without address) → open RainbowKit modal
  if (!walletReady) {
    if (openConnectModal) openConnectModal();
    else setStatus("Connect modal unavailable");
    return;
  }

  // Connected but wrong network → switch
  if (!isLinea) {
    setStatus("Switching to Linea…");
    try {
      if (!switchChainAsync) throw new Error("Switch not available");
      await switchChainAsync({ chainId: LINEA_CHAIN_ID });
      setStatus("");
    } catch {
      setStatus("Please switch to Linea in your wallet");
    }
    return;
  }

  // Daily limit
  if (dailyLimitReached) {
    setStatus("Daily limit reached");
    return;
  }

  // Claim
  try {
    setStatus("Checking PoH…");
    const ok = await fetchPohStatus(address!);
    if (!ok) {
      setStatus("PoH required — verify on Linea Hub");
      return;
    }

    setStatus("Fetching PoH signature…");
    const sig = await fetchPohSignature(address!);

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
              href="https://x.com/T0kenRain"
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
{walletReady && address && (
  <div className="tr-muted" style={{ marginTop: 10, display: "flex", gap: 10, justifyContent: "center", alignItems: "center" }}>
    <span>Connected: {address.slice(0, 6)}…{address.slice(-4)}</span>
    <button
      type="button"
      className="tr-miniBtn"
      onClick={() => disconnect()}
    >
      Disconnect
    </button>
  </div>
)}

         <div className="tr-heroBtnRow">
 <button
  className="tr-btn"
  onClick={onPrimaryAction}
  disabled={walletReady && isLinea && dailyLimitReached}
  title={walletReady && isLinea && dailyLimitReached ? "Daily limit reached" : ""}
>
  <img className="tr-dropImg sm" src="/drop.png" alt="drop" /> {primaryLabel}
</button>
</div>
{!isConnected && (
  <div className="tr-muted" style={{ marginTop: 12 }}>
    Connect your wallet to start collecting DROPS.
  </div>
)}


          {status && <div className="tr-statusPill tr-pop">{status}</div>}
{isConnected && isLinea && dailyLimitReached && (
  <div className="tr-limitRed">Daily limit reached</div>
)}
{!isConnected && (
  <div className="tr-muted2" style={{ marginTop: 10 }}>
    Connect your wallet using the button in the header to start collecting DROPS.
  </div>
)}
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
