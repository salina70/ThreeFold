const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Business = require("../models/Business");
const Review = require("../models/Review");
const { analyzeReview } = require("./sentiment");

dotenv.config();

/**
 * NOTE ON DATA SOURCE:
 * This seed data is hand-authored, not scraped from Google or any live
 * platform. Scraping Google Reviews would violate Google's Terms of Service
 * and is not something this project does. This dataset exists purely to give
 * the hackathon demo realistic breadth (30 categories, 30 businesses,
 * dozens of reviews) so the admin and owner panels aren't empty on first run.
 */

const CITIES = [
  "Kathmandu",
  "Pokhara",
  "Lalitpur",
  "Bhaktapur",
  "Biratnagar",
  "Butwal",
  "Dharan",
  "Chitwan",
  "Itahari",
  "Nepalgunj",
];

const CUSTOMER_NAMES = [
  "Anish Shrestha",
  "Sabina Gurung",
  "Bibek Thapa",
  "Prakriti Rai",
  "Rohan Karki",
  "Sunita Magar",
  "Nabin Tamang",
  "Kritika Basnet",
  "Suman Adhikari",
  "Anita Poudel",
  "Bikash Lama",
  "Pooja Shah",
  "Rajesh Bhandari",
  "Sarina Maharjan",
  "Deepak Khadka",
];

const BUSINESSES = [
  {
    name: "Himalayan Bean Cafe",
    category: "Cafe",
    description: "Cozy coffee house known for espresso and mountain views.",
  },
  {
    name: "Sekuwa Ghar Restaurant",
    category: "Restaurant",
    description: "Traditional Nepali grilled meats and momo.",
  },
  {
    name: "Kathmandu Bite Fast Food",
    category: "Fast Food",
    description: "Quick burgers, rolls, and street-style snacks.",
  },
  {
    name: "Mithai Ghar Sweets",
    category: "Bakery & Sweets",
    description: "Fresh Nepali sweets and baked goods daily.",
  },
  {
    name: "Barrel & Barley Lounge",
    category: "Bar & Lounge",
    description: "Relaxed lounge with live music on weekends.",
  },
  {
    name: "Hotel Mountain Vista",
    category: "Hotel",
    description: "Mid-range hotel with panoramic valley views.",
  },
  {
    name: "Thamel Traveler's Inn",
    category: "Guest House",
    description: "Budget-friendly guest house popular with backpackers.",
  },
  {
    name: "Peak Trails Trekking",
    category: "Trekking Agency",
    description: "Guided treks across the Annapurna and Everest regions.",
  },
  {
    name: "Gandaki Travels & Tours",
    category: "Travel Agency",
    description: "Domestic and international travel packages.",
  },
  {
    name: "Namaste Nepal Guides",
    category: "Tour Guide Service",
    description: "Licensed local guides for cultural and heritage tours.",
  },
  {
    name: "Himal Electronics",
    category: "Electronics Store",
    description: "TVs, appliances, and home electronics.",
  },
  {
    name: "QuickFix Mobile Care",
    category: "Mobile Repair Shop",
    description: "Same-day phone and tablet repairs.",
  },
  {
    name: "Sunrise Computers",
    category: "Computer Store",
    description: "Laptops, accessories, and IT support.",
  },
  {
    name: "Swasthya Pharmacy",
    category: "Pharmacy",
    description: "Neighborhood pharmacy with 24-hour service.",
  },
  {
    name: "Bagmati City Clinic",
    category: "Hospital & Clinic",
    description: "General checkups and outpatient care.",
  },
  {
    name: "Smile Care Dental",
    category: "Dental Clinic",
    description: "Family dental care and cosmetic dentistry.",
  },
  {
    name: "Glow Beauty Salon",
    category: "Salon & Spa",
    description: "Haircuts, styling, and spa treatments.",
  },
  {
    name: "Iron Peak Fitness",
    category: "Gym & Fitness Center",
    description: "Full gym with personal training available.",
  },
  {
    name: "Shanti Yoga Studio",
    category: "Yoga Studio",
    description: "Morning and evening yoga classes for all levels.",
  },
  {
    name: "Newa Fashion House",
    category: "Clothing Boutique",
    description: "Contemporary and traditional Nepali clothing.",
  },
  {
    name: "StepUp Shoes",
    category: "Footwear Store",
    description: "Casual, formal, and sports footwear.",
  },
  {
    name: "Lalitpur Gold House",
    category: "Jewelry Store",
    description: "Gold and silver jewelry, custom orders welcome.",
  },
  {
    name: "Mustang Handicrafts",
    category: "Handicraft Store",
    description: "Handmade Nepali crafts and souvenirs.",
  },
  {
    name: "Wisdom Book Corner",
    category: "Bookstore",
    description: "New and used books, textbooks, and stationery.",
  },
  {
    name: "Woodland Furniture",
    category: "Furniture Store",
    description: "Custom and ready-made wooden furniture.",
  },
  {
    name: "Fresh Basket Grocery",
    category: "Grocery Store",
    description: "Daily groceries, fruits, and vegetables.",
  },
  {
    name: "City Center Supermarket",
    category: "Supermarket",
    description: "One-stop shop for household essentials.",
  },
  {
    name: "CleanWave Laundry",
    category: "Laundry Service",
    description: "Wash, dry, and fold service with pickup.",
  },
  {
    name: "Safe Drive Academy",
    category: "Driving School",
    description: "Two-wheeler and four-wheeler driving lessons.",
  },
  {
    name: "Bright Future Coaching",
    category: "Coaching Center",
    description: "Exam preparation for SEE, +2, and entrance tests.",
  },
];

