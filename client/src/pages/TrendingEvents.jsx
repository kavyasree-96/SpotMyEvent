import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import EventCard from "../components/EventCard";
import { fetchTrendingEvents } from "../services/apiService";

export default function TrendingEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchTrendingEvents();
      setEvents(data.results || []);
    } catch (err) {
      setError("Failed to load trending events. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const queryParam = searchParams.get("q");

  return (
    <div style={{ background: "#000", minHeight: "100vh" }}>
      {/* Page header */}
      <div style={{
        padding: "56px 48px 40px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "#0d0d0d",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#888",
              padding: "7px 16px",
              borderRadius: "100px",
              fontSize: "0.82rem",
              marginBottom: "24px",
              fontFamily: "'Outfit', sans-serif",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            &larr; Back
          </button>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
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
                marginBottom: "12px",
                fontFamily: "'Outfit', sans-serif",
              }}>
                Live Now
              </span>
              <h1 style={{ fontSize: "2.4rem", color: "#fff", marginBottom: "6px" }}>
                Trending Events
              </h1>
              <p style={{ color: "#555", margin: 0, fontSize: "0.95rem" }}>
                {queryParam ? `Results for "${queryParam}"` : "Whats the hottest events happening right now? Find out here."}
              </p>
            </div>

            <button
              onClick={loadEvents}
              disabled={loading}
              style={{
                background: loading ? "rgba(255,255,255,0.05)" : "#F8CB2E",
                color: loading ? "#444" : "#000",
                border: "none",
                padding: "10px 24px",
                borderRadius: "100px",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Outfit', sans-serif",
                transition: "all 0.2s",
              }}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 48px 80px" }}>
        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(238,80,7,0.1)",
            border: "1px solid rgba(238,80,7,0.3)",
            borderRadius: "10px",
            padding: "14px 20px",
            color: "#f87171",
            marginBottom: "32px",
            fontFamily: "'Outfit', sans-serif",
            fontSize: "0.9rem",
          }}>
            {error}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
            gap: "20px",
          }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{
                background: "#111",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "14px",
                height: "320px",
                animation: "pulse 1.5s ease-in-out infinite",
              }} />
            ))}
          </div>
        )}

        {/* Events grid */}
        {!loading && events.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
            gap: "20px",
          }}>
            {events.map((event, i) => (
              <EventCard
                key={i}
                index={i}
                title={event.title}
                subtitle={event.source}
                date={event.date}
                location={event.address}
                description={event.snippet}
                thumbnail={event.thumbnail}
                badge="Trending"
                actionLabel="Read More"
                onAction={() => window.open(event.link, "_blank", "noopener")}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && events.length === 0 && !error && (
          <div style={{
            textAlign: "center",
            padding: "80px 20px",
            color: "#444",
          }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "16px", color: "#222" }}>&#9749;</div>
            <p style={{ fontSize: "1.1rem", color: "#555", marginBottom: "8px" }}>
              No trending events found right now.
            </p>
            <p style={{ fontSize: "0.9rem", color: "#444" }}>Try refreshing or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}