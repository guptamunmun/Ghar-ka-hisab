// import { useEffect, useState } from 'react';
// import api from '../api/axios';

// const categories = ['Electricity', 'School Fees', 'Rent', 'Gas', 'Phone', 'WiFi', 'OTT', 'Other'];
// const emptyForm = { name: '', amount: '', category: 'Electricity', dueDate: '' };

// export default function Bills() {
//   const [bills, setBills] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [form, setForm] = useState(emptyForm);
//   const [loading, setLoading] = useState(true);

//   const load = async () => {
//     setLoading(true);
//     const { data } = await api.get('/bills');
//     setBills(data);
//     setLoading(false);
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     await api.post('/bills', { ...form, amount: Number(form.amount) });
//     setForm(emptyForm);
//     setShowForm(false);
//     load();
//   };

//   const togglePaid = async (bill) => {
//     await api.put(`/bills/${bill._id}`, { paid: !bill.paid });
//     load();
//   };

//   const handleDelete = async (id) => {
//     if (!confirm('Delete this bill?')) return;
//     await api.delete(`/bills/${id}`);
//     load();
//   };

//   const unpaidTotal = bills.filter((b) => !b.paid).reduce((sum, b) => sum + b.amount, 0);
//   const paidTotal = bills.filter((b) => b.paid).reduce((sum, b) => sum + b.amount, 0);

//   return (
//     <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
//       <div className="flex items-center justify-between">
//         <h1 className="text-xl font-extrabold">Bills</h1>
//         <button onClick={() => setShowForm(true)} className="btn-primary">
//           + Add
//         </button>
//       </div>
//       <p className="text-sm text-household-muted">
//         Tick a bill as paid and it's added to your expenses automatically — it'll show up in your monthly total, budget and reports right away.
//       </p>

//       <div className="grid grid-cols-2 gap-4">
//         <div className="card bg-household-accent/10 border border-household-accent/30">
//           <p className="text-sm font-semibold text-household-text">Pending</p>
//           <p className="text-2xl font-extrabold mt-1">₹{unpaidTotal.toLocaleString('en-IN')}</p>
//         </div>
//         <div className="card bg-household-primary/10 border border-household-primary/30">
//           <p className="text-sm font-semibold text-household-text">Paid</p>
//           <p className="text-2xl font-extrabold mt-1">₹{paidTotal.toLocaleString('en-IN')}</p>
//         </div>
//       </div>

//       <div className="card">
//         {loading ? (
//           <p className="text-center text-household-muted py-6">Loading...</p>
//         ) : bills.length ? (
//           bills.map((bill) => (
//             <div key={bill._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
//               <div className="flex items-center gap-3">
//                 <input type="checkbox" checked={bill.paid} onChange={() => togglePaid(bill)} className="w-5 h-5 accent-household-primary" />
//                 <div className={bill.paid ? 'line-through text-household-muted' : ''}>
//                   <p className="font-bold">{bill.name}</p>
//                   <p className="text-xs text-household-muted">
//                     Due {new Date(bill.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-3">
//                 <span className="font-extrabold">₹{bill.amount.toLocaleString('en-IN')}</span>
//                 <button onClick={() => handleDelete(bill._id)} className="text-household-muted hover:text-household-danger text-sm">
//                   🗑️
//                 </button>
//               </div>
//             </div>
//           ))
//         ) : (
//           <p className="text-center text-household-muted py-6">No bills added yet.</p>
//         )}
//       </div>

//       {showForm && (
//         <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-20" onClick={() => setShowForm(false)}>
//           <div className="bg-white rounded-t-2xl sm:rounded-xl2 w-full sm:max-w-md p-6" onClick={(e) => e.stopPropagation()}>
//             <h2 className="font-extrabold text-lg mb-4">Add Bill</h2>
//             <form onSubmit={handleSubmit} className="space-y-3">
//               <div>
//                 <label className="text-sm font-semibold">Name</label>
//                 <input required className="input-field mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Electricity Bill" />
//               </div>
//               <div>
//                 <label className="text-sm font-semibold">Amount (₹)</label>
//                 <input
//                   type="number"
//                   min="0"
//                   required
//                   className="input-field mt-1"
//                   value={form.amount}
//                   onChange={(e) => setForm({ ...form, amount: e.target.value })}
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
//                 <label className="text-sm font-semibold">Due date</label>
//                 <input
//                   type="date"
//                   required
//                   className="input-field mt-1"
//                   value={form.dueDate}
//                   onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
//                 />
//               </div>
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
