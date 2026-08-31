const express = require("express");
const Business = require("../models/Business");
const Review = require("../models/Review");
const User = require("../models/User");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/admin");

const router = express.Router();

// GET /api/admin/stats - platform-wide overview for the admin panel
router.get("/stats", auth, requireAdmin, async (req, res) => {
  try {
    const [totalOrganizations, totalCustomers, totalOwners, totalFeedback, businesses] = await Promise.all([
      Business.countDocuments(),
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "owner" }),
      Review.countDocuments(),
      Business.find().select("name category city avgRating reviewCount createdAt owner").lean(),
    ]);

    // Per-business review count + distinct-customer count in one aggregation
    const perBusiness = await Review.aggregate([
      {
        $group: {
          _id: "$business",
          reviewCount: { $sum: 1 },
          uniqueCustomers: { $addToSet: "$user" },
          positive: { $sum: { $cond: [{ $eq: ["$sentiment.label", "positive"] }, 1, 0] } },
          neutral: { $sum: { $cond: [{ $eq: ["$sentiment.label", "neutral"] }, 1, 0] } },
          negative: { $sum: { $cond: [{ $eq: ["$sentiment.label", "negative"] }, 1, 0] } },
        },
      },
    ]);

    const perBusinessMap = {};
    perBusiness.forEach((row) => {
      perBusinessMap[row._id.toString()] = {
        reviewCount: row.reviewCount,
        uniqueCustomers: row.uniqueCustomers.length,
        positive: row.positive,
        neutral: row.neutral,
        negative: row.negative,
      };
    });

    const organizations = businesses.map((b) => {
      const stats = perBusinessMap[b._id.toString()] || { reviewCount: 0, uniqueCustomers: 0, positive: 0, neutral: 0, negative: 0 };
      return {
        _id: b._id,
        name: b.name,
        category: b.category,
        city: b.city,
        avgRating: b.avgRating,
        reviewCount: stats.reviewCount,
        uniqueCustomers: stats.uniqueCustomers,
        sentiment: { positive: stats.positive, neutral: stats.neutral, negative: stats.negative },
        createdAt: b.createdAt,
      };
    });

    // Platform-wide sentiment split
    const sentimentAgg = await Review.aggregate([
      { $group: { _id: "$sentiment.label", count: { $sum: 1 } } },
    ]);
    const platformSentiment = { positive: 0, neutral: 0, negative: 0 };
    sentimentAgg.forEach((row) => {
      if (row._id) platformSentiment[row._id] = row.count;
    });

    // Category breakdown
    const categoryAgg = await Business.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const topCategories = categoryAgg.map((row) => ({ category: row._id, count: row.count }));

    // Total unique customers who have ever left a review platform-wide
    const distinctReviewers = await Review.distinct("user");

    res.json({
      totalOrganizations,
      totalCustomers,
      totalOwners,
      totalFeedback,
      totalActiveReviewers: distinctReviewers.length,
      platformSentiment,
      topCategories,
      organizations: organizations.sort((a, b) => b.reviewCount - a.reviewCount),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to build admin stats", error: err.message });
  }
});

module.exports = router;
