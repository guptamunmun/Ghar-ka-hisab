import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ExpenseCard from '../components/ExpenseCard';
import BudgetProgress from '../components/BudgetProgress';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/summary')
      .then((res) => setSummary(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-10 text-center text-household-muted">Loading your home summary...</div>;
  }

  const monthTotal = summary?.monthTotal || 0;
  const budget = summary?.monthlyBudget || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Hero card */}
      <div className="card bg-household-primary text-white">
        <p className="text-sm font-semibold opacity-90">Spent this month</p>
        <p className="text-4xl font-extrabold mt-1">₹{monthTotal.toLocaleString('en-IN')}</p>

        {budget > 0 ? (
          <div className="mt-4">
            <div className="w-full h-4 bg-white/25 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((monthTotal / budget) * 100))}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-semibold">
              ₹{Math.max(0, budget - monthTotal).toLocaleString('en-IN')} left of ₹{budget.toLocaleString('en-IN')} budget
            </p>
          </div>
        ) : (
          <Link to="/budget" className="inline-block mt-4 text-sm font-bold underline">
            Set a monthly budget →
          </Link>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <p className="text-sm text-household-muted font-semibold">Today</p>
          <p className="text-2xl font-extrabold mt-1">₹{(summary?.todayTotal || 0).toLocaleString('en-IN')}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-household-muted font-semibold">This month</p>
          <p className="text-2xl font-extrabold mt-1">₹{monthTotal.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Category totals */}
      {summary?.categoryTotals?.length > 0 && (
        <div className="card">
          <h2 className="font-extrabold mb-3">Where the money went</h2>
          <div className="space-y-2">
            {summary.categoryTotals.slice(0, 6).map((c) => (
              <div key={c.category} className="flex justify-between text-sm">
                <span className="font-semibold text-household-text">{c.category}</span>
                <span className="font-bold text-household-muted">₹{c.total.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent expenses */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-extrabold">Recent expenses</h2>
          <Link to="/expenses" className="text-sm font-bold text-household-primary">
            See all
          </Link>
        </div>
        {summary?.recentExpenses?.length ? (
          summary.recentExpenses.map((e) => <ExpenseCard key={e._id} expense={e} />)
        ) : (
          <p className="text-sm text-household-muted py-4 text-center">No expenses yet. Add your first one!</p>
        )}
      </div>

      <Link to="/expenses" className="btn-primary w-full block text-center">
        + Add Expense
      </Link>
    </div>
  );
}
