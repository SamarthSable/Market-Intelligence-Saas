export default function Footer() {
  return (
    <footer className="home-footer">
      <div className="home-footer-shell">
        <div>
          <h6>MarketIntel</h6>
          <p>Quant-driven stock intelligence, sector rotation insight, and analyst research for Indian markets.</p>
        </div>

        <div>
          <h6>Platform</h6>
          <p><a href="#platform">Signals</a></p>
          <p><a href="#sectors">Sector Radar</a></p>
          <p><a href="#news">Market News</a></p>
        </div>

        <div>
          <h6>Access</h6>
          <p><a href="/login">Login</a></p>
          <p><a href="/register">Register</a></p>
          <p><a href="#why-marketintel">Why MarketIntel</a></p>
        </div>
      </div>
    </footer>
  );
}
