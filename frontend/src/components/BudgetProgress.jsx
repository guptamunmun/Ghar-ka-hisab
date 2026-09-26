export default function BudgetProgress({ spent, budget }) {
  const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  const remaining = budget - spent;
  const isOver = remaining < 0;

  const barColor = pct < 70 ? 'bg-household-primary' : pct < 100 ? 'bg-household-accent' : 'bg-household-danger';

  return (
    <div>
      <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between mt-2 text-sm font-semibold">
        <span className={isOver ? 'text-household-danger' : 'text-household-primaryDark'}>
          {isOver ? `₹${Math.abs(remaining).toLocaleString('en-IN')} over budget` : `₹${remaining.toLocaleString('en-IN')} left`}
        </span>
        <span className="text-household-muted">{pct}% used</span>
      </div>
    </div>
  );
}
