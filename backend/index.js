// index.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose"); 
const connectDB = require("./config/db");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const sliderRoutes = require('./routes/sliderRoutes');

const app = express();



app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// --- Health Check Endpoint ---
app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  // readyState '1' means 'connected'
  const isDbConnected = dbState === 1;

  if (isDbConnected) {
    res.status(200).json({
      status: "UP",
      database: "Connected",
    });
  } else {
    res.status(503).json({
      status: "DOWN",
      database: "Disconnected",
    });
  }
});


// --- Main API Routes ---
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use('/api/slider', sliderRoutes);

// Basic route to check server status
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});