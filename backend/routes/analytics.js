const express = require("express");
const Business = require("../models/Business");
const Review = require("../models/Review");

const router = express.Router();

// GET /api/analytics/:businessId
router.get("/:businessId", async (req, res) => {
  try {
    const business = await Business.findById(req.params.businessId);
    if (!business) return res.status(404).json({ message: "Business not found" });

    const reviews = await Review.find({ business: business._id })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      ratingBreakdown[r.rating] = (ratingBreakdown[r.rating] || 0) + 1;
    });

    const recentTrend = reviews
      .slice(0, 10)
      .reverse()
      .map((r) => ({
        date: r.createdAt,
        rating: r.rating,
        sentimentScore: r.sentiment.score,
        label: r.sentiment.label,
      }));

    res.json({
      business,
      totalReviews: reviews.length,
      avgRating: business.avgRating,
      sentimentSummary: business.sentimentSummary,
      topKeywords: business.topKeywords,
      ratingBreakdown,
      recentTrend,
      latestReviews: reviews.slice(0, 5),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to build analytics", error: err.message });
  }
});

module.exports = router;
