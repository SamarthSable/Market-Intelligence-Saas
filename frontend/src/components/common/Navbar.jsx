import { Navbar, Nav, Container } from "react-bootstrap";
import { FaChartLine } from "react-icons/fa6";
import ThemeToggle from "./ThemeToggle";

export default function AppNavbar() {
  return (
    <Navbar expand="lg" className="home-navbar">
      <Container fluid className="px-4">
        <Navbar.Brand href="/" className="home-brand">
          <span className="home-brand-mark">
            <FaChartLine />
          </span>
          MarketIntel
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="home-navbar-nav" />
        <Navbar.Collapse id="home-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="#platform">Platform</Nav.Link>
            <Nav.Link href="#sectors">Sectors</Nav.Link>
            <Nav.Link href="#news">News</Nav.Link>
            <Nav.Link href="#why-marketintel">Why Us</Nav.Link>
          </Nav>

          <div className="home-nav-actions">
            <ThemeToggle className="theme-toggle-navbar" />
            <a className="home-btn home-btn-secondary" href="/login">
              Login
            </a>
            <a className="home-btn home-btn-primary" href="/register">
              Get Started
            </a>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
