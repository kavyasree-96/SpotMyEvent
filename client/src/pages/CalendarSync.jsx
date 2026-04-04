import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SAMPLE_EVENTS = [
  {
    id: 1,
    title: "Music Festival",
    description: "Live music performances and food stalls.",
    location: "City Event Arena",
    startDate: "20250615T180000Z",
    endDate: "20250615T220000Z",
    displayDate: "June 15, 2025 • 6:00 PM – 10:00 PM",
    color: "#1a3a6e",
  },
  {
    id: 2,
    title: "Tech Conference",
    description: "Talks from industry leaders and networking.",
    location: "Convention Centre",
    startDate: "20250620T090000Z",
    endDate: "20250620T180000Z",
    displayDate: "June 20, 2025 • 9:00 AM – 6:00 PM",
    color: "#2d1a6e",
  },
  {
    id: 3,
    title: "Art Exhibition",
    description: "Contemporary art by local creators.",
    location: "City Art Gallery",
    startDate: "20250622T100000Z",
    endDate: "20250622T170000Z",
    displayDate: "June 22, 2025 • 10:00 AM – 5:00 PM",
    color: "#6e1a3a",
  },
];

function buildCalendarUrl(event) {
  const base = "https://www.google.com/calendar/render";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${event.startDate}/${event.endDate}`,
    details: event.description,
    location: event.location,
  });
  return `${base}?${params.toString()}`;
}

export default function CalendarSync() {
  const [added, setAdded] = useState({});
  const navigate = useNavigate();

  const handleAdd = (event) => {
    window.open(buildCalendarUrl(event), "_blank", "noopener");
    setAdded((prev) => ({ ...prev, [event.id]: true }));
  };

  const handleCustomAdd = (e) => {
    e.preventDefault();
    const form = e.target;

    const title = form.title.value.trim();
    const location = form.location.value.trim();
    const details = form.details.value.trim();
    const date = form.date.value;

    if (!title || !date) return;

    const d = new Date(date);
    const pad = (n) => String(n).padStart(2, "0");
    const dateStr = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;

    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&dates=${dateStr}T090000Z/${dateStr}T110000Z&details=${encodeURIComponent(
      details
    )}&location=${encodeURIComponent(location)}`;

    window.open(url, "_blank", "noopener");
    form.reset();
  };

  return (
    <div style={{ padding: "60px 80px", color: "white" }}>
      <button
        onClick={() => navigate("/")}
        style={{
          marginBottom: 30,
          padding: "8px 18px",
          background: "transparent",
          border: "1px solid rgba(241, 229, 229, 0.79)",
          color: "white",
          cursor: "pointer",
        }}
      >
        Back
      </button>

      <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 40 }}>
        Save Events To Calendar
      </h1>

      <h2 style={{ fontSize: 26, marginBottom: 20 }}>Upcoming Events</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(360px,1fr))",
          gap: 24,
          marginBottom: 60,
        }}
      >
        {SAMPLE_EVENTS.map((event) => (
          <div
            key={event.id}
            style={{
              border: "1px solid rgba(242, 233, 233, 0.85)",
              padding: 24,
              borderRadius: 14,
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <h3 style={{ marginBottom: 8 }}>{event.title}</h3>
            <p style={{ opacity: 0.7 }}>{event.displayDate}</p>
            <p style={{ opacity: 0.7 }}>{event.location}</p>

            <p style={{ marginTop: 16, opacity: 0.8 }}>{event.description}</p>

            <button
              onClick={() => handleAdd(event)}
              style={{
                marginTop: 18,
                width: "100%",
                padding: 12,
                border: "none",
                cursor: "pointer",
                background: added[event.id] ? "#1f7a3a" : "#EE5007",
                color: "white",
                fontWeight: 700,
                borderRadius: 8,
              }}
            >
              {added[event.id] ? "Added" : "Add to Google Calendar"}
            </button>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 26, marginBottom: 20 }}>Add Your Own Event</h2>

      <form
        onSubmit={handleCustomAdd}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          maxWidth: 700,
        }}
      >
        <input name="title" required placeholder="Event title" style={input} />
        <input name="date" required type="date" style={input} />
        <input name="location" placeholder="Location" style={input} />
        <input name="details" placeholder="Description" style={input} />

        <button
          type="submit"
          style={{
            gridColumn: "1/-1",
            padding: 14,
            border: "none",
            background: "#EE5007",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
            borderRadius: 8,
          }}
        >
          Open in Google Calendar
        </button>
      </form>
    </div>
  );
}

const input = {
  padding: 12,
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.04)",
  color: "white",
};