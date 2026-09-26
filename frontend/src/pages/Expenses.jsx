import { useEffect, useState } from 'react';
import api from '../api/axios';
import ExpenseCard from '../components/ExpenseCard';

const categories = [
  'Groceries', 'Milk', 'Vegetables', 'Rent', 'Electricity', 'Water', 'Gas', 'Phone',
  'WiFi', 'OTT', 'Househelp', 'School Fees', 'Transport', 'Medical', 'Shopping',
  'Eating Out', 'Newspaper', 'Other',
];

const emptyForm = { amount: '', category: 'Groceries', description: '', date: new Date().toISOString().slice(0, 10) };

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const load = async () => {
    setLoading(true);
    const params = {};
    if (filterCategory) params.category = filterCategory;
    if (filterDate) {
      params.startDate = filterDate;
      params.endDate = filterDate;
    }
    const { data } = await api.get('/expenses', { params });
    setExpenses(data.expenses);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory, filterDate]);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (expense) => {
    setForm({
      amount: expense.amount,
      category: expense.category,
      description: expense.description || '',
      date: expense.date.slice(0, 10),
    });
    setEditingId(expense._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, amount: Number(form.amount) };
    if (editingId) {
      await api.put(`/expenses/${editingId}`, payload);
    } else {
      await api.post('/expenses', payload);
    }
    setShowForm(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    await api.delete(`/expenses/${id}`);
    load();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold">Expenses</h1>
        <button onClick={openAdd} className="btn-primary">
          + Add
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select className="input-field" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input type="date" className="input-field" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
      </div>

      <div className="card">
        {loading ? (
          <p className="text-center text-household-muted py-6">Loading...</p>
        ) : expenses.length ? (
          expenses.map((e) => <ExpenseCard key={e._id} expense={e} onEdit={openEdit} onDelete={handleDelete} />)
        ) : (
          <p className="text-center text-household-muted py-6">No expenses found.</p>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-20" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-xl2 w-full sm:max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-extrabold text-lg mb-4">{editingId ? 'Edit Expense' : 'Add Expense'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-sm font-semibold">Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  required
                  className="input-field mt-1"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Category</label>
                <select className="input-field mt-1" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold">Note (optional)</label>
                <input
                  className="input-field mt-1"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Weekly vegetables"
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Date</label>
                <input
                  type="date"
                  className="input-field mt-1"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
