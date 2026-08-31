const express = require("express");
const Business = require("../models/Business");
const Review = require("../models/Review");
const auth = require("../middleware/auth");

const router = express.Router();

// GET /api/businesses?search=&category=&city=
router.get("/", async (req, res) => {
  try {
    const { search, category, city } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }
    if (category) filter.category = { $regex: `^${category}$`, $options: "i" };
    if (city) filter.city = { $regex: `^${city}$`, $options: "i" };

    const businesses = await Business.find(filter).sort({ createdAt: -1 });
    res.json(businesses);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch businesses", error: err.message });
  }
});

// GET /api/businesses/mine - businesses owned by the logged-in user (owner panel)
router.get("/mine", auth, async (req, res) => {
  try {
    const businesses = await Business.find({ owner: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(businesses);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch your businesses", error: err.message });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const categories = await Business.distinct("category");
    res.json(categories);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch categories", error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business)
      return res.status(404).json({ message: "Business not found" });
    res.json(business);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch business", error: err.message });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { name, category, description, address, city, phone } = req.body;
    if (!name || !category) {
      return res
        .status(400)
        .json({ message: "Name and category are required" });
    }

    const business = await Business.create({
      name,
      category,
      description,
      address,
      city,
      phone,
      owner: req.user.id,
    });

    res.status(201).json(business);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create business", error: err.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business)
      return res.status(404).json({ message: "Business not found" });
    if (String(business.owner) !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only the owner can delete this business" });
    }
    await Review.deleteMany({ business: business._id });
    await business.deleteOne();
    res.json({ message: "Business deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete business", error: err.message });
  }
});

module.exports = router;
