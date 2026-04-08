import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerPatientThunk, clearHospitalStatus } from "../../store/slices/hospitalSlice";
import apiNode from "../../services/apiNode";

export default function PatientRegistration() {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((s) => s.hospital);

  const [allPatients, setAllPatients] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    bloodGroup: "all",
    gender: "all"
  });

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "Male",
    bloodGroup: "A+",
  });

  const fetchPatients = async () => {
    try {
      const res = await apiNode.get("/hospital/patients");
      setAllPatients(res.data);
    } catch (err) {
      console.error("Failed to fetch patients");
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (success && success.includes("registered")) {
      setForm({
        name: "",
        age: "",
        gender: "Male",
        bloodGroup: "A+",
      });
      fetchPatients();
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
      fetchPatients();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const filteredPatients = allPatients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(filters.search.toLowerCase());
    const matchesBlood = filters.bloodGroup === "all" || p.bloodGroup === filters.bloodGroup;
    const matchesGender = filters.gender === "all" || p.gender === filters.gender;
    return matchesSearch && matchesBlood && matchesGender;
  });

  return (
    <div className="text-slate-800 dark:text-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-extrabold premium-gradient-text tracking-tight">
              Patient Management 📋
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              Enroll new patients and manage medical records.
            </p>
          </div>
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-3xl text-3xl flex items-center justify-center shadow-xl">📑</div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          {/* Section 1: Patient Enrollment */}
          <div className="xl:col-span-4">
            <div className="glass-card p-10 rounded-[3rem] shadow-2xl border-white/20 sticky top-8">
              <h3 className="text-xl font-black mb-8 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-4">Patient Enrollment</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 rounded-2xl border border-rose-100 dark:border-rose-900/50 text-xs font-bold">⚠️ {error}</div>}
                {success && <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 text-xs font-bold">✅ {success}</div>}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Patient Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input-field w-full px-6 py-4 rounded-2xl text-xs"
                      placeholder="Full Name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Age</label>
                      <input
                        type="number"
                        required
                        value={form.age}
                        onChange={(e) => setForm({ ...form, age: e.target.value })}
                        className="input-field w-full px-6 py-4 rounded-2xl text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Gender</label>
                      <select
                        value={form.gender}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                        className="input-field w-full px-6 py-4 rounded-2xl text-xs appearance-none"
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
                      className="input-field w-full px-6 py-4 rounded-2xl text-xs appearance-none"
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
                  {loading ? "Registering..." : "Complete Enrollment 📥"}
                </button>
              </form>
            </div>
          </div>

          {/* Section 2: Patient Registry (Detailed with Filters) */}
          <div className="xl:col-span-8 space-y-8">
            <div className="glass-card p-8 rounded-[3rem] shadow-xl border-white/10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Patient Registry</h3>
                
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative group">
                    <input 
                      type="text" 
                      placeholder="Search patient name..."
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                      className="bg-slate-100 dark:bg-slate-800/50 border-0 rounded-2xl px-10 py-3 text-xs focus:ring-2 ring-emerald-500/20 w-full md:w-64"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
                  </div>
                  
                  <select 
                    value={filters.bloodGroup}
                    onChange={(e) => setFilters({...filters, bloodGroup: e.target.value})}
                    className="bg-slate-100 dark:bg-slate-800/50 border-0 rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-widest focus:ring-2 ring-emerald-500/20"
                  >
                    <option value="all">All Groups</option>
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>

                  <select 
                    value={filters.gender}
                    onChange={(e) => setFilters({...filters, gender: e.target.value})}
                    className="bg-slate-100 dark:bg-slate-800/50 border-0 rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-widest focus:ring-2 ring-emerald-500/20"
                  >
                    <option value="all">All Genders</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto pb-4 max-h-[800px] overflow-y-auto custom-scrollbar">
                 <table className="w-full text-left border-separate border-spacing-y-3">
                   <thead>
                     <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                       <th className="px-8 py-2">Patient Details</th>
                       <th className="px-8 py-2 text-center">Blood Group</th>
                       <th className="px-8 py-2 text-center">Status</th>
                       <th className="px-8 py-2 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody>
                     {filteredPatients.length === 0 ? (
                       <tr>
                         <td colSpan="4" className="text-center py-32 bg-slate-50 dark:bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No patients found in registry</p>
                         </td>
                       </tr>
                     ) : (
                       filteredPatients.map(p => (
                        <tr key={p._id} className="group hover:-translate-y-1 transition-all duration-300">
                          <td className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 rounded-l-[2rem] border-y border-l border-slate-100 dark:border-slate-800 shadow-sm">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-lg shadow-sm font-black text-primary">
                                  {p.name.charAt(0)}
                                </div>
                                <div>
                                  <h5 className="font-black text-slate-800 dark:text-slate-100">{p.name}</h5>
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                                    {p.age} Yrs • {p.gender}
                                  </p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-800 text-center shadow-sm">
                            <span className="px-4 py-1.5 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-black rounded-xl">
                              {p.bloodGroup}
                            </span>
                          </td>
                          <td className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-800 text-center shadow-sm">
                            <div className="flex flex-col items-center gap-1">
                               <div className={`w-2 h-2 rounded-full ${p.isBlocked ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></div>
                               <span className="text-[8px] font-black uppercase tracking-tighter opacity-50">
                                 {p.isBlocked ? "On Hold" : "Active Case"}
                               </span>
                            </div>
                          </td>
                          <td className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 rounded-r-[2rem] border-y border-r border-slate-100 dark:border-slate-800 text-right shadow-sm">
                             <div className="flex justify-end gap-3">
                                <button 
                                  onClick={() => handleAction(p.isBlocked ? 'unblock' : 'block', p._id)}
                                  className={`p-2 rounded-xl transition-all ${p.isBlocked ? 'bg-emerald-100 text-emerald-600' : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-rose-500 shadow-sm'}`}
                                  title={p.isBlocked ? "Resume Service" : "Hold Service"}
                                >
                                  {p.isBlocked ? "🔓" : "🚫"}
                                </button>
                                <button 
                                  onClick={() => handleAction('delete', p._id)}
                                  className="p-2 bg-white dark:bg-slate-900 text-slate-400 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm"
                                  title="Archive Case"
                                >
                                  🗑️
                                </button>
                             </div>
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
