import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBloodBankProfile, updateBloodBankProfile } from "../../store/slices/bloodbankSlice";

export default function BloodBankProfile() {
  const dispatch = useDispatch();
  const { profile, profileLoading, profileError, loading, success, error } = useSelector((s) => s.bloodbank);
  const { user } = useSelector((s) => s.auth);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactNumber: "",
    secondaryContact: "",
    licenseNumber: "",
    operatingHours: "",
    location: {
      type: "Point",
      coordinates: [0, 0]
    }
  });

  useEffect(() => {
    dispatch(fetchBloodBankProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || user?.name || "",
        address: profile.address || "",
        contactNumber: profile.contactNumber || "",
        secondaryContact: profile.secondaryContact || "",
        licenseNumber: profile.licenseNumber || "",
        operatingHours: profile.operatingHours || "24/7",
        location: profile.location || { type: "Point", coordinates: [0, 0] }
      });
    }
  }, [profile, user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateBloodBankProfile(formData));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-4xl font-extrabold premium-gradient-text tracking-tight">
            Blood Bank Profile 🩸
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            Configure your facility protocols, license, and public contact information
          </p>
        </div>

        {profileLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-700">
            {/* Status Messages */}
            {success && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-3">
                <span className="text-xl">✅</span>
                <span className="font-bold">{success}</span>
              </div>
            )}
            {(error || profileError) && (
              <div className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/50 flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <span className="font-bold">{error || profileError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Core Facility Info */}
              <div className="glass-card p-8 rounded-3xl space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-primary">🏢</span> Core Identity
                </h3>
                
                <div>
                  <label className="label-text">Facility Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="label-text">Operating Hours</label>
                  <input
                    name="operatingHours"
                    value={formData.operatingHours}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g. 24/7 or 08:00 AM - 10:00 PM"
                  />
                </div>

                <div>
                  <label className="label-text">Medical License ID</label>
                  <input
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g. BBNK-REG-991"
                  />
                </div>
              </div>

              {/* Contact Channels */}
              <div className="glass-card p-8 rounded-3xl space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-blue-500">📞</span> Communication
                </h3>

                <div>
                  <label className="label-text">Primary Phone</label>
                  <input
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="+1 (555) 001-0011"
                  />
                </div>

                <div>
                  <label className="label-text">Dispatch / Secondary</label>
                  <input
                    name="secondaryContact"
                    value={formData.secondaryContact}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Back office or mobile line"
                  />
                </div>
              </div>
            </div>

            {/* Geometry & Location */}
            <div className="glass-card p-8 rounded-3xl space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="text-rose-500">🗺️</span> Geo-Location Intelligence
              </h3>
              
              <div>
                <label className="label-text">Full Physical Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input-field min-h-[100px]"
                  placeholder="Street No, Area, City, State..."
                />
              </div>

              <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl text-xs text-slate-500 flex items-center gap-3">
                 <div className="w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm">🛰️</div>
                 <p className="font-medium">
                   GNSS Coordinates: <span className="text-primary font-bold">{formData.location.coordinates[1]}, {formData.location.coordinates[0]}</span>
                 </p>
                 <button 
                   type="button"
                   onClick={() => {
                     navigator.geolocation.getCurrentPosition((pos) => {
                       setFormData(prev => ({
                         ...prev,
                         location: {
                           type: "Point",
                           coordinates: [pos.coords.longitude, pos.coords.latitude]
                         }
                       }));
                     });
                   }}
                   className="ml-auto text-primary font-bold hover:underline"
                 >
                   Sync current position
                 </button>
              </div>
            </div>

            {/* Commit Changes */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-12 py-4 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>Commit Registry Changes 🏗️</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
