const express = require("express");

const app = express();
const PORT = 3000;

// Store request counts (IP → [timestamps])
const requestMap = new Map();

const RATE_LIMIT = 5; // Max 5 requests
const TIME_WINDOW = 10 * 1000; // 10 seconds

// Rate limiter middleware
function rateLimiter(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";

  const now = Date.now();
  const timestamps = requestMap.get(ip) || [];
  // Remove requests older than TIME_WINDOW
  const filteredTimestamps = timestamps.filter(
    (timestamp) => now - timestamp < TIME_WINDOW
  );

  // If within limit, allow request
  if (filteredTimestamps.length < RATE_LIMIT) {
    filteredTimestamps.push(now);
    requestMap.set(ip, filteredTimestamps);
    next();
  } else {
    res.status(429).json({ message: "Too Many Requests. Try again later." });
  }
}

// Apply rate limiter to all requests
app.use(rateLimiter);

app.get("/", (req, res) => {
  res.send("Welcome! You are within the rate limit.");
});

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
