# ⚙️ WanderAI Server-Side (Backend)

This is the backend server for **WanderAI**, responsible for handling AI processing, user authentication data, and managing trip records in the database.

---

## 🚀 Technical Features

* **RESTful API:** Robust and scalable API built with Node.js and Express.js.
* **AI Integration:** Powered by **Vercel AI SDK** to generate smart travel itineraries.
- **Database:** **MongoDB** with **Mongoose** for efficient data modeling and storage.
- **Security:** Implemented CORS and environment variable protection for sensitive API keys.
- **Trip Management:** Endpoints for saving, retrieving, and deleting travel plans.

---

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **AI Tooling:** Vercel AI SDK / OpenAI API

---

## 📂 API Endpoints (Quick Look)

- `POST /api/generate-itinerary` - Generates a new AI travel plan.
- `GET /api/trips/:userId` - Fetches all saved trips for a specific user.
- `POST /api/save-trip` - Saves a generated trip to the database.

---

## 🚀 Local Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/pijush512/WanderAI-Server-Site.git](https://github.com/pijush512/WanderAI-Server-Site.git)