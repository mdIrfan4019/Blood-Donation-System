// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";

// import { fetchAdminStats } from "../../store/slices/adminStatsSlice";
// import { fetchInventory } from "../../store/slices/bloodbankSlice";

// export default function AdminDashboard() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const { stats, loading: statsLoading, error: statsError } = useSelector(
//     (s) => s.adminStats
//   );

//   const {
//     inventory = [],
//     loading: inventoryLoading,
//     error: inventoryError,
//   } = useSelector((s) => s.bloodbank);

//   useEffect(() => {
//     dispatch(fetchAdminStats());
//     dispatch(fetchInventory());
//   }, [dispatch]);

//   /* ======================
//      INVENTORY HELPERS
//   ====================== */
//   const getUnits = (bg) => {
//     const item = inventory.find((i) => i.bloodGroup === bg);
//     return item ? item.units : 0;
//   };

//   const getStatus = (units) => {
//     if (units === 0) return "❌ Out of Stock";
//     if (units <= 5) return "⚠️ Low Stock";
//     return "✅ Available";
//   };

//   const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

//   const alerts = bloodGroups
//     .map((bg) => ({ bg, units: getUnits(bg) }))
//     .filter((x) => x.units <= 5);

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       {/* Header */}
//       <div className="mb-8">
//         <h2 className="text-3xl font-bold text-red-600">
//           Admin Dashboard 🛡
//         </h2>
//         <p className="text-gray-500 text-sm mt-1">
//           System overview, inventory monitoring and quick actions
//         </p>
//       </div>

//       {/* Loading */}
//       {(statsLoading || inventoryLoading) && (
//         <div className="flex justify-center py-10">
//           <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
//         </div>
//       )}

//       {/* Errors */}
//       {(statsError || inventoryError) && (
//         <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md mb-6">
//           {statsError || inventoryError}
//         </div>
//       )}

//       {/* Quick Stats */}
//       {stats && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <StatCard title="Total Donors" value={stats.totalDonors} icon="👤" />
//           <StatCard
//             title="Pending Donations"
//             value={stats.pendingDonations}
//             icon="🩸"
//           />
//           <StatCard
//             title="Total Inventory Units"
//             value={stats.totalInventoryUnits}
//             icon="📦"
//           />
//           <StatCard
//             title="Pending Requests"
//             value={stats.pendingRequests}
//             icon="📌"
//           />
//         </div>
//       )}

//       {/* Quick Actions */}
//       <div className="flex flex-col sm:flex-row gap-4 mb-10">
//         <button
//           onClick={() => navigate("/admin/donations")}
//           className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-red-700 transition"
//         >
//           🩸 Approve Donations
//         </button>

//         <button
//           onClick={() => navigate("/admin/inventory")}
//           className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-blue-700 transition"
//         >
//           📦 Manage Inventory
//         </button>

//         <button
//           onClick={() => navigate("/admin/forecast")}
//           className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-green-700 transition"
//         >
//           📈 AI Forecast
//         </button>

//         <button
//           onClick={() => navigate("/admin/users")}
//           className="bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-gray-900 transition"
//         >
//           👥 Manage Users
//         </button>
//       </div>

//       {/* Inventory Summary */}
//       <div className="bg-white rounded-xl shadow p-6 mb-10">
//         <h3 className="text-xl font-bold mb-4">📦 Inventory Overview</h3>

//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="p-3 text-left">Blood Group</th>
//                 <th className="p-3 text-left">Units</th>
//                 <th className="p-3 text-left">Status</th>
//               </tr>
//             </thead>

//             <tbody>
//               {bloodGroups.map((bg) => {
//                 const units = getUnits(bg);
//                 const status = getStatus(units);

//                 return (
//                   <tr key={bg} className="border-t">
//                     <td className="p-3 font-semibold">{bg}</td>
//                     <td className="p-3">{units}</td>
//                     <td
//                       className={`p-3 font-semibold ${
//                         units === 0
//                           ? "text-red-600"
//                           : units <= 5
//                           ? "text-orange-600"
//                           : "text-green-600"
//                       }`}
//                     >
//                       {status}
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Alerts Section */}
//       <div className="bg-white rounded-xl shadow p-6 mb-10">
//         <h3 className="text-xl font-bold mb-4 text-orange-600">
//           🚨 Stock Alerts
//         </h3>

