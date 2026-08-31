const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
    sentiment: {
      label: { type: String, enum: ["positive", "neutral", "negative"], default: "neutral" },
      score: { type: Number, default: 0 },
      comparative: { type: Number, default: 0 },
    },
    keywords: [{ type: String }],
    ownerReply: {
      text: { type: String, default: null },
      repliedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
