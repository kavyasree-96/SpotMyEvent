import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const MOODS = [
  { label: "Adventurous", value: "outdoor adventure sports" },
  { label: "Social",      value: "social networking community meetup" },
  { label: "Creative",    value: "art craft creative workshop" },
  { label: "Chilled",     value: "relaxed music jazz lounge" },
  { label: "Intellectual",value: "talks conference educational" },
  { label: "Party",       value: "nightlife DJ dance party" },
];

const INTERESTS = [
  "Music", "Tech", "Art", "Food", "Comedy", "Sports",
  "Theatre", "Film", "Wellness", "Literature",
];

const CATEGORY_COLORS = {
  Music:      "#F8CB2E",
  Tech:       "#EE5007",
  Art:        "#a78bfa",
  Comedy:     "#34d399",
  Food:       "#fb923c",
  Sports:     "#60a5fa",
  Theatre:    "#f472b6",
  Film:       "#818cf8",
  Wellness:   "#4ade80",
  Literature: "#e879f9",
  Nightlife:  "#f59e0b",
  Community:  "#22d3ee",
};

function getAccent(category) {
  if (!category) return "#F8CB2E";
  const key = Object.keys(CATEGORY_COLORS).find(
    (k) => k.toLowerCase() === (category || "").toLowerCase()
  );
  return key ? CATEGORY_COLORS[key] : "#F8CB2E";
}

const labelStyle = {
  fontFamily: "'Outfit', sans-serif",
  fontWeight: 700,
  fontSize: "0.78rem",
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  color: "#444",
  marginBottom: "16px",
  display: "block",
};

