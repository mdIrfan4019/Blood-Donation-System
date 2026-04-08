import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchHospitalProfile, updateHospitalProfile, clearHospitalStatus } from "../../store/slices/hospitalSlice";
import { statesAndDistricts } from "../../data/indiaData";

export default function HospitalProfile() {
  const dispatch = useDispatch();
  const { profile, profileLoading, profileError, loading, success, error } = useSelector((s) => s.hospital);
  const { user } = useSelector((s) => s.auth);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactNumber: "",
    emergencyContact: "",
    hospitalType: "Public",
    licenseNumber: "",
    totalBeds: 0,
    icuBeds: 0,
    location: {
      type: "Point",
      coordinates: [0, 0]
    },
    state: "",
    district: ""
  });

  useEffect(() => {
    dispatch(fetchHospitalProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || user?.name || "",
        address: profile.address || "",
        contactNumber: profile.contactNumber || "",
        emergencyContact: profile.emergencyContact || "",
        hospitalType: profile.hospitalType || "Public",
        licenseNumber: profile.licenseNumber || "",
        totalBeds: profile.totalBeds || 0,
        icuBeds: profile.icuBeds || 0,
        location: profile.location || { type: "Point", coordinates: [0, 0] },
        state: profile.state || "",
        district: profile.district || ""
      });
    }
  }, [profile, user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateHospitalProfile(formData));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "state") {
      setFormData(prev => ({ ...prev, state: value, district: "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-extrabold premium-gradient-text tracking-tight">
              Hospital Identity 🏛️
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              Manage your medical facility details and emergency contacts
            </p>
          </div>
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-3xl shadow-xl">🏥</div>
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
              {/* General Info */}
              <div className="glass-card p-8 rounded-3xl space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-primary">🏢</span> General Information
                </h3>
                
                <div>
                  <label className="label-text">Hospital Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="label-text">Hospital Type</label>
                  <select
                    name="hospitalType"
                    value={formData.hospitalType}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="Public">Public / Government</option>
                    <option value="Private">Private Facility</option>
                    <option value="Charity">Charity / NGO</option>
                  </select>
                </div>

                <div>
                  <label className="label-text">License Number</label>
                  <input
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g. HOSP-12345"
                  />
                </div>
              </div>

              {/* Contact & Capacity */}
              <div className="glass-card p-8 rounded-3xl space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-emerald-500">📞</span> Contact & Capacity
                </h3>

                <div>
                  <label className="label-text">Official Contact</label>
                  <input
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <label className="label-text">Emergency Hotline</label>
                  <input
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="911 or direct dispatcher"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Total Beds</label>
                    <input
                      name="totalBeds"
                      type="number"
                      value={formData.totalBeds}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label-text">ICU Beds</label>
                    <input
                      name="icuBeds"
                      type="number"
                      value={formData.icuBeds}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address & Location */}
            <div className="glass-card p-8 rounded-3xl space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="text-amber-500">📍</span> Location Intelligence
              </h3>
              <div>
                <label className="label-text">Physical Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input-field min-h-[100px]"
                  placeholder="Street, City, Zip Code..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label-text">State</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select State</option>
                    {Object.keys(statesAndDistricts).map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-text">District</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="input-field"
                    required
                    disabled={!formData.state}
                  >
                    <option value="">Select District</option>
                    {formData.state && statesAndDistricts[formData.state]?.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl text-xs text-slate-500 flex items-center gap-3">
                 <div className="w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm">🛰️</div>
                 <p className="font-medium">
                   Current Geographic Coordinates: <span className="text-primary font-bold">{formData.location.coordinates[1]}, {formData.location.coordinates[0]}</span>
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
                   Update from GPS
                 </button>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-12 py-4 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 hover:translate-y-[-2px] active:translate-y-[0] transition-all flex items-center gap-3"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>Save Profile Changes 💾</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
