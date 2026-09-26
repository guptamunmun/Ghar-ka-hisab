import { useEffect, useState } from 'react';
import api from '../api/axios';
import BudgetProgress from '../components/BudgetProgress';

export default function Budget() {
  const [status, setStatus] = useState(null);
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/budget/status');
    setStatus(data);
    setMonthlyBudget(data.monthlyBudget || '');
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await api.put('/budget', { monthlyBudget: Number(monthlyBudget) });
    await load();
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-extrabold">Monthly Budget</h1>

      <form onSubmit={handleSave} className="card flex gap-3 items-end">
        <div className="flex-1">
          <label className="text-sm font-semibold">Set monthly budget (₹)</label>
          <input
            type="number"
            min="0"
            className="input-field mt-1"
            value={monthlyBudget}
            onChange={(e) => setMonthlyBudget(e.target.value)}
            placeholder="e.g. 60000"
          />
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>

      {loading ? (
        <p className="text-center text-household-muted py-6">Loading...</p>
      ) : status?.monthlyBudget > 0 ? (
        <div className="card">
          <p className="text-sm text-household-muted font-semibold">This month</p>
          <p className="text-3xl font-extrabold mt-1">₹{status.totalSpent.toLocaleString('en-IN')} spent</p>
          <div className="mt-4">
            <BudgetProgress spent={status.totalSpent} budget={status.monthlyBudget} />
          </div>
        </div>
      ) : (
        <p className="text-center text-household-muted card">Set a monthly budget to track how you're doing.</p>
      )}

      {status?.categories?.length > 0 && (
        <div className="card">
          <h2 className="font-extrabold mb-3">By category</h2>
          <div className="space-y-4">
            {status.categories.map((c) => (
              <div key={c.category}>
                <div className="flex justify-between text-sm font-semibold mb-1">
                  <span>{c.category}</span>
                  <span className="text-household-muted">₹{c.spent.toLocaleString('en-IN')}</span>
                </div>
                {c.budget > 0 && <BudgetProgress spent={c.spent} budget={c.budget} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
