// src/components/Navbar.js
import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/navbar.css";

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="navbar">
        {/* LEFT: Hamburger */}
        <div
          className="hamburger"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </div>

        {/* RIGHT: Search */}
        <input
          type="text"
          className="nav-search"
          placeholder="Search country..."
        />
      </header>

      {/* MENU */}
      {open && (
        <div className="nav-menu">
          <Link to="/" onClick={() => setOpen(false)}>
            Dashboard
          </Link>
          <Link to="/historical-risk" onClick={() => setOpen(false)}>
            Historical Risk
          </Link>
        </div>
      )}
    </>
  );
}

export default Navbar;
