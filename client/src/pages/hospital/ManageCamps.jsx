import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyCampsThunk, createCampThunk, clearHospitalStatus, fetchHospitalProfile } from "../../store/slices/hospitalSlice";
import { Navigate } from "react-router-dom";

export default function ManageCamps() {
  const dispatch = useDispatch();
  const { camps, loading, success, error, profile, profileLoading } = useSelector((s) => s.hospital);

  /* ======================
     FORCE PROFILE COMPLETION
  ====================== */
  if (!profileLoading && profile && (!profile.state || !profile.district)) {
    return <Navigate to="/hospital/profile" />;
  }

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    state: profile?.state || "",
    district: profile?.district || "",
    startDate: "",
    endDate: "",
    description: ""
  });

  useEffect(() => {
    dispatch(fetchMyCampsThunk());
    dispatch(fetchHospitalProfile());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setShowModal(false);
      setForm({
        name: "",
        address: "",
        state: profile?.state || "",
        district: profile?.district || "",
        startDate: "",
        endDate: "",
        description: ""
      });
      dispatch(clearHospitalStatus());
    }
  }, [success, dispatch, profile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createCampThunk(form));
  };

  return (
    <div className="">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-extrabold premium-gradient-text tracking-tight">
              Blood Donation Camps ⛺
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              Organize and track your community blood donation drives.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all flex items-center gap-2"
          >
            <span className="text-xl">+</span> Organize New Camp
          </button>
        </div>

        {loading && camps.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {camps.map((camp) => (
              <div key={camp._id} className="glass-card p-8 rounded-[2.5rem] group hover:border-primary/30 transition-all relative overflow-hidden">
                <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest ${camp.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {camp.status}
                </div>
                <h3 className="text-2xl font-black mb-1 mt-4">{camp.name}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
                  📍 {camp.district}, {camp.state}
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <span className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">📅</span>
                    <span>{new Date(camp.startDate).toLocaleDateString()} — {new Date(camp.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    <span className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">🏠</span>
                    <span>{camp.address}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && camps.length === 0 && (
          <div className="text-center py-32 glass-card rounded-[3rem] border-dashed border-2 border-slate-200 dark:border-slate-800">
            <div className="text-6xl mb-6 opacity-20">⛺</div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No camps organized yet</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-2xl p-10 rounded-[3rem] shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-8 right-8 text-2xl text-slate-400 hover:text-rose-500 transition-colors"
            >
              ✕
            </button>
            <h2 className="text-3xl font-black mb-2 premium-gradient-text">Organize Camp 🩸</h2>
            <p className="text-slate-500 mb-8 font-medium">Create a new blood donation drive in your area.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold border border-rose-100">{error}</div>}
              
              <div className="space-y-2">
                <label className="label-text ml-4">Camp Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g. City Central Blood Drive"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="label-text ml-4">State</label>
                  <input
                    required
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="input-field"
                    placeholder="Enter State"
                  />
                </div>
                <div className="space-y-2">
                  <label className="label-text ml-4">District</label>
                  <input
                    required
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="input-field"
                    placeholder="Enter District"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="label-text ml-4">Address Details</label>
                <textarea
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="input-field min-h-[100px]"
                  placeholder="Street, Landmark, City..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="label-text ml-4">Start Date</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="space-y-2">
                  <label className="label-text ml-4">End Date</label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-primary text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-primary/40 hover:-translate-y-1 transition-all disabled:opacity-50"
              >
                {loading ? "Creating..." : "Submit Camp"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
