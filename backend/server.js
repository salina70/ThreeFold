const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const businessRoutes = require("./routes/business");
const reviewRoutes = require("./routes/review");
const analyticsRoutes = require("./routes/analytics");
const adminRoutes = require("./routes/admin");

dotenv.config();

const app = express();

connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3002" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "Feedback Nepal API" }));

app.use("/api/auth", authRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Feedback Nepal API running on port ${PORT}`));
