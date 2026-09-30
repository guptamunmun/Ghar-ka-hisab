import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const statusStyles = {
  over: { bar: 'bg-household-danger', badge: 'bg-household-danger/10 text-household-danger', label: 'Over target' },
  under: { bar: 'bg-household-primary', badge: 'bg-household-primary/10 text-household-primary', label: 'Under target' },
  'on-track': { bar: 'bg-household-accent', badge: 'bg-household-accent/10 text-household-accent', label: 'On track' },
};

function scoreLabel(score) {
  if (score >= 75) return 'Comfortable cushion';
  if (score >= 45) return 'Steady footing';
  return 'Building stability';
}

export default function Insights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editCategory, setEditCategory] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/insights');
    setData(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (cat) => {
    setEditCategory(cat.category);
    setEditValue(cat.idealPercent);
  };

  const handleSaveTarget = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/targets/${encodeURIComponent(editCategory)}`, { idealPercent: Number(editValue) });
      setEditCategory(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleResetTarget = async () => {
    setSaving(true);
    try {
      await api.delete(`/targets/${encodeURIComponent(editCategory)}`);
      setEditCategory(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-10 text-center text-household-muted">Crunching your numbers...</div>;
  }

  if (!data) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold">Insights</h1>
        <Link to="/lifestyle" className="text-sm font-bold text-household-primary">
          {data.lifestyleScore !== null ? 'Edit profile' : 'Set up profile'}
        </Link>
      </div>

      {data.lifestyleScore === null && (
        <div className="card bg-household-accent/10 border border-household-accent/30">
          <p className="font-semibold text-sm">
            You're seeing general household targets right now.{' '}
            <Link to="/lifestyle" className="underline font-bold">
              Fill in your household profile
            </Link>{' '}
            to personalize these to your income and lifestyle.
          </p>
        </div>
      )}

      {data.lifestyleScore !== null && (
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-sm text-household-muted font-semibold">Lifestyle Score</p>
            <p className="text-xs text-household-muted">{scoreLabel(data.lifestyleScore)}</p>
          </div>
          <p className="text-3xl font-extrabold text-household-primary">{data.lifestyleScore}</p>
        </div>
      )}

      {/* <p className="text-xs text-household-muted">
        Compared against {data.basedOn === 'budget' ? 'your monthly budget' : "this month's total spend (set a monthly budget for a clearer picture)"}.
      </p> */}

      <p className="text-xs text-household-muted">
        Compared against{' '}
        {data.basedOn === 'income'
          ? 'your monthly household income'
          : data.basedOn === 'budget'
          ? "your monthly budget (set your household income in your profile for accurate, income-based targets)"
          : "this month's total spend (set your household income in your profile, or a monthly budget, for a real comparison)"}
        .
      </p>

      {data.topOptimizations?.length > 0 && (
        <div className="card">
          <p className="font-extrabold text-sm mb-3">💡 Where to optimize</p>
          <div className="space-y-3">
            {data.topOptimizations.map((c) => (
              <div key={c.category} className="flex items-start justify-between gap-3">
                <p className="text-sm">{c.insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card space-y-5">
        <p className="font-extrabold text-sm">Category breakdown</p>
        {data.categories
          .filter((c) => c.actualAmount > 0 || c.idealPercent > 0)
          .map((c) => {
            const style = statusStyles[c.status];
            const maxScale = Math.max(c.idealPercent, c.actualPercent, 5) * 1.3;
            const actualWidth = Math.min(100, (c.actualPercent / maxScale) * 100);
            const idealMarker = Math.min(100, (c.idealPercent / maxScale) * 100);

            return (
              <div key={c.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold">{c.category}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge}`}>{style.label}</span>
                    <button onClick={() => openEdit(c)} className="text-household-muted hover:text-household-primary text-xs">
                      ✏️
                    </button>
                  </div>
                </div>

                <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${style.bar} transition-all duration-500`} style={{ width: `${actualWidth}%` }} />
                  <div
                    className="absolute top-0 h-3 w-0.5 bg-household-text/60"
                    style={{ left: `${idealMarker}%` }}
                    title={`Ideal: ${c.idealPercent}%`}
                  />
                </div>

                <div className="flex justify-between mt-1 text-xs text-household-muted">
                  <span>
                    ₹{c.actualAmount.toLocaleString('en-IN')} ({c.actualPercent}%) spent
                  </span>
                  <span>Ideal: {c.idealPercent}% (₹{c.idealAmount.toLocaleString('en-IN')})</span>
                </div>

                {c.insight && <p className="text-xs mt-1 text-household-text">{c.insight}</p>}
              </div>
            );
          })}
      </div>

      {editCategory && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-20" onClick={() => setEditCategory(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-xl2 w-full sm:max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-extrabold text-lg mb-4">Target for {editCategory}</h2>
            <form onSubmit={handleSaveTarget} className="space-y-3">
              <div>
                <label className="text-sm font-semibold">Ideal % of budget</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  required
                  autoFocus
                  className="input-field mt-1"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleResetTarget} disabled={saving} className="btn-secondary flex-1">
                  Reset to default
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
