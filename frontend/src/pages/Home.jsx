import { useEffect, useMemo, useState } from "react";
import {
  FaArrowRight,
  FaBolt,
  FaChartPie,
  FaGlobe,
  FaNewspaper,
  FaShieldHalved,
  FaUserTie,
} from "react-icons/fa6";
import AppNavbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import api from "../api/api";
import placeholder from "../assets/image.png";
import "../styles/home.css";

function trimSummary(value) {
  if (!value) return "Tap into curated market context and keep the important catalyst in view.";
  return value.length > 120 ? `${value.slice(0, 117)}...` : value;
}

export default function Home() {
  const [news, setNews] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsVisibleCount, setNewsVisibleCount] = useState(3);

  useEffect(() => {
    Promise.all([api.get("/sectors/ranking"), api.get("/news/market")])
      .then(([sectorRes, newsRes]) => {
        setSectors(Array.isArray(sectorRes.data) ? sectorRes.data.slice(0, 4) : []);
        setNews(Array.isArray(newsRes.data) ? newsRes.data : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const signalPreview = useMemo(
    () =>
      sectors.slice(0, 3).map((sector, index) => ({
        symbol: ["BANK", "ENERGY", "IT"][index] || sector.sector.slice(0, 5).toUpperCase(),
        sector: sector.sector,
        change: Number(sector.return_5d || 0),
        signal: Number(sector.return_5d || 0) >= 0 ? "BUY" : "SELL",
        confidence: Math.min(92, 68 + index * 7),
      })),
    [sectors]
  );

  const visibleNews = news.slice(0, newsVisibleCount);
  const hasMoreNews = newsVisibleCount < news.length;

  return (
    <div className="home-page">
      <AppNavbar />

      <main className="home-shell">
        <section className="home-hero">
          <div className="home-hero-copy">
            <p className="home-kicker">Market Intelligence For Modern Investors</p>
            <h1>Trade with cleaner signals, sharper sector context, and analyst-grade research.</h1>
            <p>
              MarketIntel brings together live market news, momentum-aware sector tracking,
              quant-style signal framing, and structured analyst workflows in one platform built
              for Indian equities.
            </p>

            <div className="home-hero-actions">
              <a className="home-btn home-btn-primary" href="/register">
                Start Free
                <FaArrowRight />
              </a>
              <a className="home-btn home-btn-secondary" href="/login">
                Explore The Platform
              </a>
            </div>

            <div className="home-trust-row">
              <div className="home-trust-card">
                <strong>3 Roles</strong>
                <span>Admin, analyst, and client workspaces built into one product.</span>
              </div>
              <div className="home-trust-card">
                <strong>Live Context</strong>
                <span>Sector rotation and market news keep every decision grounded.</span>
              </div>
              <div className="home-trust-card">
                <strong>Faster Research</strong>
                <span>Analysts move from market setup to published note with less friction.</span>
              </div>
            </div>
          </div>

          <aside className="home-hero-panel">
            <div className="home-panel-head">
              <div>
                <p className="home-kicker">Live Snapshot</p>
                <h3>Today&apos;s market posture</h3>
                <span>{loading ? "Loading live feeds..." : "Auto-curated from your market endpoints"}</span>
              </div>
              <span className="home-status-pill">
                <FaBolt />
                Live market feed
              </span>
            </div>

            <div className="home-signal-list">
              {signalPreview.map((item) => (
                <div key={item.symbol} className="home-signal-row">
                  <div>
                    <div className="home-signal-symbol">{item.symbol}</div>
                    <span className="home-signal-sector">{item.sector}</span>
                  </div>

                  <div className="home-signal-meta">
                    <span className={`home-badge home-badge-${item.signal.toLowerCase()}`}>
                      {item.signal}
                    </span>
                    <span className={item.change >= 0 ? "home-positive" : "home-negative"}>
                      {item.change >= 0 ? "+" : ""}
                      {item.change.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="home-section" id="platform">
          <div className="home-section-head">
            <div>
              <p className="home-kicker">Platform Story</p>
              <h2>Built for fast-moving market teams</h2>
              <p>The platform connects market data, analyst workflow, and client delivery without forcing users into separate tools.</p>
            </div>
          </div>

          <div className="home-story-grid">
            <div className="home-section-card">
              <div className="home-feature-grid">
                <div className="home-feature-card">
                  <div className="home-feature-icon">
                    <FaBolt />
                  </div>
                  <h4>Signal-first workflow</h4>
                  <p>Spot high-conviction setups quickly with momentum-led views and streamlined company tracking.</p>
                </div>

                <div className="home-feature-card">
                  <div className="home-feature-icon">
                    <FaChartPie />
                  </div>
                  <h4>Sector rotation visibility</h4>
                  <p>See leadership shifts across the market and understand where strength or weakness is clustering.</p>
                </div>

                <div className="home-feature-card">
                  <div className="home-feature-icon">
                    <FaUserTie />
                  </div>
                  <h4>Analyst publishing flow</h4>
                  <p>Create, review, approve, and distribute research notes inside one connected workflow.</p>
                </div>
              </div>
            </div>

            <div className="home-section-card" id="why-marketintel">
              <p className="home-kicker">Why MarketIntel</p>
              <h3>Less dashboard noise. More decision support.</h3>
              <p>
                Instead of giving users disconnected widgets, MarketIntel organizes the product
                around real operating jobs: admins govern the platform, analysts publish ideas,
                and clients consume actionable intelligence.
              </p>
              <div className="home-feature-card">
                <div className="home-feature-icon">
                  <FaShieldHalved />
                </div>
                <h4>Role-based confidence</h4>
                <p>Every workspace is purpose-built, so users only see the tools and information that matter to them.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="home-section" id="sectors">
          <div className="home-section-head">
            <div>
              <p className="home-kicker">Sector Radar</p>
              <h2>Sector leaders at a glance</h2>
              <p>Track five-day sector momentum and use it to anchor research, watchlists, and short-term market reads.</p>
            </div>
          </div>

          <div className="home-sector-grid">
            {sectors.map((sector) => (
              <div key={sector.sector} className="home-sector-box">
                <div className="home-sector-top">
                  <strong>{sector.sector}</strong>
                  <span className={sector.return_5d >= 0 ? "home-positive" : "home-negative"}>
                    {sector.return_5d >= 0 ? "+" : ""}
                    {Number(sector.return_5d || 0).toFixed(2)}%
                  </span>
                </div>
                <p>
                  {sector.return_5d >= 0
                    ? "Momentum is holding up well across the recent session window."
                    : "Weakness is showing up and may need closer analyst attention."}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="home-section" id="news">
          <div className="home-section-head">
            <div>
              <p className="home-kicker">Market Coverage</p>
              <h2>Fresh headlines, ready for context</h2>
              <p>Use market news as a starting point, then move directly into sector and signal validation inside the product.</p>
            </div>
          </div>

          <div className="home-news-grid">
            {visibleNews.map((item, index) => (
              <article
                key={`${item.url || item.title}-${index}`}
                className="home-news-card"
                onClick={() => window.open(item.url, "_blank", "noopener,noreferrer")}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={item.image || placeholder}
                  alt={item.title || "Market news"}
                  className="home-news-image"
                  onError={(event) => {
                    event.currentTarget.src = placeholder;
                  }}
                />
                <div className="home-news-body">
                  <h4>{item.title}</h4>
                  <p>{trimSummary(item.summary || item.description)}</p>
                  <div className="home-news-meta">
                    <span>{item.source || "Market feed"}</span>
                    <span>
                      <FaNewspaper /> Open story
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {hasMoreNews && (
            <div className="home-load-more">
              <button
                type="button"
                className="home-btn home-btn-secondary"
                onClick={() => setNewsVisibleCount((current) => current + 3)}
              >
                Load More News
              </button>
            </div>
          )}
        </section>

        <section className="home-cta-panel">
          <div className="home-cta-row">
            <div>
              <p className="home-kicker">Ready To Explore</p>
              <h3>Move from headlines to conviction faster.</h3>
              <p>Start with a client seat, publish as an analyst, or manage the whole operation as an admin.</p>
            </div>

            <div className="home-hero-actions">
              <a className="home-btn home-btn-primary" href="/register">
                Create Account
              </a>
              <a className="home-btn home-btn-secondary" href="/login">
                Sign In
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
