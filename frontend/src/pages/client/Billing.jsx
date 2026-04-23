export default function ClientBilling() {
  return (
    <div className="client-dashboard client-page billing-page">
      <section className="section-hero">
        <div>
          <p className="section-kicker">Commercial Readiness</p>
          <h2>Billing Overview</h2>
          <p className="section-subtitle">
            This screen is intentionally presented as a product showcase, so
            interview reviewers can see where subscriptions, seats, and upgrade
            paths would live inside the client workspace.
          </p>
        </div>

        <div className="section-hero-badge">
          <span>Demo billing mode</span>
        </div>
      </section>

      <section className="section-summary-grid">
        <article className="section-summary-card">
          <span className="summary-label">Current Plan</span>
          <strong>Free Showcase</strong>
          <small>Good for product demos and walkthroughs</small>
        </article>

        <article className="section-summary-card">
          <span className="summary-label">Seats Included</span>
          <strong>1 Client Seat</strong>
          <small>Illustrates how account access could be packaged</small>
        </article>

        <article className="section-summary-card">
          <span className="summary-label">Upgrade Path</span>
          <strong>Pro Research</strong>
          <small>Reserved for future payment integration</small>
        </article>
      </section>

      <div className="client-list-row">
        <div>
          <b>Payment status</b>
          <span> Billing is currently disabled in this demo build.</span>
        </div>
        <button type="button" className="btn btn-primary" disabled>
          Coming Soon
        </button>
      </div>

      <div className="client-list-row">
        <div>
          <b>Interview note</b>
          <span>
            This page is intentionally non-transactional so the hosted version
            stays safe to share without collecting card details.
          </span>
        </div>
      </div>
    </div>
  );
}
