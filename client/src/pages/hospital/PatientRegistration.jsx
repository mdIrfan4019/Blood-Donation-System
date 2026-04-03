import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerPatientThunk, clearHospitalStatus } from "../../store/slices/hospitalSlice";
import apiNode from "../../services/apiNode";

export default function PatientRegistration() {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((s) => s.hospital);

  const [recentPatients, setRecentPatients] = useState([]);
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "Male",
    bloodGroup: "A+",
  });

  const fetchRecent = async () => {
    try {
      const res = await apiNode.get("/hospital/patients");
      setRecentPatients(res.data.slice(0, 5)); // Show last 5
    } catch (err) {
      console.error("Failed to fetch patients");
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  useEffect(() => {
    if (success && success.includes("registered")) {
      setForm({
        name: "",
        age: "",
        gender: "Male",
        bloodGroup: "A+",
      });
      fetchRecent();
      setTimeout(() => dispatch(clearHospitalStatus()), 4000);
    }
  }, [success, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerPatientThunk(form));
  };

  const handleAction = async (action, id) => {
    if (action === 'delete' && !window.confirm("Are you sure you want to permanently delete this patient record?")) return;
    try {
      if (action === 'delete') await apiNode.delete(`/hospital/patient/${id}`);
      if (action === 'block') await apiNode.patch(`/hospital/patient/${id}/block`);
      if (action === 'unblock') await apiNode.patch(`/hospital/patient/${id}/unblock`);
      fetchRecent();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  return (
    <div className="text-slate-800 dark:text-slate-100">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-extrabold premium-gradient-text tracking-tight">
              Patient Records 📋
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              Register and manage patients for medical treatment.
            </p>
          </div>
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-3xl text-3xl flex items-center justify-center shadow-xl">📑</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Registration Form */}
          <div className="lg:col-span-2">
            <div className="glass-card p-10 rounded-[3rem] shadow-2xl border-white/20">
              <h3 className="text-xl font-black mb-8 uppercase tracking-widest">New Patient</h3>
              <form onSubmit={handleSubmit} className="space-y-8">
                {error && <div className="p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 rounded-2xl border border-rose-100 dark:border-rose-900/50 text-sm font-bold">⚠️ {error}</div>}
                {success && <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 text-sm font-bold">✅ {success}</div>}

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Patient Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input-field w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-slate-900/50"
                      placeholder="Full Name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Age</label>
                      <input
                        type="number"
                        required
                        value={form.age}
                        onChange={(e) => setForm({ ...form, age: e.target.value })}
                        className="input-field w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-slate-900/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Gender</label>
                      <select
                        value={form.gender}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                        className="input-field w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-slate-900/50"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Blood Group Required</label>
                    <select
                      value={form.bloodGroup}
                      onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                      className="input-field w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-slate-900/50"
                    >
                      {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-emerald-900/40 hover:-translate-y-1 transition-all active:scale-[0.98]"
                >
                  {loading ? "Registering..." : "Complete Registration 📥"}
                </button>
              </form>
            </div>
          </div>

          {/* Recent Patients Table */}
          <div className="lg:col-span-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Recently Registered Patients</h4>
            <div className="glass-card rounded-[3rem] overflow-hidden border-white/20">
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="bg-slate-100 dark:bg-slate-900/50">
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Name</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Group</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Gender</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                     {recentPatients.length === 0 ? (
                       <tr>
                         <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No patients yet</td>
                       </tr>
                     ) : (
                       recentPatients.map(p => (
                        <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                          <td className="px-8 py-6 font-black">{p.name}</td>
                          <td className="px-8 py-6 text-center">
                            <span className="px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-[10px] font-black rounded-lg">{p.bloodGroup}</span>
                          </td>
                          <td className="px-8 py-6 text-sm font-bold text-slate-500">{p.gender}</td>
                          <td className="px-8 py-6 flex justify-end gap-2">
                             <button 
                               onClick={() => handleAction(p.isBlocked ? 'unblock' : 'block', p._id)}
                               className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded ${p.isBlocked ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-500'}`}
                             >
                               {p.isBlocked ? 'Blocked' : 'Block'}
                             </button>
                             <button 
                               onClick={() => handleAction('delete', p._id)}
                               className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded bg-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white"
                             >
                               DEL
                             </button>
                          </td>
                        </tr>
                       ))
                     )}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
