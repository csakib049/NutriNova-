# Nutrinova

AI-Assisted Diet Tracker & Meal Planner — a full-stack MERN application.

🔗 **Live Demo:** [https://nutrinova-frontend.onrender.com/](https://nutrinova-frontend.onrender.com/)

## Tech Stack

- **Frontend:** React (Vite), React Router, Axios, Recharts, Tailwind CSS
- **Backend:** Node.js + Express.js (REST API)
- **Database:** MongoDB with Mongoose ODM
- **Auth:** JWT + bcrypt
- **AI:** Rule-based nutrition engine with optional LLM API integration

## Features

- JWT-based authentication (signup/login)
- BMI calculator with WHO category classification and history
- Personalized diet/meal plan generator (BMR → TDEE → macros → weekly plan)
- Weekly health check-ins with trend analysis (improved/worsened/stable)
- Daily meal/food logging with macro tracking
- Progress charts (weight, BMI, glucose over time; daily calorie intake)
- Water intake tracker
- Streak tracker for consistent logging
- AI diet assistant panel (natural-language Q&A)
- Export weekly report as CSV
- Goal setting with estimated timeline
- Searchable food database with 50+ seeded items
- Responsive UI (mobile + desktop)

## Project Structure

```
Nutrinova/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── api/         # Axios instance
│       ├── components/  # Navbar, ProtectedRoute
│       ├── context/     # AuthContext
│       └── pages/       # All page components
├── server/          # Express backend
│   └── src/
│       ├── config/      # MongoDB connection
│       ├── middleware/   # Auth, error handler
│       ├── models/      # Mongoose schemas
│       ├── routes/      # API routes
│       ├── utils/       # Nutrition engine, meal planner
│       └── validators/  # Express-validator rules
├── .env.example
├── package.json     # (optional monorepo scripts)
└── README.md
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas URI)

### 1. Clone and install dependencies

```bash
# Backend
cd server
cp .env.example .env   # Edit .env with your MongoDB URI and JWT secret
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure environment variables (`server/.env`)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nutrinova
JWT_SECRET=your_jwt_secret_key_change_me
JWT_EXPIRES_IN=7d
AI_API_KEY=your_llm_api_key_optional
AI_API_URL=https://api.openai.com/v1/chat/completions
```

### 3. Seed the food database

```bash
cd server
npm run seed
```

This populates 50+ food items with realistic calorie/macro data.

### 4. Start the app

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API requests to `http://localhost:5000`.

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | No | Register |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/users/me` | Yes | Get profile |
| PUT | `/api/users/me` | Yes | Update profile |
| POST | `/api/bmi` | Yes | Calculate BMI |
| GET | `/api/bmi/history` | Yes | BMI history |
| GET | `/api/bmi/latest` | Yes | Latest BMI |
| POST | `/api/meal-plan/generate` | Yes | Generate meal plan |
| GET | `/api/meal-plan/current` | Yes | Get current plan |
| POST | `/api/checkins/weekly` | Yes | Weekly check-in |
| GET | `/api/checkins/history` | Yes | Check-in history |
| GET | `/api/checkins/trend` | Yes | Latest trend |
| POST | `/api/food-logs` | Yes | Log a meal |
| GET | `/api/food-logs/daily` | Yes | Daily summary |
| GET | `/api/food-logs/weekly` | Yes | Weekly summary |
| GET | `/api/foods/search` | Yes | Search foods |
| POST | `/api/foods` | Yes | Add food (admin) |
| GET | `/api/foods/:id` | Yes | Get food detail |
| POST | `/api/ai/ask` | Yes | AI diet question |
| POST | `/api/water` | Yes | Log water |
| GET | `/api/water/today` | Yes | Today's water |
| GET | `/api/water/history` | Yes | Water history |
| GET | `/api/export/report/csv` | Yes | Download CSV report |
| GET | `/api/health` | No | Health check |

## Data Models

- **User** — name, email, password (hashed), age, gender, height, weight, activityLevel, hasDiabetes, goal, targetWeight
- **BMIRecord** — userId, bmi, weight, height, category, date
- **WeeklyCheckIn** — userId, weekStartDate, weight, bmi, glucose, diabetesStatus, notes, trend
- **MealPlan** — userId, weekStartDate, dailyPlans[], targetCalories, targetMacros
- **FoodItem** — name, calories, protein, carbs, fat, servingSize, glycemicIndex, category, isLowGlycemic
- **FoodLog** — userId, date, mealType, foodItems[], totalCalories, totalMacros
- **WaterLog** — userId, date, amountMl
