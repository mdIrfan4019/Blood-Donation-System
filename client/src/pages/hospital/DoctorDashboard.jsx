import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchInventoryForRequest, 
  requestBloodThunk, 
  fetchDoctorRequestsThunk, 
  completeRequestThunk,
  clearHospitalStatus 
} from "../../store/slices/hospitalSlice";
import apiNode from "../../services/apiNode";

export default function DoctorDashboard() {
  const dispatch = useDispatch();
  const { inventoryCheck, doctorRequests, loading, error, success } = useSelector((s) => s.hospital);

  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    patientId: "",
    bloodGroup: "A+",
    component: "Whole Blood",
    units: 1,
  });

  useEffect(() => {
    dispatch(fetchDoctorRequestsThunk());
    const getPatients = async () => {
      try {
        const res = await apiNode.get("/hospital/patients");
        setPatients(res.data);
      } catch (err) {
        console.error("Failed to fetch patients");
      }
    };
    getPatients();
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => dispatch(clearHospitalStatus()), 4000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  const handleCheckStock = () => {
    dispatch(fetchInventoryForRequest(form.bloodGroup));
  };

  const handleRequest = (e) => {
    e.preventDefault();
    dispatch(requestBloodThunk(form));
  };

  const handleComplete = (id) => {
    dispatch(completeRequestThunk(id));
  };

  const stockInfo = inventoryCheck?.[form.bloodGroup];

  return (
    <div className="text-slate-800 dark:text-slate-100 regular-font">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-extrabold premium-gradient-text tracking-tight">
              Clinical Operations 🏥
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              Request blood units and confirm handovers to patients.
            </p>
          </div>
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center text-3xl shadow-xl">🧪</div>
        </div>

        {error && <div className="mb-8 p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 rounded-2xl border border-rose-100 dark:border-rose-900/50 text-sm font-bold">⚠️ {error}</div>}
        {success && <div className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 text-sm font-bold">✅ {success}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Request Section */}
          <div className="lg:col-span-2 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Form */}
              <div className="glass-card p-10 rounded-[3rem] shadow-2xl border-white/20">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">New Request</h4>
                <form onSubmit={handleRequest} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Select Patient</label>
                    <select
                      required
                      value={form.patientId}
                      onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                      className="input-field w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-slate-900/50"
                    >
                      <option value="">Choose Patient...</option>
                      {patients.map(p => (
                        <option key={p._id} value={p._id}>{p.name} ({p.bloodGroup})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Blood Group</label>
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
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Units</label>
                      <input
                        type="number"
                        min="1"
                        value={form.units}
                        onChange={(e) => setForm({ ...form, units: e.target.value })}
                        className="input-field w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-slate-900/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Component</label>
                    <select
                      value={form.component}
                      onChange={(e) => setForm({ ...form, component: e.target.value })}
                      className="input-field w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-slate-900/50"
                    >
                      <option value="Whole Blood">Whole Blood</option>
                      <option value="Plasma">Plasma</option>
                      <option value="Platelets">Platelets</option>
                      <option value="RBC">RBC (Packed Red Cells)</option>
                      <option value="Cryoprecipitate">Cryoprecipitate</option>
                    </select>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button
                      type="button"
                      onClick={handleCheckStock}
                      className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-[10px] uppercase tracking-widest border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      Check Stock 🔍
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-900/30 hover:-translate-y-1 transition-all"
                    >
                      {loading ? "Processing..." : "Assign to Patient 🩸"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Inventory Insight */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Inventory Status</h4>
                {stockInfo ? (
                  <div className="glass-card p-8 rounded-[3rem] border-emerald-500/20 bg-emerald-50/10 active-status-card">
                    <div className="flex justify-between items-end mb-8">
                      <div>
                        <h5 className="text-5xl font-black text-emerald-600">{stockInfo.totalAvailable}</h5>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mt-1">Available Units ({form.bloodGroup})</p>
                      </div>
                      <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/40 rounded-2xl flex items-center justify-center text-3xl">❄️</div>
                    </div>

                    <div className="space-y-3">
                      {stockInfo.items?.length > 0 ? (
                        stockInfo.items.map(item => (
                          <div key={item._id} className="p-4 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-white dark:border-slate-800 flex justify-between items-center shadow-sm">
                            <div>
                              <p className="text-xs font-black text-slate-700 dark:text-slate-300">{item.component}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Temp: {item.temperature}</p>
                            </div>
                            <span className="text-lg font-black text-emerald-600">{item.unitsAvailable}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-6 text-slate-400 font-bold uppercase tracking-widest text-[10px] italic">Out of stock</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="glass-card h-full p-20 rounded-[3rem] text-center border-dashed border-slate-300 dark:border-slate-700 opacity-50 flex items-center justify-center">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Select group and check stock</p>
                  </div>
                )}
              </div>
            </div>

            {/* Active Requests List */}
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Patient Requests & Handover Tracking</h4>
              <div className="glass-card rounded-[3rem] overflow-hidden border-white/20">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-900/50">
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Patient</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Requirement</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {doctorRequests.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No active requests</td>
                        </tr>
                      ) : (
                        doctorRequests.map(req => (
                          <tr key={req._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                            <td className="px-8 py-6">
                              <p className="font-black">{req.patient?.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(req.createdAt).toLocaleDateString()}</p>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <div className="inline-flex flex-col items-center">
                                <span className="text-xs font-black">{req.units} Units</span>
                                <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">{req.bloodGroup} {req.component}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                req.status === "completed" ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600 animate-pulse"
                              }`}>
                                {req.status}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              {req.status !== "completed" ? (
                                <button
                                  onClick={() => handleComplete(req._id)}
                                  className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-900/20 hover:scale-105 transition-transform"
                                >
                                  Handover Confirmed 🤝
                                </button>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-400 italic">Closed at {new Date(req.completedAt).toLocaleTimeString()}</span>
                              )}
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

          {/* Side Insight */}
          <div className="hidden lg:block space-y-8">
            <div className="glass-card p-10 rounded-[3rem] bg-slate-900 text-white border-0">
               <h5 className="text-xl font-black mb-4">Medical Guidelines</h5>
               <ul className="space-y-4 text-xs font-medium text-slate-400">
                 <li className="flex gap-3">
                   <span className="text-emerald-500">✓</span>
                   Always verify patient ID before blood handover.
                 </li>
                 <li className="flex gap-3">
                   <span className="text-emerald-500">✓</span>
                   Ensure cold chain is maintained until the point of use.
                 </li>
                 <li className="flex gap-3">
                   <span className="text-emerald-500">✓</span>
                   Mark as completed immediately after handover is done.
                 </li>
               </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
