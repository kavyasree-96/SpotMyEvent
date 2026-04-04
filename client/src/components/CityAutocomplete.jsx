import React, { useState } from "react";

const WORLD_CITIES = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "Austin",
  "London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Liverpool", "Bristol",
  "Toronto", "Vancouver", "Montreal", "Calgary", "Edmonton", "Ottawa",
  "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide",
  "Tokyo", "Osaka", "Kyoto", "Yokohama", "Nagoya", "Sapporo",
  "Paris", "Marseille", "Lyon", "Toulouse", "Nice",
  "Berlin", "Munich", "Hamburg", "Cologne", "Frankfurt",
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow",
  "Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu",
  "Moscow", "Saint Petersburg", "Novosibirsk",
  "Mexico City", "Guadalajara", "Monterrey",
  "São Paulo", "Rio de Janeiro", "Brasília", "Salvador",
  "Cairo", "Alexandria", "Giza",
  "Istanbul", "Ankara", "Izmir",
  "Lagos", "Kano", "Ibadan",
  "Karachi", "Lahore", "Faisalabad",
  "Bangkok", "Phuket", "Chiang Mai",
  "Seoul", "Busan", "Incheon",
  "Singapore",
  "Kuala Lumpur", "George Town",
  "Jakarta", "Surabaya", "Bandung",
  "Cape Town", "Johannesburg", "Durban"
];

const CityAutocomplete = ({ onPlaceSelect }) => {
  const [selectedCity, setSelectedCity] = useState("");

  const handleChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    if (city) {
      onPlaceSelect({ city, lat: 0, lon: 0 });
    }
  };

  return (
    <select
      value={selectedCity}
      onChange={handleChange}
      style={{
        width: '100%',
        padding: '14px 20px',
        fontSize: '1rem',
        borderRadius: '40px',
        border: '1px solid #333',
        background: '#111',
        color: '#fff',
        outline: 'none',
        cursor: 'pointer'
      }}
    >
      <option value="">Select a city</option>
      {WORLD_CITIES.map(city => (
        <option key={city} value={city}>{city}</option>
      ))}
    </select>
  );
};

export default CityAutocomplete;