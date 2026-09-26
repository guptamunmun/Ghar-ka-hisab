// import { useEffect, useMemo, useState } from 'react';
// import api from '../api/axios';

// const categories = [
//   'Groceries', 'Milk', 'Vegetables', 'Rent', 'Electricity', 'Water', 'Gas', 'Phone',
//   'WiFi', 'OTT', 'Househelp', 'School Fees', 'Transport', 'Medical', 'Shopping',
//   'Eating Out', 'Newspaper', 'Other',
// ];

// const monthNames = [
//   'January', 'February', 'March', 'April', 'May', 'June',
//   'July', 'August', 'September', 'October', 'November', 'December',
// ];

// const emptyForm = {
//   name: '',
//   amount: '',
//   isVariableAmount: false,
//   category: 'Milk',
//   frequency: 'monthly',
//   dayOfMonth: 1,
//   monthOfYear: 1,
//   reminderEnabled: false,
// };

// // Is this recurring item "due" today, based on its frequency + scheduled day?
// function isDueToday(item) {
//   if (!item.active || !item.reminderEnabled) return false;
//   const today = new Date();
//   if (item.frequency === 'daily') return true;
//   if (item.frequency === 'monthly') return today.getDate() === Number(item.dayOfMonth);
//   if (item.frequency === 'yearly') {
//     return today.getDate() === Number(item.dayOfMonth) && today.getMonth() + 1 === Number(item.monthOfYear);
//   }
//   // Weekly items don't carry a specific weekday in this MVP, so just remind every day
//   // the app is opened — better a gentle nudge than a missed payment.
//   if (item.frequency === 'weekly') return true;
//   return false;
// }

// export default function Recurring() {
//   const [items, setItems] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [form, setForm] = useState(emptyForm);
//   const [editingId, setEditingId] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [notifPermission, setNotifPermission] = useState(
//     typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
//   );

//   const load = async () => {
//     setLoading(true);
//     const { data } = await api.get('/recurring');
//     setItems(data);
//     setLoading(false);
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   const dueToday = useMemo(() => items.filter(isDueToday), [items]);

//   // Fire a browser notification once per day for today's reminders (if permission granted).
//   useEffect(() => {
//     if (!dueToday.length || typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
//     const todayKey = new Date().toISOString().slice(0, 10);
//     const shownKey = 'gkh_reminders_shown_' + todayKey;
//     if (localStorage.getItem(shownKey)) return;

//     dueToday.forEach((item) => {
//       new Notification('Ghar Ka Hisaab reminder', {
//         body: `${item.name} (${item.category}) is due today${item.isVariableAmount ? '' : ` — ₹${item.amount.toLocaleString('en-IN')}`}`,
//       });
//     });
//     localStorage.setItem(shownKey, '1');
//   }, [dueToday]);

//   const openAdd = () => {
//     setForm(emptyForm);
//     setEditingId(null);
//     setShowForm(true);
//   };

//   const openEdit = (item) => {
//     setForm({
//       name: item.name,
//       amount: item.amount || '',
//       isVariableAmount: !!item.isVariableAmount,
//       category: item.category,
//       frequency: item.frequency,
//       dayOfMonth: item.dayOfMonth,
//       monthOfYear: item.monthOfYear || 1,
//       reminderEnabled: !!item.reminderEnabled,
//     });
//     setEditingId(item._id);
//     setShowForm(true);
//   };

//   const requestNotificationPermission = async () => {
//     if (typeof Notification === 'undefined') return;
//     const result = await Notification.requestPermission();
//     setNotifPermission(result);
//   };

