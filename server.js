const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Get API key from environment variable or use default
const SERPAPI_KEY = process.env.SERPAPI_KEY || 'bd39fee26801e243ffad644d269b0a96a7e4a2f57b2e9033771ad0cb51db2006';

// Allow CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Serve static files (so you can open http://localhost:3000/rank-checker.html)
app.use(express.static(path.join(__dirname)));

// Add root route handler for debugging
app.post('/', (req, res) => {
  console.log('Received request at root path');
  res.status(404).json({ error: 'Please use the /serpapi endpoint' });
});

app.post('/serpapi', async (req, res) => {
  const { keyword, location } = req.body;
  console.log('Received request with:', { keyword, location });
  const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}&num=100&api_key=${SERPAPI_KEY}`;
  console.log('Making request to:', url);
  try {
    const response = await fetch(url);
    console.log('Response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('SerpAPI error response:', errorText);
      throw new Error(`SerpAPI returned ${response.status}: ${errorText}`);
    }
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data).substring(0, 200) + '...');
    res.json(data);
  } catch (err) {
    console.error('Error fetching from SerpAPI:', err);
    res.status(500).json({ 
      error: 'Failed to fetch from SerpAPI', 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});