import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import NotificationCenter from "./NotificationCenter";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { role } = useSelector((s) => s.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="w-full px-8 lg:px-12 py-4 flex items-center justify-between">
        {/* Brand */}
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => role && navigate(`/${role}`)}
        >
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 shadow-inner">
            🩸
          </div>
          <h2 className="text-xl font-black tracking-tight premium-gradient-text">
            Drop4Life
          </h2>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
           {role === "donor" && (
             <>
               <NavLink onClick={() => navigate("/donor")} label="Dashboard" />
               <NavLink onClick={() => navigate("/donor/donate")} label="Donate" />
               <NavLink onClick={() => navigate("/donor/profile")} label="Profile" />
             </>
           )}
           {role === "hospital" && (
             <>
               <NavLink onClick={() => navigate("/hospital")} label="Requests" />
               <NavLink onClick={() => navigate("/hospital/inventory")} label="Inventory" />
               <NavLink onClick={() => navigate("/hospital/camps")} label="Camps" />
               <NavLink onClick={() => navigate("/hospital/staff")} label="Staff" />
               <NavLink onClick={() => navigate("/hospital/profile")} label="Profile" />
             </>
           )}
           {role === "doctor" && (
             <>
               <NavLink onClick={() => navigate("/doctor")} label="Patient Requests" />
               <NavLink onClick={() => navigate("/hospital")} label="Inventory" />
             </>
           )}
           {role === "tester" && (
             <>
               <NavLink onClick={() => navigate("/tester")} label="Lab Screening" />
             </>
           )}
           {role === "receptionist" && (
             <>
               <NavLink onClick={() => navigate("/receptionist")} label="Registration" />
             </>
           )}
           {role === "admin" && (
             <>
               <NavLink onClick={() => navigate("/admin")} label="Management" />
               <NavLink onClick={() => navigate("/admin/inventory")} label="Supply" />
             </>
           )}
        </div>

        {/* User Status & Actions */}
        <div className="flex items-center space-x-6">
          {role && (
            <div className="flex items-center gap-4">
              <NotificationCenter />
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                   {role} Access
                 </span>
              </div>
            </div>
          )}

          {role ? (
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 rounded-xl font-bold text-sm shadow-lg hover:translate-y-[-2px] transition-all active:translate-y-[0]"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="btn-primary px-8 py-2.5 rounded-xl font-bold text-sm"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ onClick, label }) {
  return (
    <button 
      onClick={onClick}
      className="text-sm font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-widest relative group"
    >
      {label}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
    </button>
  );
}
