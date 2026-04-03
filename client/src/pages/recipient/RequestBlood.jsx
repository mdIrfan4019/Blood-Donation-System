// import { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { createBloodRequest } from "../../store/slices/recipientSlice";

// export default function RequestBlood() {
//   const [form, setForm] = useState({
//     bloodGroup: "",
//     units: "",
//     urgency: "medium",
//   });

//   const dispatch = useDispatch();
//   const { loading, error, success } = useSelector((s) => s.recipient);

//   const submit = () => {
//     dispatch(createBloodRequest(form));
//   };

//   /* ✅ Redirect after success */
//   useEffect(() => {
//     if (success) {
//       setTimeout(() => {
//         navigate("/recipient");
//       }, 1000); // small delay so user sees success msg
//     }
//   }, [success, navigate]);
//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
//       <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 space-y-6">
//         {/* Header */}
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-red-600">
//             Request Blood 🩸
//           </h2>
//           <p className="text-gray-500 text-sm mt-1">
//             Submit a blood request for urgent needs
//           </p>
//         </div>

//         {/* Error */}
//         {error && (
//           <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md text-sm">
//             {error}
//           </div>
//         )}

//         {/* Success */}
//         {success && (
//           <div className="bg-green-100 text-green-700 px-4 py-2 rounded-md text-sm text-center">
//             Blood request submitted successfully!
//           </div>
//         )}

//         {/* Blood Group */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Blood Group
//           </label>
//           <select
//             className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
//             onChange={(e) =>
//               setForm({ ...form, bloodGroup: e.target.value })
//             }
//             value={form.bloodGroup}
//           >
//             <option value="">Select blood group</option>
//             <option value="A+">A+</option>
//             <option value="A-">A-</option>
//             <option value="B+">B+</option>
//             <option value="B-">B-</option>
//             <option value="O+">O+</option>
//             <option value="O-">O-</option>
//             <option value="AB+">AB+</option>
//             <option value="AB-">AB-</option>
//           </select>
//         </div>

//         {/* Units */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Units Required
//           </label>
//           <input
//             type="number"
//             min="1"
//             placeholder="e.g. 2"
//             className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
//             onChange={(e) =>
//               setForm({ ...form, units: e.target.value })
//             }
//             value={form.units}
//           />
//         </div>

//         {/* Urgency */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Urgency Level
//           </label>
//           <select
//             className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
//             onChange={(e) =>
//               setForm({ ...form, urgency: e.target.value })
//             }
//             value={form.urgency}
//           >
//             <option value="low">Low</option>
//             <option value="medium">Medium</option>
//             <option value="high">High</option>
//             <option value="critical">Critical</option>
//           </select>
//         </div>

//         {/* Submit Button */}
//         <button
//           onClick={submit}
//           disabled={loading}
//           className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold shadow hover:bg-red-700 transition duration-200 disabled:opacity-50"
//         >
//           {loading ? "Submitting..." : "Submit Request"}
//         </button>
//       </div>
//     </div>
//   );
// }



import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createBloodRequest } from "../../store/slices/recipientSlice";
import { useNavigate } from "react-router-dom";

export default function RequestBlood() {
  const [form, setForm] = useState({
    bloodGroup: "",
    units: 1,
    urgency: "medium",
    component: "Whole Blood",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, success } = useSelector((s) => s.recipient);

  const submit = (e) => {
    e.preventDefault();
    dispatch(createBloodRequest(form));
  };

  /* ✅ Redirect after success */
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate("/recipient");
      }, 1500); 
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-10 flex items-center justify-center">
      <div className="glass-card p-10 rounded-[2.5rem] w-full max-w-2xl shadow-2xl shadow-slate-200 dark:shadow-none animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">
            🚑
          </div>
          <h2 className="text-4xl font-extrabold premium-gradient-text tracking-tight">
            Emergency Request
          </h2>
          <p className="text-slate-500 font-medium mt-2">
            Submit a specialized blood component request for immediate matching
          </p>
        </div>

        <form onSubmit={submit} className="space-y-8">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/50 flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <span className="font-bold">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-3">
              <span className="text-xl">✅</span>
              <span className="font-bold">Request successfully logged. Redirecting...</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Type & Group */}
            <div className="space-y-6">
              <div>
                <label className="label-text">Required Component</label>
                <select
                  className="input-field cursor-pointer"
                  onChange={(e) => setForm({ ...form, component: e.target.value })}
                  value={form.component}
                >
                  <option value="Whole Blood">Whole Blood (Standard)</option>
                  <option value="Plasma">Fresh Frozen Plasma</option>
                  <option value="Platelets">Concentrated Platelets</option>
                </select>
              </div>

              <div>
                <label className="label-text">Blood Group</label>
                <select
                  className="input-field cursor-pointer"
                  onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                  value={form.bloodGroup}
                  required
                >
                  <option value="">Select blood group</option>
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Units & Urgency */}
            <div className="space-y-6">
              <div>
                <label className="label-text">Units Required (ml)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="input-field"
                  onChange={(e) => setForm({ ...form, units: Number(e.target.value) })}
                  value={form.units}
                  required
                />
              </div>

              <div>
                <label className="label-text">Urgency Priority</label>
                <div className="grid grid-cols-2 gap-3">
                  {["low", "medium", "high", "critical"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setForm({ ...form, urgency: level })}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        form.urgency === level 
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-[1.05]" 
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-primary/50"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-5 rounded-[1.5rem] tracking-widest font-black uppercase text-sm shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 group"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Submit Request 📡
                  <span className="group-hover:translate-x-2 transition-transform">→</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
