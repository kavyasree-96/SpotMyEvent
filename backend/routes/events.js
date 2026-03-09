const express = require("express");
const router = express.Router();
const fetch = require("node-fetch"); // npm i node-fetch@2
console.log("SERPAPI_KEY:", process.env.SERPAPI_KEY);

const fallbackEvents = [
  { title: "Bangalore Tech Meetup", date: "2026-03-10", location: "Koramangala, Bangalore", link: "https://www.meetup.com/" },
  { title: "Bangalore Music Festival", date: "2026-03-15", location: "MG Road, Bangalore", link: "https://www.eventbrite.com/" },
  { title: "Food Carnival", date: "2026-03-20", location: "Indiranagar, Bangalore", link: "https://www.eventbrite.com/" }
];

console.log("SERPAPI_KEY:", process.env.SERPAPI_KEY);
router.get("/events", async (req, res) => {
  const location = req.query.location || "Bangalore";
  const query = `${location} events`;
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    console.warn("SERPAPI_KEY not found! Using fallback events.");
    return res.json(fallbackEvents);
  }

  // Construct URL similar to the working link
  const url = `https://serpapi.com/search.json?engine=google_events&q=${encodeURIComponent(query)}&hl=en&gl=in&google_domain=google.com&api_key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("FULL SERPAPI RESPONSE:", data);

    if (data.events_results && data.events_results.length > 0) {
      return res.json(data.events_results);
    }

    res.json(fallbackEvents);
  } catch (err) {
    console.error("Error fetching from SerpAPI:", err);
    res.json(fallbackEvents);
  }
});

module.exports = router;