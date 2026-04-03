import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchHospitalRequests, submitLabResultsThunk } from "../../store/slices/hospitalSlice";

export default function LabTesting() {
  const dispatch = useDispatch();
  const { requests, loading, error, success } = useSelector((s) => s.hospital);

  const [selectedDonation, setSelectedDonation] = useState(null);
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
  }, [dispatch]);

  const pendingTests = requests.filter(r => r.status === "testing");

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
    <div className="">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-extrabold premium-gradient-text tracking-tight">
              Lab Screening 🧪
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              Screen approved blood donations before inventory entry.
            </p>
          </div>
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-3xl flex items-center justify-center text-3xl shadow-xl">🔬</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* List Section */}
          <div className="lg:col-span-1 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pending Tests</h4>
            {pendingTests.length === 0 ? (
              <div className="glass-card p-10 rounded-3xl text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                No pending tests
              </div>
            ) : (
              pendingTests.map(d => (
                <div 
                  key={d._id} 
                  onClick={() => setSelectedDonation(d)}
                  className={`glass-card p-6 rounded-3xl cursor-pointer transition-all border-2 ${selectedDonation?._id === d._id ? 'border-primary shadow-lg scale-[1.02]' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-800'}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg uppercase">{d.bloodGroup}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(d.donationDate).toLocaleDateString()}</span>
                  </div>
                  <h5 className="text-lg font-black mt-3 text-slate-800 dark:text-slate-100">{d.donor?.name || "Anonymous"}</h5>
                  <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest">{d.units} Units • {d.donationType}</p>
                </div>
              ))
            )}
          </div>

          {/* Form Section */}
          <div className="lg:col-span-2">
            {selectedDonation ? (
               <div className="glass-card p-10 rounded-[3rem] shadow-2xl border-white/20 animate-in fade-in slide-in-from-right-6 duration-500">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-8">Screening for: {selectedDonation.bloodGroup} ( {selectedDonation.units} Units )</h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                      {Object.keys(results).map(disease => (
                        <div key={disease} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                            {disease.replace(/([A-Z])/g, ' $1').toUpperCase()}
                          </label>
                          <select 
                            value={results[disease]}
                            onChange={(e) => setResults({ ...results, [disease]: e.target.value })}
                            className="bg-transparent text-sm font-black focus:outline-none"
                          >
                            <option value="negative" className="text-emerald-500">Negative</option>
                            <option value="positive" className="text-rose-500">Positive</option>
                          </select>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Remarks</label>
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="input-field w-full px-6 py-4 rounded-2xl h-32 resize-none"
                        placeholder="Additional observations..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-primary/40 hover:-translate-y-1 transition-all active:scale-[0.98]"
                    >
                      {loading ? "Submitting..." : "Submit Screening Results 📋"}
                    </button>
                  </form>
               </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center glass-card rounded-[3rem] border-dashed border-slate-300 dark:border-slate-700 py-20 px-10 text-center">
                 <div className="text-6xl mb-6 opacity-20">🔬</div>
                 <h3 className="text-xl font-black text-slate-400 italic">Select a donation to begin screening</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
