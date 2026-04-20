const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    required: true,
    enum: ["Textbooks", "Electronics", "Furniture", "Clothing", "Transportation", "Other"],
  },
  sellerEmail: { type: String, required: true, trim: true },
  pickupLocation: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Listing", listingSchema);
