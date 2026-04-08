import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addStaffThunk, fetchStaffThunk, clearHospitalStatus } from "../../store/slices/hospitalSlice";
import apiNode from "../../services/apiNode";

export default function StaffManagement({ onPerformTask }) {
  const dispatch = useDispatch();
  const { loading, error, success, staff } = useSelector((s) => s.hospital);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "tester",
  });

  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    status: "all"
  });

  useEffect(() => {
    dispatch(fetchStaffThunk());
  }, [dispatch]);

  useEffect(() => {
    if (success && success.includes("registered")) {
      setForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "tester",
      });
      setTimeout(() => dispatch(clearHospitalStatus()), 4000);
    }
  }, [success, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(addStaffThunk(form));
  };

  const handleAction = async (action, id) => {
    if (action === 'delete' && !window.confirm("Are you sure you want to permanently delete this personnel?")) return;
    try {
      if (action === 'delete') await apiNode.delete(`/hospital/user/${id}`);
      if (action === 'block') await apiNode.patch(`/hospital/user/${id}/block`);
      if (action === 'unblock') await apiNode.patch(`/hospital/user/${id}/unblock`);
      dispatch(fetchStaffThunk());
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(filters.search.toLowerCase()) || 
                          s.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesRole = filters.role === "all" || s.role === filters.role;
    const matchesStatus = filters.status === "all" || 
                          (filters.status === "active" && !s.isBlocked) || 
                          (filters.status === "blocked" && s.isBlocked);
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-extrabold premium-gradient-text tracking-tight">
              Hospital Personnel 👨‍⚕️
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              Add and manage your medical and administrative staff.
            </p>
          </div>
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center text-3xl shadow-xl">🏥</div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          {/* Section 1: Staff Registration */}
          <div className="xl:col-span-4 space-y-6">
            <div className="glass-card p-10 rounded-[3rem] shadow-2xl border-white/20 h-fit sticky top-8">
              <h3 className="text-xl font-black mb-8 text-slate-800 dark:text-slate-100 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-4">Staff Registration</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 rounded-2xl border border-rose-100 dark:border-rose-900/50 text-xs font-bold">
                    ⚠️ {error}
                  </div>
                )}
                {success && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 text-xs font-bold">
                    ✅ {success}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Full Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input-field w-full px-6 py-4 rounded-2xl text-xs"
                      placeholder="Dr. John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Email Address</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="input-field w-full px-6 py-4 rounded-2xl text-xs"
                      placeholder="john@hospital.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Password</label>
                    <input
                      type="password"
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="input-field w-full px-6 py-4 rounded-2xl text-xs"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Staff Role</label>
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="input-field w-full px-6 py-4 rounded-2xl text-xs appearance-none"
                    >
                      <option value="tester">Lab Tester (Pathologist)</option>
                      <option value="doctor">Doctor</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="nurse">Nurse</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-red-500/30 hover:-translate-y-1 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? "Registering..." : "Submit Staff Registration"}
                </button>
              </form>
            </div>
          </div>

          {/* Section 2: Staff Directory (Detailed with Filters) */}
          <div className="xl:col-span-8 space-y-8">
            <div className="glass-card p-8 rounded-[3rem] shadow-xl border-white/10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Registered Members Detail</h3>
                
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative group">
                    <input 
                      type="text" 
                      placeholder="Search name or email..."
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                      className="bg-slate-100 dark:bg-slate-800/50 border-0 rounded-2xl px-10 py-3 text-xs focus:ring-2 ring-primary/20 w-full md:w-64"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
                  </div>
                  
                  <select 
                    value={filters.role}
                    onChange={(e) => setFilters({...filters, role: e.target.value})}
                    className="bg-slate-100 dark:bg-slate-800/50 border-0 rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-widest focus:ring-2 ring-primary/20"
                  >
                    <option value="all">All Roles</option>
                    <option value="doctor">Doctors</option>
                    <option value="tester">Testers</option>
                    <option value="nurse">Nurses</option>
                    <option value="receptionist">Receptionists</option>
                  </select>

                  <select 
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="bg-slate-100 dark:bg-slate-800/50 border-0 rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-widest focus:ring-2 ring-primary/20"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 max-h-[800px] overflow-y-auto custom-scrollbar pr-2">
                {filteredStaff.length === 0 ? (
                  <div className="col-span-full text-center py-32 bg-slate-50 dark:bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No personnel matches your filters</p>
                  </div>
                ) : (
                  filteredStaff.map((s) => (
                    <div key={s._id} className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-2xl transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 flex gap-2">
                         <button 
                           onClick={() => handleAction(s.isBlocked ? 'unblock' : 'block', s._id)}
                           className={`p-2 rounded-xl transition-colors ${s.isBlocked ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-600'}`}
                           title={s.isBlocked ? "Unblock User" : "Block User"}
                         >
                           {s.isBlocked ? "🔓" : "🚫"}
                         </button>
                         <button 
                           onClick={() => handleAction('delete', s._id)}
                           className="p-2 bg-slate-100 text-slate-400 hover:bg-rose-600 hover:text-white rounded-xl transition-all"
                           title="Delete Staff"
                         >
                           🗑️
                         </button>
                      </div>

                      <div className="flex flex-col h-full">
                        <div className="mb-6">
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                            s.role === 'tester' ? 'bg-blue-100 text-blue-600' : 
                            s.role === 'doctor' ? 'bg-purple-100 text-purple-600' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {s.role}
                          </span>
                        </div>
                        
                        <h5 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2 truncate pr-20">{s.name}</h5>
                        <p className="text-xs font-medium text-slate-500 mb-6 truncate">{s.email}</p>
                        
                        <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-700 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${s.isBlocked ? 'bg-rose-500' : 'bg-emerald-500 shake-slow'}`}></div>
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-50">
                              {s.isBlocked ? "Restricted" : "Active Member"}
                            </span>
                          </div>
                          <span className="text-[9px] font-bold text-slate-300">ID: {s._id.slice(-6)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
