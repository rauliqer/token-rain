"use client";

export default function HowItWorksPage() {
  return (
    <div className="tr-bg">
      <div className="tr-wrap">

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

        {/* HERO */}
        <div className="tr-hero">
          <h1 className="tr-title">How it works</h1>
          <div className="tr-subtitle">
            Simple rules. Transparent rewards.
          </div>
        </div>

        {/* CONTENT */}
        <div className="tr-card pad" style={{ marginTop: 16 }}>
          <section style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 6 }}>🌧️ What is Token Rain?</h3>
            <div className="tr-muted">
              Token Rain is a Linea-native campaign where users collect
              <b> DROPS</b>. Each DROP represents one ticket for the final reward
              distribution after the Linea Exponent campaign ends.
            </div>
          </section>

          <section style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 6 }}>💧 How do I get DROPS?</h3>
            <div className="tr-muted">
              • Each on-chain interaction with the Token Rain contract grants
              <b> 1 DROP</b>.<br />
              • You can earn up to <b>20 DROPS per day</b>.<br />
              • DROPS are non-transferable and tied to your wallet.
            </div>
          </section>

          <section style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 6 }}>🧠 Proof of Humanity (PoH)</h3>
            <div className="tr-muted">
              Token Rain requires <b>Proof of Humanity</b> on Linea.
              <br />
              Only wallets that passed PoH can interact with the contract and
              appear on the leaderboard.
            </div>
          </section>

          <section style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 6 }}>🎟️ DROPS & Rewards</h3>
            <div className="tr-muted">
              • Each DROP equals <b>one ticket</b> in the final reward process.<br />
              • The top rewards are selected via a <b>live random draw</b>.<br />
              • Additional rewards are distributed proportionally among all
              participants.
            </div>
          </section>

          <section style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 6 }}>⏳ Campaign timeline</h3>
            <div className="tr-muted">
              • Token Rain runs during the <b>Linea Exponent campaign</b>.<br />
              • DROPS collection ends on the <b>final official day</b> of Exponent.<br />
              • Rewards are distributed <b>after Linea completes its rewards</b>.
            </div>
          </section>

          <section>
            <h3 style={{ marginBottom: 6 }}>🔍 Transparency</h3>
            <div className="tr-muted">
              • All DROPS are recorded on-chain.<br />
              • Leaderboard is generated directly from contract events.<br />
              • No manual intervention, no hidden rules.
            </div>
          </section>

          <div className="tr-footnote" style={{ marginTop: 16 }}>
            Token Rain is a community experiment built on Linea.
          </div>
        </div>

      </div>
    </div>
  );
}