export default function AiRecommendations() {
  const navigate = useNavigate();
  const [mood, setMood]           = useState("");
  const [interests, setInterests] = useState([]);
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [searched, setSearched]   = useState(false);

  const toggleInterest = (item) =>
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );

  // Build a single `interest` string the controller expects
  const buildInterest = () => {
    const parts = [];
    if (interests.length > 0) parts.push(interests.join(" "));
    if (mood) parts.push(mood);
    return parts.join(" ").trim() || "events";
  };

  const handleSubmit = async () => {
    if (!mood && interests.length === 0) {
      setError("Please select a mood or at least one interest.");
      return;
    }
    setLoading(true);
    setError("");
    setResults([]);
    setSearched(false);

    const interest = buildInterest();

    try {
      const response = await fetch("http://localhost:5000/api/ai-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Controller expects: { interest: string, city: string }
        body: JSON.stringify({ interest, city: "Bangalore" }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Server error ${response.status}`);
      }

      setResults(data.results || []);
      setSearched(true);
    } catch (err) {
      console.error("AI recommendations error:", err);
      setError(err.message || "Could not fetch recommendations. Make sure the backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#000", minHeight: "100vh", width: "100%", boxSizing: "border-box" }}>

      {/* ── Header ── */}
      <div style={{
        padding: "56px 56px 40px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "#0a0a0a",
        width: "100%",
        boxSizing: "border-box",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#666",
              padding: "7px 18px",
              borderRadius: "100px",
              fontSize: "0.82rem",
              marginBottom: "28px",
              fontFamily: "'Outfit', sans-serif",
              cursor: "pointer",
            }}
          >
            &larr; Back
          </button>

          <span style={{
            display: "inline-block",
            background: "#EE5007",
            color: "#fff",
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "1px",
            textTransform: "uppercase",
            padding: "3px 12px",
            borderRadius: "100px",
            marginBottom: "14px",
            fontFamily: "'Outfit', sans-serif",
          }}>
            Live Event Search
          </span>

          <h1 style={{
            fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
            color: "#fff",
            marginBottom: "8px",
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 900,
            lineHeight: 1.15,
          }}>
            AI Recommendations
          </h1>
          <p style={{
            color: "#555",
            margin: 0,
            fontSize: "0.95rem",
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 300,
          }}>
            Pick your mood and interests — we will find real events in Bangalore for you.
          </p>
        </div>
      </div>

      {/* ── Form ── */}
      <div style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "48px 56px 80px",
        boxSizing: "border-box",
      }}>

        {/* Mood */}
        <div style={{ marginBottom: "40px" }}>
          <span style={labelStyle}>Your Mood</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {MOODS.map((m) => {
              const active = mood === m.value;
              return (
                <button
                  key={m.label}
                  onClick={() => setMood(active ? "" : m.value)}
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    padding: "10px 22px",
                    borderRadius: "100px",
                    border: `1px solid ${active ? "#F8CB2E" : "rgba(255,255,255,0.09)"}`,
                    background: active ? "rgba(248,203,46,0.1)" : "transparent",
                    color: active ? "#F8CB2E" : "#555",
                    fontSize: "0.88rem",
                    fontWeight: active ? 700 : 400,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interests */}
        <div style={{ marginBottom: "40px" }}>
          <span style={labelStyle}>Interests</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {INTERESTS.map((item) => {
              const active = interests.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => toggleInterest(item)}
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    padding: "8px 18px",
                    borderRadius: "100px",
                    border: `1px solid ${active ? "#EE5007" : "rgba(255,255,255,0.07)"}`,
                    background: active ? "rgba(238,80,7,0.12)" : "#111",
                    color: active ? "#EE5007" : "#555",
                    fontSize: "0.85rem",
                    fontWeight: active ? 700 : 400,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(238,80,7,0.08)",
            border: "1px solid rgba(238,80,7,0.25)",
            borderRadius: "10px",
            padding: "12px 18px",
            color: "#f87171",
            marginBottom: "24px",
            fontFamily: "'Outfit', sans-serif",
            fontSize: "0.88rem",
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            background: loading ? "rgba(248,203,46,0.12)" : "#F8CB2E",
            color: loading ? "#555" : "#000",
            border: "none",
            padding: "14px 40px",
            borderRadius: "100px",
            fontWeight: 700,
            fontSize: "0.95rem",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "'Outfit', sans-serif",
            transition: "all 0.2s",
            marginBottom: "56px",
            display: "block",
          }}
        >
          {loading ? "Searching events..." : "Find Events"}
        </button>

        {/* Loading skeletons */}
        {loading && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
          }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{
                background: "#111",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "14px",
                height: "220px",
                animation: "pulse 1.5s ease-in-out infinite",
              }} />
            ))}
          </div>
        )}

        {/* Results */}
        {searched && results.length > 0 && (
          <div>
            <h2 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "1.3rem",
              color: "#fff",
              marginBottom: "8px",
              fontWeight: 700,
            }}>
              Events found for you
            </h2>
            <p style={{
              color: "#444",
              fontSize: "0.85rem",
              fontFamily: "'Outfit', sans-serif",
              marginBottom: "24px",
            }}>
              {results.length} event{results.length !== 1 ? "s" : ""} matching your selection
            </p>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "16px",
            }}>
              {results.map((ev, i) => (
                <AiEventCard key={i} ev={ev} />
              ))}
            </div>
          </div>
        )}

        {searched && !loading && results.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ color: "#444", fontFamily: "'Outfit', sans-serif", fontSize: "0.95rem" }}>
              No events found. Try a different mood or interest.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function AiEventCard({ ev }) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const accent = getAccent(ev.category);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#111",
        border: `1px solid ${hovered ? accent + "55" : "rgba(255,255,255,0.07)"}`,
        borderRadius: "14px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s",
        transform: hovered ? "translateY(-3px)" : "none",
      }}
    >
      {/* Thumbnail */}
      {ev.thumbnail && !imgError && (
        <div style={{ height: "160px", flexShrink: 0 }}>
          <img
            src={ev.thumbnail}
            alt={ev.title}
            onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
      )}

      {/* No thumbnail fallback bar */}
      {(!ev.thumbnail || imgError) && (
        <div style={{
          height: "6px",
          background: `linear-gradient(90deg, ${accent}, ${accent}44)`,
          flexShrink: 0,
        }} />
      )}

      {/* Content */}
      <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
          {ev.category && (
            <span style={{
              background: accent,
              color: "#000",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
              padding: "2px 9px",
              borderRadius: "100px",
              fontFamily: "'Outfit', sans-serif",
            }}>
              {ev.category}
            </span>
          )}
          {ev.date && (
            <span style={{ color: "#444", fontSize: "0.75rem", fontFamily: "'Outfit', sans-serif" }}>
              {ev.date}
            </span>
          )}
        </div>

        <h3 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "0.98rem",
          fontWeight: 700,
          color: "#fff",
          margin: 0,
          lineHeight: 1.35,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {ev.title}
        </h3>

        {(ev.venue || ev.location) && (
          <p style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "0.78rem",
            color: "#444",
            margin: 0,
          }}>
            {ev.venue ? `${ev.venue}` : ""}{ev.venue && ev.location ? " — " : ""}{ev.location || ""}
          </p>
        )}

        {ev.description && (
          <p style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "0.82rem",
            color: "#555",
            lineHeight: "1.5",
            margin: 0,
            flex: 1,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {ev.description}
          </p>
        )}

        {ev.link && (
          <a
            href={ev.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginTop: "8px",
              display: "inline-block",
              padding: "8px 16px",
              borderRadius: "100px",
              border: `1px solid ${accent}55`,
              color: accent,
              fontFamily: "'Outfit', sans-serif",
              fontSize: "0.8rem",
              fontWeight: 700,
              textDecoration: "none",
              alignSelf: "flex-start",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = accent;
              e.currentTarget.style.color = "#000";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = accent;
            }}
          >
            View Event &rarr;
          </a>
        )}
      </div>
    </div>
  );
}