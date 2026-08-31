# Feedback Nepal — AI Customer Feedback Analyzer

A MERN-stack hackathon project. Users browse any listed business and leave a
review; every review is automatically run through a lightweight, offline
sentiment + keyword engine so business owners get a live "AI insights"
dashboard — average rating, positive/neutral/negative split, trending
keywords, and rating distribution — with zero external API keys required.

## Tech stack
- MongoDB
- Express
- React.js
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
  the seed script


## API overview
| Method | Route | Description |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Log in |
| GET | /api/businesses | List/search businesses |
| GET | /api/businesses/categories | Distinct categories |
| GET | /api/businesses/:id | Business detail |
| POST | /api/businesses | Create business (auth) |
| DELETE | /api/businesses/:id | Delete business (owner only) |
| GET | /api/businesses/mine | Businesses owned by the logged-in user (auth) |
| GET | /api/reviews/business/:businessId | Reviews for a business |
| POST | /api/reviews | Submit review (auth, runs AI analysis) |
| DELETE | /api/reviews/:id | Delete own review, or a review on a business you own (auth) |
| POST | /api/reviews/:id/reply | Owner replies publicly to a review (auth, owner only) |
| GET | /api/reviews/owner | All reviews across the logged-in owner's businesses (auth) |
| GET | /api/reviews/owner/export | CSV export of the owner's reviews (auth) |
| GET | /api/analytics/:businessId | Full AI dashboard payload |
| GET | /api/admin/stats | Platform-wide statistics (auth, admin only) |

## Notes for judges / demo tips
- Seed the database first (`npm run seed`) for an instant, populated demo.
- Submit a very positive and a very negative review live to show the
  sentiment badge and dashboard numbers update in real time.
- The logo and palette (deep indigo + marigold) are original, custom-built
  for this brief — no external image assets used.

