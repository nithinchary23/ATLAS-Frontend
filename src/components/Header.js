import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/header.css";

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const goTo = (path) => {
    navigate(path);
    setOpen(false);
  };

  // 🔹 Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 🔹 Handle Enter key in search
  const handleSearch = (e) => {
    if (e.key === "Enter") {
      const country = query.trim();
      if (!country) return;

      navigate(`/country/${encodeURIComponent(country)}`);
      setQuery("");
    }
  };

  return (
    <header className={`app-header ${scrolled ? "scrolled" : ""}`}>
      {/* LEFT */}
      <div className="header-left">
        <div className="hamburger" onClick={() => setOpen(!open)}>
          <span />
          <span />
          <span />
        </div>

        <div className="app-identity">
          <div className="app-name tooltip">
            ATLAS
            <span className="tooltip-text">
              Anti-Trafficking Landscape Assessment System
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT: SEARCH */}
      <input
        className="header-search"
        placeholder="Search country..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleSearch}
      />

      {/* SIDEBAR */}
      <div className={`side-menu ${open ? "open" : ""}`}>
        <div className="side-menu-title">MENU</div>

        <div className="menu-item" onClick={() => goTo("/")}>
          Dashboard
        </div>

        <div className="menu-item" onClick={() => goTo("/history-map")}>
          Historical Risk
        </div>

        <div className="menu-item" onClick={() => goTo("/hotspots")}>
          Predictive Hotspots
        </div>

        <div className="menu-item" onClick={() => goTo("/countries")}>
          Country Profiles
        </div>

        <div className="menu-item" onClick={() => goTo("/reports")}>
          Reports
        </div>

        <div className="menu-divider" />

        <div className="menu-item" onClick={() => goTo("/settings")}>
          Settings
        </div>
      </div>

      {open && <div className="menu-overlay" onClick={() => setOpen(false)} />}
    </header>
  );
}

export default Header;
