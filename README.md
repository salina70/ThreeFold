<<<<<<< HEAD
# Feedback Nepal — AI Customer Feedback Analyzer

A MERN-stack hackathon project. Users browse any listed business and leave a
review; every review is automatically run through a lightweight, offline
sentiment + keyword engine so business owners get a live "AI insights"
dashboard — average rating, positive/neutral/negative split, trending
keywords, and rating distribution — with zero external API keys required.

## Tech stack
- MongoDB
- Express
- React
- Node.js

## Project structure

feedback-nepal/
  backend/          Express API, MongoDB models, AI analysis engine
  frontend/         React app 
  README.md

## Prerequisites
- Node.js 18+
- MongoDB running locally (MongoDB Compass)

## 1. Backend setup
```bash
cd backend
cp .env      # edit MONGO_URI / JWT_SECRET if needed
npm install
npm run seed               # optional: loads 4 demo businesses + reviews
npm run dev                 # starts API on http://localhost:5000
```

Demo accounts created by `npm run seed` (all use password `password123`):
- **Admin**: `admin@feedbacknepal.com`
- **Owners** (each owns ~10 of the 30 seeded businesses): `owner1@feedbacknepal.com`, `owner2@feedbacknepal.com`, `owner3@feedbacknepal.com`
- **Customers**: `customer1@feedbacknepal.com` through `customer15@feedbacknepal.com`

## 2. Frontend setup
```bash
cd frontend
npm install
npm start                   # starts React app on http://localhost:3002
```

By default the frontend calls `http://localhost:5000/api`. To change that,
```
REACT_APP_API_URL=http://localhost:5000/api
```

## How the "AI" analyzer works
Every time a review is submitted (`POST /api/reviews`), the backend:
1. Tokenizes the review text.
2. Scores it against a weighted sentiment lexicon (with basic negation
   handling, e.g. "not good" flips polarity).
3. Classifies it as positive / neutral / negative.
4. Extracts top keywords (stopwords removed, sentiment words boosted).
5. Recomputes the business's aggregate stats (average rating, sentiment
   split, top keywords) so the dashboard stays live.

This design was chosen deliberately for a hackathon: it's fully explainable,
runs offline/instantly, and has zero API cost or key management. If you want
to swap in a real LLM (OpenAI, Claude, etc.) later, replace the body of
`analyzeReview()` in `backend/utils/sentiment.js` — the rest of the app
doesn't need to change.

## Core user flows
- **Anyone**: browse/search businesses by name, category, or city.
- **Signed-in customer**: leave a star rating + written review for any
  business.
- **Signed-in owner**: list a new business, manage it from the **Owner
  panel**, reply publicly to reviews, remove a review, and export a CSV
  report.
- **Admin**: open the **Admin panel** for a platform-wide view — total
  organizations, total customers, total feedback, sentiment split across the
  whole platform, and a full table of every business with its own review
  count, unique-customer count, and sentiment mix.
- **Anyone signed in**: open a business's "AI insights" dashboard (linked
  from the business page or the owner panel) to see sentiment breakdown,
  rating distribution, trending keywords, and a sentiment trend of the most
  recent reviews.

### Owner panel (`/owner-panel`, owner accounts only)
- List of every business you own, with a quick rating snapshot and a link
  into its full AI dashboard.
- Every review across all your businesses in one feed.
- Reply publicly to a review (shown on the business's public page).
- Remove an inappropriate review from your business.
- Export a CSV report of all your reviews (business, customer, rating,
  sentiment, text, keywords, your reply, date) for offline reporting.

### Admin panel (`/admin`, admin accounts only)
- KPI cards: total organizations, registered customers, business owners,
  total feedback submitted, and customers who've actually left a review.
- Platform-wide sentiment split and a breakdown of organizations by
  category.
- A sortable table of every organization with its review count, unique
  customer count, average rating, and sentiment mix.
- There's no self-registration path to the admin role — create one through
  the seed script or directly in MongoDB by setting a user's `role` to
  `"admin"`.

### A note on "Google reviews" data
This project does **not** scrape Google Reviews. Scraping Google's review
data programmatically violates Google's Terms of Service, and Google's own
review content isn't something Feedback Nepal has rights to redistribute.
Instead, `npm run seed` generates realistic, hand-authored demo data across
**30 business categories** (cafes, restaurants, clinics, gyms, guest houses,
trekking agencies, and more) with varied ratings, sentiment, and reviewer
names, so the admin and owner panels are fully populated for a demo without
depending on any external, ToS-restricted data source. If you later want
real reviews, the legitimate path is Google's official **Places API**
(paid, requires an API key and attribution), which is a drop-in data source
you could wire into the `Business` model without changing the AI analysis
pipeline.
