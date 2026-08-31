# 🇳🇵 Feedback Nepal — AI Customer Feedback Analyzer

**Feedback Nepal** is a MERN-stack platform that helps businesses understand customer feedback using a lightweight, offline **AI sentiment & keyword analyzer**.

Businesses get live insights such as **average rating, sentiment breakdown, rating distribution, and trending keywords** — with **no external API keys required**.

## Tech Stack

* **MongoDB + Mongoose** — Database
* **Express.js + Node.js** — Backend API
* **React + React Router** — Frontend
* **Custom NLP Engine** — Sentiment analysis & keyword extraction

## Key Features

### Customers

* Browse and search businesses
* Filter by name, category, or city
* Give star ratings and written reviews
* View AI-generated insights

### Business Owners

* Add and manage businesses
* View all customer reviews
* Reply to reviews publicly
* Remove inappropriate reviews
* View AI analytics dashboard
* Export reviews as CSV

### Admin

* Platform-wide dashboard
* Total businesses, customers, owners & feedback
* Overall sentiment analysis
* Category statistics
* Business-wise review and rating analytics

## AI Analyzer

When a review is submitted, the system automatically:

1. Analyzes the review text
2. Calculates sentiment using a weighted lexicon
3. Handles basic negation such as **"not good"**
4. Classifies it as **Positive, Neutral, or Negative**
5. Extracts important keywords
6. Updates business analytics instantly

The analyzer is **offline, explainable, fast, and free**, making it ideal for a hackathon MVP.

## Quick Setup

### Backend

```bash
cd backend
npm install
npm run seed
npm run dev
```

Runs on:

```text
http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Runs on:

```text
http://localhost:3001
```

## Demo

**Demo password:** `password123`

* Admin: `admin@feedbacknepal.com`
* Owners: `owner1@feedbacknepal.com`, `owner2@feedbacknepal.com`, `owner3@feedbacknepal.com`
* Customers: `customer1@feedbacknepal.com` → `customer15@feedbacknepal.com`

## API Highlights

| Method | Endpoint                    | Purpose                 |
| ------ | --------------------------- | ----------------------- |
| POST   | `/api/auth/register`        | Register                |
| POST   | `/api/auth/login`           | Login                   |
| GET    | `/api/businesses`           | Browse businesses       |
| POST   | `/api/businesses`           | Add business            |
| GET    | `/api/reviews/business/:id` | Get reviews             |
| POST   | `/api/reviews`              | Submit & analyze review |
| POST   | `/api/reviews/:id/reply`    | Owner reply             |
| GET    | `/api/analytics/:id`        | AI insights             |
| GET    | `/api/admin/stats`          | Admin analytics         |

## Google Reviews

Feedback Nepal **does not scrape Google Reviews**. The project uses realistic seeded demo reviews to avoid Google's Terms of Service and external API dependencies.

For real Google data, the future integration path is the **official Google Places API**.

## Hackathon Demo

**Best demo flow:**

> Browse Business → Submit Positive/Negative Review → AI Sentiment Analysis → Live Dashboard Update → View Trending Keywords & Rating Statistics

### Core Idea

**Turn customer reviews into actionable business insights.**

Feedback Nepal helps business owners quickly understand **what customers love, what they dislike, and where the business can improve.**
