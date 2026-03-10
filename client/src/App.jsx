import React, { useState, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import sunflower from "./sunflower.jpg";

const FALLBACK_COLORS = ["#1a3a6e","#2d1a6e","#6e1a3a","#1a6e3a","#6e4a1a","#1a4a6e","#4a1a6e","#6e1a1a","#1a6e6e","#4a6e1a"];
const FALLBACK_EMOJIS = ["🎵","🎭","🎨","🏟️","🎪","🎬","🌟","🎤","🎸","🎺"];
const gold = "#c9a84c";
const darkBg = "rgba(10,22,48,.9)";

/* ── Star pin — created inside function to avoid module-level Leaflet crash ── */
function makeStarPin() {
  return L.divIcon({
    className: "",
    html: `<svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 1C10.3 1 4 7.3 4 15c0 10.5 14 28 14 28S32 25.5 32 15C32 7.3 25.7 1 18 1z"
        fill="#0f2d5e" stroke="#c9a84c" stroke-width="2"/>
      <polygon points="18,7 19.8,13 26,13 21,17 22.8,23 18,19 13.2,23 15,17 10,13 16.2,13"
        fill="#f5c842"/>
    </svg>`,
    iconSize: [36, 44], iconAnchor: [18, 44], popupAnchor: [0, -46],
  });
}

function Recenter({ position, zoom }) {
  const map = useMap();
  useEffect(() => { map.setView(position, zoom, { animate: true }); }, [position, zoom]);
  return null;
}

export default function App() {
  const [position,      setPosition]      = useState([12.9716, 77.5946]);
  const [placeName,     setPlaceName]     = useState("Bengaluru");
  const [zoom,          setZoom]          = useState(12);
  const [search,        setSearch]        = useState("");
  const [suggestions,   setSuggestions]   = useState([]);
  const [showSug,       setShowSug]       = useState(false);
  const [eventQuery,    setEventQuery]    = useState("");
  const [events,        setEvents]        = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError,   setEventsError]   = useState("");
  const [selectedIdx,   setSelectedIdx]   = useState(0);
  const [starPin,       setStarPin]       = useState(null);
  const debounceRef = useRef(null);

  /* Create Leaflet icon only after mount */
  useEffect(() => { setStarPin(makeStarPin()); }, []);

  /* Autocomplete */
  const fetchSuggestions = async (text) => {
    if (text.trim().length < 2) { setSuggestions([]); return; }
    try {
      const r = await fetch(`http://localhost:5000/api/autocomplete?text=${encodeURIComponent(text)}`);
      const d = await r.json();
      setSuggestions(d.suggestions || []);
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
    setZoom(13);
    setShowSug(false);
    setSuggestions([]);
  };

  /* Navigate */
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
      setZoom(13);
    }
  };

  /* Find events */
  const handleFindEvents = async () => {
    if (!search.trim()) { setEventsError("Enter a location first."); return; }
    setEventsError(""); setEvents([]); setEventsLoading(true); setSelectedIdx(0);
    try {
      const params = new URLSearchParams({ location: search.trim(), radius: 50 });
      params.set("lat", position[0]);
      params.set("lng", position[1]);
      if (eventQuery.trim()) params.set("query", eventQuery.trim());
      const res  = await fetch(`http://localhost:5000/api/search-events?${params}`);
      const data = await res.json();
      if (data.error) setEventsError(data.error);
      else {
        setEvents(data.results || []);
        if (!data.results?.length) setEventsError("No events found here.");
      }
    } catch { setEventsError("Can't reach backend — is it running on port 5000?"); }
    finally   { setEventsLoading(false); }
  };

  /* Close suggestions on outside click */
  useEffect(() => {
    const h = (e) => { if (!e.target.closest("#sw")) setShowSug(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const eventPins  = events.filter(e => e.lat && e.lng);
  const selectedEv = events[selectedIdx] || null;

  return (
    <div style={{
      width:"100vw", minHeight:"100vh",
      backgroundImage:`url(${sunflower})`,
      backgroundSize:"cover", backgroundPosition:"center", backgroundAttachment:"fixed",
      position:"relative", boxSizing:"border-box",
    }}>
      {/* Overlay */}
      <div style={{
        position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
        background:"linear-gradient(160deg,rgba(8,18,38,.55) 0%,rgba(14,30,60,.52) 100%)",
      }}/>

      <div style={{
        position:"relative", zIndex:1,
        width:"100%", maxWidth:"1100px",
        margin:"0 auto", padding:"36px 24px 60px",
        display:"flex", flexDirection:"column", gap:"20px",
      }}>

        {/* HEADER */}
        <div style={{ textAlign:"center" }}>
          <h1 style={{
            fontFamily:"Georgia,serif", fontSize:"clamp(2.8rem,6vw,4.5rem)",
            color:"#f5c842", margin:0, lineHeight:1,
            textShadow:"2px 3px 0 #5a3a00, 0 0 40px rgba(245,200,66,.45)",
          }}>SpotMyEvent</h1>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"10px", margin:"10px 0 6px" }}>
            <div style={{ width:60, height:1, background:`linear-gradient(90deg,transparent,${gold})` }}/>
            <span style={{ color:"#f5c842" }}>✦</span>
            <div style={{ width:60, height:1, background:`linear-gradient(90deg,${gold},transparent)` }}/>
          </div>
          <p style={{ fontStyle:"italic", color:"#fde68a", fontSize:"1rem", opacity:.85 }}>
            find what blooms near you, under the starry night
          </p>
        </div>

        {/* SEARCH BAR */}
        <div style={{ position:"relative" }} id="sw">
          <div style={{
            display:"flex", alignItems:"center", gap:"12px",
            background:"rgba(10,22,48,.88)", border:`1.5px solid ${gold}`,
            borderRadius:"12px", padding:"10px 16px",
          }}>
            <span style={{ color:gold, flexShrink:0 }}>📍</span>
            <input
              value={search} onChange={onSearchChange} autoComplete="off"
              onKeyDown={e => e.key==="Enter" && handleSearch()}
              onFocus={() => suggestions.length > 0 && setShowSug(true)}
              placeholder="Enter a city..."
              style={{ flex:1, background:"transparent", border:"none", outline:"none", color:"#fdf6dc", fontSize:"1rem" }}
            />
            <button onClick={handleSearch} style={{
              padding:"9px 28px", borderRadius:"8px", border:`1px solid ${gold}`,
              background:`linear-gradient(135deg,${gold},#e07b2a)`,
              color:"#0a1628", fontWeight:"700", fontSize:"1rem", cursor:"pointer",
            }}>Navigate</button>
          </div>

          {showSug && suggestions.length > 0 && (
            <div style={{
              position:"absolute", top:"calc(100% + 4px)", left:0, right:0,
              background:"#0a1630", border:`1px solid ${gold}`,
              borderRadius:"10px", zIndex:9999, overflow:"hidden",
              boxShadow:"0 8px 30px rgba(0,0,0,.7)",
            }}>
              {suggestions.map((s, i) => (
                <div key={i} onMouseDown={() => pickSuggestion(s)}
                  style={{ padding:"10px 16px", color:"#fde68a", fontSize:".9rem", cursor:"pointer", borderBottom:"1px solid rgba(201,168,76,.1)" }}
                  onMouseEnter={e => e.currentTarget.style.background="rgba(201,168,76,.12)"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}
                >📍 {s.label}</div>
              ))}
            </div>
          )}
        </div>

        {/* MAP */}
        <div style={{
          width:"100%", height:"300px", borderRadius:"14px", overflow:"hidden",
          border:`2px solid ${gold}`, boxShadow:"0 6px 36px rgba(0,0,0,.7)",
        }}>
          <MapContainer center={position} zoom={zoom} style={{ height:"100%", width:"100%" }}>
            <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            {starPin && eventPins.map((e, i) => (
              <Marker key={i} position={[e.lat, e.lng]} icon={starPin}>
                <Popup>
                  <strong>{e.title}</strong>
                  {e.date    && <><br/>📅 {e.date}</>}
                  {e.venue   && <><br/>🏛 {e.venue}</>}
                  {e.distance != null && <><br/>📏 {e.distance}km away</>}
                </Popup>
              </Marker>
            ))}
            <Recenter position={position} zoom={zoom}/>
          </MapContainer>
        </div>

        {/* UPCOMING BAR */}
        <div style={{
          display:"flex", alignItems:"center", gap:"12px", flexWrap:"wrap",
          background:darkBg, border:`1.5px solid ${gold}`,
          borderRadius:"12px", padding:"12px 20px",
        }}>
          <span style={{
            fontFamily:"Georgia,serif", fontSize:"1.5rem", fontWeight:"700",
            color:"#f5c842", letterSpacing:"2px", flexShrink:0,
            textShadow:`0 0 20px rgba(245,200,66,.4)`,
          }}>UPCOMING</span>
          <div style={{ width:"1px", height:"28px", background:gold, opacity:.4, flexShrink:0 }}/>
          <input
            value={eventQuery} onChange={e => setEventQuery(e.target.value)}
            onKeyDown={e => e.key==="Enter" && handleFindEvents()}
            placeholder="Find event, artist, or type..."
            style={{ flex:1, minWidth:"140px", background:"transparent", border:"none", outline:"none", color:"#fdf6dc", fontSize:"1rem" }}
          />
          <button onClick={handleFindEvents} disabled={eventsLoading} style={{
            padding:"9px 20px", borderRadius:"8px", border:`1px solid ${gold}`, flexShrink:0,
            background: eventsLoading ? "rgba(201,168,76,.3)" : `linear-gradient(135deg,#f5c842,${gold})`,
            color:"#0a1628", fontWeight:"700", fontSize:".95rem",
            cursor: eventsLoading ? "not-allowed" : "pointer",
          }}>{eventsLoading ? "Searching…" : "Search"}</button>
        </div>

        {eventsError && <div style={{ color:"#fca5a5", fontStyle:"italic", fontSize:".9rem" }}>⚠ {eventsError}</div>}

        {/* UPCOMING EVENTS */}
        {events.length > 0 && (
          <div style={{ background:darkBg, border:`1.5px solid ${gold}`, borderRadius:"14px", overflow:"hidden" }}>

            <div style={{ padding:"16px 24px", borderBottom:`1px solid rgba(201,168,76,.25)` }}>
              <span style={{
                fontFamily:"Georgia,serif", fontSize:"1.4rem", fontWeight:"700",
                color:"#f5c842", letterSpacing:"1px",
              }}>UPCOMING EVENTS</span>
            </div>

            {/* Featured event */}
            {selectedEv && (
              <div style={{ display:"flex", borderBottom:`1px solid rgba(201,168,76,.2)`, minHeight:"220px" }}>
                <div style={{ width:"40%", flexShrink:0, position:"relative", overflow:"hidden" }}>
                  {selectedEv.thumbnail
                    ? <img src={selectedEv.thumbnail} alt={selectedEv.title}
                        style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", minHeight:"220px" }}
                        onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}
                      />
                    : null}
                  <div style={{
                    display: selectedEv.thumbnail ? "none" : "flex",
                    width:"100%", minHeight:"220px",
                    background:`linear-gradient(135deg,${FALLBACK_COLORS[selectedIdx % FALLBACK_COLORS.length]},#0d1f3c)`,
                    alignItems:"center", justifyContent:"center", fontSize:"5rem",
                  }}>{FALLBACK_EMOJIS[selectedIdx % FALLBACK_EMOJIS.length]}</div>
                </div>
                <div style={{ flex:1, padding:"24px 28px", display:"flex", flexDirection:"column", gap:"10px" }}>
                  <div>
                    <div style={{ fontFamily:"Georgia,serif", fontSize:"1.2rem", color:"#f5c842", fontWeight:"700" }}>
                      {selectedEv.title}
                    </div>
                    {selectedEv.venue && <div style={{ color:"#fde68a", fontSize:".9rem", marginTop:"4px" }}>{selectedEv.venue}</div>}
                  </div>
                  {selectedEv.date     && <div style={{ color:"rgba(253,230,138,.75)", fontSize:".88rem" }}>📅 {selectedEv.date}</div>}
                  {selectedEv.address  && <div style={{ color:"rgba(253,230,138,.65)", fontSize:".85rem" }}>📍 {selectedEv.address}</div>}
                  {selectedEv.distance != null && <div style={{ color:"#f5c842", fontSize:".82rem" }}>📏 {selectedEv.distance} km away</div>}
                  {selectedEv.description && (
                    <p style={{
                      color:"#b8ac98", fontSize:".85rem", lineHeight:"1.55", margin:0,
                      display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden",
                    }}>{selectedEv.description}</p>
                  )}
                  <div style={{ marginTop:"auto", paddingTop:"12px" }}>
                    {selectedEv.link && (
                      <a href={selectedEv.link} target="_blank" rel="noopener noreferrer" style={{
                        display:"inline-block",
                        padding:"13px 40px", borderRadius:"10px",
                        background:"linear-gradient(135deg,#f5c842,#e07b2a)",
                        color:"#0a1628", fontWeight:"700", fontSize:"1.05rem",
                        textDecoration:"none", letterSpacing:".5px",
                        boxShadow:"0 4px 20px rgba(245,200,66,.45)",
                        transition:"transform .15s, box-shadow .15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 6px 28px rgba(245,200,66,.65)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 4px 20px rgba(245,200,66,.45)"; }}
                      >🎟 Book Ticket</a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Event list */}
            <div style={{ maxHeight:"340px", overflowY:"auto" }}>
              {events.map((ev, i) => (
                <div key={i} onClick={() => setSelectedIdx(i)}
                  style={{
                    display:"flex", alignItems:"center", gap:"14px",
                    padding:"11px 20px", cursor:"pointer",
                    borderBottom:"1px solid rgba(201,168,76,.08)",
                    background: i===selectedIdx ? "rgba(201,168,76,.12)" : "transparent",
                    transition:"background .15s",
                  }}
                  onMouseEnter={e => { if(i!==selectedIdx) e.currentTarget.style.background="rgba(201,168,76,.06)"; }}
                  onMouseLeave={e => { if(i!==selectedIdx) e.currentTarget.style.background="transparent"; }}
                >
                  {ev.thumbnail
                    ? <img src={ev.thumbnail} alt={ev.title}
                        style={{ width:"50px", height:"50px", borderRadius:"8px", objectFit:"cover", flexShrink:0 }}
                        onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}
                      />
                    : null}
                  <div style={{
                    display: ev.thumbnail ? "none" : "flex",
                    width:"50px", height:"50px", borderRadius:"8px", flexShrink:0,
                    background:`linear-gradient(135deg,${FALLBACK_COLORS[i%FALLBACK_COLORS.length]},#0d1f3c)`,
                    alignItems:"center", justifyContent:"center", fontSize:"1.4rem",
                  }}>{FALLBACK_EMOJIS[i%FALLBACK_EMOJIS.length]}</div>

                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{
                      fontFamily:"Georgia,serif", fontSize:".9rem",
                      color: i===selectedIdx ? "#f5c842" : "#fde68a",
                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                    }}>{ev.title}</div>
                    <div style={{ color:"rgba(253,230,138,.55)", fontSize:".76rem", marginTop:"2px" }}>
                      {[ev.venue, ev.date, ev.distance != null ? `${ev.distance}km` : null].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}