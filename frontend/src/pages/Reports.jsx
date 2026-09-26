// import { useEffect, useState } from 'react';
// import api from '../api/axios';

// const tabs = [
//   { key: 'daily', label: 'Daily' },
//   { key: 'weekly', label: 'Weekly' },
//   { key: 'monthly', label: 'Monthly' },
//   { key: 'category', label: 'By Category' },
// ];

// export default function Reports() {
//   const [tab, setTab] = useState('weekly');
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   console.log(tab);

//   useEffect(() => {
//     setLoading(true);
//     api
//       .get(`/reports/${tab}`)
//       .then((res) => setData(res.data))
//       .finally(() => setLoading(false));
//   }, [tab]);
//   console.log(data);

//   return (
//     <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
//       <h1 className="text-xl font-extrabold">Reports</h1>

//       <div className="flex gap-2 overflow-x-auto">
//         {tabs.map((t) => (
//           <button
//             key={t.key}
//             onClick={() => setTab(t.key)}
//             className={`whitespace-nowrap px-4 py-2 rounded-xl2 text-sm font-bold transition-colors ${
//               tab === t.key ? 'bg-household-primary text-white' : 'bg-white text-household-text'
//             }`}
//           >
//             {t.label}
//           </button>
//         ))}
//       </div>

//       {loading ? (
//         <p className="text-center text-household-muted py-6">Loading...</p>
//       ) : (
//         <div className="card space-y-4">
//           {tab === 'daily' && data && (
//             <>
//               <p className="text-sm text-household-muted font-semibold">Today's total</p>
//               <p className="text-3xl font-extrabold">₹{data.total.toLocaleString('en-IN')}</p>
//               <div className="divide-y divide-gray-100">
//                 {data.expenses.map((e) => (
//                   <div key={e._id} className="flex justify-between py-2 text-sm">
//                     <span className="font-semibold">{e.category}</span>
//                     <span className="font-bold">₹{e.amount.toLocaleString('en-IN')}</span>
//                   </div>
//                 ))}
//               </div>
//             </>
//           )}

//           {tab === 'weekly' && data && (
//             <>
//               <p className="text-sm text-household-muted font-semibold">This week's total</p>
//               <p className="text-3xl font-extrabold">₹{data.total.toLocaleString('en-IN')}</p>
//               <div className="space-y-2">
//                 {data.daily.map((d) => (
//                   <div key={d._id} className="flex justify-between text-sm">
//                     <span className="font-semibold">{d._id}</span>
//                     <span className="font-bold">₹{d.total.toLocaleString('en-IN')}</span>
//                   </div>
//                 ))}
//               </div>
//             </>
//           )}

//           {tab === 'monthly' && data && (
//             <>
//               <p className="text-sm text-household-muted font-semibold">This month's total</p>
//               <p className="text-3xl font-extrabold">₹{data.total.toLocaleString('en-IN')}</p>
//               <div>
//                 <p className="font-bold text-sm mb-2">By category</p>
//                 <div className="space-y-2">
//                   {data.byCategory.map((c) => (
//                     <div key={c.category} className="flex justify-between text-sm">
//                       <span className="font-semibold">{c.category}</span>
//                       <span className="font-bold">₹{c.total.toLocaleString('en-IN')}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </>
//           )}

//           {tab === 'category' && data && (
//             <div className="space-y-2">
//               {data.categories.map((c) => (
//                 <div key={c.category} className="flex justify-between text-sm">
//                   <span className="font-semibold">
//                     {c.category} <span className="text-household-muted">({c.count})</span>
//                   </span>
//                   <span className="font-bold">₹{c.total.toLocaleString('en-IN')}</span>
//                 </div>
//               ))}
//               {data.categories.length === 0 && <p className="text-center text-household-muted py-4">No data for this month.</p>}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
import { useEffect, useState } from 'react';
import api from '../api/axios';

const tabs = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'category', label: 'By Category' },
];

