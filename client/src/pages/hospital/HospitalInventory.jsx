import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInventoryThunk, addInventoryThunk, clearHospitalStatus, fetchHospitalProfile } from "../../store/slices/hospitalSlice";
import { Navigate } from "react-router-dom";

export default function HospitalInventory() {
  const dispatch = useDispatch();
  const { inventory, loading, error, success, profile, profileLoading } = useSelector((s) => s.hospital);

  /* ======================
     FORCE PROFILE COMPLETION
  ====================== */
  if (!profileLoading && profile && (!profile.state || !profile.district)) {
    return <Navigate to="/hospital/profile" />;
  }

  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    bloodGroup: "A+",
    component: "Whole Blood",
    unitsAvailable: "",
    expiryDate: "",
    temperature: "",
  });

  useEffect(() => {
    dispatch(fetchInventoryThunk());
    dispatch(fetchHospitalProfile());
  }, [dispatch]);

  useEffect(() => {
    if (success && success.includes("added")) {
      setShowAddForm(false);
      setForm({
        bloodGroup: "A+",
        component: "Whole Blood",
        unitsAvailable: "",
        expiryDate: "",
        temperature: "",
      });
      // Optionally alert or just let the success message in the state handle it
    }
  }, [success]);

  const submit = (e) => {
    e.preventDefault();
    dispatch(addInventoryThunk(form));
  };

  return (
    <div className="">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-black premium-gradient-text tracking-tight">
              Blood Storage & Inventory ❄️
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              Real-time stock management and unit tracking.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/30 hover:-translate-y-1 transition-all"
          >
            {showAddForm ? "Close Form" : "Add New Unit +"}
          </button>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-8 p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-2xl border border-rose-100 dark:border-rose-900/50 text-sm font-bold">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 text-sm font-bold">
            ✅ {success}
          </div>
        )}

        {/* Add Form */}
        {showAddForm && (
          <div className="glass-card p-10 rounded-[3rem] mb-12 animate-in fade-in slide-in-from-top-4 duration-500 border border-white/20">
            <h3 className="text-xl font-black mb-8 text-slate-800 dark:text-slate-100 uppercase tracking-widest">Register New Blood Unit</h3>
            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Blood Group</label>
                <select
                  value={form.bloodGroup}
                  onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                  className="input-field w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-slate-900/50"
                  required
                >
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Component Type</label>
                <select
                  value={form.component}
                  onChange={(e) => setForm({ ...form, component: e.target.value })}
                  className="input-field w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-slate-900/50"
                  required
                >
                  {["Whole Blood", "Plasma", "Platelets", "RBC", "Cryoprecipitate"].map(comp => (
                    <option key={comp} value={comp}>{comp}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Units Available</label>
                <input
                  type="number"
                  min="1"
                  value={form.unitsAvailable}
                  onChange={(e) => setForm({ ...form, unitsAvailable: e.target.value })}
                  className="input-field w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-slate-900/50"
                  placeholder="e.g. 5"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Expiry Date</label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  className="input-field w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-slate-900/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Storage Temp (°C)</label>
                <input
                  value={form.temperature}
                  onChange={(e) => setForm({ ...form, temperature: e.target.value })}
                  className="input-field w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-slate-900/50"
                  placeholder="e.g. 2-6°C"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/30 hover:bg-primary-dark transition-all disabled:opacity-50"
                >
                  {loading ? "Registering..." : "Publish to Inventory"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Inventory List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {inventory.map((item) => (
            <div key={item._id} className="glass-card p-8 rounded-[2.5rem] group hover:border-primary/30 transition-all relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className="px-4 py-1.5 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-sm font-black rounded-xl border border-red-200 dark:border-red-800/50 shadow-sm">
                    {item.bloodGroup}
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${new Date(item.expiryDate) < new Date() ? 'text-rose-500' : 'text-slate-400'}`}>
                    Exp: {new Date(item.expiryDate).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-3xl font-black premium-gradient-text mb-1">
                  {item.unitsAvailable} Units
                </h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {item.component}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Storage Temp</span>
                  <span className="text-slate-800 dark:text-slate-100">{item.temperature || "N/A"}</span>
                </div>
              </div>

              {/* Decorative background flourish */}
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && inventory.length === 0 && (
          <div className="text-center py-32 glass-card rounded-[3rem]">
            <div className="text-6xl mb-6 grayscale opacity-20">🧊</div>
            <p className="text-slate-400 font-bold uppercase tracking-widest italic group-hover:not-italic transition-all">
              Your inventory is currently empty
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