const REVIEW_BANK = [
  // positive
  {
    text: "Amazing experience overall, the staff were incredibly friendly and helpful.",
    ratings: [5, 4],
  },
  {
    text: "Great quality and fast service, I will definitely come back again.",
    ratings: [5, 4],
  },
  {
    text: "One of the best experiences I've had in the city, highly recommend.",
    ratings: [5],
  },
  {
    text: "The staff were very professional and polite throughout my visit.",
    ratings: [4, 5],
  },
  {
    text: "Excellent service and reasonable prices, very satisfied with everything.",
    ratings: [5, 4],
  },
  {
    text: "Loved it! Clean, comfortable, and the people were wonderful.",
    ratings: [5],
  },
  {
    text: "Outstanding quality and the owner is genuinely caring about customers.",
    ratings: [5],
  },
  {
    text: "Fantastic experience, everything was smooth and efficient.",
    ratings: [4, 5],
  },
  {
    text: "Impressed by how friendly and welcoming everyone was.",
    ratings: [4],
  },
  {
    text: "Best in town, worth every rupee, highly recommended to friends.",
    ratings: [5],
  },
  // neutral
  {
    text: "It was okay, nothing special but nothing bad either.",
    ratings: [3],
  },
  {
    text: "Average experience, the price was reasonable for what we got.",
    ratings: [3],
  },
  {
    text: "Decent service, though it took a bit longer than expected.",
    ratings: [3, 2],
  },
  { text: "Fine overall, might visit again if I'm in the area.", ratings: [3] },
  { text: "Not bad, but not particularly memorable either.", ratings: [3] },
  { text: "The place was okay, some things could be improved.", ratings: [3] },
  {
    text: "A fairly standard experience, similar to other places nearby.",
    ratings: [3],
  },
  {
    text: "It met basic expectations, nothing more nothing less.",
    ratings: [3],
  },
  { text: "Reasonable quality, average service, an okay pick.", ratings: [3] },
  {
    text: "Neither impressed nor disappointed, just an average visit.",
    ratings: [3],
  },
  // negative
  {
    text: "Very disappointing experience, the staff seemed unprofessional and rude.",
    ratings: [1, 2],
  },
  {
    text: "Terrible service, I had to wait far too long and it was not worth it.",
    ratings: [1, 2],
  },
  {
    text: "The quality was poor and overpriced for what we received.",
    ratings: [1, 2],
  },
  {
    text: "I would avoid this place, the experience was frustrating and slow.",
    ratings: [1],
  },
  {
    text: "Not satisfied at all, the staff were careless and unfriendly.",
    ratings: [1, 2],
  },
  {
    text: "Worst experience in a long time, definitely won't be returning.",
    ratings: [1],
  },
  {
    text: "Disappointed with how the whole visit turned out, quite bad.",
    ratings: [2, 1],
  },
  {
    text: "The place was dirty and the service was extremely slow.",
    ratings: [1, 2],
  },
  {
    text: "Overpriced and underwhelming, I expected much better quality.",
    ratings: [2],
  },
  {
    text: "Unprofessional staff and a complete waste of time and money.",
    ratings: [1],
  },
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  return [...arr].sort(() => 0.5 - Math.random());
}

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Business.deleteMany({}),
    Review.deleteMany({}),
  ]);

  await User.create({
    name: "Feedback Nepal Admin",
    email: "admin@feedbacknepal.com",
    password: "password123",
    role: "admin",
  });

  const owners = await User.create([
    {
      name: "Owner One",
      email: "owner1@feedbacknepal.com",
      password: "password123",
      role: "owner",
    },
    {
      name: "Owner Two",
      email: "owner2@feedbacknepal.com",
      password: "password123",
      role: "owner",
    },
    {
      name: "Owner Three",
      email: "owner3@feedbacknepal.com",
      password: "password123",
      role: "owner",
    },
  ]);

  const customers = await User.create(
    CUSTOMER_NAMES.map((name, i) => ({
      name,
      email: `customer${i + 1}@feedbacknepal.com`,
      password: "password123",
      role: "customer",
    })),
  );

  let createdCount = 0;

  for (let i = 0; i < BUSINESSES.length; i++) {
    const base = BUSINESSES[i];
    const owner = owners[Math.floor(i / 10) % owners.length];
    const city = CITIES[i % CITIES.length];

    const business = await Business.create({
      name: base.name,
      category: base.category,
      description: base.description,
      city,
      address: `${city} - Ward ${1 + (i % 15)}`,
      phone: `98${(10000000 + i * 137).toString().slice(0, 8)}`,
      owner: owner._id,
    });

    const reviewCount = 4 + Math.floor(Math.random() * 5); // 4-8 reviews
    const chosenTemplates = shuffle(REVIEW_BANK).slice(0, reviewCount);
    const shuffledCustomers = shuffle(customers);

    const sentimentSummary = { positive: 0, neutral: 0, negative: 0 };
    const keywordFreq = {};
    let ratingSum = 0;

    for (let j = 0; j < chosenTemplates.length; j++) {
      const template = chosenTemplates[j];
      const reviewer = shuffledCustomers[j % shuffledCustomers.length];
      const rating = pick(template.ratings);
      const { sentiment, keywords } = analyzeReview(template.text);

      await Review.create({
        business: business._id,
        user: reviewer._id,
        rating,
        text: template.text,
        sentiment,
        keywords,
      });

      sentimentSummary[sentiment.label]++;
      ratingSum += rating;
      keywords.forEach((k) => (keywordFreq[k] = (keywordFreq[k] || 0) + 1));
      createdCount++;
    }

    const topKeywords = Object.entries(keywordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([w]) => w);

    await Business.findByIdAndUpdate(business._id, {
      avgRating: Number((ratingSum / chosenTemplates.length).toFixed(2)),
      reviewCount: chosenTemplates.length,
      sentimentSummary,
      topKeywords,
    });
  }

  console.log(
    `Seed complete: ${BUSINESSES.length} businesses across ${new Set(BUSINESSES.map((b) => b.category)).size} categories, ${createdCount} reviews.`,
  );
  console.log("---");
  console.log("Admin login    -> admin@feedbacknepal.com / password123");
  console.log(
    "Owner logins   -> owner1@feedbacknepal.com / owner2@feedbacknepal.com / owner3@feedbacknepal.com (password123)",
  );
  console.log(
    "Customer login -> customer1@feedbacknepal.com / password123 (up to customer15@...)",
  );

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
