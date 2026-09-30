import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const lifestyleOptions = [
  { value: 'minimalist', label: 'Minimalist', hint: 'Spend only on essentials, save aggressively' },
  { value: 'balanced', label: 'Balanced', hint: 'A healthy mix of essentials and comforts' },
  { value: 'comfortable', label: 'Comfortable', hint: 'A bit more room for eating out, shopping, etc.' },
  { value: 'premium', label: 'Premium', hint: 'Prioritize comfort and convenience' },
];

const workOptions = [
  { value: 'salaried', label: 'Salaried' },
  { value: 'business', label: 'Business owner' },
  { value: 'freelance', label: 'Freelance / gig' },
  { value: 'student', label: 'Student' },
  { value: 'homemaker', label: 'Homemaker' },
  { value: 'retired', label: 'Retired' },
];

function scoreLabel(score) {
  if (score >= 75) return { text: 'Comfortable cushion', color: 'text-household-primary' };
  if (score >= 45) return { text: 'Steady footing', color: 'text-household-accent' };
  return { text: 'Building stability', color: 'text-household-danger' };
}

export default function Lifestyle() {
  const [form, setForm] = useState({ age: '', lifestyle: 'balanced', income: '', workProfile: 'salaried' });
  const [score, setScore] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/lifestyle').then((res) => {
      if (res.data) {
        const { age, lifestyle, income, workProfile, lifestyleScore } = res.data;
        setForm({ age, lifestyle, income, workProfile });
        setScore(lifestyleScore);
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const { data } = await api.put('/lifestyle', form);
      setScore(data.profile.lifestyleScore);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-lg mx-auto px-4 py-10 text-center text-household-muted">Loading...</div>;
  }

  const label = score !== null ? scoreLabel(score) : null;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      <div>
        <h1 className="text-xl font-extrabold">Your Household Profile</h1>
        <p className="text-sm text-household-muted mt-1">
          A few details so we can tailor "ideal spending" targets to your household instead of a one-size-fits-all number.
        </p>
      </div>

      {score !== null && (
        <div className="card bg-household-primary text-white text-center">
          <p className="text-sm font-semibold opacity-90">Lifestyle Score</p>
          <p className="text-5xl font-extrabold mt-1">{score}</p>
          <p className={`text-sm font-bold mt-1 ${label.color === 'text-household-danger' ? 'text-household-accent' : ''}`}>
            {label.text}
          </p>
          <p className="text-xs opacity-80 mt-2">
            A rough, general-purpose indicator from what you shared below — not a credit or financial health score.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="text-sm font-semibold">Age</label>
          <input
            type="number"
            min="13"
            max="120"
            required
            className="input-field mt-1"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Monthly household income (₹)</label>
          <input
            type="number"
            min="0"
            required
            className="input-field mt-1"
            value={form.income}
            onChange={(e) => setForm({ ...form, income: e.target.value })}
            placeholder="e.g. 80000"
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Work profile</label>
          <select className="input-field mt-1" value={form.workProfile} onChange={(e) => setForm({ ...form, workProfile: e.target.value })}>
            {workOptions.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold">Lifestyle</label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {lifestyleOptions.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => setForm({ ...form, lifestyle: opt.value })}
                className={`text-left p-3 rounded-xl2 border-2 transition-colors ${
                  form.lifestyle === opt.value ? 'border-household-primary bg-household-primary/5' : 'border-gray-200'
                }`}
              >
                <p className="font-bold text-sm">{opt.label}</p>
                <p className="text-xs text-household-muted mt-0.5">{opt.hint}</p>
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving...' : 'Save & Calculate'}
        </button>

        {saved && (
          <p className="text-center text-sm font-semibold text-household-primary">
            Saved! Your category targets are now personalized —{' '}
            <Link to="/insights" className="underline">
              see your Insights
            </Link>
            .
          </p>
        )}
      </form>

      <p className="text-xs text-household-muted text-center">
        This is a general guideline based on common household budgeting rules of thumb — not professional financial advice.
      </p>
    </div>
  );
}
