import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { donateBloodThunk, clearDonorStatus, checkEligibility, clearEligibility } from "../../store/slices/donorSlice";
import { useNavigate } from "react-router-dom";
import apiNode from "../../services/apiNode";

export default function DonateBlood() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { donationLoading, success, error, dashboard, eligibility, eligibilityLoading } = useSelector((s) => s.donor);

  const [step, setStep] = useState(1);
  const [hospitals, setHospitals] = useState([]);
  const [camps, setCamps] = useState([]);
  
  const [filter, setFilter] = useState({
    state: dashboard?.state || "",
    district: dashboard?.district || "",
  });

  const [form, setForm] = useState({
    donationType: "hospital",
    hospitalId: "",
    campId: "",
    units: 1,
    bloodGroup: dashboard?.bloodGroup || "A+",
    eligibility: {
      hb: "",
      bp: "",
      age: dashboard?.age || "",
      height: "",
    },
  });

  useEffect(() => {
    dispatch(clearEligibility());
  }, [dispatch]);

  // Fetch entities based on filter
  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const query = `?state=${filter.state}&district=${filter.district}`;
        const [hRes, cRes] = await Promise.all([
          apiNode.get(`/hospital/all${query}`),
          apiNode.get(`/hospital/camp/all${query}`)
        ]);
        setHospitals(hRes.data);
        setCamps(cRes.data);
      } catch (err) {
        console.error("Failed to fetch entities");
      }
    };
    if (filter.state && filter.district) {
      fetchEntities();
    }
  }, [filter]);

  useEffect(() => {
    if (success) {
      alert(success);
      dispatch(clearDonorStatus());
      navigate("/donor");
    }
  }, [success, dispatch, navigate]);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleCheckAI = () => {
    dispatch(checkEligibility({
      hb: Number(form.eligibility.hb),
      bp: form.eligibility.bp,
      age: Number(form.eligibility.age),
      weight: Number(form.eligibility.weight),
      height: Number(form.eligibility.height)
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    
    if (eligibility?.status !== "Eligible") {
       alert("You must pass the AI Eligibility Check before donating.");
       return;
    }

    dispatch(donateBloodThunk({
      ...form,
      state: filter.state,
      district: filter.district,
      ...form.eligibility
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-10 flex items-center justify-center">
      <div className="glass-card p-10 rounded-[3rem] w-full max-w-4xl shadow-2xl border-white/20 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Progress Bar */}
        <div className="flex justify-between mb-12 relative px-10">
           <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -z-10" />
           {[1, 2, 3, 4].map(s => (
             <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30' : 'bg-slate-100 dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-800'}`}>
               {s}
             </div>
           ))}
        </div>

        <div className="text-center mb-10">
          <h2 className="text-4xl font-black premium-gradient-text tracking-tight">
            {step === 1 && "Start Your Journey 🩸"}
            {step === 2 && "Find Near You 📍"}
            {step === 3 && "Health Checkup 🧪"}
            {step === 4 && "Final Request 🚀"}
          </h2>
          <p className="text-slate-500 font-medium mt-2">
            {step === 1 && "Choose how you'd like to contribute today"}
            {step === 2 && "Filter by your location to find hospitals or camps"}
            {step === 3 && "Provide your vitals for safer donation"}
            {step === 4 && "Confirm your donation details and submit"}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-10">
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 rounded-2xl border border-rose-100 dark:border-rose-900/50 text-sm font-bold">
              ⚠️ {error}
            </div>
          )}

          {/* STEP 1: SELECT TYPE */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                type="button"
                onClick={() => { setForm({...form, donationType: 'hospital'}); nextStep(); }}
                className="group p-8 glass-card hover:bg-red-500/5 border-2 border-transparent hover:border-red-500/20 transition-all text-left"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🏥</div>
                <h3 className="text-xl font-bold mb-2">At Hospital</h3>
                <p className="text-sm text-slate-500">Donate directly at a registered hospital facility</p>
              </button>
              <button
                type="button"
                onClick={() => { setForm({...form, donationType: 'camp'}); nextStep(); }}
                className="group p-8 glass-card hover:bg-orange-500/5 border-2 border-transparent hover:border-orange-500/20 transition-all text-left"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">⛺ At Camp</div>
                <h3 className="text-xl font-bold mb-2">Donation Camp</h3>
                <p className="text-sm text-slate-500">Find a nearby mobile camp or special blood drive</p>
              </button>
            </div>
          )}

          {/* STEP 2: LOCATION & ENTITY */}
          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">State</label>
                  <input
                    required
                    value={filter.state}
                    onChange={(e) => setFilter({ ...filter, state: e.target.value })}
                    className="input-field w-full"
                    placeholder="Enter State"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">District</label>
                  <input
                    required
                    value={filter.district}
                    onChange={(e) => setFilter({ ...filter, district: e.target.value })}
                    className="input-field w-full"
                    placeholder="Enter District"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
                  {form.donationType === 'hospital' ? "Nearby Hospitals" : "Active Camps"}
                </label>
                <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {form.donationType === "hospital" ? (
                    hospitals.length > 0 ? hospitals.map(h => (
                      <button
                        key={h._id}
                        type="button"
                        onClick={() => { setForm({...form, hospitalId: h._id}); nextStep(); }}
                        className={`p-5 rounded-2xl border text-left transition-all ${form.hospitalId === h._id ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800 hover:border-primary/50'}`}
                      >
                        <h4 className="font-bold">{h.name}</h4>
                        <p className="text-xs text-slate-500">Registered Medical Facility</p>
                      </button>
                    )) : <p className="text-center py-10 text-slate-400 font-medium">No hospitals found in this district.</p>
                  ) : (
                    camps.length > 0 ? camps.map(c => (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => { setForm({...form, campId: c._id, hospitalId: c.hospitalId?._id}); nextStep(); }}
                        className={`p-5 rounded-2xl border text-left transition-all ${form.campId === c._id ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800 hover:border-primary/50'}`}
                      >
                        <h4 className="font-bold">{c.name}</h4>
                        <p className="text-xs text-slate-500">Organized by: {c.hospitalId?.name || "Unknown"}</p>
                        <p className="text-[10px] text-primary font-bold mt-1">📅 {new Date(c.startDate).toLocaleDateString()}</p>
                      </button>
                    )) : <p className="text-center py-10 text-slate-400 font-medium">No active camps found in this district.</p>
                  )}
                </div>
              </div>
              
              <button type="button" onClick={prevStep} className="text-slate-400 font-bold text-xs uppercase hover:text-primary transition-colors">← Go Back</button>
            </div>
          )}

          {/* STEP 3: ELIGIBILITY */}
          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
               <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Hb Level (g/dL)</label>
                  <input
                    type="number" step="0.1" required
                    value={form.eligibility.hb}
                    onChange={(e) => setForm({ ...form, eligibility: { ...form.eligibility, hb: e.target.value } })}
                    className="input-field w-full"
                    placeholder="e.g. 13.5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">BP (mmHg)</label>
                  <input
                    required
                    value={form.eligibility.bp}
                    onChange={(e) => setForm({ ...form, eligibility: { ...form.eligibility, bp: e.target.value } })}
                    className="input-field w-full"
                    placeholder="e.g. 120/80"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Age</label>
                  <input
                    type="number" required readOnly
                    value={form.eligibility.age}
                    className="input-field w-full opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Weight (kg)</label>
                  <input
                    type="number" required
                    value={form.eligibility.weight}
                    onChange={(e) => setForm({ ...form, eligibility: { ...form.eligibility, weight: e.target.value } })}
                    className="input-field w-full"
                    placeholder="e.g. 65"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Height (cm)</label>
                  <input
                    type="number" required
                    value={form.eligibility.height}
                    onChange={(e) => setForm({ ...form, eligibility: { ...form.eligibility, height: e.target.value } })}
                    className="input-field w-full"
                    placeholder="e.g. 175"
                  />
                </div>
              </div>

              <div className="pt-4">
                 <button 
                  type="button"
                  onClick={handleCheckAI}
                  disabled={eligibilityLoading || !form.eligibility.hb || !form.eligibility.bp || !form.eligibility.weight || !form.eligibility.height}
                  className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg hover:bg-slate-700 transition-all disabled:opacity-50"
                 >
                   {eligibilityLoading ? "AI analyzing..." : "Verify Health with AI 🧠"}
                 </button>
              </div>

              {eligibility && (
                <div className={`p-6 rounded-[2.5rem] border-2 animate-in zoom-in-95 duration-500 ${eligibility.status === 'Eligible' ? 'bg-emerald-50/50 border-emerald-500/20' : 'bg-rose-50/50 border-rose-500/20'}`}>
                   <div className="flex items-center justify-between mb-6">
                      <h4 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Explainable AI Report</h4>
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${eligibility.status === 'Eligible' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                        {eligibility.status}
                      </span>
                   </div>

                   <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                      {eligibility.explanation?.map((e, idx) => (
                        <div key={idx} className="flex justify-between items-center p-4 bg-white/50 dark:bg-slate-900/50 rounded-2xl shadow-sm border border-white dark:border-slate-800">
                           <div className="flex-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{e.factor}</p>
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{e.message}</p>
                           </div>
                           <div className="text-right ml-4">
                              <p className={`text-[10px] font-black uppercase ${e.impact === 'Positive' ? 'text-emerald-500' : 'text-rose-500'}`}>{e.impact}</p>
                              <p className="text-[9px] text-slate-400 font-bold mt-0.5">Val: {e.value}</p>
                           </div>
                        </div>
                      ))}
                   </div>

                   {eligibility.confidence !== undefined && (
                     <div className="mt-6 flex items-center justify-center gap-2">
                        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden max-w-[100px]">
                           <div className="h-full bg-primary" style={{ width: `${eligibility.confidence * 100}%` }} />
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Confidence: {(eligibility.confidence * 100).toFixed(0)}%</span>
                     </div>
                   )}
                </div>
              )}

              <div className="flex flex-col gap-4">
                <button 
                  type="button" 
                  onClick={nextStep}
                  disabled={eligibility?.status !== "Eligible"}
                  className="w-full py-5 bg-primary text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-primary/30 disabled:opacity-30 disabled:grayscale transition-all"
                >
                  Proceed to Final Step →
                </button>
                <button type="button" onClick={prevStep} className="text-slate-400 font-bold text-xs uppercase hover:text-primary transition-colors text-center">← Go Back</button>
              </div>
            </div>
          )}

          {/* STEP 4: FINAL SUBMISSION */}
          {step === 4 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
               <div className="glass-card p-8 border-primary/20 bg-primary/5 rounded-3xl">
                  <h4 className="text-sm font-black uppercase tracking-widest text-primary mb-4">Donation Summary</h4>
                  <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <span className="text-slate-500">Type:</span> <span className="font-bold uppercase tracking-widest">{form.donationType}</span>
                    <span className="text-slate-500">Location:</span> <span className="font-bold">{filter.district}, {filter.state}</span>
                    <span className="text-slate-500">Target:</span> <span className="font-bold">
                       {form.donationType === 'hospital' 
                        ? hospitals.find(h => h._id === form.hospitalId)?.name 
                        : camps.find(c => c._id === form.campId)?.name}
                    </span>
                    <span className="text-slate-500">Blood Group:</span> <span className="font-bold text-red-500">{form.bloodGroup}</span>
                  </div>
               </div>

               <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Units of Blood</label>
                    <input
                      type="number" min="1" max="1" readOnly
                      value={form.units}
                      className="input-field w-full opacity-60"
                    />
                    <p className="text-[10px] text-slate-400 ml-4">Standard donation is 1 unit.</p>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="submit"
                    disabled={donationLoading || eligibility?.status !== "Eligible"}
                    className="w-full py-6 bg-primary text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-[12px] shadow-2xl shadow-primary/50 hover:-translate-y-1 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {donationLoading ? "Processing..." : "Verify & Confirm Donation 🩸"}
                  </button>
                  <button type="button" onClick={prevStep} className="w-full text-slate-400 font-bold text-xs uppercase mt-6 hover:text-primary transition-colors">← Edit Details</button>
                </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

