import { useEffect, useState } from "react";
import {
  FaArrowTrendUp,
  FaBolt,
  FaChartColumn,
  FaFileCircleCheck,
  FaFilePen,
  FaWaveSquare,
} from "react-icons/fa6";
import { getAnalystInsights, getAnalystStats } from "../../api/analyst.api";
import "../../styles/reports.css";

function formatSignedPercent(value) {
  const numeric = Number(value || 0);
  const sign = numeric > 0 ? "+" : "";
  return `${sign}${numeric.toFixed(2)}%`;
}

function formatDate(value) {
  if (!value) return "Awaiting market data";
  return new Date(value).toLocaleDateString();
}

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [insights, setInsights] = useState({
    marketSummary: {},
    sectorLeaders: [],
    signalBoard: [],
    recentReports: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getAnalystStats(), getAnalystInsights()])
      .then(([statsRes, insightsRes]) => {
        setStats(statsRes.data || {});
        setInsights(
          insightsRes.data || {
            marketSummary: {},
            sectorLeaders: [],
            signalBoard: [],
            recentReports: [],
          }
        );
      })
      .catch(() => {
        setError("Unable to load your analyst cockpit right now.");
      })
      .finally(() => setLoading(false));
  }, []);

  const approvalRate = Number(stats.approvalRate || insights.stats?.approvalRate || 0);
  const marketSummary = insights.marketSummary || {};
  const topSector = insights.sectorLeaders?.[0];
  const topSignal = insights.signalBoard?.[0];

  return (
    <div className="analyst-page analyst-dashboard-page">
      <section className="analyst-hero">
        <div>
          <p className="analyst-kicker">Research Cockpit</p>
          <h2>Analyst Dashboard</h2>
          <p className="analyst-subtitle">
            Track your publishing pipeline, review live market momentum, and
            surface ideas worth turning into reports.
          </p>
        </div>

        <div className="analyst-hero-badge">
          <span className="badge-label">Latest market session</span>
          <strong>{formatDate(marketSummary.latestTradeDate)}</strong>
          <small>{marketSummary.averageConfidence || 0}% average signal confidence</small>
        </div>
      </section>

      {loading && <p className="analyst-message">Loading analyst insights...</p>}
      {!loading && error && <p className="analyst-message">{error}</p>}

      {!loading && !error && (
        <>
          <section className="analyst-stat-grid">
            <Stat
              icon={<FaFilePen />}
              title="My Reports"
              value={stats.reports}
              meta="Total submissions in your pipeline"
            />
            <Stat
              icon={<FaFileCircleCheck />}
              title="Approval Rate"
              value={`${approvalRate}%`}
              meta={`${stats.approved || 0} approved reports`}
            />
            <Stat
              icon={<FaWaveSquare />}
              title="Pending Review"
              value={stats.pending}
              meta={`${stats.rejected || 0} rejected reports`}
            />
            <Stat
              icon={<FaBolt />}
              title="BUY Signals"
              value={marketSummary.buySignals}
              meta="High-priority names on the board"
            />
          </section>

          <section className="analyst-grid">
            <article className="analyst-card analyst-card-feature">
              <div className="analyst-card-head">
                <div>
                  <p className="analyst-section-label">Market Pulse</p>
                  <h3>What looks strongest right now</h3>
                </div>
                <FaChartColumn className="analyst-card-icon" />
              </div>

              <div className="analyst-feature-grid">
                <div className="analyst-feature-block">
                  <span>Top Sector</span>
                  <strong>{topSector?.sector || "No signal yet"}</strong>
                  <small>
                    {topSector ? formatSignedPercent(topSector.return_5d) : "Awaiting data"}
                  </small>
                </div>
                <div className="analyst-feature-block">
                  <span>Top Conviction</span>
                  <strong>{topSignal?.symbol || "No symbol yet"}</strong>
                  <small>{topSignal?.confidence || 0}% confidence</small>
                </div>
                <div className="analyst-feature-block">
                  <span>Signal Split</span>
                  <strong>
                    {marketSummary.buySignals || 0}/{marketSummary.sellSignals || 0}/
                    {marketSummary.holdSignals || 0}
                  </strong>
                  <small>BUY / SELL / HOLD</small>
                </div>
              </div>
            </article>

            <article className="analyst-card">
              <div className="analyst-card-head">
                <div>
                  <p className="analyst-section-label">Sector Leaders</p>
                  <h3>Momentum leaders</h3>
                </div>
                <FaArrowTrendUp className="analyst-card-icon" />
              </div>

              <div className="analyst-list">
                {insights.sectorLeaders?.length ? (
                  insights.sectorLeaders.map((sector) => (
                    <div key={sector.sector} className="analyst-list-row">
                      <div>
                        <strong>{sector.sector}</strong>
                        <span>Five-session relative move</span>
                      </div>
                      <b className={sector.return_5d >= 0 ? "positive" : "negative"}>
                        {formatSignedPercent(sector.return_5d)}
                      </b>
                    </div>
                  ))
                ) : (
                  <p className="analyst-message">No sector data available yet.</p>
                )}
              </div>
            </article>

            <article className="analyst-card">
              <div className="analyst-card-head">
                <div>
                  <p className="analyst-section-label">Signal Board</p>
                  <h3>Live market setups</h3>
                </div>
                <FaBolt className="analyst-card-icon" />
              </div>

              <div className="analyst-list">
                {insights.signalBoard?.length ? (
                  insights.signalBoard.map((signal) => (
                    <div key={signal.id} className="analyst-list-row">
                      <div>
                        <strong>{signal.symbol}</strong>
                        <span>{`${signal.sector} - ${signal.signal}`}</span>
                      </div>
                      <div className="analyst-list-meta">
                        <b>{signal.confidence}%</b>
                        <small className={signal.change >= 0 ? "positive" : "negative"}>
                          {formatSignedPercent(signal.change)}
                        </small>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="analyst-message">No market signals available yet.</p>
                )}
              </div>
            </article>

            <article className="analyst-card">
              <div className="analyst-card-head">
                <div>
                  <p className="analyst-section-label">Recent Reports</p>
                  <h3>Your latest submissions</h3>
                </div>
                <FaFilePen className="analyst-card-icon" />
              </div>

              <div className="analyst-list">
                {insights.recentReports?.length ? (
                  insights.recentReports.map((report) => (
                    <div key={report.id} className="analyst-list-row">
                      <div>
                        <strong>{report.title}</strong>
                        <span>{report.sectors?.name || "General market"}</span>
                      </div>
                      <span className={`report-status status-${report.status || "pending"}`}>
                        {report.status || "pending"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="analyst-message">You have not created a report yet.</p>
                )}
              </div>
            </article>
          </section>
        </>
      )}
    </div>
  );
}

function Stat({ icon, title, value, meta }) {
  return (
    <article className="analyst-stat-card">
      <div className="analyst-stat-icon">{icon}</div>
      <span className="analyst-stat-title">{title}</span>
      <strong className="analyst-stat-value">{value || 0}</strong>
      <small>{meta}</small>
    </article>
  );
}
