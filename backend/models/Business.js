const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    phone: { type: String, default: "" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    sentimentSummary: {
      positive: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 },
      negative: { type: Number, default: 0 },
    },
    topKeywords: [{ type: String }],
  },
  { timestamps: true }
);

businessSchema.index({ name: "text", category: "text", city: "text" });

module.exports = mongoose.model("Business", businessSchema);
