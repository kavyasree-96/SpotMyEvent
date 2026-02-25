const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Dummy data to simulate a database
const events = [
  { id: 1, title: "Tech Meetup", lat: 12.9716, lng: 77.5946, category: "Tech" },
  { id: 2, title: "Music Concert", lat: 12.9352, lng: 77.6245, category: "Music" },
  { id: 3, title: "Art Gallery", lat: 12.9611, lng: 77.6387, category: "Art" }
];

app.get('/api/events', (req, res) => {
  res.json(events);
});

app.post('/api/events', (req, res) => {
  const { title, lat, lng, category } = req.body;

  // Validation
  if (!title || !lat || !lng || !category) {
    return res.status(400).json({ error: 'Missing required fields: title, lat, lng, category' });
  }

  // Generate new ID
  const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;

  // Create new event
  const newEvent = { id: newId, title, lat, lng, category };
  events.push(newEvent);

  res.status(201).json(newEvent);
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});