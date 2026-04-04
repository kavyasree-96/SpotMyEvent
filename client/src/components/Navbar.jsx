import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container">
        <Link className="navbar-brand" to="/">
          SpotMyEvent
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link click-scroll" to="/">Home</Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link click-scroll" to="/trending">Trending</Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link click-scroll" to="/ai">AI Picks</Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link click-scroll" to="/calendar">Calendar</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}