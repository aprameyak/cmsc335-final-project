require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const listingsRouter = require("./routes/listings");
const buildingsRouter = require("./routes/buildings");

const app = express();

mongoose
  .connect(process.env.MONGO_CONNECTION_STRING || "mongodb://localhost:27017/terrapin-marketplace")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use("/api/listings", listingsRouter);
app.use("/api/buildings", buildingsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Terrapin Marketplace running on port ${PORT}`));
