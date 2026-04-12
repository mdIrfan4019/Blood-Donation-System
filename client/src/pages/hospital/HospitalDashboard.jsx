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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row font-outfit overflow-x-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-[60]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-primary/20">
            🏥
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter leading-none">Medical Center</h1>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Command Port</p>
          </div>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 transition-all active:scale-95"
        >
          {isSidebarOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          )}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-[280px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-8 flex flex-col gap-10 transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:w-80 md:h-screen md:sticky md:top-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="hidden md:flex items-center gap-4 px-2">
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
              onClick={() => {
                setActiveWorkspace(ws.id);
                setIsSidebarOpen(false);
              }}
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

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[65] md:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto md:h-screen custom-scrollbar">
        <div className="p-4 sm:p-6 md:p-8 lg:p-12 animate-in fade-in slide-in-from-right-10 duration-700">
          <div className="max-w-7xl mx-auto">
            {renderWorkspace()}
          </div>
        </div>
      </main>
    </div>
  );
}
