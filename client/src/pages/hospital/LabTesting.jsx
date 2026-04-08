import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchHospitalRequests, 
  submitLabResultsThunk, 
  claimDonationThunk,
  fetchTestingHistoryThunk 
} from "../../store/slices/hospitalSlice";

export default function LabTesting() {
  const dispatch = useDispatch();
  const { requests, testingHistory, loading, error, success } = useSelector((s) => s.hospital);
  const { user } = useSelector((s) => s.auth);

  const [activeTab, setActiveTab] = useState("active"); // active, history
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null); // For history modal

  const [historyFilters, setHistoryFilters] = useState({
    search: "",
    bloodGroup: "All",
    status: "All"
  });

  const [results, setResults] = useState({
    hiv: "negative",
    hepatitisB: "negative",
    hepatitisC: "negative",
    malaria: "negative",
    syphilis: "negative",
    otherSeriousDiseases: "negative",
  });
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    dispatch(fetchHospitalRequests());
    if (activeTab === "history") {
      dispatch(fetchTestingHistoryThunk());
    }
  }, [dispatch, activeTab]);

  useEffect(() => {
    if (success) {
      setResults({
        hiv: "negative",
        hepatitisB: "negative",
        hepatitisC: "negative",
        malaria: "negative",
        syphilis: "negative",
        otherSeriousDiseases: "negative",
      });
      setRemarks("");
      dispatch(fetchTestingHistoryThunk());
    }
  }, [success, dispatch]);

  const availableTests = requests.filter(r => r.status === "testing" && !r.testerId);
  const myAssignments = requests.filter(r => r.status === "testing" && r.testerId === user?._id);

  // Filtered History
  const filteredHistory = testingHistory.filter(h => {
    const donorName = h.donation?.donor?.name || "Anonymous";
    const matchesSearch = donorName.toLowerCase().includes(historyFilters.search.toLowerCase());
    const matchesGroup = historyFilters.bloodGroup === "All" || h.donation?.bloodGroup === historyFilters.bloodGroup;
    const matchesStatus = historyFilters.status === "All" || h.status === historyFilters.status;
    return matchesSearch && matchesGroup && matchesStatus;
  });

  const handleClaim = (id) => {
    dispatch(claimDonationThunk(id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(submitLabResultsThunk({
      donationId: selectedDonation._id,
      results,
      remarks,
    }));
    setSelectedDonation(null);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-5xl font-black premium-gradient-text tracking-tighter">
              Lab Screening 🧪
            </h2>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-purple-500"></span>
               Bio-Safety Control • Automated Validation Protocol
            </p>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-[2rem] border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-inner">
             <button
               onClick={() => setActiveTab("active")}
               className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
                 activeTab === "active" 
                 ? "bg-white dark:bg-slate-800 text-primary shadow-2xl shadow-primary/10 ring-1 ring-slate-200 dark:ring-slate-700" 
                 : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
               }`}
             >
               <span className="text-lg">🔬</span> Active Screening
             </button>
             <button
               onClick={() => setActiveTab("history")}
               className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
                 activeTab === "history" 
                 ? "bg-white dark:bg-slate-800 text-purple-500 shadow-2xl shadow-purple-500/10 ring-1 ring-slate-200 dark:ring-slate-700" 
                 : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
               }`}
             >
               <span className="text-lg">📜</span> Testing History
             </button>
          </div>
        </div>

        {activeTab === "active" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-8">
            {/* List Section */}
            <div className="lg:col-span-4 space-y-10">
              {/* My Active Assignments */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary px-4">My Personal Desk ({myAssignments.length})</h4>
                {myAssignments.length === 0 ? (
                  <div className="p-10 bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] text-[10px] text-slate-400 font-bold uppercase text-center leading-loose">
                    You haven't claimed any<br/>clinical units for screening
                  </div>
                ) : (
                  myAssignments.map(d => (
                    <div 
                      key={d._id} 
                      onClick={() => setSelectedDonation(d)}
                      className={`glass-card p-8 rounded-[2.5rem] cursor-pointer transition-all border-2 ${selectedDonation?._id === d._id ? 'border-primary shadow-2xl scale-[1.02]' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-800 shadow-sm'}`}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black rounded-xl uppercase tracking-widest ring-1 ring-primary/20">{d.bloodGroup}</span>
                        <div className="flex gap-1">
                           {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/30 animate-pulse" style={{animationDelay: `${i*200}ms`}}></div>)}
                        </div>
                      </div>
                      <h5 className="text-xl font-black text-slate-800 dark:text-slate-100">{d.donor?.name || "Anonymous Donor"}</h5>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status: Assigned to You</p>
                    </div>
                  ))
                )}
              </div>

              {/* Available Pool */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-4">Global Queue ({availableTests.length})</h4>
                <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
                  {availableTests.length === 0 ? (
                    <div className="p-10 bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] text-[10px] text-slate-400 font-bold uppercase text-center">
                      Market pool is empty
                    </div>
                  ) : (
                    availableTests.map(d => (
                      <div 
                        key={d._id} 
                        className="glass-card p-6 rounded-[2rem] border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all shadow-sm"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-black rounded-lg uppercase tracking-widest">{d.bloodGroup}</span>
                            <h5 className="text-md font-black mt-2 text-slate-800 dark:text-slate-100">{d.donor?.name || "Unknown Donor"}</h5>
                          </div>
                          <button 
                            onClick={() => handleClaim(d._id)}
                            className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-primary transition-all shadow-lg hover:-translate-y-1"
                            title="Claim for Screening"
                          >
                            📥
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="lg:col-span-8">
              {selectedDonation ? (
                 <div className="glass-card p-12 rounded-[4rem] shadow-2xl border-white/20 sticky top-8">
                    <div className="flex justify-between items-start mb-12">
                      <div>
                        <h3 className="text-4xl font-black text-slate-800 dark:text-slate-100">Screening Protocol: {selectedDonation.bloodGroup}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-3">
                           <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> 
                           Clinical UID: {selectedDonation._id}
                        </p>
                      </div>
                      <button 
                        onClick={() => setSelectedDonation(null)}
                        className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-all shadow-sm"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-12">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.keys(results).map(disease => (
                          <div key={disease} className="group flex flex-col p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4 group-hover:text-primary transition-colors">
                              {disease.replace(/([A-Z])/g, ' $1').toUpperCase()}
                            </label>
                            <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-inner border border-slate-100 dark:border-slate-700">
                               <button
                                 type="button"
                                 onClick={() => setResults({...results, [disease]: "negative"})}
                                 className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${results[disease] === 'negative' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                               >
                                 Negative
                               </button>
                               <button
                                 type="button"
                                 onClick={() => setResults({...results, [disease]: "positive"})}
                                 className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${results[disease] === 'positive' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                               >
                                 Positive
                               </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-6">Technician Remarks & Observation</label>
                        <textarea
                          required
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          className="input-field w-full px-8 py-6 rounded-[2rem] h-40 resize-none bg-slate-50/50 border-white/40 shadow-inner"
                          placeholder="Note any abnormalities or clinical observations here..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-6 bg-primary text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        {loading ? "BIO-VALIDATING..." : "SUBMIT VALIDATED CLINICAL RESULTS 🧪"}
                      </button>
                    </form>
                 </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center glass-card rounded-[4rem] border-dashed border-slate-300 dark:border-slate-700 py-32 px-10 text-center animate-pulse">
                   <div className="text-8xl mb-8 opacity-20 filter grayscale">🔬</div>
                   <h3 className="text-2xl font-black text-slate-400 uppercase tracking-widest italic">Awaiting Clinical Selection</h3>
                   <p className="text-[10px] text-slate-400 mt-4 uppercase tracking-[0.3em] font-bold">Pick an assigned unit from your personal desk to begin the bio-safety validation</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8">
            {/* History Filters */}
            <div className="glass-card p-10 rounded-[3rem] bg-white/50 dark:bg-slate-900/50 border-white/20 backdrop-blur-xl shadow-2xl flex flex-wrap items-center gap-8">
               <div className="flex-1 min-w-[300px] relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                  <input 
                    type="text"
                    placeholder="Search Donor Registry..."
                    value={historyFilters.search}
                    onChange={(e) => setHistoryFilters({...historyFilters, search: e.target.value})}
                    className="w-full pl-16 pr-8 py-5 bg-slate-50 dark:bg-slate-800 border-0 rounded-3xl text-sm font-black focus:ring-2 ring-purple-500/20 transition-all placeholder:text-slate-300"
                  />
               </div>
               <div className="flex items-center gap-6">
                  <select 
                    value={historyFilters.bloodGroup}
                    onChange={(e) => setHistoryFilters({...historyFilters, bloodGroup: e.target.value})}
                    className="px-8 py-5 bg-slate-50 dark:bg-slate-800 border-0 rounded-3xl text-[10px] font-black uppercase tracking-widest focus:ring-2 ring-purple-500/20 appearance-none min-w-[150px]"
                  >
                     <option value="All">All Groups</option>
                     {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                  <select 
                    value={historyFilters.status}
                    onChange={(e) => setHistoryFilters({...historyFilters, status: e.target.value})}
                    className="px-8 py-5 bg-slate-50 dark:bg-slate-800 border-0 rounded-3xl text-[10px] font-black uppercase tracking-widest focus:ring-2 ring-purple-500/20 appearance-none min-w-[150px]"
                  >
                     <option value="All">All Status</option>
                     <option value="safe">SAFE ✅</option>
                     <option value="unsafe">UNSAFE ⚠️</option>
                  </select>
                  <button 
                    onClick={() => setHistoryFilters({ search: "", bloodGroup: "All", status: "All" })}
                    className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-purple-500 rounded-2xl transition-all shadow-sm flex items-center justify-center font-black"
                    title="Reset Clinical Filters"
                  >
                     🔄
                  </button>
               </div>
            </div>

            {/* History Table */}
            <div className="glass-card rounded-[4rem] overflow-hidden border-white/10 shadow-3xl bg-white/30 dark:bg-slate-900/30 backdrop-blur-md">
               <div className="p-12 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="text-2xl font-black uppercase tracking-widest">Personal Screening Audit 📜</h3>
                  <div className="px-6 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Showing {filteredHistory.length} Results
                  </div>
               </div>
               
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-6 px-12 pb-12">
                    <thead>
                      <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        <th className="px-8">Donor Profile</th>
                        <th className="px-8 text-center">Bio-Group</th>
                        <th className="px-8 text-center">Validation Date</th>
                        <th className="px-8 text-center">Health Status</th>
                        <th className="px-8 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-40 bg-slate-50/50 dark:bg-slate-900/20 rounded-[4rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                             <div className="text-5xl mb-6 opacity-20">📭</div>
                             <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">No historical bio-data matching your filters</p>
                          </td>
                        </tr>
                      ) : (
                        filteredHistory.map(h => (
                          <tr key={h._id} className="group transition-all hover:-translate-y-1">
                            <td className="px-8 py-8 bg-white dark:bg-slate-800/80 rounded-l-[2rem] border-y border-l border-slate-100 dark:border-slate-800 shadow-sm">
                               <div className="flex items-center gap-5">
                                  <div className="w-14 h-14 rounded-[1.25rem] bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-xl font-black text-slate-300 border border-slate-100 dark:border-slate-600 shadow-inner italic">
                                    {h.donation?.donor?.name.charAt(0)}
                                  </div>
                                  <div>
                                     <p className="text-lg font-black text-slate-800 dark:text-slate-100">{h.donation?.donor?.name}</p>
                                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{h.donation?.donationType} Donation</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-8 bg-white dark:bg-slate-800/80 border-y border-slate-100 dark:border-slate-800 text-center">
                               <span className="px-5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-primary shadow-sm">{h.donation?.bloodGroup}</span>
                            </td>
                            <td className="px-8 py-8 bg-white dark:bg-slate-800/80 border-y border-slate-100 dark:border-slate-800 text-center">
                               <p className="text-sm font-black text-slate-700 dark:text-slate-300">{new Date(h.testedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{new Date(h.testedAt).toLocaleDateString()}</p>
                            </td>
                            <td className="px-8 py-8 bg-white dark:bg-slate-800/80 border-y border-slate-100 dark:border-slate-800 text-center">
                               <span className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ${
                                 h.status === "safe" ? "bg-emerald-100 text-emerald-600 ring-1 ring-emerald-200" : "bg-rose-100 text-rose-600 ring-1 ring-rose-200"
                               }`}>
                                 {h.status.toUpperCase()}
                               </span>
                            </td>
                            <td className="px-8 py-8 bg-white dark:bg-slate-800/80 rounded-r-[2rem] border-y border-r border-slate-100 dark:border-slate-800 text-right">
                               <button 
                                 onClick={() => setSelectedReport(h)}
                                 className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl hover:-translate-y-1"
                               >
                                 View Bio-Report 📊
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
        )}
      </div>

      {/* Bio-Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setSelectedReport(null)}></div>
           <div className="relative glass-card w-full max-w-2xl rounded-[4rem] p-12 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] scale-in-center duration-500">
              <div className="flex justify-between items-start mb-14 relative z-10">
                 <div>
                    <span className="px-4 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 text-[9px] font-black rounded-xl uppercase tracking-widest block w-fit mb-4 border border-purple-200">PERSONAL AUDIT LOG</span>
                    <h3 className="text-4xl font-black text-slate-800 dark:text-slate-100">Bio-Safety Report</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{selectedReport.donation?.donor?.name} • {selectedReport.donation?.bloodGroup}</p>
                 </div>
                 <button 
                   onClick={() => setSelectedReport(null)}
                   className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-all shadow-sm"
                 >
                   ✕
                 </button>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-14 relative z-10">
                 {Object.entries(selectedReport.results).map(([disease, result]) => (
                   <div key={disease} className="flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-inner">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{disease.replace(/([A-Z])/g, ' $1')}</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${result === 'negative' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {result} {result === 'negative' ? "✅" : "⚠️"}
                      </span>
                   </div>
                 ))}
              </div>

              <div className="p-8 bg-slate-900 rounded-[2.5rem] relative z-10 border border-white/10 shadow-2xl">
                 <h6 className="text-[9px] font-black uppercase tracking-widest text-primary mb-4">Technician Observation</h6>
                 <p className="text-sm font-medium text-slate-300 italic leading-relaxed">"{selectedReport.remarks || "No clinical remarks provided for this session."}"</p>
                 <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center opacity-40">
                    <p className="text-[8px] font-bold uppercase tracking-widest">Validated at {new Date(selectedReport.testedAt).toLocaleString()}</p>
                    <p className="text-[8px] font-bold uppercase tracking-widest">Ver: Bio-Secure 1.0</p>
                 </div>
              </div>
              
              {/* Background Glow */}
              <div className={`absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-[100px] opacity-20 ${selectedReport.status === 'safe' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
           </div>
        </div>
      )}
    </div>
  );
}
