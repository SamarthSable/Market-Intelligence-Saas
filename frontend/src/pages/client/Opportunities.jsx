import { useEffect, useState } from "react";
import "../../styles/opportunities.css";
import { getOpportunities } from "../../api/opportunities.api";
import { getCompanyHistory } from "../../api/market.api";
import {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
} from "../../api/watchlist.api";
import CandleChart from "../../components/charts/CandleChart";
import {
  FaArrowTrendUp,
  FaBrain,
  FaBullseye,
  FaChartSimple,
  FaFilterCircleDollar,
  FaPlus,
  FaStar,
  FaTrash,
  FaTrophy,
} from "react-icons/fa6";

export default function Opportunities() {
  const [stocks, setStocks] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [history, setHistory] = useState([]);
  const [historyMeta, setHistoryMeta] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getOpportunities(), getWatchlist()])
      .then(([opportunitiesRes, watchlistRes]) => {
        const nextStocks = Array.isArray(opportunitiesRes.data)
          ? opportunitiesRes.data
          : [];
        setStocks(nextStocks);
        setWatchlist(Array.isArray(watchlistRes.data) ? watchlistRes.data : []);
        setSelectedSymbol(nextStocks[0]?.symbol || "");
      })
      .catch(() => {
        setStocks([]);
        setError("Unable to load top opportunities.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadHistory() {
      if (!selectedSymbol) {
        if (isActive) {
          setHistory([]);
          setHistoryMeta(null);
          setHistoryLoading(false);
        }
        return;
      }

      if (isActive) {
        setHistoryLoading(true);
      }

      try {
        const res = await getCompanyHistory(selectedSymbol);
        if (!isActive) return;

        setHistory(Array.isArray(res.data?.candles) ? res.data.candles : []);
        setHistoryMeta(res.data?.company || null);
      } catch {
        if (!isActive) return;

        setHistory([]);
        setHistoryMeta(null);
      } finally {
        if (isActive) {
          setHistoryLoading(false);
        }
      }
    }

    void loadHistory();

    return () => {
      isActive = false;
    };
  }, [selectedSymbol]);

  const topOpportunity = stocks[0];
  const watchlistIds = new Set(watchlist.map((company) => company.id));
  const selectedStock =
    stocks.find((stock) => stock.symbol === selectedSymbol) || topOpportunity || null;

  async function toggleWatchlist(stock) {
    try {
      setError("");
      const existing = watchlist.find((company) => company.symbol === stock.symbol);
      const res = existing
        ? await removeFromWatchlist(existing.id)
        : await addToWatchlist({
            companyId: stock.id,
            symbol: stock.symbol,
          });

      setWatchlist(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(
        err?.response?.data?.error || "Unable to update your watchlist right now."
      );
    }
  }

  return (
    <div className="client-dashboard client-page opportunities-page">
      <section className="section-hero">
        <div>
          <p className="section-kicker">Company Radar</p>
          <h2>Top AI Opportunities</h2>
          <p className="section-subtitle">
            These companies are ranked by your opportunity model using signal
            strength, RSI, liquidity, and overall setup quality.
          </p>
        </div>

        <div className="section-hero-badge">
          <FaBrain />
          <span>{stocks.length} ranked setups</span>
        </div>
      </section>

      {loading && <p>Loading ranked opportunities...</p>}
      {!loading && error && <p>{error}</p>}
      {!loading && !error && stocks.length === 0 && (
        <p>No opportunities are available yet.</p>
      )}

      {!loading && !error && stocks.length > 0 && (
        <>
          <section className="section-summary-grid">
            <article className="section-summary-card">
              <div className="summary-icon summary-icon-gold">
                <FaTrophy />
              </div>
              <span className="summary-label">Top Pick</span>
              <strong>{topOpportunity?.symbol || "N/A"}</strong>
              <small>{topOpportunity?.sector || "No sector data"}</small>
            </article>

            <article className="section-summary-card">
              <div className="summary-icon summary-icon-cyan">
                <FaBullseye />
              </div>
              <span className="summary-label">Best Score</span>
              <strong>{topOpportunity?.score || 0}</strong>
              <small>Highest ranking in the current list</small>
            </article>

            <article className="section-summary-card">
              <div className="summary-icon summary-icon-green">
                <FaArrowTrendUp />
              </div>
              <span className="summary-label">Average Confidence</span>
              <strong>
                {Math.round(
                  stocks.reduce(
                    (sum, stock) => sum + Number(stock.confidence || 0),
                    0
                  ) / stocks.length
                )}
                %
              </strong>
              <small>Across ranked opportunities</small>
            </article>
          </section>

          <section className="company-spotlight-card">
            <div className="company-spotlight-header">
              <div>
                <p className="section-kicker">Selected Company</p>
                <h3>{selectedStock?.symbol || "N/A"}</h3>
                <p className="company-spotlight-subtitle">
                  {historyMeta?.name ||
                    selectedStock?.name ||
                    "Opportunity detail view"}
                </p>
              </div>

              {selectedStock && (
                <button
                  type="button"
                  className="watchlist-action-btn"
                  onClick={() => toggleWatchlist(selectedStock)}
                >
                  {watchlist.some(
                    (company) => company.symbol === selectedStock.symbol
                  ) ? (
                    <>
                      <FaTrash />
                      Remove From Watchlist
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      Add To Watchlist
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="company-spotlight-meta">
              <span>
                <FaStar />
                {historyMeta?.sector || selectedStock?.sector || "Unknown Sector"}
              </span>
              <span>
                <FaBullseye />
                Confidence {selectedStock?.confidence || 0}%
              </span>
              <span>
                <FaChartSimple />
                Score {selectedStock?.score || 0}
              </span>
            </div>

            {historyLoading ? (
              <p>Loading candlestick chart...</p>
            ) : (
              <CandleChart candles={history} />
            )}
          </section>

          <section className="opportunity-card-grid">
            {stocks.map((stock, index) => (
              <article
                key={stock.symbol}
                className={`opportunity-card ${
                  selectedSymbol === stock.symbol ? "is-selected" : ""
                }`}
                onClick={() => setSelectedSymbol(stock.symbol)}
              >
                <div className="opportunity-card-top">
                  <span className="opportunity-rank">#{index + 1}</span>
                  <span className="opportunity-score">Score {stock.score}</span>
                </div>

                <h3>{stock.symbol}</h3>
                <p className="opportunity-sector">{stock.sector}</p>

                <div className="opportunity-metric-grid">
                  <div>
                    <span>
                      <FaFilterCircleDollar />
                      Price
                    </span>
                    <strong>Rs. {stock.price}</strong>
                  </div>
                  <div>
                    <span>
                      <FaChartSimple />
                      RSI
                    </span>
                    <strong>{stock.rsi}</strong>
                  </div>
                  <div>
                    <span>
                      <FaBullseye />
                      Confidence
                    </span>
                    <strong>{stock.confidence}%</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className={`watchlist-inline-btn ${
                    watchlistIds.has(stock.id) ? "is-saved" : ""
                  }`}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleWatchlist(stock);
                  }}
                >
                  {watchlistIds.has(stock.id) ? (
                    <>
                      <FaTrash />
                      Remove
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      Save To Watchlist
                    </>
                  )}
                </button>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
