import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyRequests } from "../../store/slices/recipientSlice";
import { useNavigate } from "react-router-dom";

export default function RecipientDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { requests } = useSelector((s) => s.recipient);

  useEffect(() => {
    dispatch(fetchMyRequests());
  }, [dispatch]);

  const count = requests.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-10 flex items-center justify-center">
      <div className="glass-card p-10 rounded-[2.5rem] w-full max-w-lg shadow-2xl shadow-slate-200 dark:shadow-none animate-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
            🩸
          </div>
          <h2 className="text-4xl font-extrabold premium-gradient-text tracking-tight">
            Recipient Hub
          </h2>
          <p className="text-slate-500 font-medium mt-2">
            Request life-saving blood components and track fulfillment
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <button
            onClick={() => navigate("/recipient/request")}
            className="group relative overflow-hidden bg-primary text-white p-6 rounded-3xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/20"
          >
            <div className="relative z-10 flex items-center justify-between">
              <div className="text-left">
                <p className="text-xl">Request Blood ➕</p>
                <p className="text-[10px] uppercase font-black tracking-widest opacity-70">Immediate medical requirement</p>
              </div>
              <span className="text-2xl group-hover:translate-x-2 transition-transform duration-300">→</span>
            </div>
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors" />
          </button>

          <button
            onClick={() => navigate("/recipient/requests")}
            disabled={count === 0}
            className={`group relative overflow-hidden p-6 rounded-3xl font-bold transition-all ${
              count > 0
                ? "bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-950/20"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700"
            }`}
          >
            <div className="relative z-10 flex items-center justify-between">
              <div className="text-left">
                <p className="text-xl">Track Status 📋</p>
                <p className="text-[10px] uppercase font-black tracking-widest opacity-70">View {count} active requests</p>
              </div>
              {count > 0 && <span className="text-2xl group-hover:translate-x-2 transition-transform duration-300">→</span>}
            </div>
          </button>
        </div>

        {count === 0 && (
          <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              No active requests found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
