import { useState } from "react";
import api from "../../services/apiNode";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function HospitalForecast() {
  const [bloodGroup, setBloodGroup] = useState("A+");
  const [days, setDays] = useState(30);
  const [type, setType] = useState("daily");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleForecast = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await api.post("/hospital/forecast", { bloodGroup, days: Number(days), type });
      setResult(res.data);
      alert("AI Forecast generated successfully");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Not enough data for this specific scenario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex justify-between items-end">
         <div>
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
             <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
             AI Engine Ready
           </div>
           <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100">Local Demand Forecast</h2>
           <p className="text-sm font-bold text-slate-400 mt-1">Predict upcoming blood shortages specific to this facility</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="glass-card p-8 rounded-[2.5rem] h-fit">
          <form onSubmit={handleForecast} className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Blood Group Model</label>
              <select 
                value={bloodGroup} 
                onChange={e => setBloodGroup(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl p-3 font-bold focus:border-primary outline-none transition-colors"
              >
                {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Historical Window (Days)</label>
              <input 
                type="number"
                min="7" max="365"
                value={days}
                onChange={e => setDays(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl p-3 font-bold focus:border-primary outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Aggregation Frequency</label>
              <div className="flex gap-2">
                {['daily', 'weekly'].map(t => (
                  <button
                    key={t} type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      type === t ? 'bg-primary text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:shadow-primary/20 hover:bg-primary transition-all disabled:opacity-50"
            >
              {loading ? "Running Models..." : "Submit Forecast Request"}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
           {!result && !loading && (
             <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-10 glass-card rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
               <div className="text-6xl mb-4 opacity-50 text-slate-300">📈</div>
               <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Awaiting execution parameters</p>
             </div>
           )}

           {loading && (
             <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-10 glass-card rounded-[2.5rem]">
               <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
               <p className="mt-6 font-black text-primary uppercase tracking-widest animate-pulse">Running Neural Networks...</p>
             </div>
           )}

           {result && !loading && (
             <>
                <div className={`p-8 rounded-[2rem] border relative overflow-hidden ${
                  result.shortage 
                    ? "bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/50" 
                    : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50"
                }`}>
                   <div className="relative z-10 flex flex-col sm:flex-row gap-8 justify-between">
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${result.shortage ? 'text-rose-500' : 'text-emerald-500'}`}>
                           AI Recommendation
                        </p>
                        <h3 className={`text-xl font-bold ${result.shortage ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                           {result.suggestion}
                        </h3>
                      </div>
                      
                      <div className="flex gap-6 shrink-0 text-center bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                         <div>
                            <p className="text-3xl font-black text-slate-800 dark:text-white">{result.predicted_units}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Predicted</p>
                         </div>
                         <div className="w-px bg-slate-200 dark:bg-slate-800"></div>
                         <div>
                            <p className="text-3xl font-black text-slate-800 dark:text-white">{result.totalStock}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Actual Stock</p>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="glass-card p-6 rounded-3xl text-center">
                    <p className="text-2xl font-black text-primary">{result.series.reduce((a,b)=>a+b, 0)}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Historical Demand</p>
                  </div>
                  <div className="glass-card p-6 rounded-3xl text-center">
                    <p className="text-2xl font-black text-primary">{result.series.length}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Datapoints Found</p>
                  </div>
                  <div className="glass-card p-6 rounded-3xl text-center">
                    <p className="text-2xl font-black text-primary">{result.bloodGroup}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Analyzed Type</p>
                  </div>
                  <div className="glass-card p-6 rounded-3xl text-center">
                    <p className="text-2xl font-black text-primary">{result.days}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Day Window</p>
                  </div>
                </div>
             </>
           )}
        </div>
      </div>
    </div>
  )
}
