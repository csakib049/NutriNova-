import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useAnimVariants } from '../lib/motion';

export default function Landing() {
  const { user } = useAuth();
  const reduce = useReducedMotion();
  const { fadeUp, staggerContainer } = useAnimVariants();
  const cardHover = reduce ? undefined : { y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.12)' };

  if (user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold text-brand mb-4">Welcome back, {user.name}!</h1>
        <p className="text-xl text-muted mb-8">Track your nutrition journey with Nutrinova.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/dashboard" className="bg-brand text-brand-contrast px-6 py-3 rounded-lg hover:bg-brand-hover">Go to Dashboard</Link>
          <Link to="/log-meal" className="bg-surface-alt text-foreground px-6 py-3 rounded-lg hover:bg-border">Log a Meal</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <motion.div
        className="text-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 variants={fadeUp} className="flex items-center justify-center gap-3 text-5xl font-bold text-brand mb-6">
          <img src="/nutrinova-logo.png" alt="Nutrinova logo" className="h-16 w-16 rounded-full object-cover" />
          Nutrinova
        </motion.h1>
        <motion.p variants={fadeUp} className="text-2xl text-muted mb-4">AI-Powered Diet Tracking & Meal Planning</motion.p>
        <motion.p variants={fadeUp} className="text-lg text-muted mb-10 max-w-2xl mx-auto">
          Calculate your BMI, get personalized meal plans, track your daily nutrition,
          monitor your health trends, and achieve your wellness goals.
        </motion.p>
        <motion.div variants={fadeUp} className="flex gap-4 justify-center">
          <Link to="/signup" className="bg-brand text-brand-contrast px-8 py-3 rounded-lg text-lg hover:bg-brand-hover">Get Started Free</Link>
          <Link to="/login" className="bg-surface-alt text-foreground px-8 py-3 rounded-lg text-lg hover:bg-border">Login</Link>
        </motion.div>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-8 mt-20">
        <motion.div
          variants={fadeUp}
          whileHover={cardHover}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="p-6 bg-surface rounded-xl shadow-md"
        >
          <div className="text-3xl mb-3">📊</div>
          <h3 className="text-xl font-semibold mb-2">BMI & Health Tracking</h3>
          <p className="text-muted">Calculate BMI, track weekly progress with visual charts for weight, BMI, and glucose.</p>
        </motion.div>
        <motion.div
          variants={fadeUp}
          whileHover={cardHover}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="p-6 bg-surface rounded-xl shadow-md"
        >
          <div className="text-3xl mb-3">🥗</div>
          <h3 className="text-xl font-semibold mb-2">Personalized Meal Plans</h3>
          <p className="text-muted">AI-generated weekly meal plans tailored to your goals, diabetes status, and activity level.</p>
        </motion.div>
        <motion.div
          variants={fadeUp}
          whileHover={cardHover}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="p-6 bg-surface rounded-xl shadow-md"
        >
          <div className="text-3xl mb-3">🤖</div>
          <h3 className="text-xl font-semibold mb-2">AI Diet Assistant</h3>
          <p className="text-muted">Ask natural-language questions about diet, nutrition, and get personalized advice.</p>
        </motion.div>
      </div>
    </div>
  );
}
