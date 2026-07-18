const express = require('express');
const auth = require('../middleware/auth');
const WeeklyCheckIn = require('../models/WeeklyCheckIn');
const FoodLog = require('../models/FoodLog');

const router = express.Router();

router.post('/ask', auth, async (req, res, next) => {
  try {
    const { question } = req.body;
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const user = req.user;

    const recentCheckIn = await WeeklyCheckIn.findOne({ userId: user._id }).sort({ weekStartDate: -1 }).lean();

    const todayFoodLogs = await FoodLog.find({
      userId: user._id,
      date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    }).lean();

    const todayCalories = todayFoodLogs.reduce((s, l) => s + l.totalCalories, 0);

    const context = {
      user: {
        name: user.name,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        activityLevel: user.activityLevel,
        hasDiabetes: user.hasDiabetes,
        goal: user.goal,
      },
      recentCheckIn: recentCheckIn ? {
        weight: recentCheckIn.weight,
        bmi: recentCheckIn.bmi,
        glucose: recentCheckIn.glucose,
        weekStartDate: recentCheckIn.weekStartDate,
      } : null,
      todayCalories,
    };

    const apiKey = process.env.AI_API_KEY;
    const apiUrl = process.env.AI_API_URL;

    if (!apiKey) {
      return res.json({
        answer: generateLocalAnswer(question, context),
        source: 'rule-based',
      });
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a helpful dietitian assistant. The user has the following profile: ${JSON.stringify(context.user)}. Their recent glucose was ${context.recentCheckIn?.glucose || 'unknown'}. They've consumed ${context.todayCalories} calories today. Provide concise, practical diet advice.`,
            },
            { role: 'user', content: question },
          ],
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      return res.json({ answer: data.choices?.[0]?.message?.content || 'No response from AI', source: 'ai' });
    } catch {
      return res.json({ answer: generateLocalAnswer(question, context), source: 'rule-based' });
    }
  } catch (error) {
    next(error);
  }
});

function generateLocalAnswer(question, context) {
  const q = question.toLowerCase();
  const { user, recentCheckIn, todayCalories } = context;

  if (q.includes('glucose') || q.includes('blood sugar') || q.includes('diabetic')) {
    if (user.hasDiabetes) {
      return 'Since you have diabetes, focus on low-glycemic foods like leafy greens, whole grains, lean proteins, and healthy fats. Avoid sugary drinks and refined carbs. Consider eating smaller, more frequent meals to keep blood sugar stable.';
    }
    return 'Maintain a balanced diet with moderate carbohydrate intake. Include fiber-rich foods to help regulate blood sugar levels.';
  }

  if (q.includes('calorie') || q.includes('eat today') || q.includes('how much')) {
    return `You've consumed ${todayCalories} calories today so far. Based on your profile, aim for a balanced intake. Consider including lean protein, vegetables, and complex carbs in your next meal.`;
  }

  if (q.includes('weight loss') || q.includes('lose weight')) {
    if (user.goal === 'lose') {
      return 'Great that you are focused on weight loss! Ensure a calorie deficit of 300-500 calories below your TDEE. Prioritize protein to preserve muscle, include plenty of vegetables, and stay hydrated. Aim for 0.5-1 kg loss per week for sustainable results.';
    }
    return 'To lose weight, focus on creating a moderate calorie deficit. Include protein-rich foods, plenty of fiber, and stay active. Consider setting your goal to "lose" in your profile for a personalized meal plan.';
  }

  if (q.includes('meal') || q.includes('eat') || q.includes('food')) {
    if (user.hasDiabetes) {
      return 'For diabetes-friendly meals: choose whole grains over refined, include lean protein (chicken, fish, tofu), load up on non-starchy vegetables, and use healthy fats like olive oil. Avoid sugary sauces and drinks.';
    }
    return 'For balanced meals: fill half your plate with vegetables, a quarter with lean protein, and a quarter with complex carbs. Include healthy fats and stay hydrated.';
  }

  return 'I am your Nutrinova diet assistant. Ask me about meal suggestions, calorie tracking, glucose management, or weight goals. I can provide personalized advice based on your health profile.';
}

module.exports = router;
