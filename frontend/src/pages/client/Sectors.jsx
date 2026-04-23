import { useEffect, useState } from "react";
import { FaArrowTrendDown, FaArrowTrendUp, FaChartPie, FaRankingStar } from "react-icons/fa6";
import { getSectorRanking } from "../../api/sector.api";
import "../../styles/sectors.css";

function formatPercent(value) {
  const numeric = Number(value || 0);
  const sign = numeric > 0 ? "+" : "";
  return `${sign}${numeric.toFixed(2)}%`;
}

export default function Sectors() {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getSectorRanking()
      .then((res) => setSectors(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError("Unable to load sector performance."))
      .finally(() => setLoading(false));
  }, []);

  const leader = sectors[0];
  const gainers = sectors.filter((sector) => Number(sector.return_5d) >= 0).length;

  return (
    <div className="client-dashboard client-page sectors-page">
      <section className="section-hero">
        <div>
          <p className="section-kicker">Sector Lens</p>
          <h2>Sector Performance</h2>
          <p className="section-subtitle">
            Follow leadership across the market and spot which industry groups
            are carrying momentum right now.
          </p>
        </div>

        <div className="section-hero-badge">
          <FaChartPie />
          <span>{sectors.length} sectors tracked</span>
        </div>
      </section>

      {loading && <p>Loading sector rankings...</p>}
      {!loading && error && <p>{error}</p>}
      {!loading && !error && sectors.length === 0 && (
        <p>No sector performance data is available yet.</p>
      )}

      {!loading && !error && sectors.length > 0 && (
        <>
          <section className="section-summary-grid">
            <article className="section-summary-card">
              <div className="summary-icon summary-icon-gold">
                <FaRankingStar />
              </div>
              <span className="summary-label">Top Sector</span>
              <strong>{leader?.sector || "N/A"}</strong>
              <small>{leader ? formatPercent(leader.return_5d) : "No data"}</small>
            </article>

            <article className="section-summary-card">
              <div className="summary-icon summary-icon-green">
                <FaArrowTrendUp />
              </div>
              <span className="summary-label">Positive Sectors</span>
              <strong>{gainers}</strong>
              <small>Industry groups in green</small>
            </article>

            <article className="section-summary-card">
              <div className="summary-icon summary-icon-red">
                <FaArrowTrendDown />
              </div>
              <span className="summary-label">Lagging Sectors</span>
              <strong>{sectors.length - gainers}</strong>
              <small>Industry groups under pressure</small>
            </article>
          </section>

          <section className="sector-card-grid">
            {sectors.map((sector, index) => (
              <article key={sector.sector} className="sector-detail-card">
                <div className="sector-card-top">
                  <span className="sector-rank">#{index + 1}</span>
                  <span
                    className={`sector-direction ${
                      Number(sector.return_5d) >= 0 ? "is-up" : "is-down"
                    }`}
                  >
                    {Number(sector.return_5d) >= 0 ? <FaArrowTrendUp /> : <FaArrowTrendDown />}
                  </span>
                </div>

                <h3>{sector.sector}</h3>
                <strong
                  className={`sector-return ${
                    Number(sector.return_5d) >= 0 ? "is-up" : "is-down"
                  }`}
                >
                  {formatPercent(sector.return_5d)}
                </strong>
                <p>Average 5-day move across the sector basket.</p>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
