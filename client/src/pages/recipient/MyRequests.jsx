// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchMyRequests } from "../../store/slices/recipientSlice";

// export default function MyRequests() {
//   const dispatch = useDispatch();

//   const { requests = [], loading, error } = useSelector((s) => s.recipient);

//   const [activeTab, setActiveTab] = useState("pending");

//   useEffect(() => {
//     dispatch(fetchMyRequests());

//     // ✅ auto refresh every 5 seconds
//     const interval = setInterval(() => {
//       dispatch(fetchMyRequests());
//     }, 5000);

//     return () => clearInterval(interval);
//   }, [dispatch]);

//   const statusStyle = (status) => {
//     switch (status) {
//       case "matched":
//         return "bg-green-100 text-green-700";
//       case "completed":
//         return "bg-blue-100 text-blue-700";
//       default:
//         return "bg-yellow-100 text-yellow-700";
//     }
//   };

//   // ✅ Split requests
//   const pendingRequests = requests.filter((r) => r.status !== "completed");
//   const completedRequests = requests.filter((r) => r.status === "completed");

//   // ✅ Choose list based on tab
//   const displayedRequests =
//     activeTab === "pending" ? pendingRequests : completedRequests;

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       {/* Header */}
//       <h2 className="text-2xl font-bold text-red-600 mb-4">
//         My Blood Requests 🩸
//       </h2>

//       {/* Tabs */}
//       <div className="flex gap-3 mb-6">
//         <button
//           onClick={() => setActiveTab("pending")}
//           className={`px-5 py-2 rounded-lg font-semibold transition ${
//             activeTab === "pending"
//               ? "bg-orange-600 text-white shadow"
//               : "bg-white text-gray-700 border"
//           }`}
//         >
//           ⏳ Pending ({pendingRequests.length})
//         </button>

//         <button
//           onClick={() => setActiveTab("completed")}
//           className={`px-5 py-2 rounded-lg font-semibold transition ${
//             activeTab === "completed"
//               ? "bg-blue-600 text-white shadow"
//               : "bg-white text-gray-700 border"
//           }`}
//         >
//           ✅ Completed ({completedRequests.length})
//         </button>
//       </div>

//       {/* Loading / Error */}
//       {loading && <p className="text-gray-600">Loading...</p>}
//       {error && <p className="text-red-500">{error}</p>}

//       {/* Empty State */}
//       {!loading && displayedRequests.length === 0 && (
//         <p className="text-gray-500 text-center mt-10">
//           No {activeTab} requests found
//         </p>
//       )}

//       {/* Requests List */}
//       {displayedRequests.map((r) => (
//         <div key={r._id} className="bg-white rounded-xl shadow p-4 mb-4">
//           <p>
//             <strong>Blood Group:</strong> {r.bloodGroup}
//           </p>

//           <p>
//             <strong>Units:</strong> {r.units}
//           </p>

//           <span
//             className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${statusStyle(
//               r.status
//             )}`}
//           >
//             {r.status.toUpperCase()}
//           </span>

//           {r.matchedDonor && (
//             <p className="text-sm mt-2 text-gray-600">
//               Donor: {r.matchedDonor.name} ({r.matchedDonor.email})
//             </p>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyRequests } from "../../store/slices/recipientSlice";

export default function MyRequests() {
  const dispatch = useDispatch();

  const { requests = [], loading, error } = useSelector((s) => s.recipient);

  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    dispatch(fetchMyRequests());

    // ✅ auto refresh every 5 seconds
    const interval = setInterval(() => {
      dispatch(fetchMyRequests());
    }, 5000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const statusStyle = (status) => {
    switch (status) {
      case "matched":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const urgencyStyle = (urgency) => {
    switch (urgency) {
      case "critical":
        return "bg-red-600 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-400 text-black";
      case "low":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ✅ Urgency priority mapping
  const urgencyPriority = {
    critical: 1,
    high: 2,
    medium: 3,
    low: 4,
  };

  // ✅ Split requests
  const pendingRequests = requests
    .filter((r) => r.status !== "completed")
    .sort((a, b) => {
      const aPriority = urgencyPriority[a.urgency] || 99;
      const bPriority = urgencyPriority[b.urgency] || 99;
      return aPriority - bPriority; // critical first
    });

  const completedRequests = requests.filter((r) => r.status === "completed");

  // ✅ Choose list based on tab
  const displayedRequests =
    activeTab === "pending" ? pendingRequests : completedRequests;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-extrabold premium-gradient-text tracking-tight">
              Request Tracking 📡
            </h2>
            <p className="text-slate-500 font-medium mt-2">
              Monitor the real-time status of your life-saving requirements
            </p>
          </div>

          {/* Tabs */}
          <div className="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-2xl w-fit shadow-inner">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
                activeTab === "pending"
                  ? "bg-white dark:bg-slate-700 text-primary shadow-sm scale-[1.02]"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              ⏳ Active ({pendingRequests.length})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
                activeTab === "completed"
                  ? "bg-white dark:bg-slate-700 text-emerald-500 shadow-sm scale-[1.02]"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              ✅ Fulfilled ({completedRequests.length})
            </button>
          </div>
        </div>

        {/* Loading / Error */}
        {(loading || error) && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            {loading && <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>}
            {error && <p className="text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/30 px-6 py-2 rounded-full border border-rose-100 dark:border-rose-900/50">⚠️ {error}</p>}
          </div>
        )}

        {/* Empty State */}
        {!loading && displayedRequests.length === 0 && (
          <div className="glass-card p-20 rounded-[3rem] text-center border-dashed border-2">
            <div className="text-6xl mb-6 grayscale opacity-20">🌫️</div>
            <p className="text-slate-400 font-bold uppercase tracking-widest">
              No {activeTab} requests on record
            </p>
            <button 
              onClick={() => navigate("/recipient/request")}
              className="mt-6 text-primary font-black hover:underline underline-offset-8"
            >
              Create New Request →
            </button>
          </div>
        )}

        {/* Requests List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-1000">
          {displayedRequests.map((r) => (
            <div key={r._id} className="glass-card p-8 rounded-[2rem] hover:translate-y-[-4px] transition-all group border-l-4 border-l-transparent hover:border-l-primary relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-3xl font-black text-slate-800 dark:text-slate-100">
                    {r.bloodGroup}
                  </h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                    {r.component || "Whole Blood"}
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${statusStyle(r.status)}`}>
                    {r.status}
                  </span>
                  {activeTab === "pending" && (
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${urgencyStyle(r.urgency)}`}>
                      {r.urgency} Priority
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Quantity Required</span>
                  <span className="text-lg font-black text-primary">{r.units} Units</span>
                </div>

                {r.matchedDonor && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                      👤
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-emerald-600">Donor Matched</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{r.matchedDonor.name}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between px-2">
                   <p className="text-[10px] font-bold text-slate-400">
                    {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400">
                    ID: {r._id.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
