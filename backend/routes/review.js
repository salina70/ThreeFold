const express = require("express");
const Review = require("../models/Review");
const Business = require("../models/Business");
const auth = require("../middleware/auth");
const { analyzeReview } = require("../utils/sentiment");

const router = express.Router();

// GET /api/reviews/owner - every review across every business the logged-in owner runs
router.get("/owner", auth, async (req, res) => {
  try {
    const businesses = await Business.find({ owner: req.user.id }).select("_id name");
    const businessIds = businesses.map((b) => b._id);
    const businessNameById = {};
    businesses.forEach((b) => (businessNameById[b._id.toString()] = b.name));

    const reviews = await Review.find({ business: { $in: businessIds } })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    const withBusinessName = reviews.map((r) => ({
      ...r.toObject(),
      businessName: businessNameById[r.business.toString()],
    }));

    res.json(withBusinessName);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your reviews", error: err.message });
  }
});

// GET /api/reviews/owner/export - CSV report of every review across the owner's businesses
router.get("/owner/export", auth, async (req, res) => {
  try {
    const businesses = await Business.find({ owner: req.user.id }).select("_id name");
    const businessIds = businesses.map((b) => b._id);
    const businessNameById = {};
    businesses.forEach((b) => (businessNameById[b._id.toString()] = b.name));

    const reviews = await Review.find({ business: { $in: businessIds } })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    const escapeCsv = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;
    const header = ["Business", "Customer", "Rating", "Sentiment", "Review", "Keywords", "Owner Reply", "Date"];
    const rows = reviews.map((r) => [
      businessNameById[r.business.toString()],
      r.user?.name || "Anonymous",
      r.rating,
      r.sentiment.label,
      r.text,
      (r.keywords || []).join("; "),
      r.ownerReply?.text || "",
      new Date(r.createdAt).toISOString().slice(0, 10),
    ]);

    const csv = [header, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="feedback-nepal-reviews.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: "Failed to export reviews", error: err.message });
  }
});

// GET /api/reviews/business/:businessId
router.get("/business/:businessId", async (req, res) => {
  try {
    const reviews = await Review.find({ business: req.params.businessId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviews", error: err.message });
  }
});

// POST /api/reviews  { business, rating, text }
router.post("/", auth, async (req, res) => {
  try {
    const { business, rating, text } = req.body;
    if (!business || !rating || !text) {
      return res.status(400).json({ message: "Business, rating and text are required" });
    }

    const biz = await Business.findById(business);
    if (!biz) return res.status(404).json({ message: "Business not found" });

    const { sentiment, keywords } = analyzeReview(text);

    const review = await Review.create({
      business,
      user: req.user.id,
      rating,
      text,
      sentiment,
      keywords,
    });

    await recomputeBusinessStats(business);

    const populated = await review.populate("user", "name");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to submit review", error: err.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const isAuthor = String(review.user) === req.user.id;
    let isBusinessOwner = false;
    if (!isAuthor) {
      const business = await Business.findById(review.business).select("owner");
      isBusinessOwner = business && String(business.owner) === req.user.id;
    }

    if (!isAuthor && !isBusinessOwner) {
      return res.status(403).json({ message: "You can only delete your own review, or a review on a business you own" });
    }

    const businessId = review.business;
    await review.deleteOne();
    await recomputeBusinessStats(businessId);
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete review", error: err.message });
  }
});

// POST /api/reviews/:id/reply - business owner responds publicly to a review
router.post("/:id/reply", auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Reply text is required" });
    }

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const business = await Business.findById(review.business).select("owner");
    if (!business || String(business.owner) !== req.user.id) {
      return res.status(403).json({ message: "Only the business owner can reply to this review" });
    }

    review.ownerReply = { text: text.trim(), repliedAt: new Date() };
    await review.save();

    const populated = await review.populate("user", "name");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to save reply", error: err.message });
  }
});

async function recomputeBusinessStats(businessId) {
  const reviews = await Review.find({ business: businessId });
  const reviewCount = reviews.length;
  const avgRating = reviewCount
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(2))
    : 0;

  const sentimentSummary = { positive: 0, neutral: 0, negative: 0 };
  const keywordFreq = {};

  reviews.forEach((r) => {
    sentimentSummary[r.sentiment.label] = (sentimentSummary[r.sentiment.label] || 0) + 1;
    (r.keywords || []).forEach((kw) => {
      keywordFreq[kw] = (keywordFreq[kw] || 0) + 1;
    });
  });

  const topKeywords = Object.entries(keywordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);

  await Business.findByIdAndUpdate(businessId, {
    avgRating,
    reviewCount,
    sentimentSummary,
    topKeywords,
  });
}

module.exports = router;
