// import { useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { saveDonorProfile } from "../../store/slices/donorSlice";
// import { useNavigate } from "react-router-dom";

// export default function Profile() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { profileLoading, error } = useSelector((s) => s.donor);

//   const [form, setForm] = useState({
//     bloodGroup: "",
//     address: "",
//     lat: null,
//     lng: null,
//   });

//   /* ============================
//      GET USER LOCATION (GPS)
//   ============================ */
//   const getLocation = () => {
//     if (!navigator.geolocation) {
//       alert("Geolocation not supported");
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         setForm((f) => ({
//           ...f,
//           lat: pos.coords.latitude,
//           lng: pos.coords.longitude,
//         }));
//       },
//       () => alert("Location permission denied")
//     );
//   };

//   const submit = async (e) => {
//     e.preventDefault();

//     if (!form.lat || !form.lng) {
//       alert("Please allow location access");
//       return;
//     }

//     const res = await dispatch(
//       saveDonorProfile({
//         bloodGroup: form.bloodGroup,
//         location: {
//           address: form.address,
//           lat: form.lat,
//           lng: form.lng,
//         },
//       })
//     );

//     if (res.meta.requestStatus === "fulfilled") {
//       navigate("/donor");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
//       <form
//         onSubmit={submit}
//         className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-5"
//       >
//         <h2 className="text-2xl font-bold text-red-600 text-center">
//           Donor Profile 🩸
//         </h2>

//         {/* Blood Group */}
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Blood Group
//           </label>
//           <select
//             required
//             className="w-full border rounded-lg px-4 py-2"
//             onChange={(e) =>
//               setForm({ ...form, bloodGroup: e.target.value })
//             }
//           >
//             <option value="">Select</option>
//             <option>A+</option>
//             <option>A-</option>
//             <option>B+</option>
//             <option>B-</option>
//             <option>O+</option>
//             <option>O-</option>
//             <option>AB+</option>
//             <option>AB-</option>
//           </select>
//         </div>

//         {/* Address */}
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Location (City / Area / Hospital)
//           </label>
//           <input
//             required
//             placeholder="e.g. AIIMS, New Delhi"
//             className="w-full border rounded-lg px-4 py-2"
//             onChange={(e) =>
//               setForm({ ...form, address: e.target.value })
//             }
//           />
//         </div>

//         {/* GPS BUTTON */}
//         <button
//           type="button"
//           onClick={getLocation}
//           className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
//         >
//           📍 Use My Current Location
//         </button>

//         {/* LOCATION STATUS */}
//         {form.lat && form.lng && (
//           <p className="text-green-600 text-sm text-center">
//             Location captured successfully ✔
//           </p>
//         )}

//         {error && (
//           <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm">
//             {error}
//           </div>
//         )}

//         <button
//           disabled={profileLoading}
//           className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition"
//         >
//           {profileLoading ? "Saving..." : "Save Profile"}
//         </button>
//       </form>
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { saveDonorProfile, fetchDonorDashboard } from "../../store/slices/donorSlice";
import { useNavigate } from "react-router-dom";
import { statesAndDistricts } from "../../data/indiaData";

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

const { profileLoading, error, dashboard } = useSelector((s) => s.donor);

  const [form, setForm] = useState({
    bloodGroup: "",
    age: "",
    medicalHistory: "",
    address: "",
    state: "",
    district: "",
    lat: null,
    lng: null,
  });

  useEffect(() => {
    dispatch(fetchDonorDashboard());
  }, [dispatch]);

  useEffect(() => {
    if (dashboard?.bloodGroup) {
      setForm((prev) => ({
        ...prev,
        bloodGroup: dashboard.bloodGroup,
        age: dashboard.age || "",
        medicalHistory: dashboard.medicalHistory?.join(", ") || "",
        address: dashboard.location?.address || "",
        state: dashboard.location?.state || "",
        district: dashboard.location?.district || "",
        lat: dashboard.location?.lat || null,
        lng: dashboard.location?.lng || null,
      }));
    }
  }, [dashboard]);

  const isBloodGroupLocked = dashboard?.totalDonations > 0;

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }));
      },
      () => alert("Location permission denied")
    );
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.lat || !form.lng) {
      alert("Please allow location access");
      return;
    }

    const payload = {
      age: Number(form.age),
      medicalHistory: form.medicalHistory.split(",").map(i => i.trim()).filter(i => i),
      location: {
        address: form.address,
        lat: form.lat,
        lng: form.lng,
      },
      state: form.state,
      district: form.district,
    };

    // Only allow bloodGroup if not locked
    if (!isBloodGroupLocked) {
      payload.bloodGroup = form.bloodGroup;
    }

    const res = await dispatch(saveDonorProfile(payload));

    if (res.meta.requestStatus === "fulfilled") {
      navigate("/donor");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <div className="glass-card p-8 rounded-3xl w-full max-w-lg space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold premium-gradient-text">
            Donor Profile 🩸
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Complete your profile to start saving lives
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Blood Group */}
            <div>
              <label className="label-text">Blood Group</label>
              <select
                required
                disabled={isBloodGroupLocked}
                value={form.bloodGroup}
                className={`input-field ${isBloodGroupLocked ? "opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800" : ""}`}
                onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
              >
                <option value="">Select</option>
                <option>A+</option><option>A-</option>
                <option>B+</option><option>B-</option>
                <option>O+</option><option>O-</option>
                <option>AB+</option><option>AB-</option>
              </select>
              {isBloodGroupLocked && (
                <p className="text-[10px] text-red-500 mt-1">Locked after first donation</p>
              )}
            </div>

            {/* Age */}
            <div>
              <label className="label-text">Age</label>
              <input
                type="number"
                required
                min="18"
                max="65"
                placeholder="18-65"
                value={form.age}
                className="input-field"
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
            </div>
          </div>

          {/* Medical History */}
          <div>
            <label className="label-text">Medical History (Optional)</label>
            <textarea
              placeholder="e.g. None, Hypertension, Diabetes (comma separated)"
              value={form.medicalHistory}
              rows="2"
              className="input-field resize-none"
              onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })}
            />
          </div>

          {/* Address */}
          <div>
            <label className="label-text">Location (City / Area / Hospital)</label>
            <input
              required
              value={form.address}
              placeholder="e.g. AIIMS, New Delhi"
              className="input-field"
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label-text">State</label>
              <select
                required
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value, district: "" })}
                className="input-field"
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
                required
                disabled={!form.state}
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="input-field"
              >
                <option value="">Select District</option>
                {form.state && statesAndDistricts[form.state]?.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
          </div>

          {/* GPS BUTTON */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={getLocation}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-primary/20 text-primary hover:bg-primary/5 rounded-xl transition-all font-medium"
            >
              📍 {form.lat ? "Update Location" : "Capture Current Location"}
            </button>

            {form.lat && form.lng && (
              <div className="flex items-center justify-center gap-2 text-green-600 text-xs font-semibold bg-green-50 dark:bg-green-950/30 py-2 rounded-lg">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live location active
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm border border-red-100 dark:border-red-900/50">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={profileLoading}
            className="btn-primary w-full py-4 text-lg"
          >
            {profileLoading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
