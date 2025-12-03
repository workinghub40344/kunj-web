// index.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose"); 
const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorMiddleware");

const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const sliderRoutes = require('./routes/sliderRoutes');
const userRoutes = require('./routes/userRoutes.js');
const accessoryRoutes = require('./routes/accessoryRoutes.js');

const app = express();

// --- Security Middleware ---
app.use(helmet());

// --- CORS Configuration ---
const allowedOrigins = [
  "https://kunjcreationindia.com",
  "https://www.kunjcreationindia.com",
  "http://localhost:5173",
  "http://localhost:8080"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

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
app.use('/api/users', userRoutes);
app.use('/api/accessories', accessoryRoutes);

// Basic route to check server status
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// --- Error Handling Middleware ---
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});