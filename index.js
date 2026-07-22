require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { nanoid } = require("nanoid");
const Url = require("./Url");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Serve React frontend
app.use(express.static(path.join(__dirname, "frontend/dist")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist", "index.html"));
});

// Shorten a URL
app.post("/api/shorten", async (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: "originalUrl is required" });
  }

  try {
    const shortCode = nanoid(7);

    const newUrl = await Url.create({
      originalUrl,
      shortCode,
    });

    res.status(201).json({
      shortCode: newUrl.shortCode,
      shortUrl: `${req.protocol}://${req.get("host")}/${newUrl.shortCode}`,
      originalUrl: newUrl.originalUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Redirect short code to original URL
app.get("/:code", async (req, res) => {
  const { code } = req.params;

  try {
    const url = await Url.findOne({ shortCode: code });

    if (!url) {
      return res.status(404).send("Short URL not found");
    }

    url.clicks += 1;
    await url.save();

    return res.redirect(url.originalUrl);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

// Get stats for a short URL
app.get("/api/stats/:code", async (req, res) => {
  const { code } = req.params;

  try {
    const url = await Url.findOne({ shortCode: code });

    if (!url) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    res.json({
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
