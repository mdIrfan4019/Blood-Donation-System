import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDonorDashboard } from "../../store/slices/donorSlice";
import { useNavigate, Navigate } from "react-router-dom";

const COOLDOWN_DAYS = 90;

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

const { dashboard, dashboardLoading, error } = useSelector((s) => s.donor);

  // SAFE eligibility source (redux + localStorage)
  const eligibility =
    useSelector((s) => s.donor.eligibility) ||
    JSON.parse(localStorage.getItem("donorEligibility"));

  const isEligible = eligibility?.status === "Eligible";

  useEffect(() => {
    dispatch(fetchDonorDashboard());
  }, [dispatch]);

  /* ======================
     FORCE PROFILE COMPLETION
  ====================== */
  if (
    !dashboardLoading &&
    dashboard &&
    (!dashboard.bloodGroup || !dashboard.state || !dashboard.district)
  ) {
    return <Navigate to="/donor/profile" />;
  }

  /* ======================
     90 DAYS COOLDOWN LOGIC
  ====================== */
  const lastDonationDate = dashboard?.lastDonationDate
    ? new Date(dashboard.lastDonationDate)
    : null;

  const today = new Date();

  const daysSinceLastDonation = lastDonationDate
    ? Math.floor(
        (today - lastDonationDate) / (1000 * 60 * 60 * 24)
      )
    : null;

  const daysRemaining =
    daysSinceLastDonation !== null
      ? COOLDOWN_DAYS - daysSinceLastDonation
      : 0;

  const isCooldownActive =
    lastDonationDate && daysRemaining > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8">
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold premium-gradient-text tracking-tight">
            Donor Dashboard 🩸
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Welcome back! Ready to save more lives?
          </p>
        </div>
        <div className="flex gap-3">
           <button
            onClick={() => navigate("/donor/profile")}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-sm hover:shadow-md transition-all text-sm font-semibold"
          >
            👤 Edit Profile
          </button>
        </div>
      </div>

      {/* dashboardLoading */}
      {dashboardLoading && (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Stats */}
      {!dashboardLoading && dashboard && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Donations" value={dashboard.totalDonations || 0} icon="❤️" trend="+1" />
          <StatCard
            title="Last Donation"
            value={
              dashboard.lastDonationDate
                ? new Date(dashboard.lastDonationDate).toLocaleDateString()
                : "None"
            }
            icon="📅"
          />
          <StatCard
            title="Status"
            value={dashboard.isAvailable ? "Ready" : "Resting"}
            icon="⚡"
            color={dashboard.isAvailable ? "text-green-500" : "text-amber-500"}
          />
          <StatCard
            title="Group"
            value={dashboard.bloodGroup || "??"}
            icon="🩸"
            color="text-red-500"
          />
        </div>
      )}

      {/* BANNERS SECTION */}
      <div className="space-y-4 mb-10">
        {dashboard && !dashboard.bloodGroup && (
          <div className="glass-card bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-2xl flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <p className="text-sm font-medium">Please complete your donor profile before donating</p>
          </div>
        )}

        {isCooldownActive && (
          <div className="glass-card bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400 p-4 rounded-2xl flex items-center gap-3">
             <span className="text-xl">⏳</span>
             <p className="text-sm font-medium">
               Next donation possible in <strong>{daysRemaining}</strong> days
             </p>
          </div>
        )}
      </div>

      {/* Donation History */}
      {dashboard?.donations?.length > 0 && (
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Donation Journey 📋</h3>
            <span className="text-sm text-slate-500">{dashboard.donations.length} records found</span>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-4 text-left text-sm font-bold text-slate-600 dark:text-slate-400">Date</th>
                  <th className="p-4 text-left text-sm font-bold text-slate-600 dark:text-slate-400">Blood Group</th>
                  <th className="p-4 text-left text-sm font-bold text-slate-600 dark:text-slate-400">Units</th>
                  <th className="p-4 text-left text-sm font-bold text-slate-600 dark:text-slate-400">Location</th>
                  <th className="p-4 text-left text-sm font-bold text-slate-600 dark:text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {dashboard.donations.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 text-sm font-medium">{new Date(d.donationDate).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg border border-red-200 dark:border-red-800/50">
                        {d.bloodGroup}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{d.units} Units</td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                      {d.location?.address || "—"}
                    </td>
                    <td className="p-4">
                      {d.status === "approved" ? (
                        <button 
                         onClick={() => navigate(`/donor/certificate/${d._id}`)}
                         className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                          📜 Certificate
                        </button>
                      ) : (
                        <span className="text-[10px] uppercase font-bold text-slate-400">{d.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color = "text-red-600", trend }) {
  return (
    <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500" />
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xl">{icon}</div>
        {trend && <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">{trend}</span>}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{title}</p>
        <p className={`text-3xl font-black tracking-tight ${color}`}>{value}</p>
      </div>
    </div>
  );
}
