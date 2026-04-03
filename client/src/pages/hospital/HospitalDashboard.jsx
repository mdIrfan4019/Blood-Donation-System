import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

import HospitalRequests from "./Requests";
import HospitalInventory from "./HospitalInventory";
import ManageCamps from "./ManageCamps";
import HospitalProfile from "./Profile";
import NetworkDirectory from "./NetworkDirectory";
import HospitalForecast from "./HospitalForecast";

import { fetchHospitalProfile } from "../../store/slices/hospitalSlice";

export default function HospitalDashboard() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { profile, profileLoading } = useSelector((s) => s.hospital);

  const determineWorkspace = (path) => {
    if (path.includes("inventory")) return "inventory";
    if (path.includes("camps")) return "camps";
    if (path.includes("staff") || path.includes("patients") || path.includes("network")) return "network";
    if (path.includes("profile")) return "profile";
    return "overview";
  };

  const [activeWorkspace, setActiveWorkspace] = useState(determineWorkspace(location.pathname));

  useEffect(() => {
    setActiveWorkspace(determineWorkspace(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    dispatch(fetchHospitalProfile());
  }, [dispatch]);

  // Force profile completion
  if (!profileLoading && profile && (!profile.state || !profile.district)) {
    return <Navigate to="/hospital/profile" />;
  }

  const workspaces = [
    { id: "overview", name: "Inbound Logistics", icon: "🏥" },
    { id: "inventory", name: "Storage & Inventory", icon: "🧊" },
    { id: "network", name: "Network Directory", icon: "🌐" },
    { id: "forecast", name: "Demand Forecast", icon: "📈" },
    { id: "camps", name: "Blood Donation Camps", icon: "⛺" },
    { id: "profile", name: "Hospital Identity", icon: "🏛️" },
  ];

  const renderWorkspace = () => {
    switch (activeWorkspace) {
      case "overview":
        return <HospitalRequests />;
      case "inventory":
        return <HospitalInventory />;
      case "camps":
        return <ManageCamps />;
      case "network":
        return <NetworkDirectory />;
      case "forecast":
        return <HospitalForecast />;
      case "profile":
        return <HospitalProfile />;
      default:
        return <HospitalRequests />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row font-outfit">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-8 flex flex-col gap-10 sticky top-0 h-auto md:h-screen overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-4 px-2">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-primary/20">
            🏥
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-none">Medical Center</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hospital Command Port</p>
          </div>
        </div>

        <nav className="flex flex-col gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 px-2">Workspaces</p>
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => setActiveWorkspace(ws.id)}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all group ${
                activeWorkspace === ws.id
                  ? "bg-primary text-white shadow-xl shadow-primary/30 active-workspace"
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <span className={`text-xl transition-transform group-hover:scale-110 ${activeWorkspace === ws.id ? 'scale-110' : ''}`}>{ws.icon}</span>
              {ws.name}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-10 px-2 border-t border-slate-100 dark:border-slate-800">
           <div className="p-5 glass-card rounded-3xl bg-slate-50 dark:bg-slate-800/50 border-0 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-lg">👨‍💼</div>
              <div>
                <p className="text-xs font-black text-slate-800 dark:text-slate-100">Administrator</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active System Control</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen custom-scrollbar">
        <div className="p-4 md:p-8 lg:p-12 animate-in fade-in slide-in-from-right-10 duration-700">
          <div className="max-w-7xl mx-auto">
            {renderWorkspace()}
          </div>
        </div>
      </main>
    </div>
  );
}
