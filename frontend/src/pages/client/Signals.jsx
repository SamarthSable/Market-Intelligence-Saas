import { useEffect, useState } from "react";
import "../../styles/signals.css";
import { getClientSignals } from "../../api/market.api";
import { FaBolt, FaCalendarDay, FaChartLine, FaSignal } from "react-icons/fa6";

function formatSignalDate(value) {
  return new Date(value).toLocaleDateString();
}

export default function Signals() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getClientSignals()
      .then((res) => setSignals(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError("Unable to load market signals right now."))
      .finally(() => setLoading(false));
  }, []);

  const buySignals = signals.filter((signal) => signal.signal_type === "BUY").length;
  const latestDate = signals[0]?.trade_date;

  return (
    <div className="signals-page client-page">
      <section className="section-hero">
        <div>
          <p className="section-kicker">Signal Center</p>
          <h2>Market Signals</h2>
          <p className="section-subtitle">
            Review the latest model-driven trade calls and focus first on the
            setups with stronger conviction.
          </p>
        </div>

        <div className="section-hero-badge">
          <FaSignal />
          <span>{signals.length} signals loaded</span>
        </div>
      </section>

      <p className="signals-intro">
        {loading
          ? "Loading the latest signals..."
          : error || "Live AI trading recommendations"}
      </p>

      {!loading && !error && signals.length > 0 && (
        <section className="signals-summary-grid">
          <article className="signals-summary-card">
            <div className="summary-icon summary-icon-green">
              <FaBolt />
            </div>
            <span className="summary-label">BUY Signals</span>
            <strong>{buySignals}</strong>
            <small>Actionable bullish calls</small>
          </article>

          <article className="signals-summary-card">
            <div className="summary-icon summary-icon-cyan">
              <FaChartLine />
            </div>
            <span className="summary-label">Average Confidence</span>
            <strong>
              {Math.round(
                signals.reduce((sum, signal) => sum + Number(signal.confidence || 0), 0) /
                  signals.length
              )}
              %
            </strong>
            <small>Across the current signal set</small>
          </article>

          <article className="signals-summary-card">
            <div className="summary-icon summary-icon-blue">
              <FaCalendarDay />
            </div>
            <span className="summary-label">Latest Trade Date</span>
            <strong>{latestDate ? formatSignalDate(latestDate) : "N/A"}</strong>
            <small>Most recent market session</small>
          </article>
        </section>
      )}

      {!loading && !error && signals.length === 0 && (
        <p>No signals are available yet.</p>
      )}

      {!loading && !error && signals.length > 0 && (
        <table className="signals-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Signal</th>
              <th>Confidence</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {signals.map((signal) => (
              <tr key={signal.id}>
                <td className="company-name">
                  <div className="signal-company-block">
                    <strong>
                      {signal.companies?.symbol || signal.companies?.name || "N/A"}
                    </strong>
                    <span>{signal.companies?.name || "Unknown Company"}</span>
                  </div>
                </td>

                <td>
                  <span className={`signal-badge ${signal.signal_type}`}>
                    {signal.signal_type}
                  </span>
                </td>

                <td className="confidence">
                  <div className="confidence-wrap">
                    <span>{signal.confidence}%</span>
                    <div className="confidence-bar">
                      <div
                        className="confidence-bar-fill"
                        style={{ width: `${Math.min(Number(signal.confidence || 0), 100)}%` }}
                      />
                    </div>
                  </div>
                </td>

                <td className="signal-date">{formatSignalDate(signal.trade_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
