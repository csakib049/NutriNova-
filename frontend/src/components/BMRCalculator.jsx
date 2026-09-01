import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Flame } from 'lucide-react';

function calculateBMR(sex, weight, height, age) {
  const bmr = 10 * weight + 6.25 * height - 5 * age;
  return sex === 'male' ? bmr + 5 : bmr - 161;
}

export default function BMRCalculator({ embedded = false }) {
  const [sex, setSex] = useState('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const reduce = useReducedMotion();

  const handleCalculate = (e) => {
    e.preventDefault();
    setError('');

    const ageNum = Number(age);
    const heightNum = Number(height);
    const weightNum = Number(weight);

    if (!ageNum || ageNum < 10 || ageNum > 120) {
      setError('Please enter a valid age (10–120 years).');
      return;
    }
    if (!heightNum || heightNum < 50 || heightNum > 300) {
      setError('Please enter a valid height (50–300 cm).');
      return;
    }
    if (!weightNum || weightNum < 10 || weightNum > 500) {
      setError('Please enter a valid weight (10–500 kg).');
      return;
    }

    setResult(calculateBMR(sex, weightNum, heightNum, ageNum));
  };

  const formContent = (
    <>
      <form onSubmit={handleCalculate} className="space-y-4">
        <div>
          <label className="block text-muted mb-1">Sex</label>
          <div className="flex rounded-lg border overflow-hidden">
            <button
              type="button"
              onClick={() => setSex('male')}
              className={`flex-1 p-3 text-sm font-medium transition-colors ${
                sex === 'male'
                  ? 'bg-brand text-brand-contrast'
                  : 'bg-surface text-muted hover:bg-background'
              }`}
              aria-pressed={sex === 'male'}
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => setSex('female')}
              className={`flex-1 p-3 text-sm font-medium transition-colors ${
                sex === 'female'
                  ? 'bg-brand text-brand-contrast'
                  : 'bg-surface text-muted hover:bg-background'
              }`}
              aria-pressed={sex === 'female'}
            >
              Female
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="bmr-age" className="block text-muted mb-1">Age (years)</label>
          <input
            id="bmr-age"
            type="number"
            min="10"
            max="120"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-ring outline-none"
          />
        </div>

        <div>
          <label htmlFor="bmr-height" className="block text-muted mb-1">Height (cm)</label>
          <input
            id="bmr-height"
            type="number"
            step="0.1"
            min="50"
            max="300"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-ring outline-none"
          />
        </div>

        <div>
          <label htmlFor="bmr-weight" className="block text-muted mb-1">Weight (kg)</label>
          <input
            id="bmr-weight"
            type="number"
            step="0.1"
            min="10"
            max="500"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-ring outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-brand text-brand-contrast p-3 rounded-lg hover:bg-brand-hover"
        >
          Calculate BMR
        </button>
      </form>

      {error && (
        <div className="bg-danger-bg text-danger-strong p-3 rounded mt-4" role="alert">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {result != null && (
          <motion.div
            key={result}
            className="mt-6 p-4 bg-brand-soft rounded-lg"
            initial={{ opacity: 0, scale: reduce ? 1 : 0.9, y: reduce ? 0 : 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: reduce ? 1 : 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <p className="text-2xl font-bold text-brand">
              Your BMR is {Math.round(result)} calories/day
            </p>
            <p className="text-sm text-muted mt-1">
              This is the number of calories your body needs at rest to maintain basic functions.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  if (embedded) return formContent;

  return (
    <div className="bg-surface p-6 rounded-xl shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="h-5 w-5 text-brand" />
        <h2 className="text-xl font-semibold">BMR Calculator</h2>
      </div>
      {formContent}
    </div>
  );
}
