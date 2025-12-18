export default function TheRainPage() {
  return (
    <div className="tr-bg">
      <div className="tr-wrap">
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
          </div>
        </div>

        <div className="tr-card pad tr-heroCard">
          <h1 className="tr-heroTitle">The Rain</h1>
          <div className="tr-heroSub">
            This is how rewards will be distributed after the campaign ends.
          </div>

          <div className="tr-cardDivider" />

          <div className="tr-cardBody">
            <p className="tr-subLine">
              All rewards earned from the Linea Exponent campaign will be
              distributed to participants of Token Rain.
            </p>

            <br />

            <h3 className="tr-cardTitle">🎲 Lottery Winners</h3>
            <p className="tr-subLine">
              A portion of the rewards will be assigned to randomly selected
              wallets.
            </p>
            <p className="tr-subLine">
              Each DROP you collect acts as one ticket in the lottery.
              <br />
              More DROPS = higher chance to win.
            </p>

            <br />

            <h3 className="tr-cardTitle">🌧 Proportional Distribution</h3>
            <p className="tr-subLine">
              The remaining rewards will be distributed proportionally based on
              the total number of DROPS collected.
            </p>

            <br />

            <h3 className="tr-cardTitle">🔒 Important Notes</h3>
            <p className="tr-subLine">
              • DROPS are non-transferable
              <br />
              • Only wallets that passed Linea PoH can participate
              <br />
              • Final distribution happens after the campaign ends
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
