import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const EventMapView = ({ events }) => {
  // Find first event with coordinates to center map
  const firstCoordEvent = events.find(ev => ev.lat && ev.lng);
  const center = firstCoordEvent 
    ? [firstCoordEvent.lat, firstCoordEvent.lng]
    : [12.9716, 77.5946]; // default Bangalore

  return (
    <MapContainer center={center} zoom={12} style={{ height: '500px', width: '100%', borderRadius: '16px', marginTop: '20px' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {events.map((event, idx) => {
        if (event.lat && event.lng) {
          return (
            <Marker key={idx} position={[event.lat, event.lng]}>
              <Popup>
                <strong>{event.title}</strong><br />
                {event.address}<br />
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(event.address)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#F8CB2E', fontWeight: 'bold' }}
                >
                  Get Directions →
                </a>
              </Popup>
            </Marker>
          );
        }
        return null;
      })}
    </MapContainer>
  );
};

export default EventMapView;