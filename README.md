# 🌻 SpotMyEvent

> *Find what blooms near you, under the starry night.*

A full-stack event discovery platform that lets users search for a location, explore events nearby on an interactive map, and book tickets — all in one beautiful Van Gogh-inspired interface.

---

## ✨ Features

- 🔍 **Location Search** — Autocomplete-powered search using Geoapify
- 🗺️ **Interactive Map** — Events pinned on an OpenStreetMap-based map with star markers
- 🎟️ **Event Discovery** — Real-time events fetched via SerpAPI (Google Events)
- 📅 **Event Cards** — Thumbnail, date, venue, address, distance, and Book Ticket button
- 🌍 **Geocoding** — Event venues geocoded to precise lat/lng coordinates

---

## 🗂️ Project Structure

```
SpotMyEvent/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # Entry point
│   │   ├── index.css        # Global styles
│   │   └── sunflower.jpg    # Background image
│   ├── .env                 # Frontend env variables
│   └── package.json
│
├── backend/                 # Node.js / Express backend
│   ├── server.js            # API server
│   ├── .env                 # Backend env variables (never commit this)
│   └── package.json
│
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v20+
- npm
- A [SerpAPI](https://serpapi.com) account (free tier: 100 searches/month)
- A [Geoapify](https://geoapify.com) account (free tier available)

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/SpotMyEvent.git
cd SpotMyEvent
```

---

### 2. Set up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
SERP_API_KEY=your_serpapi_key_here
GEOAPIFY_KEY=your_geoapify_key_here
PORT=5000
```

Start the backend server:

```bash
node server.js
```

Backend runs at `http://localhost:5000`

---

### 3. Set up the Frontend

```bash
cd client
npm install
```

Create a `.env` file in the `client/` folder:

```env
VITE_GEOAPIFY_KEY=your_geoapify_key_here
```

Start the frontend dev server:

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## 🔌 API Reference

### `GET /api/autocomplete`
Returns location suggestions as the user types.

| Param | Type | Description |
|-------|------|-------------|
| `text` | string | Partial location string |

```
GET /api/autocomplete?text=banga
```

---

### `GET /api/search-events`
Returns events near a location, filtered by radius.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `location` | string | required | City or place name |
| `query` | string | — | Event type (e.g. music, comedy) |
| `lat` | number | — | Latitude of searched location |
| `lng` | number | — | Longitude of searched location |

```
GET /api/search-events?location=Bengaluru&query=music&lat=12.97&lng=77.59
```

**Response:**
```json
{
  "location": "Bengaluru",
  "centre": { "lat": 12.9716, "lng": 77.5946 },
  "radius": 20,
  "total": 7,
  "results": [
    {
      "title": "Jazz at Cubbon Park",
      "venue": "Cubbon Park",
      "date": "15-May-2026",
      "address": "Cubbon Park, Bengaluru",
      "lat": 12.9763,
      "lng": 77.5929,
      "distance": 0.54,
      "link": "https://...",
      "thumbnail": "https://..."
    }
  ]
}
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7 |
| Map | Leaflet, React-Leaflet |
| Styling | Inline styles (no Tailwind dependency) |
| Backend | Node.js, Express 5 |
| Event Data | SerpAPI (Google Events engine) |
| Geocoding | Geoapify |
| Distance | Haversine formula |

---

## 🔐 Environment Variables

| File | Variable | Description |
|------|----------|-------------|
| `backend/.env` | `SERP_API_KEY` | SerpAPI key for event search |
| `backend/.env` | `GEOAPIFY_KEY` | Geoapify key for geocoding & autocomplete |
| `client/.env` | `VITE_GEOAPIFY_KEY` | Geoapify key for frontend search |

> ⚠️ Never commit `.env` files. They are listed in `.gitignore`.

---

## 📐 Distance Calculation

Events are filtered using the **Haversine formula** with a fixed 50km default radius. It calculates the great-circle distance between two lat/lng points on Earth, accurate to within ~0.5% for distances under 1000km.

```js
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
```
