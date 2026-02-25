import React, { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import sunflower from "./sunflower.jpg";

// Helper to recenter and optionally zoom map
function Recenter({ position, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, zoom || 13, { animate: true });
  }, [position, zoom, map]);
  return null;
}

const App = () => {
  const [position, setPosition] = useState([28.6139, 77.209]); // default
  const [placeName, setPlaceName] = useState("Delhi");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(13); // default zoom

  // Get user's actual location on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          setPlaceName("Your Location");
          setZoom(16); // zoom in tighter for current location
        },
        () => {
          setPosition([28.6139, 77.209]);
          setPlaceName("Delhi");
          setZoom(13);
        }
      );
    }
  }, []);

  // Search using Geoapify
  const handleSearch = async () => {
    if (!search) return;
    setError("");
    try {
      const apiKey = import.meta.env.VITE_GEOAPIFY_KEY;
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          search
        )}&apiKey=${apiKey}`
      );
      const data = await res.json();

      if (data.features && data.features.length > 0) {
        const [lon, lat] = data.features[0].geometry.coordinates;
        const formatted = data.features[0].properties.formatted;
        setPosition([lat, lon]);
        setPlaceName(formatted);
        setZoom(16); // zoom in tighter on searched location
      } else {
        setError("Location not found!");
      }
    } catch {
      setError("Error fetching location");
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen w-screen items-center p-6 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${sunflower})` }}
    >
      {/* HEADER */}
      <header className="text-center mb-6">
        <h1 className="text-5xl font-extrabold text-white">SpotMyEvent</h1>
        <p className="text-white mt-2 text-lg">Find your location!</p>
      </header>
  
      {/* MAIN CONTENT */}
      <div className="flex flex-col w-full max-w-6xl gap-6">
  
        {/* SEARCH BAR */}
        <div className="rounded-2xl p-4 shadow-lg bg-yellow-400">
          <input
            type="text"
            placeholder="Enter location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full p-4 rounded-2xl border-none focus:ring-2 focus:ring-white focus:outline-none shadow-inner bg-yellow-400 text-white placeholder-white"
          />
          {error && (
            <p className="mt-2 text-white font-semibold">{error}</p>
          )}
        </div>
  
        {/* MAP */}
        <div className="h-[450px] rounded-2xl overflow-hidden shadow-lg">
          <MapContainer
            center={position}
            zoom={zoom}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
              <Popup>{placeName}</Popup>
            </Marker>
  
            <Recenter position={position} zoom={zoom} />
          </MapContainer>
        </div>
  
      </div>
    </div>
  );
export default App;