const express = require('express');
const auth = require('../middleware/auth');
const WeeklyCheckIn = require('../models/WeeklyCheckIn');
const FoodLog = require('../models/FoodLog');
const { askGemini } = require('../utils/geminiClient');

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

    const systemPrompt = `You are a helpful dietitian assistant. The user has the following profile: ${JSON.stringify(context.user)}. Their recent glucose was ${context.recentCheckIn?.glucose || 'unknown'}. They've consumed ${context.todayCalories} calories today. Provide concise, practical diet advice.`;

    try {
      const geminiAnswer = await askGemini(systemPrompt, question);
      if (geminiAnswer) {
        return res.json({ answer: geminiAnswer, source: 'gemini' });
      }
      console.warn('[Gemini] No answer returned, falling back');
    } catch (err) {
      console.error(`[Gemini] Request error: ${err.message}, falling back`);
    }

    const apiKey = process.env.AI_API_KEY;
    const apiUrl = process.env.AI_API_URL;

    console.log(`[AI API] env -> url=${apiUrl || '(undefined/empty)'} key=${maskApiKey(apiKey)}`);

    if (!apiKey || !apiUrl) {
      console.warn('[AI API] AI_API_KEY and/or AI_API_URL is missing; falling back to rule-based answer');
      return res.json({
        answer: generateLocalAnswer(question, context),
        source: 'rule-based',
      });
    }

    const request = buildRequest(apiUrl, apiKey, context, question);
    console.log(`[AI API] detected provider/model: ${request.provider}/${request.model}`);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: request.headers,
        body: JSON.stringify(request.body),
      });

      if (!response.ok) {
        let responseBody = '';
        try {
          responseBody = await response.text();
        } catch (readErr) {
          // ignore body read errors, we still log status below
        }
        console.error(
          `[AI API] Request failed: HTTP ${response.status} ${response.statusText} -> ${responseBody.slice(0, 2000)}`
        );
        return res.json({ answer: generateLocalAnswer(question, context), source: 'rule-based' });
      }

      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content;
      if (!answer) {
        console.error('[AI API] Unexpected success response shape, no choices[0].message.content:', JSON.stringify(data));
        return res.json({ answer: 'No response from AI', source: 'ai' });
      }
      return res.json({ answer, source: 'ai' });
    } catch (err) {
      console.error(`[AI API] Network/request error: ${err.message}`);
      return res.json({ answer: generateLocalAnswer(question, context), source: 'rule-based' });
    }
  } catch (error) {
    next(error);
  }
});

function maskApiKey(key) {
  if (!key) return '(undefined/empty)';
  if (key.length <= 8) return '***';
  return `${key.slice(0, 4)}...${key.slice(-4)} (${key.length} chars)`;
}

function buildRequest(apiUrl, apiKey, context, question) {
  const url = apiUrl.toLowerCase();
  const messages = [
    {
      role: 'system',
      content: `You are a helpful dietitian assistant. The user has the following profile: ${JSON.stringify(context.user)}. Their recent glucose was ${context.recentCheckIn?.glucose || 'unknown'}. They've consumed ${context.todayCalories} calories today. Provide concise, practical diet advice.`,
    },
    { role: 'user', content: question },
  ];

  // Azure OpenAI uses a different auth scheme (api-key header) and puts the
  // deployment/model name in the URL, not the body.
  if (url.includes('openai.azure.com')) {
    return {
      provider: 'azure-openai',
      model: '(in URL)',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: { messages, max_tokens: 500 },
    };
  }

  // OpenAI-compatible providers
  let provider = 'openai-compatible';
  let model = 'gpt-3.5-turbo';

  if (url.includes('api.groq.com')) {
    provider = 'groq';
    model = 'llama-3.3-70b-versatile';
  } else if (url.includes('openrouter.ai')) {
    provider = 'openrouter';
    model = 'openai/gpt-4o-mini';
  } else if (url.includes('api.together.xyz')) {
    provider = 'together';
    model = 'meta-llama/Llama-3.3-70B-Instruct-Turbo';
  } else if (url.includes('ollama')) {
    provider = 'ollama';
    model = 'llama3.2';
  } else if (url.includes('localhost') || url.includes('127.0.0.1')) {
    provider = 'lm-studio';
    model = '';
  } else if (url.includes('api.openai.com')) {
    provider = 'openai';
    model = 'gpt-3.5-turbo';
  }

  return {
    provider,
    model: model || '(unset - use a loaded model name)',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: { model, messages, max_tokens: 500 },
  };
}

function generateLocalAnswer(question, context) {
  const q = question.toLowerCase();
  const { user, recentCheckIn, todayCalories } = context;

  if (q.includes('glucose') || q.includes('blood sugar') || q.includes('diabetic')) {
    if (user.hasDiabetes) {
      return 'Since you have diabetes, focus on low-glycemic foods like leafy greens, whole grains, lean proteins, and healthy fats. Avoid sugary drinks and refined carbs. Consider eating smaller, more frequent meals to keep blood sugar stable.';
    }
    return 'Certain plant-based and high-fiber foods, healthy fats, and proteins help stabilize and lower blood sugar naturally by slowing digestion and improving insulin sensitivity.';
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

  if (q.includes('snack') || q.includes('snacks')) {
    if (user.hasDiabetes) {
      return 'Healthy snack idea for stable blood sugar: a handful of almonds with a small apple, plain Greek yogurt with cinnamon, or hummus with cucumber and carrot sticks. Avoid sugary granola bars, large amounts of dried fruit, and fruit juices.';
    }
    if (user.goal === 'lose') {
      return 'Healthy snack idea for weight loss: cottage cheese with berries, a boiled egg with veggie sticks, an apple with one spoonful of peanut butter, or roasted chickpeas. Keep portions reasonable and prioritize protein and fiber.';
    }
    if (user.goal === 'gain') {
      return 'Healthy snack idea for gaining: a banana with peanut butter on whole-grain toast, Greek yogurt topped with granola and honey, or a protein shake blended with milk and oats. Pair carbohydrates with protein to add calories.';
    }
    return 'Healthy snack idea: a medium apple with a spoonful of peanut butter, Greek yogurt with berries, a small handful of mixed nuts, or carrots and hummus. Aim for a balance of protein, fiber, and healthy fats to keep you full.';
  }

  return 'I am your Nutrinova diet assistant. Ask me about meal suggestions, calorie tracking, glucose management, or weight goals. I can provide personalized advice based on your health profile.';
}

module.exports = router;
