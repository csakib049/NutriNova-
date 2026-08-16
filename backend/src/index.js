require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const bmiRoutes = require('./routes/bmi');
const mealPlanRoutes = require('./routes/mealPlan');
const checkInRoutes = require('./routes/checkins');
const foodLogRoutes = require('./routes/foodLogs');
const foodRoutes = require('./routes/foods');
const aiRoutes = require('./routes/ai');
const waterRoutes = require('./routes/water');
const exportRoutes = require('./routes/export');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));



app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bmi', bmiRoutes);
app.use('/api/meal-plan', mealPlanRoutes);
app.use('/api/checkins', checkInRoutes);
app.use('/api/food-logs', foodLogRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/export', exportRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('NutriNova API is running!');
});

app.use(errorHandler);

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Nutrinova server running on port ${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\nPort ${PORT} is already in use.`);
      console.error(`Find the process using it: lsof -i :${PORT}`);
      console.error('Then either kill it ("kill <pid>") or change PORT in the .env file, and restart.');
      process.exit(1);
    }
    console.error('Server error:', err);
    process.exit(1);
  });
});