//         {alerts.length === 0 ? (
//           <p className="text-green-600 font-semibold">
//             ✅ All blood groups are sufficiently stocked
//           </p>
//         ) : (
//           <div className="space-y-3 text-sm">
//             {alerts.map((a) => (
//               <p
//                 key={a.bg}
//                 className={`px-4 py-2 rounded-lg font-semibold ${
//                   a.units === 0
//                     ? "bg-red-100 text-red-700"
//                     : "bg-orange-100 text-orange-800"
//                 }`}
//               >
//                 {a.units === 0 ? "❌ Out of Stock" : "⚠️ Low Stock"}:{" "}
//                 {a.bg} ({a.units} units left)
//               </p>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Forecast Section */}
//       <div className="bg-white rounded-xl shadow p-6">
//         <h3 className="text-xl font-bold mb-4 text-green-700">
//           📈 AI Demand Forecast
//         </h3>

//         <p className="text-gray-600 text-sm mb-4">
//           Use AI model to predict upcoming blood demand and manage inventory.
//         </p>

//         <button
//           onClick={() => navigate("/admin/forecast")}
//           className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
//         >
//           Run Forecast
//         </button>
//       </div>
//     </div>
//   );
// }

// function StatCard({ title, value, icon }) {
//   return (
//     <div className="bg-white rounded-xl shadow p-6">
//       <div className="flex justify-between mb-2">
//         <h3 className="font-semibold text-gray-700">{title}</h3>
//         <span>{icon}</span>
//       </div>
//       <p className="text-3xl font-bold text-red-600">{value ?? 0}</p>
//     </div>
//   );
// }


import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchAdminStats } from "../../store/slices/adminStatsSlice";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { stats, loading, error } = useSelector((s) => s.adminStats);

  useEffect(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-10">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-4xl font-extrabold premium-gradient-text tracking-tight text-center md:text-left">
            Admin Management 🛡️
          </h2>
          <p className="text-slate-500 font-medium mt-1 text-center md:text-left text-sm sm:text-base">
            System pulse, critical alerts, and global operations
          </p>
        </div>
        <div className="flex items-center justify-center md:justify-end gap-3">
           <div className="px-4 py-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-2">
             <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">System Live</span>
           </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 text-red-600 p-4 rounded-2xl mb-8 border border-red-100 dark:border-red-900/50">
          {error}
        </div>
      )}

      {/* Quick Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 max-w-4xl">
          <StatCard title="Total Donors" value={stats.totalDonors} icon="👥" color="blue" />
          <StatCard title="Active Hospitals" value={stats.totalHospitals} icon="🏥" color="amber" />
        </div>
      )}

      {/* Main Actions Area */}
      <div className="mb-10 max-w-sm">
        <div className="glass-card p-8 rounded-3xl flex flex-col gap-4">
           <h3 className="text-lg font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Priority Actions</h3>
           <ActionButton 
             onClick={() => navigate("/admin/users")}
             label="User Directory"
             sub="Manage donor & hospitals"
             icon="👥"
             color="slate"
           />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    rose: "text-rose-600 bg-rose-50 dark:bg-rose-900/20",
    amber: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
  };

  return (
    <div className="glass-card p-6 rounded-3xl group hover:translate-y-[-4px] transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 flex items-center justify-center rounded-2xl text-xl ${colors[color]}`}>
          {icon}
        </div>
        <div className="text-right">
           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</h4>
        </div>
      </div>
      <p className="text-4xl font-black text-slate-800 dark:text-slate-100 mt-2">{value ?? 0}</p>
      <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
         <div className="bg-primary h-full w-2/3 rounded-full opacity-30" />
      </div>
    </div>
  );
}

function ActionButton({ onClick, label, sub, icon, color }) {
  const colors = {
    rose: "bg-rose-500 shadow-rose-500/20",
    emerald: "bg-emerald-500 shadow-emerald-500/20",
    primary: "bg-primary shadow-primary/20",
    slate: "bg-slate-800 shadow-slate-800/20",
  };

  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left border border-transparent hover:border-slate-100 dark:hover:border-slate-700 active:scale-[0.98]"
    >
      <div className={`w-12 h-12 flex items-center justify-center rounded-2xl text-xl text-white shadow-lg ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="font-bold text-slate-800 dark:text-slate-100">{label}</p>
        <p className="text-xs text-slate-500">{sub}</p>
      </div>
      <div className="ml-auto text-slate-300 group-hover:text-primary transition-colors">
        →
      </div>
    </button>
  );
}
