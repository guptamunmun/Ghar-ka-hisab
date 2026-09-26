const categoryIcons = {
  Groceries: '🛒',
  Milk: '🥛',
  Vegetables: '🥦',
  Rent: '🏠',
  Electricity: '💡',
  Water: '🚿',
  Gas: '🔥',
  Phone: '📱',
  WiFi: '📶',
  OTT: '🎬',
  Househelp: '🧹',
  'School Fees': '🎒',
  Transport: '🚌',
  Medical: '💊',
  Shopping: '🛍️',
  'Eating Out': '🍽️',
  Newspaper: '📰',
  Other: '💰',
};

export default function ExpenseCard({ expense, onEdit, onDelete }) {
  const icon = categoryIcons[expense.category] || '💰';
  const dateStr = new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-household-bg flex items-center justify-center text-lg">{icon}</div>
        <div>
          <p className="font-bold text-household-text">{expense.category}</p>
          <p className="text-xs text-household-muted">
            {expense.description ? `${expense.description} · ` : ''}
            {dateStr}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-extrabold text-household-text">₹{expense.amount.toLocaleString('en-IN')}</span>
        {onEdit && (
          <button onClick={() => onEdit(expense)} className="text-household-muted hover:text-household-primary text-sm">
            ✏️
          </button>
        )}
        {onDelete && (
          <button onClick={() => onDelete(expense._id)} className="text-household-muted hover:text-household-danger text-sm">
            🗑️
          </button>
        )}
      </div>
    </div>
  );
}
