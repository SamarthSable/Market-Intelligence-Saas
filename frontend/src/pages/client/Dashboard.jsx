import { useEffect, useState } from "react";
import "../../styles/clientdasbord.css";
import { getPortfolio, getSectorRanking } from "../../api/dashboard.api";
import { getApprovedReports } from "../../api/reports.api";
import { getWatchlist } from "../../api/watchlist.api";
import { FaArrowTrendUp, FaBolt, FaCompass, FaEye, FaFolderOpen, FaStar } from "react-icons/fa6";

function formatSignedPercent(value) {
  const numeric = Number(value || 0);
  const sign = numeric > 0 ? "+" : "";
  return `${sign}${numeric.toFixed(2)}%`;
}

export default function ClientDashboard() {
  const [portfolio, setPortfolio] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [reports, setReports] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getPortfolio(),
      getSectorRanking(),
      getApprovedReports(),
      getWatchlist(),
    ])
      .then(([portfolioRes, sectorsRes, reportsRes, watchlistRes]) => {
        setPortfolio(
          Array.isArray(portfolioRes.data?.portfolio)
            ? portfolioRes.data.portfolio
            : []
        );
        setSectors(Array.isArray(sectorsRes.data) ? sectorsRes.data : []);
        setReports(Array.isArray(reportsRes.data) ? reportsRes.data : []);
        setWatchlist(Array.isArray(watchlistRes.data) ? watchlistRes.data : []);
      })
      .catch(() => {
        setError("Unable to load your dashboard right now.");
        setPortfolio([]);
        setSectors([]);
        setReports([]);
        setWatchlist([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const topSector = sectors[0];
  const topMover = [...portfolio].sort((a, b) => b.change - a.change)[0];
  const buySignals = portfolio.filter((stock) => stock.signal === "BUY").length;
  const averageChange =
    portfolio.length > 0
      ? portfolio.reduce((sum, stock) => sum + Number(stock.change || 0), 0) /
        portfolio.length
      : 0;

  return (
    <div className="client-dashboard client-dashboard-overview">
      <section className="dashboard-hero">
        <div>
          <p className="dashboard-kicker">Client Overview</p>
          <h2>Market Intelligence Dashboard</h2>
          <p className="dashboard-subtitle">
            Track your portfolio posture, monitor leading sectors, and keep
            fresh analyst research close at hand.
          </p>
        </div>

        <div className="dashboard-pulse">
          <span className="pulse-label">Market Pulse</span>
          <strong className={averageChange >= 0 ? "positive" : "negative"}>
            {formatSignedPercent(averageChange)}
          </strong>
          <span className="pulse-caption">Average portfolio move</span>
        </div>
      </section>

      {loading && <p className="dashboard-message">Loading dashboard insights...</p>}
      {!loading && error && <p className="dashboard-message">{error}</p>}

      {!loading && !error && (
        <>
          <section className="dashboard-stats">
            <article className="stat-card">
              <div className="stat-icon stat-icon-blue">
                <FaEye />
              </div>
              <span className="stat-label">Tracked Stocks</span>
              <strong>{portfolio.length}</strong>
              <small>Companies in your market snapshot</small>
            </article>

            <article className="stat-card">
              <div className="stat-icon stat-icon-amber">
                <FaStar />
              </div>
              <span className="stat-label">Watchlist</span>
              <strong>{watchlist.length}</strong>
              <small>Names you are actively monitoring</small>
            </article>

            <article className="stat-card">
              <div className="stat-icon stat-icon-green">
                <FaBolt />
              </div>
              <span className="stat-label">Buy Signals</span>
              <strong>{buySignals}</strong>
              <small>Current BUY recommendations</small>
            </article>

            <article className="stat-card">
              <div className="stat-icon stat-icon-cyan">
                <FaArrowTrendUp />
              </div>
              <span className="stat-label">Top Sector</span>
              <strong>{topSector?.sector || "N/A"}</strong>
              <small>
                {topSector ? formatSignedPercent(topSector.return_5d) : "No sector data"}
              </small>
            </article>
          </section>

          <section className="dashboard-grid">
            <article className="card spotlight-card">
              <div className="section-heading">
                <h4>Today&apos;s Spotlight</h4>
                <span>Best momentum from your tracked list</span>
              </div>

              {topMover ? (
                <div className="spotlight-body">
                  <div>
                    <p className="spotlight-symbol">{topMover.symbol}</p>
                    <h3>{topMover.name}</h3>
                    <p className="spotlight-sector">{topMover.sector}</p>
                  </div>

                  <div className="spotlight-metrics">
                    <div className="spotlight-metric spotlight-metric-price">
                      <span>Price</span>
                      <strong>Rs. {topMover.price}</strong>
                    </div>
                    <div className="spotlight-metric spotlight-metric-move">
                      <span>Move</span>
                      <strong className={topMover.change >= 0 ? "positive" : "negative"}>
                        {formatSignedPercent(topMover.change)}
                      </strong>
                    </div>
                    <div className="spotlight-metric spotlight-metric-signal">
                      <span>Signal</span>
                      <strong className="spotlight-signal-text">{topMover.signal}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="dashboard-message">No portfolio snapshot is available yet.</p>
              )}
            </article>

            <article className="card sectors-card">
              <div className="section-heading">
                <h4>
                  <FaCompass className="section-icon" />
                  Sector Performance
                </h4>
                <span>5-day leaders across your universe</span>
              </div>

              {sectors.length === 0 ? (
                <p className="dashboard-message">No sector performance data yet.</p>
              ) : (
                <div className="sector-grid">
                  {sectors.slice(0, 6).map((sector) => (
                    <div key={sector.sector} className="sector-box">
                      <div className="sector-name">{sector.sector}</div>
                      <div
                        className={`sector-value ${
                          sector.return_5d >= 0 ? "up" : "down"
                        }`}
                      >
                        {formatSignedPercent(sector.return_5d)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="card watchlist-card">
              <div className="section-heading">
                <h4>
                  <FaStar className="section-icon" />
                  My Watchlist
                </h4>
                <span>Quick glance at your saved names</span>
              </div>

              {watchlist.length === 0 ? (
                <p className="dashboard-message">Your watchlist is empty.</p>
              ) : (
                <div className="watchlist-stack">
                  {watchlist.slice(0, 5).map((company) => (
                    <div key={company.id} className="watchlist-row">
                      <div>
                        <strong>{company.symbol}</strong>
                        <span>{company.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="card reports-card">
              <div className="section-heading">
                <h4>
                  <FaFolderOpen className="section-icon" />
                  Latest Analyst Reports
                </h4>
                <span>Fresh approved research from your team</span>
              </div>

              {reports.length === 0 ? (
                <p className="dashboard-message">No approved reports yet.</p>
              ) : (
                <div className="report-list">
                  {reports.slice(0, 3).map((report) => (
                    <div key={report.id} className="report">
                      <div className="report-meta">
                        <h5>{report.title}</h5>
                        <span>{report.sectors?.name || "General Market"}</span>
                      </div>
                      <p>{report.summary}</p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>
        </>
      )}
    </div>
  );
}