//   const handleReminderToggle = (checked) => {
//     setForm({ ...form, reminderEnabled: checked });
//     if (checked && notifPermission === 'default') {
//       requestNotificationPermission();
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const payload = {
//       ...form,
//       amount: form.amount === '' ? 0 : Number(form.amount),
//       dayOfMonth: Number(form.dayOfMonth),
//       monthOfYear: Number(form.monthOfYear),
//     };
//     if (editingId) {
//       await api.put(`/recurring/${editingId}`, payload);
//     } else {
//       await api.post('/recurring', payload);
//     }
//     setShowForm(false);
//     load();
//   };

//   const toggleActive = async (item) => {
//     await api.put(`/recurring/${item._id}`, { active: !item.active });
//     load();
//   };

//   const handleDelete = async (id) => {
//     if (!confirm('Delete this recurring expense?')) return;
//     await api.delete(`/recurring/${id}`);
//     load();
//   };

//   return (
//     <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
//       <div className="flex items-center justify-between">
//         <h1 className="text-xl font-extrabold">Recurring Expenses</h1>
//         <button onClick={openAdd} className="btn-primary">
//           + Add
//         </button>
//       </div>
//       <p className="text-sm text-household-muted">Milk, newspaper, househelp, WiFi, OTT — the regulars.</p>

//       {dueToday.length > 0 && (
//         <div className="card bg-household-accent/10 border border-household-accent/30">
//           <p className="font-extrabold text-sm mb-2">🔔 Due today</p>
//           <div className="space-y-1">
//             {dueToday.map((item) => (
//               <div key={item._id} className="flex justify-between text-sm">
//                 <span className="font-semibold">
//                   {item.name} <span className="text-household-muted">· {item.category}</span>
//                 </span>
//                 <span className="font-bold text-household-muted">
//                   {item.isVariableAmount ? '~ varies' : `₹${item.amount.toLocaleString('en-IN')}`}
//                 </span>
//               </div>
//             ))}
//           </div>
//           {notifPermission === 'default' && (
//             <button onClick={requestNotificationPermission} className="text-xs font-bold text-household-primary mt-2 underline">
//               Turn on browser notifications for reminders
//             </button>
//           )}
//           {notifPermission === 'denied' && (
//             <p className="text-xs text-household-muted mt-2">
//               Browser notifications are blocked — you'll still see this banner whenever you open the app.
//             </p>
//           )}
//         </div>
//       )}

//       <div className="card">
//         {loading ? (
//           <p className="text-center text-household-muted py-6">Loading...</p>
//         ) : items.length ? (
//           items.map((item) => (
//             <div key={item._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
//               <div>
//                 <p className="font-bold">
//                   {item.name} {item.reminderEnabled && <span title="Reminder on">🔔</span>}
//                 </p>
//                 <p className="text-xs text-household-muted">
//                   {item.category} · {item.frequency}
//                   {item.frequency === 'monthly' ? ` (day ${item.dayOfMonth})` : ''}
//                   {item.frequency === 'yearly' ? ` (${monthNames[item.monthOfYear - 1]} ${item.dayOfMonth})` : ''} ·{' '}
//                   {item.isVariableAmount ? `~₹${(item.amount || 0).toLocaleString('en-IN')} (varies)` : `₹${item.amount.toLocaleString('en-IN')}`}
//                 </p>
//               </div>
//               <div className="flex items-center gap-3">
//                 <button
//                   onClick={() => toggleActive(item)}
//                   className={`text-xs font-bold px-2 py-1 rounded-full ${
//                     item.active ? 'bg-household-primary/10 text-household-primary' : 'bg-gray-100 text-household-muted'
//                   }`}
//                 >
//                   {item.active ? 'Active' : 'Paused'}
//                 </button>
//                 <button onClick={() => openEdit(item)} className="text-household-muted hover:text-household-primary text-sm">
//                   ✏️
//                 </button>
//                 <button onClick={() => handleDelete(item._id)} className="text-household-muted hover:text-household-danger text-sm">
//                   🗑️
//                 </button>
//               </div>
//             </div>
//           ))
//         ) : (
//           <p className="text-center text-household-muted py-6">No recurring expenses yet.</p>
//         )}
//       </div>

//       {showForm && (
//         <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-20" onClick={() => setShowForm(false)}>
//           <div className="bg-white rounded-t-2xl sm:rounded-xl2 w-full sm:max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
//             <h2 className="font-extrabold text-lg mb-4">{editingId ? 'Edit' : 'Add'} Recurring Expense</h2>
//             <form onSubmit={handleSubmit} className="space-y-3">
//               <div>
//                 <label className="text-sm font-semibold">Name</label>
//                 <input required className="input-field mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Milk" />
//               </div>

//               <label className="flex items-center gap-2 text-sm font-semibold pt-1">
//                 <input
//                   type="checkbox"
//                   className="w-4 h-4 accent-household-primary"
//                   checked={form.isVariableAmount}
//                   onChange={(e) => setForm({ ...form, isVariableAmount: e.target.checked })}
//                 />
//                 Amount varies each time (e.g. milk bill, electricity-linked)
//               </label>

//               <div>
//                 <label className="text-sm font-semibold">
//                   {form.isVariableAmount ? 'Typical amount (₹) — optional' : 'Amount (₹)'}
//                 </label>
//                 <input
//                   type="number"
//                   min="0"
//                   required={!form.isVariableAmount}
//                   className="input-field mt-1"
//                   value={form.amount}
//                   onChange={(e) => setForm({ ...form, amount: e.target.value })}
//                   placeholder={form.isVariableAmount ? 'e.g. usually around 900' : ''}
//                 />
//               </div>

//               <div>
//                 <label className="text-sm font-semibold">Category</label>
//                 <select className="input-field mt-1" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
//                   {categories.map((c) => (
//                     <option key={c} value={c}>
//                       {c}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="text-sm font-semibold">Frequency</label>
//                 <select className="input-field mt-1" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
//                   <option value="daily">Daily</option>
//                   <option value="weekly">Weekly</option>
//                   <option value="monthly">Monthly</option>
//                   <option value="yearly">Yearly</option>
//                 </select>
//               </div>

//               {form.frequency === 'yearly' && (
//                 <div className="flex gap-3">
//                   <div className="flex-1">
//                     <label className="text-sm font-semibold">Month</label>
//                     <select
//                       className="input-field mt-1"
//                       value={form.monthOfYear}
//                       onChange={(e) => setForm({ ...form, monthOfYear: e.target.value })}
//                     >
//                       {monthNames.map((m, i) => (
//                         <option key={m} value={i + 1}>
//                           {m}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   <div className="flex-1">
//                     <label className="text-sm font-semibold">Day</label>
//                     <input
//                       type="number"
//                       min="1"
//                       max="31"
//                       className="input-field mt-1"
//                       value={form.dayOfMonth}
//                       onChange={(e) => setForm({ ...form, dayOfMonth: e.target.value })}
//                     />
//                   </div>
//                 </div>
//               )}

//               {form.frequency === 'monthly' && (
//                 <div>
//                   <label className="text-sm font-semibold">Day of month</label>
//                   <input
//                     type="number"
//                     min="1"
//                     max="31"
//                     className="input-field mt-1"
//                     value={form.dayOfMonth}
//                     onChange={(e) => setForm({ ...form, dayOfMonth: e.target.value })}
//                   />
//                 </div>
//               )}

//               <label className="flex items-center gap-2 text-sm font-semibold pt-1">
//                 <input
//                   type="checkbox"
//                   className="w-4 h-4 accent-household-primary"
//                   checked={form.reminderEnabled}
//                   onChange={(e) => handleReminderToggle(e.target.checked)}
//                 />
//                 Remind me
//                 {form.frequency === 'monthly' && form.reminderEnabled ? ` on day ${form.dayOfMonth} of each month` : ''}
//                 {form.frequency === 'yearly' && form.reminderEnabled ? ` on ${monthNames[form.monthOfYear - 1]} ${form.dayOfMonth} every year` : ''}
//               </label>
//               {form.reminderEnabled && notifPermission === 'denied' && (
//                 <p className="text-xs text-household-muted -mt-2">
//                   Browser notifications are blocked, but you'll still see a reminder banner on this page.
//                 </p>
//               )}

//               <div className="flex gap-3 pt-2">
//                 <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
//                   Cancel
//                 </button>
//                 <button type="submit" className="btn-primary flex-1">
//                   Save
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const categories = [
  'Groceries', 'Milk', 'Vegetables', 'Rent', 'Electricity', 'Water', 'Gas', 'Phone',
  'WiFi', 'OTT', 'Househelp', 'School Fees', 'Transport', 'Medical', 'Shopping',
  'Eating Out', 'Newspaper', 'Other',
];

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const emptyForm = {
  name: '',
  amount: '',
  isVariableAmount: false,
  category: 'Milk',
  frequency: 'monthly',
  dayOfMonth: 1,
  monthOfYear: 1,
  reminderEnabled: false,
};

// A rough-but-good-enough "which cycle does this date fall into" key, per frequency.
// Used to tell whether an item has already been paid for the CURRENT cycle, so a
// payment logged today stops the reminder until the next cycle rolls around —
// without needing a full recurrence-scheduling engine for this MVP.
function cycleKey(frequency, date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  if (frequency === 'daily') return `${y}-${m}-${d}`;
  if (frequency === 'weekly') {
    const startOfYear = new Date(y, 0, 1);
    const dayOfYear = Math.floor((date - startOfYear) / 86400000);
    return `${y}-w${Math.floor(dayOfYear / 7)}`;
  }
  if (frequency === 'monthly') return `${y}-${m}`;
  if (frequency === 'yearly') return `${y}`;
  return `${y}-${m}-${d}`;
}

function isPaidThisCycle(item) {
  if (!item.lastPaidDate) return false;
  return cycleKey(item.frequency, new Date(item.lastPaidDate)) === cycleKey(item.frequency, new Date());
}

// Is this recurring item "due" today — scheduled, reminders on, and not already paid
// for the current cycle? Once paid, this naturally goes false until the next cycle's
// scheduled date comes around again, with no manual re-enabling needed.
function isDueToday(item) {
  if (!item.active || !item.reminderEnabled || isPaidThisCycle(item)) return false;
  const today = new Date();
  if (item.frequency === 'daily') return true;
  if (item.frequency === 'monthly') return today.getDate() === Number(item.dayOfMonth);
  if (item.frequency === 'yearly') {
    return today.getDate() === Number(item.dayOfMonth) && today.getMonth() + 1 === Number(item.monthOfYear);
  }
  // Weekly items don't carry a specific weekday in this MVP, so just remind every day
  // of the week it hasn't been paid yet — better a gentle nudge than a missed payment.
  if (item.frequency === 'weekly') return true;
  return false;
}

function cycleLabel(frequency) {
  if (frequency === 'daily') return 'today';
  if (frequency === 'weekly') return 'this week';
  if (frequency === 'monthly') return 'this month';
  if (frequency === 'yearly') return 'this year';
  return 'this cycle';
}

export default function Recurring() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  // Pay modal state
  const [payItem, setPayItem] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [paying, setPaying] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/recurring');
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const dueToday = useMemo(() => items.filter(isDueToday), [items]);

  // Fire a browser notification once per day for today's still-unpaid reminders.
  useEffect(() => {
    if (!dueToday.length || typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const todayKey = new Date().toISOString().slice(0, 10);
    const shownKey = 'gkh_reminders_shown_' + todayKey;
    if (localStorage.getItem(shownKey)) return;

    dueToday.forEach((item) => {
      new Notification('Ghar Ka Hisaab reminder', {
        body: `${item.name} (${item.category}) is due${item.isVariableAmount ? '' : ` — ₹${item.amount.toLocaleString('en-IN')}`}`,
      });
    });
    localStorage.setItem(shownKey, '1');
  }, [dueToday]);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({
      name: item.name,
      amount: item.amount || '',
      isVariableAmount: !!item.isVariableAmount,
      category: item.category,
      frequency: item.frequency,
      dayOfMonth: item.dayOfMonth,
      monthOfYear: item.monthOfYear || 1,
      reminderEnabled: !!item.reminderEnabled,
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const requestNotificationPermission = async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setNotifPermission(result);
  };

  const handleReminderToggle = (checked) => {
    setForm({ ...form, reminderEnabled: checked });
    if (checked && notifPermission === 'default') {
      requestNotificationPermission();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      amount: form.amount === '' ? 0 : Number(form.amount),
      dayOfMonth: Number(form.dayOfMonth),
      monthOfYear: Number(form.monthOfYear),
    };
    if (editingId) {
      await api.put(`/recurring/${editingId}`, payload);
    } else {
      await api.post('/recurring', payload);
    }
    setShowForm(false);
    load();
  };

  const toggleActive = async (item) => {
    await api.put(`/recurring/${item._id}`, { active: !item.active });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this recurring expense?')) return;
    await api.delete(`/recurring/${id}`);
    load();
  };

  const openPay = (item) => {
    setPayItem(item);
    setPayAmount(item.amount || '');
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!payItem) return;
    setPaying(true);
    try {
      await api.post(`/recurring/${payItem._id}/pay`, { amount: Number(payAmount) });
      setPayItem(null);
      load();
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold">Recurring Expenses</h1>
        <button onClick={openAdd} className="btn-primary">
          + Add
        </button>
      </div>
      <p className="text-sm text-household-muted">
        Milk, newspaper, househelp, WiFi, OTT — the regulars. Mark one paid and it's logged as an expense automatically; the reminder goes quiet until the next cycle.
      </p>

      {dueToday.length > 0 && (
        <div className="card bg-household-accent/10 border border-household-accent/30">
          <p className="font-extrabold text-sm mb-2">🔔 Due now</p>
          <div className="space-y-2">
            {dueToday.map((item) => (
              <div key={item._id} className="flex items-center justify-between text-sm">
                <span className="font-semibold">
                  {item.name} <span className="text-household-muted">· {item.category}</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-household-muted">
                    {item.isVariableAmount ? '~ varies' : `₹${item.amount.toLocaleString('en-IN')}`}
                  </span>
                  <button onClick={() => openPay(item)} className="text-xs font-bold text-white bg-household-primary px-2 py-1 rounded-full">
                    Mark Paid
                  </button>
                </div>
              </div>
            ))}
          </div>
          {notifPermission === 'default' && (
            <button onClick={requestNotificationPermission} className="text-xs font-bold text-household-primary mt-2 underline">
              Turn on browser notifications for reminders
            </button>
          )}
          {notifPermission === 'denied' && (
            <p className="text-xs text-household-muted mt-2">
              Browser notifications are blocked — you'll still see this banner whenever you open the app.
            </p>
          )}
        </div>
      )}

      <div className="card">
        {loading ? (
          <p className="text-center text-household-muted py-6">Loading...</p>
        ) : items.length ? (
          items.map((item) => {
            const paidThisCycle = isPaidThisCycle(item);
            return (
              <div key={item._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-bold">
                    {item.name} {item.reminderEnabled && <span title="Reminder on">🔔</span>}
                    {paidThisCycle && (
                      <span className="ml-1 text-xs font-bold text-household-primary align-middle">✓ Paid {cycleLabel(item.frequency)}</span>
                    )}
                  </p>
                  <p className="text-xs text-household-muted">
                    {item.category} · {item.frequency}
                    {item.frequency === 'monthly' ? ` (day ${item.dayOfMonth})` : ''}
                    {item.frequency === 'yearly' ? ` (${monthNames[item.monthOfYear - 1]} ${item.dayOfMonth})` : ''} ·{' '}
                    {item.isVariableAmount ? `~₹${(item.amount || 0).toLocaleString('en-IN')} (varies)` : `₹${item.amount.toLocaleString('en-IN')}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {item.active && (
                    <button
                      onClick={() => openPay(item)}
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        paidThisCycle ? 'bg-gray-100 text-household-muted' : 'bg-household-primary text-white'
                      }`}
                    >
                      {paidThisCycle ? 'Paid' : 'Mark Paid'}
                    </button>
                  )}
                  <button
                    onClick={() => toggleActive(item)}
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      item.active ? 'bg-household-primary/10 text-household-primary' : 'bg-gray-100 text-household-muted'
                    }`}
                  >
                    {item.active ? 'Active' : 'Paused'}
                  </button>
                  <button onClick={() => openEdit(item)} className="text-household-muted hover:text-household-primary text-sm">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="text-household-muted hover:text-household-danger text-sm">
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-household-muted py-6">No recurring expenses yet.</p>
        )}
      </div>

      {/* Add / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-20" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-xl2 w-full sm:max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-extrabold text-lg mb-4">{editingId ? 'Edit' : 'Add'} Recurring Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-sm font-semibold">Name</label>
                <input required className="input-field mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Milk" />
              </div>

              <label className="flex items-center gap-2 text-sm font-semibold pt-1">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-household-primary"
                  checked={form.isVariableAmount}
                  onChange={(e) => setForm({ ...form, isVariableAmount: e.target.checked })}
                />
                Amount varies each time (e.g. milk bill, electricity-linked)
              </label>

              <div>
                <label className="text-sm font-semibold">
                  {form.isVariableAmount ? 'Typical amount (₹) — optional' : 'Amount (₹)'}
                </label>
                <input
                  type="number"
                  min="0"
                  required={!form.isVariableAmount}
                  className="input-field mt-1"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder={form.isVariableAmount ? 'e.g. usually around 900' : ''}
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
                <label className="text-sm font-semibold">Frequency</label>
                <select className="input-field mt-1" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {form.frequency === 'yearly' && (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-sm font-semibold">Month</label>
                    <select
                      className="input-field mt-1"
                      value={form.monthOfYear}
                      onChange={(e) => setForm({ ...form, monthOfYear: e.target.value })}
                    >
                      {monthNames.map((m, i) => (
                        <option key={m} value={i + 1}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-semibold">Day</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      className="input-field mt-1"
                      value={form.dayOfMonth}
                      onChange={(e) => setForm({ ...form, dayOfMonth: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {form.frequency === 'monthly' && (
                <div>
                  <label className="text-sm font-semibold">Day of month</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    className="input-field mt-1"
                    value={form.dayOfMonth}
                    onChange={(e) => setForm({ ...form, dayOfMonth: e.target.value })}
                  />
                </div>
              )}

              <label className="flex items-center gap-2 text-sm font-semibold pt-1">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-household-primary"
                  checked={form.reminderEnabled}
                  onChange={(e) => handleReminderToggle(e.target.checked)}
                />
                Remind me
                {form.frequency === 'monthly' && form.reminderEnabled ? ` on day ${form.dayOfMonth} of each month` : ''}
                {form.frequency === 'yearly' && form.reminderEnabled ? ` on ${monthNames[form.monthOfYear - 1]} ${form.dayOfMonth} every year` : ''}
              </label>
              {form.reminderEnabled && notifPermission === 'denied' && (
                <p className="text-xs text-household-muted -mt-2">
                  Browser notifications are blocked, but you'll still see a reminder banner on this page.
                </p>
              )}

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

      {/* Pay modal */}
      {payItem && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-20" onClick={() => setPayItem(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-xl2 w-full sm:max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-extrabold text-lg mb-1">Mark "{payItem.name}" as paid</h2>
            <p className="text-sm text-household-muted mb-4">
              This logs it as an expense right away{payItem.reminderEnabled ? `, and the reminder will go quiet until it's due again ${cycleLabel(payItem.frequency) === 'today' ? 'tomorrow' : `next ${payItem.frequency.replace('ly', '')}`}.` : '.'}
            </p>
            <form onSubmit={handlePay} className="space-y-3">
              <div>
                <label className="text-sm font-semibold">Amount paid (₹)</label>
                <input
                  type="number"
                  min="0"
                  required
                  autoFocus
                  className="input-field mt-1"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
                {payItem.isVariableAmount && (
                  <p className="text-xs text-household-muted mt-1">Pre-filled with the last known amount — adjust if this cycle's is different.</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setPayItem(null)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={paying} className="btn-primary flex-1">
                  {paying ? 'Saving...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}