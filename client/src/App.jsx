import React, { useState, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import sunflower from "./sunflower.jpg";

/* ── custom pins ── */
const makePin = (color) => L.divIcon({
  className: "",
  html: `<svg width="28" height="40" viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 1C7.4 1 2 6.4 2 13c0 9.5 12 26 12 26S26 22.5 26 13C26 6.4 20.6 1 14 1z"
      fill="${color}" stroke="white" stroke-width="1.5"/>
    <circle cx="14" cy="13" r="5" fill="white" fill-opacity="0.9"/>
  </svg>`,
  iconSize: [28, 40], iconAnchor: [14, 40], popupAnchor: [0, -42],
});
const BLUE_PIN   = makePin("#0f3460");
const YELLOW_PIN = makePin("#b8860b");

function Recenter({ position }) {
  const map = useMap();
  useEffect(() => { map.setView(position, 13, { animate: true }); }, [position]);
  return null;
}

export default function App() {
  const [position,  setPosition]  = useState([12.9716, 77.5946]);
  const [placeName, setPlaceName] = useState("Bengaluru");
  const [search,    setSearch]    = useState("");

  const [suggestions,  setSuggestions]  = useState([]);
  const [showSug,      setShowSug]      = useState(false);
  const debounceRef = useRef(null);

  const [eventQuery,    setEventQuery]    = useState("");
  const [events,        setEvents]        = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError,   setEventsError]   = useState("");

  /* ── autocomplete ── */
  const fetchSuggestions = async (text) => {
    if (text.trim().length < 2) { setSuggestions([]); return; }
    try {
      const r    = await fetch(`http://localhost:5000/api/autocomplete?text=${encodeURIComponent(text)}`);
      const data = await r.json();
      setSuggestions(data.suggestions || []);
      setShowSug(true);
    } catch { setSuggestions([]); }
  };

  const onSearchChange = (e) => {
    setSearch(e.target.value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(e.target.value), 280);
  };

  const pickSuggestion = (s) => {
    setSearch(s.label);
    setPosition([s.lat, s.lng]);
    setPlaceName(s.label);
    setShowSug(false);
    setSuggestions([]);
  };

  /* ── navigate ── */
  const handleSearch = async () => {
    if (!search.trim()) return;
    setShowSug(false);
    const key  = import.meta.env.VITE_GEOAPIFY_KEY;
    const res  = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(search)}&limit=1&apiKey=${key}`);
    const data = await res.json();
    if (data.features?.length > 0) {
      const [lng, lat] = data.features[0].geometry.coordinates;
      setPosition([lat, lng]);
      setPlaceName(data.features[0].properties.formatted);
    }
  };

  /* ── find events ── */
  const handleFindEvents = async () => {
    if (!search.trim()) { setEventsError("Enter a location first."); return; }
    setEventsError(""); setEvents([]); setEventsLoading(true);
    try {
      const params = new URLSearchParams({ location: search.trim() });
      if (eventQuery.trim()) params.set("query", eventQuery.trim());
      const res  = await fetch(`http://localhost:5000/api/search-events?${params}`);
      const data = await res.json();
      if (data.error) { setEventsError(data.error); }
      else {
        const seen = new Set();
        const deduped = (data.results || []).filter(e => {
          const key = `${e.title}__${e.date}__${e.venue}`;
          if (seen.has(key)) return false;
          seen.add(key); return true;
        });
        setEvents(deduped);
        if (!deduped.length) setEventsError("No events found.");
      }
    } catch { setEventsError("Can't reach backend — is it running on port 5000?"); }
    finally   { setEventsLoading(false); }
  };

  /* close suggestions on outside click */
  useEffect(() => {
    const h = (e) => { if (!e.target.closest("#search-wrap")) setShowSug(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const eventPins = events.filter(e => e.lat && e.lng);

  /* ── styles ── */
  const S = {
    page: {
      width: "100vw", minHeight: "100vh",
      backgroundImage: `url(${sunflower})`,
      backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed",
      boxSizing: "border-box", padding: "32px 32px 48px", position: "relative",
    },
    overlay: {
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
      background: "linear-gradient(135deg,rgba(10,22,40,.87) 0%,rgba(17,34,68,.82) 100%)",
    },
    inner: {
      position: "relative", zIndex: 1,
      width: "100%", maxWidth: "1200px", margin: "0 auto",
      display: "flex", flexDirection: "column", gap: "24px",
    },
    title: {
      fontFamily: "Georgia, serif", fontSize: "clamp(2.8rem,6vw,4.8rem)",
      color: "#f5c842", textShadow: "2px 3px 0 #7a4a1e, 0 0 30px rgba(245,200,66,.5)",
      margin: 0, lineHeight: 1.05,
    },
    subtitle: { fontStyle: "italic", color: "#fde68a", fontSize: "1rem", marginTop: "6px", opacity: .85 },
    searchPanel: {
      width: "100%", background: "rgba(17,34,68,.88)",
      border: "1px solid rgba(245,200,66,.25)", borderRadius: "14px",
      padding: "14px 18px", display: "flex", gap: "12px", position: "relative",
    },
    searchInput: {
      flex: 1, padding: "12px 16px", borderRadius: "10px",
      border: "1.5px solid rgba(245,200,66,.3)", background: "rgba(10,22,40,.8)",
      color: "#fdf6dc", fontSize: "1rem", outline: "none",
    },
    searchBtn: {
      padding: "12px 26px", borderRadius: "10px", border: "none",
      background: "linear-gradient(135deg,#f4a225,#e07b2a)",
      color: "#0a1628", fontWeight: "700", fontSize: "1rem",
      cursor: "pointer", whiteSpace: "nowrap",
    },
    dropdown: {
      position: "absolute", top: "calc(100% + 4px)", left: "18px", right: "130px",
      background: "#0c1e3a", border: "1px solid rgba(245,200,66,.28)",
      borderRadius: "10px", zIndex: 9999, overflow: "hidden",
      boxShadow: "0 8px 30px rgba(0,0,0,.6)",
    },
    suggestion: {
      padding: "10px 14px", color: "#fde68a", fontSize: ".9rem",
      cursor: "pointer", borderBottom: "1px solid rgba(245,200,66,.08)",
    },
    columns: { display: "flex", gap: "24px", alignItems: "flex-start" },
    mapWrap: {
      flex: "0 0 55%", height: "600px", borderRadius: "16px", overflow: "hidden",
      border: "2px solid rgba(245,200,66,.25)", boxShadow: "0 8px 40px rgba(0,0,0,.6)",
    },
    rightPanel: { flex: 1, display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 },
    box: {
      background: "rgba(17,34,68,.88)", border: "1px solid rgba(245,200,66,.22)",
      borderRadius: "14px", padding: "18px 20px",
    },
    panelTitle: { fontFamily: "Georgia, serif", fontSize: "1.2rem", color: "#f5c842", marginBottom: "12px" },
    eventsInput: {
      width: "100%", padding: "10px 14px", borderRadius: "10px",
      border: "1.5px solid rgba(245,200,66,.25)", background: "rgba(10,22,40,.8)",
      color: "#fdf6dc", fontSize: ".95rem", outline: "none",
      marginBottom: "10px", boxSizing: "border-box",
    },
    findBtn: {
      width: "100%", padding: "11px", borderRadius: "10px", border: "none",
      background: "linear-gradient(135deg,#f5c842,#f4a225)",
      color: "#0a1628", fontWeight: "700", fontSize: ".95rem", cursor: "pointer",
    },
    errText: { color: "#fca5a5", fontStyle: "italic", fontSize: ".85rem", marginTop: "8px" },
    eventsScroll: { maxHeight: "460px", overflowY: "auto", marginTop: "4px" },
    card: {
      display: "flex", gap: "0",
      background: "rgba(13,31,60,.9)", border: "1px solid rgba(245,200,66,.13)",
      borderRadius: "10px", overflow: "hidden", marginBottom: "10px",
    },
    cardStripe: { width: "4px", flexShrink: 0, background: "linear-gradient(180deg,#f5c842,#e07b2a)" },
    cardImg: { width: "80px", flexShrink: 0, objectFit: "cover", filter: "saturate(.8)" },
    cardNoImg: {
      width: "80px", flexShrink: 0, background: "rgba(26,58,110,.8)",
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem",
    },
    cardBody: { padding: "10px 12px", display: "flex", flexDirection: "column", gap: "4px", flex: 1 },
    cardTitle: { fontFamily: "Georgia, serif", fontSize: ".92rem", color: "#fde68a", lineHeight: 1.3 },
    cardMeta: { fontSize: ".76rem", color: "rgba(253,230,138,.7)", fontStyle: "italic" },
    cardLink: { fontSize: ".76rem", color: "#f4a225", textDecoration: "none", marginTop: "2px" },
    pinBadge: {
      fontSize: ".68rem", color: "#b8860b", background: "rgba(184,134,11,.15)",
      border: "1px solid rgba(184,134,11,.3)", borderRadius: "10px",
      padding: "1px 6px", width: "fit-content",
    },
    emptyMsg: { color: "rgba(253,230,138,.4)", fontStyle: "italic", fontSize: ".9rem", textAlign: "center", marginTop: "40px" },
  };

  return (
    <div style={S.page}>
      <div style={S.overlay} />
      <div style={S.inner}>

        {/* TITLE */}
        <div>
          <h1 style={S.title}>SpotMyEvent</h1>
          <p style={S.subtitle}>find what blooms near you, under the starry night</p>
        </div>

        {/* SEARCH BAR */}
        <div style={S.searchPanel} id="search-wrap">
          <input
            style={S.searchInput}
            placeholder="Enter a city or place…"
            value={search}
            onChange={onSearchChange}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            onFocus={() => suggestions.length > 0 && setShowSug(true)}
            autoComplete="off"
          />
          <button style={S.searchBtn} onClick={handleSearch}>Navigate</button>

          {showSug && suggestions.length > 0 && (
            <div style={S.dropdown}>
              {suggestions.map((s, i) => (
                <div key={i} style={S.suggestion}
                  onMouseDown={() => pickSuggestion(s)}
                  onMouseEnter={e => e.target.style.background = "rgba(245,200,66,.1)"}
                  onMouseLeave={e => e.target.style.background = "transparent"}
                >
                  📍 {s.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MAP + RIGHT PANEL */}
        <div style={S.columns}>

          {/* MAP */}
          <div style={S.mapWrap}>
            <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
              <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={position} icon={BLUE_PIN}>
                <Popup><strong>{placeName}</strong></Popup>
              </Marker>
              {eventPins.map((e, i) => (
                <Marker key={i} position={[e.lat, e.lng]} icon={YELLOW_PIN}>
                  <Popup>
                    <strong>{e.title}</strong>
                    {e.date && <><br/>📅 {e.date}</>}
                    {e.venue && <><br/>🏛 {e.venue}</>}
                  </Popup>
                </Marker>
              ))}
              <Recenter position={position} />
            </MapContainer>
          </div>

          {/* RIGHT PANEL */}
          <div style={S.rightPanel}>

            {/* Event search */}
            <div style={S.box}>
              <div style={S.panelTitle}>✦ Find Events</div>
              <input
                style={S.eventsInput}
                placeholder="Event type — music, comedy, art…"
                value={eventQuery}
                onChange={e => setEventQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleFindEvents()}
              />
              <button
                style={{ ...S.findBtn, opacity: eventsLoading ? .6 : 1 }}
                onClick={handleFindEvents}
                disabled={eventsLoading}
              >
                {eventsLoading ? "Searching…" : "Search Events"}
              </button>
              {eventsError && <div style={S.errText}>⚠ {eventsError}</div>}
            </div>

            {/* Events list */}
            <div style={S.box}>
              <div style={S.panelTitle}>✦ Events</div>
              {events.length === 0 && !eventsLoading && (
                <div style={S.emptyMsg}>Search for events above to see results here.</div>
              )}
              <div style={S.eventsScroll}>
                {events.map((ev, i) => (
                  <div key={i} style={S.card}>
                    <div style={S.cardStripe} />
                    {ev.thumbnail
                      ? <img style={S.cardImg} src={ev.thumbnail} alt={ev.title} />
                      : <div style={S.cardNoImg}>🌻</div>
                    }
                    <div style={S.cardBody}>
                      <div style={S.cardTitle}>{ev.title}</div>
                      {ev.date    && <div style={S.cardMeta}>📅 {ev.date}</div>}
                      {ev.venue   && <div style={S.cardMeta}>🏛 {ev.venue}</div>}
                      {ev.address && <div style={S.cardMeta}>📍 {ev.address}</div>}
                      {ev.lat && ev.lng && <div style={S.pinBadge}>📌 Pinned on map</div>}
                      {ev.link && <a style={S.cardLink} href={ev.link} target="_blank" rel="noopener noreferrer">View Event →</a>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}