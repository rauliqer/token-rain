"use client";

export default function TheRainPage() {
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
            <a href="/the-rain" className="active">
              The Rain
            </a>
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

        {/* CONTENT */}
        <div className="tr-card pad tr-heroCard">
          <h1 className="tr-heroTitle">The Rain</h1>
          <div className="tr-heroSub">Exact prize structure for Token Rain.</div>

          <div className="tr-cardDivider" />

          <div className="tr-cardBody">
            <p className="tr-subLine">
              Token Rain will distribute <b>100% of the Linea Exponent rewards</b>{" "}
              earned by this project to participants after the campaign ends.
            </p>

            <br />

            <h3 className="tr-cardTitle">🏆 Prize Pools</h3>
            <p className="tr-subLine">
              The reward pool is split into two parts:
              <br />• <b>Lottery prizes</b> (fixed winners)
              <br />• <b>Community share</b> (everyone else, proportional)
            </p>

            <br />

            <h3 className="tr-cardTitle">🎲 Lottery Prizes (Top Winners)</h3>
            <p className="tr-subLine">
              We will pick <b>10 winners</b> in a <b>live draw on X</b>.
              <br />
              Each DROP equals <b>1 lottery ticket</b>.
              <br />
              More DROPS = <b>higher chance</b> to win.
            </p>

            <div className="tr-prizeTableWrap">
              <table className="tr-prizeTable">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Reward</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1st</td>
                    <td>10%</td>
                  </tr>
                  <tr>
                    <td>2nd</td>
                    <td>9%</td>
                  </tr>
                  <tr>
                    <td>3rd</td>
                    <td>8%</td>
                  </tr>
                  <tr>
                    <td>4th</td>
                    <td>7%</td>
                  </tr>
                  <tr>
                    <td>5th</td>
                    <td>6%</td>
                  </tr>
                  <tr>
                    <td>6th</td>
                    <td>5%</td>
                  </tr>
                  <tr>
                    <td>7th</td>
                    <td>4%</td>
                  </tr>
                  <tr>
                    <td>8th</td>
                    <td>3%</td>
                  </tr>
                  <tr>
                    <td>9th</td>
                    <td>2%</td>
                  </tr>
                  <tr>
                    <td>10th</td>
                    <td>1%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <br />

            <h3 className="tr-cardTitle">🌧 Community Share</h3>
            <p className="tr-subLine">
              The remaining <b>45%</b> is distributed to <b>all eligible participants</b>{" "}
              proportionally to the total number of DROPS collected.
            </p>

            <br />

            <h3 className="tr-cardTitle">✅ Eligibility</h3>
            <p className="tr-subLine">
              • You must have passed <b>Linea Proof of Humanity (PoH)</b>
              <br />
              • Minimum <b>1 DROP</b> to qualify
              <br />
              • DROPS are <b>non-transferable</b>
            </p>

            <br />

            <h3 className="tr-cardTitle">⏳ Timing</h3>
            <p className="tr-subLine">
              DROPS collection ends on the <b>final official day of Linea Exponent</b>.
              <br />
              Rewards are distributed <b>after Linea sends Exponent rewards</b>.
            </p>

            <div className="tr-footnote" style={{ marginTop: 16 }}>
              Final amounts depend on the total Exponent rewards received.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
