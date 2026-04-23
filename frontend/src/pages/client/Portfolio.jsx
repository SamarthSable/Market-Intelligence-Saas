import { useEffect, useState } from "react";
import "../../styles/portfolio.css";
import { getPortfolio } from "../../api/dashboard.api";
import { FaArrowTrendUp, FaBriefcase, FaChartLine, FaShieldHalved } from "react-icons/fa6";

function formatPercent(value) {
  const numeric = Number(value || 0);
  const sign = numeric > 0 ? "+" : "";
  return `${sign}${numeric.toFixed(2)}%`;
}

export default function ClientPortfolio() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getPortfolio()
      .then((res) =>
        setData(Array.isArray(res.data?.portfolio) ? res.data.portfolio : [])
      )
      .catch(() => {
        setData([]);
        setError("Unable to load portfolio analytics.");
      })
      .finally(() => setLoading(false));
  }, []);

  const averageMove =
    data.length > 0
      ? data.reduce((sum, stock) => sum + Number(stock.change || 0), 0) / data.length
      : 0;
  const buySignals = data.filter((stock) => stock.signal === "BUY").length;
  const topPerformer = [...data].sort((a, b) => Number(b.change) - Number(a.change))[0];

  return (
    <div className="client-dashboard client-page portfolio-page">
      <section className="section-hero">
        <div>
          <p className="section-kicker">Portfolio View</p>
          <h2>My Portfolio</h2>
          <p className="section-subtitle">
            See your tracked holdings, compare relative strength, and scan
            current signals without leaving the page.
          </p>
        </div>

        <div className="section-hero-badge">
          <FaBriefcase />
          <span>{data.length} holdings in view</span>
        </div>
      </section>

      {loading && <p className="empty">Loading portfolio analytics...</p>}
      {!loading && error && <p className="empty">{error}</p>}

      {!loading && !error && (
        <>
          <section className="section-summary-grid portfolio-summary-grid">
            <article className="section-summary-card">
              <div className="summary-icon summary-icon-blue">
                <FaBriefcase />
              </div>
              <span className="summary-label">Holdings</span>
              <strong>{data.length}</strong>
              <small>Companies in your current snapshot</small>
            </article>

            <article className="section-summary-card">
              <div className="summary-icon summary-icon-green">
                <FaArrowTrendUp />
              </div>
              <span className="summary-label">Average Move</span>
              <strong>{formatPercent(averageMove)}</strong>
              <small>Across all tracked holdings</small>
            </article>

            <article className="section-summary-card">
              <div className="summary-icon summary-icon-cyan">
                <FaShieldHalved />
              </div>
              <span className="summary-label">BUY Signals</span>
              <strong>{buySignals}</strong>
              <small>Positions with active BUY signals</small>
            </article>

            <article className="section-summary-card">
              <div className="summary-icon summary-icon-gold">
                <FaChartLine />
              </div>
              <span className="summary-label">Top Performer</span>
              <strong>{topPerformer?.symbol || "N/A"}</strong>
              <small>
                {topPerformer ? formatPercent(topPerformer.change) : "No performance data"}
              </small>
            </article>
          </section>

          <div className="row header">
            <div className="portfolio-company">Company</div>
            <div className="portfolio-cell">Price</div>
            <div className="portfolio-cell">Change %</div>
            <div className="portfolio-cell">RSI</div>
            <div className="portfolio-cell">Signal</div>
          </div>

          {data.length === 0 && <p className="empty">No stocks in portfolio</p>}

          {data.map((stock) => (
            <div key={stock.id} className="row portfolio-row">
              <div className="portfolio-company">
                <b>{stock.symbol}</b>
                <span>{stock.sector}</span>
              </div>

              <div className="portfolio-cell price">Rs. {stock.price ?? "-"}</div>

              <div
                className={`portfolio-cell change ${
                  stock.change > 0 ? "positive" : "negative"
                }`}
              >
                {formatPercent(stock.change)}
              </div>

              <div className="portfolio-cell rsi">
                {stock.rsi ? stock.rsi.toFixed(1) : "-"}
              </div>

              <div className={`portfolio-cell signal ${stock.signal}`}>{stock.signal}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
