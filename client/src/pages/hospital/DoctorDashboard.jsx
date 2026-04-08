import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get("view") || "ops";

  const { inventoryCheck, doctorRequests, loading, error, success } = useSelector((s) => s.hospital);

  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    patientId: "",
    bloodGroup: "A+",
    component: "Whole Blood",
    units: 1,
  });

  const [historyFilters, setHistoryFilters] = useState({
    search: "",
    bloodGroup: "All",
    component: "All"
  });

  // Sync activeTab with URL 'view' parameter
  const activeTab = currentView;
  const setActiveTab = (view) => setSearchParams({ view });

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
      if (success.includes("approved")) {
         setForm({ patientId: "", bloodGroup: "A+", component: "Whole Blood", units: 1 });
      }
      dispatch(fetchDoctorRequestsThunk());
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

  // Logic: Only show patients not currently receiving blood
  const availablePatients = patients.filter(p => !p.isAssignedBlood && !p.isBlocked);

  // Filter requests by status for tabs
  const handoverRequests = doctorRequests.filter(r => r.status === "approved" || r.status === "pending");
  
  // Advanced Filtered History
  const historyRequests = doctorRequests.filter(r => {
    const isHistory = r.status === "completed" || r.status === "rejected";
    if (!isHistory) return false;

    const matchesSearch = r.patient?.name.toLowerCase().includes(historyFilters.search.toLowerCase());
    const matchesGroup = historyFilters.bloodGroup === "All" || r.bloodGroup === historyFilters.bloodGroup;
    const matchesComp = historyFilters.component === "All" || r.component === historyFilters.component;

    return matchesSearch && matchesGroup && matchesComp;
  });

  const tabs = [
    { id: "ops", name: "Clinical Ops", icon: "🧪" },
    { id: "handover", name: "Handover Queue", icon: "🤝" },
    { id: "history", name: "Patient History", icon: "📜" },
  ];

  return (
    <div className="text-slate-800 dark:text-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-5xl font-black premium-gradient-text tracking-tighter">
              Doctor Console 👨‍⚕️
            </h2>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
               Live Clinical Environment • {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-[2rem] border border-slate-200 dark:border-slate-800 backdrop-blur-xl">
             {tabs.map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
                   activeTab === tab.id 
                   ? "bg-white dark:bg-slate-800 text-primary shadow-2xl shadow-primary/10 ring-1 ring-slate-200 dark:ring-slate-700" 
                   : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                 }`}
               >
                 <span className="text-lg">{tab.icon}</span>
                 {tab.name}
               </button>
             ))}
          </div>
        </div>

        {error && <div className="mb-8 p-6 bg-rose-50 dark:bg-rose-950/30 text-rose-600 rounded-[2rem] border border-rose-100 dark:border-rose-900/50 text-xs font-black uppercase tracking-widest animate-in slide-in-from-top-4">⚠️ {error}</div>}
        {success && <div className="mb-8 p-6 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/50 text-xs font-black uppercase tracking-widest animate-in slide-in-from-top-4">✅ {success}</div>}

        <div className="mt-8 transition-all duration-700 animate-in fade-in slide-in-from-bottom-8">
          {activeTab === "ops" && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
              <div className="xl:col-span-4">
                <div className="glass-card p-10 rounded-[3rem] shadow-2xl border-white/20 sticky top-8">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-10 border-b border-slate-100 dark:border-slate-800 pb-4">Blood Assignment 🩸</h4>
                  <form onSubmit={handleRequest} className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Available Patients</label>
                      <select
                        required
                        value={form.patientId}
                        onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                        className="input-field w-full px-8 py-5 rounded-3xl text-sm appearance-none bg-slate-50 border-0 focus:ring-2 ring-primary/20"
                      >
                        <option value="">Choose Patient...</option>
                        {availablePatients.map(p => (
                          <option key={p._id} value={p._id}>{p.name} ({p.bloodGroup})</option>
                        ))}
                      </select>
                      <p className="text-[9px] font-bold text-slate-400 px-4">Only patients without current assignments are listed.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Blood Group</label>
                        <select
                          value={form.bloodGroup}
                          onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                          className="input-field w-full px-8 py-5 rounded-3xl text-sm appearance-none bg-slate-50 border-0 focus:ring-2 ring-primary/20"
                        >
                          {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Units Required</label>
                        <input
                          type="number"
                          min="1"
                          value={form.units}
                          onChange={(e) => setForm({ ...form, units: e.target.value })}
                          className="input-field w-full px-8 py-5 rounded-3xl text-sm bg-slate-50 border-0 focus:ring-2 ring-primary/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Blood Component</label>
                      <select
                        value={form.component}
                        onChange={(e) => setForm({ ...form, component: e.target.value })}
                        className="input-field w-full px-8 py-5 rounded-3xl text-sm appearance-none bg-slate-50 border-0 focus:ring-2 ring-primary/20"
                      >
                        <option value="Whole Blood">Whole Blood (Default)</option>
                        <option value="Plasma">Plasma</option>
                        <option value="Platelets">Platelets</option>
                        <option value="RBC">RBC (Packed Cells)</option>
                        <option value="Cryoprecipitate">Cryoprecipitate</option>
                      </select>
                    </div>

                    <div className="pt-6 flex flex-col gap-4">
                      <button
                        type="button"
                        onClick={handleCheckStock}
                        className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] border border-white/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
                      >
                        Query Inventory ❄️
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-6 bg-primary text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all disabled:opacity-50"
                      > 
                        {loading ? "Approving..." : "Submit Assignment"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="xl:col-span-8 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="glass-card p-10 rounded-[3rem] bg-emerald-600/5 border-emerald-500/10">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-8 flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Inventory Status
                      </h5>
                      {stockInfo ? (
                        <div className="space-y-6">
                           <div className="flex border-b border-emerald-500/10 pb-6 mb-6">
                              <span className="text-6xl font-black text-emerald-600">{stockInfo.totalAvailable}</span>
                              <div className="ml-4 pt-2">
                                <p className="text-xs font-black uppercase tracking-widest text-emerald-500">Units</p>
                                <p className="text-[10px] font-bold text-slate-400">Compatible with {form.bloodGroup}</p>
                              </div>
                           </div>
                           <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                              {stockInfo.items?.map(item => (
                                <div key={item._id} className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-emerald-500/10 flex justify-between items-center group hover:border-emerald-500/30 transition-all">
                                   <div>
                                      <p className="text-[11px] font-black text-slate-700 dark:text-slate-200">{item.component}</p>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Target Case: {item.bloodGroup}</p>
                                   </div>
                                   <div className="text-lg font-black text-emerald-600">{item.unitsAvailable}</div>
                                </div>
                              ))}
                           </div>
                        </div>
                      ) : (
                        <div className="text-center py-20">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">Choose a group and<br/>query the medical archives.</p>
                        </div>
                      )}
                   </div>

                   <div className="glass-card p-10 rounded-[3rem] bg-slate-900 text-white border-0 relative overflow-hidden">
                      <div className="relative z-10 flex flex-col h-full">
                         <h5 className="text-[10px] font-black uppercase tracking-widest text-primary mb-8">Clinical Directives</h5>
                         <ul className="space-y-6 flex-1">
                            {[
                              "Validate Patient ID matching the bracelet.",
                              "Ensure cold pack integrity during transfer.",
                              "Immediate recording of completion is mandatory for traceability."
                            ].map((text, i) => (
                              <li key={i} className="flex gap-4 text-xs font-medium text-slate-300 leading-relaxed">
                                <span className="w-5 h-5 rounded-lg bg-primary/20 flex items-center justify-center text-[10px] text-primary shrink-0">0{i+1}</span>
                                {text}
                              </li>
                            ))}
                         </ul>
                         <div className="mt-8 pt-6 border-t border-white/5 opacity-40 text-center">
                            <p className="text-[9px] font-bold uppercase tracking-widest">Protocol Ver: 4.2.0-Safe</p>
                         </div>
                      </div>
                      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary opacity-5 blur-[80px]"></div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "handover" && (
            <div className="glass-card rounded-[3rem] overflow-hidden shadow-xl border-white/10">
               <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-4">
                     Queue Handover 🤝
                     <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] rounded-full">{handoverRequests.length} Pending</span>
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Only authorized personnel may trigger CONFIRMATION</p>
               </div>
               
               <div className="p-8">
                 {handoverRequests.length === 0 ? (
                   <div className="py-32 text-center bg-slate-50 dark:bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                     <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No active blood assignments at this moment</p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                     {handoverRequests.map(req => (
                       <div key={req._id} className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-2xl transition-all group flex flex-col h-full">
                          <div className="flex justify-between items-start mb-8">
                             <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-xl shadow-sm border border-slate-100 dark:border-slate-800 font-black text-primary">
                                {req.patient?.name.charAt(0)}
                             </div>
                             <span className="px-3 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest rounded-lg animate-pulse">
                                Approved
                             </span>
                          </div>
                          
                          <h6 className="text-lg font-black mb-1 text-slate-800 dark:text-slate-100">{req.patient?.name}</h6>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Assigned: {new Date(req.createdAt).toLocaleDateString()} {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          
                          <div className="grid grid-cols-2 gap-3 mb-8">
                             <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Group</p>
                                <p className="text-xs font-black text-rose-500">{req.bloodGroup}</p>
                             </div>
                             <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Units</p>
                                <p className="text-xs font-black text-slate-700 dark:text-slate-300">{req.units}</p>
                             </div>
                          </div>

                          <button
                            onClick={() => handleComplete(req._id)}
                            className="mt-auto w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-emerald-900/20 hover:scale-[1.02] transition-transform"
                          >
                            Mark as Handed Over 🤝
                          </button>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-8">
               {/* Advanced History Filters */}
               <div className="glass-card p-8 rounded-[2.5rem] bg-white/50 dark:bg-slate-900/50 border-white/20 backdrop-blur-xl shadow-xl flex flex-wrap items-center gap-6">
                  <div className="flex-1 min-w-[300px] relative">
                     <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                     <input 
                       type="text"
                       placeholder="Search Patient Name..."
                       value={historyFilters.search}
                       onChange={(e) => setHistoryFilters({...historyFilters, search: e.target.value})}
                       className="w-full pl-14 pr-8 py-4 bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl text-sm font-medium focus:ring-2 ring-primary/20 transition-all"
                     />
                  </div>
                  <div className="flex items-center gap-4">
                     <select 
                       value={historyFilters.bloodGroup}
                       onChange={(e) => setHistoryFilters({...historyFilters, bloodGroup: e.target.value})}
                       className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl text-xs font-black uppercase tracking-widest appearance-none focus:ring-2 ring-primary/20"
                     >
                        <option value="All">All Groups</option>
                        {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                     </select>
                     <select 
                       value={historyFilters.component}
                       onChange={(e) => setHistoryFilters({...historyFilters, component: e.target.value})}
                       className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl text-xs font-black uppercase tracking-widest appearance-none focus:ring-2 ring-primary/20"
                     >
                        <option value="All">All Components</option>
                        {["Whole Blood", "Plasma", "Platelets", "RBC"].map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                     <button 
                       onClick={() => setHistoryFilters({ search: "", bloodGroup: "All", component: "All" })}
                       className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-2xl transition-colors"
                       title="Reset Filters"
                     >
                        🔄
                     </button>
                  </div>
               </div>

               <div className="glass-card rounded-[3rem] overflow-hidden border-white/10 shadow-xl">
                 <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-xl font-black uppercase tracking-widest">Medical Logs & History 📜</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Showing {historyRequests.length} Records</p>
                 </div>
               
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-4 px-8 pb-8">
                    <thead>
                      <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <th className="px-8 py-4">Patient Profile</th>
                        <th className="px-8 py-4 text-center">Treatment Group</th>
                        <th className="px-8 py-4 text-center">Handover Time</th>
                        <th className="px-8 py-4 text-right">Status Record</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-4">
                      {historyRequests.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-32 bg-slate-50 dark:bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                             <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No historical data points detected</p>
                          </td>
                        </tr>
                      ) : (
                        historyRequests.map(req => (
                          <tr key={req._id} className="group transition-all hover:-translate-y-1">
                            <td className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 rounded-l-[1.5rem] border-y border-l border-slate-100 dark:border-slate-800 shadow-sm">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-xs font-black text-slate-300 border border-slate-100 dark:border-slate-800">
                                    ID
                                  </div>
                                  <div>
                                     <p className="text-sm font-black text-slate-800 dark:text-slate-100">{req.patient?.name}</p>
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{req.component}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-800 text-center shadow-sm">
                               <span className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-black text-rose-500">{req.bloodGroup}</span>
                               <span className="ml-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{req.units} Units</span>
                            </td>
                            <td className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-800 text-center shadow-sm">
                               <p className="text-xs font-black text-slate-700 dark:text-slate-300">{new Date(req.completedAt || req.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{new Date(req.completedAt || req.updatedAt).toLocaleDateString()}</p>
                            </td>
                            <td className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 rounded-r-[1.5rem] border-y border-r border-slate-100 dark:border-slate-800 text-right shadow-sm">
                               <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                                 req.status === "completed" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                               }`}>
                                 {req.status}
                               </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                   </table>
                </div>
             </div>
           </div>
          )}
        </div>
      </div>
    </div>
  );
}
