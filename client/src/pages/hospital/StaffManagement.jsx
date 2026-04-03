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
    role: "tester", // Changed default to tester as per user focus
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

  return (
    <div className="">
      <div className="max-w-6xl mx-auto">
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

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Form Section */}
          <div className="lg:col-span-3 glass-card p-10 rounded-[3rem] shadow-2xl border-white/20 h-fit">
            <h3 className="text-xl font-black mb-8 text-slate-800 dark:text-slate-100 uppercase tracking-widest">Register New Staff</h3>
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 rounded-2xl border border-rose-100 dark:border-rose-900/50 text-sm font-bold">
                  ⚠️ {error}
                </div>
              )}
              {success && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 text-sm font-bold">
                  ✅ {success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Full Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:ring-primary/20"
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
                    className="input-field w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:ring-primary/20"
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
                    className="input-field w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:ring-primary/20"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Staff Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="input-field w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:ring-primary/20"
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
                className="w-full py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-primary/40 hover:-translate-y-1 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Registering Staff..." : "Add Staff Member 🚀"}
              </button>
            </form>
          </div>

          {/* List Section */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Staff Members</h4>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {staff.length === 0 ? (
                <div className="text-center py-20 grayscale opacity-20">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No staff found</p>
                </div>
              ) : (
                staff.map((s) => (
                  <div key={s._id} className="glass-card p-6 rounded-3xl border border-white/10 hover:border-primary/20 transition-all group">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-black text-slate-800 dark:text-slate-100">{s.name}</h5>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{s.email}</p>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <span className={`px-3 py-1 bg-slate-100 dark:bg-slate-800 text-[9px] font-black rounded-lg uppercase tracking-widest ${s.role === 'tester' ? 'text-blue-500' : 'text-slate-500'} ${s.isBlocked ? 'text-rose-500 line-through' : ''}`}>
                          {s.isBlocked ? "BLOCKED" : s.role}
                        </span>
                        <div className="flex gap-2">
                           <button 
                             onClick={() => handleAction(s.isBlocked ? 'unblock' : 'block', s._id)}
                             className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 hover:text-slate-800"
                           >
                             {s.isBlocked ? 'Unblock' : 'Block'}
                           </button>
                           <button 
                             onClick={() => handleAction('delete', s._id)}
                             className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded bg-rose-100 dark:bg-rose-900/30 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                           >
                             Del
                           </button>
                        </div>
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
  );
}