export default function Reports() {
  const [tab, setTab] = useState('monthly');

  // One state slot PER TAB, keyed by tab name — e.g. { monthly: {...}, daily: {...} }.
  // This is the actual fix: with a single shared `data` variable, a slow or failed
  // request for one tab could leave a DIFFERENT tab's shape sitting in state
  // (monthly's { byDay, byCategory } rendered while `tab === 'category'`, which
  // expects { categories }) — that mismatch is exactly what threw
  // "Cannot read properties of undefined (reading 'map')". Keying data by tab
  // means the "category" branch can only ever read what `/reports/category`
  // actually returned, never another tab's leftovers.
  const [reportsByTab, setReportsByTab] = useState({});
  const [loadingTab, setLoadingTab] = useState(null); // which tab is currently fetching
  const [errorByTab, setErrorByTab] = useState({});

  useEffect(() => {
    let cancelled = false;
    setLoadingTab(tab);
    setErrorByTab((prev) => ({ ...prev, [tab]: null }));

    api
      .get(`/reports/${tab}`)
      .then((res) => {
        if (cancelled) return;
        setReportsByTab((prev) => ({ ...prev, [tab]: res.data }));
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(`Failed to load /reports/${tab}:`, err.response?.status, err.response?.data || err.message);
        const status = err.response?.status;
        setErrorByTab((prev) => ({
          ...prev,
          [tab]:
            status === 404
              ? `The server has no route for /reports/${tab}. Restart the backend so it picks up the latest routes/reports.js.`
              : 'Could not load this report. Please try again.',
        }));
      })
      .finally(() => {
        if (!cancelled) setLoadingTab((current) => (current === tab ? null : current));
      });

    // If the user switches tabs before this resolves, ignore the stale response —
    // it belongs to a tab that isn't selected anymore.
    return () => {
      cancelled = true;
    };
  }, [tab]);

  const data = reportsByTab[tab];
  const loading = loadingTab === tab && !data;
  const error = errorByTab[tab];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-extrabold">Reports</h1>

      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl2 text-sm font-bold transition-colors ${
              tab === t.key ? 'bg-household-primary text-white' : 'bg-white text-household-text'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-household-muted py-6">Loading...</p>
      ) : error ? (
        <div className="card text-center">
          <p className="text-household-danger font-semibold">{error}</p>
        </div>
      ) : !data ? (
        <p className="text-center text-household-muted py-6">No data yet.</p>
      ) : (
        <div className="card space-y-4">
          {tab === 'daily' && (
            <>
              <p className="text-sm text-household-muted font-semibold">Today's total</p>
              <p className="text-3xl font-extrabold">₹{(data.total || 0).toLocaleString('en-IN')}</p>
              <div className="divide-y divide-gray-100">
                {data.expenses?.length ? (
                  data.expenses.map((e) => (
                    <div key={e._id} className="flex justify-between py-2 text-sm">
                      <span className="font-semibold">{e.category}</span>
                      <span className="font-bold">₹{e.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-household-muted py-4">No expenses today.</p>
                )}
              </div>
            </>
          )}

          {tab === 'weekly' && (
            <>
              <p className="text-sm text-household-muted font-semibold">This week's total</p>
              <p className="text-3xl font-extrabold">₹{(data.total || 0).toLocaleString('en-IN')}</p>
              <div className="space-y-2">
                {data.daily?.length ? (
                  data.daily.map((d) => (
                    <div key={d._id} className="flex justify-between text-sm">
                      <span className="font-semibold">{d._id}</span>
                      <span className="font-bold">₹{d.total.toLocaleString('en-IN')}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-household-muted py-4">No expenses this week.</p>
                )}
              </div>
            </>
          )}

          {tab === 'monthly' && (
            <>
              <p className="text-sm text-household-muted font-semibold">This month's total</p>
              <p className="text-3xl font-extrabold">₹{(data.total || 0).toLocaleString('en-IN')}</p>
              <div>
                <p className="font-bold text-sm mb-2">By category</p>
                <div className="space-y-2">
                  {data.byCategory?.length ? (
                    data.byCategory.map((c) => (
                      <div key={c.category} className="flex justify-between text-sm">
                        <span className="font-semibold">{c.category}</span>
                        <span className="font-bold">₹{c.total.toLocaleString('en-IN')}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-household-muted py-4">No expenses this month.</p>
                  )}
                </div>
              </div>
            </>
          )}

          {tab === 'category' && (
            <div className="space-y-2">
              {data.categories?.length ? (
                data.categories.map((c) => (
                  <div key={c.category} className="flex justify-between text-sm">
                    <span className="font-semibold">
                      {c.category} <span className="text-household-muted">({c.count})</span>
                    </span>
                    <span className="font-bold">₹{c.total.toLocaleString('en-IN')}</span>
                  </div>
                ))
              ) : (
                <p className="text-center text-household-muted py-4">No data for this month.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

