import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";
import {
  fetchHospitalRequests,
  fetchHospitalProfile,
  fulfillRequestThunk,
  clearHospitalStatus,
  fetchInventoryForRequest,
  approveDonationThunk,
} from "../../store/slices/hospitalSlice";

export default function Requests() {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("pending");

  const {
    requests = [],
    loading,
    error,
    success,
    fulfillResult,
    inventoryCheck,
    profile,
    profileLoading
  } = useSelector((s) => s.hospital);

  /* ======================
     FORCE PROFILE COMPLETION
  ====================== */
  if (!profileLoading && profile && (!profile.state || !profile.district)) {
    return <Navigate to="/hospital/profile" />;
  }

  /* ===========================
     FETCH DATA ON LOAD
  =========================== */
  useEffect(() => {
    dispatch(fetchHospitalRequests());
    dispatch(fetchHospitalProfile());
  }, [dispatch]);

  /* ===========================
     INVENTORY CHECK
  =========================== */
  useEffect(() => {
    const pendingRequests = requests.filter((r) => r.status === "pending" && !r.donationType);
    pendingRequests.forEach((r) => {
      if (!inventoryCheck?.[r.bloodGroup]) {
        dispatch(fetchInventoryForRequest(r.bloodGroup));
      }
    });
  }, [requests, dispatch, inventoryCheck]);

  /* ===========================
     HANDLERS
  =========================== */
  useEffect(() => {
    if (success) {
      if (fulfillResult?.deductions) {
        const usedGroups = fulfillResult.deductions
          .map((d) => `${d.bloodGroup} (${d.deductedUnits})`)
          .join(", ");
        alert(`✅ Fulfilled Successfully!\nUsed: ${usedGroups}`);
      } else if (success.includes("Approved")) {
        alert("✅ Donation Approved for Lab Testing!");
      }
      dispatch(clearHospitalStatus());
      dispatch(fetchHospitalRequests());
    }
  }, [success, fulfillResult, dispatch]);

  const handleFulfill = (id) => {
    dispatch(fulfillRequestThunk(id));
  };

  const handleApproveDonation = (id) => {
    dispatch(approveDonationThunk(id));
  };

  /* ===========================
     FILTERS
  =========================== */
  const donationsList = requests.filter((r) => r.donationType && r.status === "pending");
  const processedDonations = requests.filter((r) => r.donationType && r.status !== "pending");
  const patientRequests = requests.filter((r) => !r.donationType);

  /* ===========================
     RENDER CARD
  =========================== */
  const renderRequestCard = (r, isDonation = false) => {
    if (isDonation) {
      const isPending = r.status === "pending";
      return (
        <div key={r._id} className="glass-card p-8 rounded-[2.5rem] group hover:border-primary/30 transition-all relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className={`px-4 py-1.5 text-sm font-black rounded-xl border ${r.status === 'safe' ? 'bg-emerald-100 text-emerald-600 border-emerald-200' :
                  r.status === 'testing' ? 'bg-blue-100 text-blue-600 border-blue-200' :
                    'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50'
                }`}>
                DONATION: {r.bloodGroup} {r.status !== 'pending' && `• ${r.status.toUpperCase()}`}
              </span>
              <h3 className="text-2xl font-black mt-3 text-slate-800 dark:text-slate-100">
                {r.donor?.name || "New Donor"}
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                Method: {r.donationType} • {r.state}, {r.district}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-[10px] font-bold uppercase tracking-widest">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">Hb: {r.eligibility?.hb}</div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">BP: {r.eligibility?.bp}</div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">Age: {r.eligibility?.age}</div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">Wt: {r.eligibility?.weight}kg</div>
            </div>
            {isPending && (
              <button
                onClick={() => handleApproveDonation(r._id)}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-900/30 hover:-translate-y-1 transition-all"
              >
                Approve for Testing 🔬
              </button>
            )}
          </div>
        </div>
      );
    }

    const inv = inventoryCheck?.[r.bloodGroup];
    const totalAvailable = inv?.totalAvailable ?? 0;
    const canFulfill = totalAvailable >= r.units;

    return (
      <div key={r._id} className="glass-card p-8 rounded-[2.5rem] group hover:border-primary/30 transition-all relative overflow-hidden">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className={`px-4 py-1.5 text-sm font-black rounded-xl border ${r.status === 'completed' ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50'
              }`}>
              {r.bloodGroup} {r.status === 'completed' && "• COMPLETED"}
            </span>
            <h3 className="text-2xl font-black mt-3 text-slate-800 dark:text-slate-100">
              {r.units} Units Required
            </h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
              {r.component || "Whole Blood"} • {r.urgency || "Standard"}
            </p>
            <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">
              Patient: {r.patient?.name || "N/A"}
            </p>
          </div>
          {r.status === "completed" && (
            <span className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
              Delivered
            </span>
          )}
        </div>

        {r.status === "pending" && (
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${canFulfill ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50' : 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/50'}`}>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Live Inventory</p>
                <p className={`text-lg font-black ${canFulfill ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {totalAvailable} Units Available
                </p>
              </div>
              <span className="text-2xl">{canFulfill ? "✅" : "⚠️"}</span>
            </div>

            <button
              onClick={() => handleFulfill(r._id)}
              disabled={!canFulfill || loading}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${canFulfill ? 'bg-primary text-white shadow-xl shadow-primary/30 hover:-translate-y-1' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              {canFulfill ? "Fulfill Requirement 🚚" : "Low Inventory ⛔"}
            </button>
          </div>
        )}
      </div>
    );
  };

  const currentList =
    activeTab === "donations"
      ? donationsList
      : activeTab === "completed"
        ? processedDonations
        : patientRequests;

  return (
    <div className="">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold premium-gradient-text tracking-tight">
            Inbound Logistics 🏥
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            Manage incoming requests and blood donations.
          </p>
        </div>

        <div className="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-2xl w-fit shadow-inner">
          <button
            onClick={() => setActiveTab("donations")}
            className={`px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === "donations" ? 'bg-white dark:bg-slate-700 text-blue-500 shadow-sm' : 'text-slate-500'}`}
          >
            🩸 Donations ({donationsList.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === "completed" ? 'bg-white dark:bg-slate-700 text-orange-500 shadow-sm' : 'text-slate-500'}`}
          >
            🧪 Processed ({processedDonations.length})
          </button>
          <button
            onClick={() => setActiveTab("patient")}
            className={`px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === "patient" ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm' : 'text-slate-500'}`}
          >
            📦 Given to Patient ({patientRequests.length})
          </button>
        </div>
      </div>

      {(loading || error) && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          {loading && <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>}
          {error && <p className="text-rose-500 font-bold">⚠️ {error}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        {currentList.map((r) => renderRequestCard(r, activeTab === "donations" || activeTab === "completed"))}
      </div>

      {!loading && currentList.length === 0 && (
        <div className="text-center py-32 glass-card rounded-[3rem]">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No records found for this category</p>
        </div>
      )}
    </div>
  );
}
