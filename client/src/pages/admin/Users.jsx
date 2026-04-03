

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  deleteUserThunk,
  blockUserThunk,
  unblockUserThunk,
  clearAdminStatus,
} from "../../store/slices/adminSlice";

export default function Users() {
  const dispatch = useDispatch();
  const { users = [], loading, error } = useSelector((s) => s.admin);

  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const filteredUsers = users.filter((u) => {
    const matchRole = roleFilter === "all" ? true : u.role === roleFilter;

    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());

    return matchRole && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-10">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold premium-gradient-text tracking-tight">
            User Directory 👥
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            Manage donors, recipients, and medical partners
          </p>
        </div>
        <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
           <div className="px-4 py-2 text-sm font-bold text-slate-500">Total Users: {users.length}</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-6 rounded-3xl mb-10 flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <label className="label-text">Search Directory</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              placeholder="Filter by name, email or ID..."
              className="input-field pl-12"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="w-full lg:w-64">
          <label className="label-text">Filter by Role</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Roles</option>
            <option value="donor">Donors</option>
            <option value="hospital">Hospitals</option>
          </select>
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

      {/* Users List */}
      {!loading && filteredUsers.length > 0 && (
        <div className="glass-card rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none border-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Identity</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Joined Date</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg shadow-inner">
                          {u.role === "hospital" ? "🏥" : u.role === "donor" ? "🩸" : "👤"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100">{u.name || "Unnamed User"}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                         u.role === "admin" ? "bg-purple-50 text-purple-600 border-purple-100" :
                         u.role === "hospital" ? "bg-blue-50 text-blue-600 border-blue-100" :
                         u.role === "recipient" ? "bg-green-50 text-green-600 border-green-100" :
                         "bg-rose-50 text-rose-600 border-rose-100"
                       }`}>
                         {u.role}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-1.5">
                         <span className={`w-2 h-2 rounded-full ${u.isBlocked ? "bg-rose-500" : "bg-emerald-500"}`} />
                         <span className={`text-[10px] font-black uppercase ${u.isBlocked ? "text-rose-600" : "text-emerald-600"}`}>
                           {u.isBlocked ? "Blocked" : "Active"}
                         </span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500">
                       {new Date(u.createdAt).toLocaleDateString("en-US", {month: 'short', day: 'numeric', year: 'numeric'})}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2">
                         <button
                           onClick={() => u.isBlocked ? dispatch(unblockUserThunk(u._id)) : dispatch(blockUserThunk(u._id))}
                           className={`p-2 rounded-xl transition-all ${u.isBlocked ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-amber-50 text-amber-600 hover:bg-amber-100"}`}
                           title={u.isBlocked ? "Unblock User" : "Block User"}
                         >
                           {u.isBlocked ? "🔓" : "🚫"}
                         </button>
                         <button
                           onClick={() => {
                             if (window.confirm("Permanently delete this user?")) dispatch(deleteUserThunk(u._id));
                           }}
                           className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all"
                           title="Delete User"
                         >
                           🗑️
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredUsers.length === 0 && (
        <div className="text-center py-32 glass-card rounded-3xl">
          <div className="text-4xl mb-4 opacity-20">📂</div>
          <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-sm">No Matching Users</p>
          <p className="text-slate-500 text-xs mt-2">Adjust your search or filter parameters</p>
        </div>
      )}
    </div>
  );
}
