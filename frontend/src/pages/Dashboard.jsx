import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, CircleGauge, LucideWeight, Droplet, Calculator, ClipboardList, ForkKnife, CalendarCheck, Activity, LucideTv } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ExerciseSection from '../components/ExerciseSection';
import api from '../api/axios';
import { useAnimVariants } from '../lib/motion';
import { useCountUp } from '../lib/useCountUp';

const MotionLink = motion(Link);

const VIDEOS = [
  { id: '9Z7xGweBUd8', title: '7-Day Indian Diet Plan to Lose Weight Fast' },
  { id: 'TlX0IkveNnY', title: 'High Protein Anti-inflammatory Diet Plan' },
  { id: 'qOFAyv9Appg', title: 'Weight Loss Breakfast Ideas (Dr Tasnim Jara)' },
  { id: 'vN25AxvLb0k', title: 'Diet Plan for Weight Loss & Thyroid' },
];

function VideoEmbed({ id, title }) {
  return (
    <div>
      <div className="aspect-video rounded-lg overflow-hidden">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`}
          title={title}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
        ></iframe>
      </div>
      <div className="flex items-center justify-between gap-2 mt-1">
        <p className="text-sm text-muted">{title}</p>
        <a
          href={`https://www.youtube.com/watch?v=${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-brand hover:underline whitespace-nowrap"
        >
          Watch on YouTube
        </a>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [todayLogs, setTodayLogs] = useState(null);
  const [latestBMI, setLatestBMI] = useState(null);
  const [trend, setTrend] = useState(null);
  const [water, setWater] = useState(null);
  const [loading, setLoading] = useState(true);
  const { fadeUp, staggerContainer } = useAnimVariants();

  const countCalories = useCountUp(todayLogs?.summary?.calories || 0);
  const countBmi = useCountUp(latestBMI?.bmi || 0, { decimals: 1 });
  const countWeight = useCountUp(trend?.latest?.weight || user?.weight || 0, { decimals: 1 });
  const countWater = useCountUp((water?.totalMl || 0) / 1000, { decimals: 1 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsRes, bmiRes, trendRes, waterRes] = await Promise.all([
          api.get('/food-logs/daily'),
          api.get('/bmi/latest'),
          api.get('/checkins/trend'),
          api.get('/water/today'),
        ]);
        setTodayLogs(logsRes.data);
        setLatestBMI(bmiRes.data.record);
        setTrend(trendRes.data);
        setWater(waterRes.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-brand mb-6">Dashboard</h1>

      <motion.div
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp} className="bg-surface p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-4 w-4 text-brand" />
            <h3 className="text-muted text-sm uppercase">Today's Calories</h3>
          </div>
          <p className="text-3xl font-bold mt-1">{countCalories}</p>
          <p className="text-muted text-sm">protein: {todayLogs?.summary?.protein || 0}g · carbs: {todayLogs?.summary?.carbs || 0}g · fat: {todayLogs?.summary?.fat || 0}g</p>
        </motion.div>
        <motion.div variants={fadeUp} className="bg-surface p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <CircleGauge className="h-4 w-4 text-brand" />
            <h3 className="text-muted text-sm uppercase">Current BMI</h3>          </div>
          <p className="text-3xl font-bold mt-1">{latestBMI?.bmi ? countBmi : 'N/A'}</p>
          <p className="text-muted text-sm capitalize">{latestBMI?.category || 'Not calculated'}</p>
        </motion.div>
        <motion.div variants={fadeUp} className="bg-surface p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <LucideWeight className="h-4 w-4 text-brand" />
            <h3 className="text-muted text-sm uppercase">Latest Weight</h3>
          </div>
          <p className="text-3xl font-bold mt-1">{countWeight} kg</p>
          <p className={`text-sm ${trend?.trend?.weight === 'improved' ? 'text-success' : trend?.trend?.weight === 'worsened' ? 'text-danger' : 'text-neutral'}`}>
            {trend?.trend?.weight === 'improved' ? '↓ Trending down' : trend?.trend?.weight === 'worsened' ? '↑ Trending up' : 'Stable'}
          </p>
        </motion.div>
        <motion.div variants={fadeUp} className="bg-surface p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Droplet className="h-4 w-4 text-brand" />
            <h3 className="text-muted text-sm uppercase">Water Today</h3>
          </div>
          <p className="text-3xl font-bold mt-1">{countWater}L</p>
          <p className="text-muted text-sm">{water?.count || 0} glasses</p>
        </motion.div>
      </motion.div>

      {!user?.height && (
        <div className="bg-warning-bg border border-warning-bg p-4 rounded-lg mb-8">
          <p className="text-warning-text">Complete your <Link to="/profile" className="underline font-semibold">profile</Link> to get a personalized meal plan.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-surface p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <MotionLink to="/bmi" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="bg-brand-soft p-3 rounded-lg text-center hover:bg-border transition-colors duration-200">
              <Calculator className="h-5 w-5 mx-auto mb-1 text-brand" />
              Calculate BMI
            </MotionLink>
            <MotionLink to="/meal-plan" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="bg-brand-soft p-3 rounded-lg text-center hover:bg-border transition-colors duration-200">
              <ClipboardList className="h-5 w-5 mx-auto mb-1 text-brand" />
              View Meal Plan
            </MotionLink>
            <MotionLink to="/log-meal" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="bg-brand-soft p-3 rounded-lg text-center hover:bg-border transition-colors duration-200">
              <ForkKnife className="h-5 w-5 mx-auto mb-1 text-brand" />
              Log a Meal
            </MotionLink>
            <MotionLink to="/checkin" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="bg-brand-soft p-3 rounded-lg text-center hover:bg-border transition-colors duration-200">
              <CalendarCheck className="h-5 w-5 mx-auto mb-1 text-brand" />
              Weekly Check-In
            </MotionLink>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Latest Glucose</h2>
          </div>
          <p className="text-3xl font-bold">{trend?.latest?.glucose || 'N/A'} <span className="text-lg font-normal text-muted">mg/dL</span></p>
          <p className={`text-sm mt-1 ${trend?.trend?.glucose === 'improved' ? 'text-success' : trend?.trend?.glucose === 'worsened' ? 'text-danger' : 'text-neutral'}`}>
            {trend?.trend?.glucose === 'improved' ? '↓ Improving' : trend?.trend?.glucose === 'worsened' ? '↑ Rising' : 'Stable'}
          </p>
        </div>
      </div>

      <div className="bg-surface p-6 rounded-xl shadow-md mt-8">
        <div className="flex items-center gap-2 mb-4">
          <LucideTv className="h-5 w-5 text-brand" />
          <h2 className="text-xl font-semibold">Diet Videos </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {VIDEOS.map((video) => (
            <VideoEmbed key={video.id} id={video.id} title={video.title} />
          ))}
        </div>
      </div>

      <ExerciseSection />
    </div>
  );
}
