import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import NotificationCenter from "./NotificationCenter";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { role } = useSelector((s) => s.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setIsMenuOpen(false);
    navigate("/");
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="w-full px-6 lg:px-12 py-4 flex items-center justify-between">
        {/* Brand */}
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => {
             closeMenu();
             if (role) navigate(`/${role}`);
             else navigate('/');
          }}
        >
          <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 shadow-inner">
            🩸
          </div>
          <h2 className="text-xl font-black tracking-tight text-rose-600 dark:text-rose-500">
            Drop4Life
          </h2>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
           {!role && (
             <>
               <PublicNavLink href="#features" label="Platform" />
               <PublicNavLink href="#how" label="Process" />
               <PublicNavLink href="#docs" label="Knowledge" />
               <PublicNavLink href="#testimonials" label="Stories" />
             </>
           )}
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
               <NavLink onClick={() => navigate("/doctor?view=handover")} label="Handover" />
               <NavLink onClick={() => navigate("/doctor?view=history")} label="History" />
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

        {/* Right Section: Actions & Mobile Toggle */}
        <div className="flex items-center space-x-4">
          {role && (
            <div className="flex items-center gap-2 sm:gap-4">
              <NotificationCenter />
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                   {role} Access
                 </span>
              </div>
            </div>
          )}

          {/* User Sign In/Out (Desktop) */}
          <div className="hidden md:block">
            {role ? (
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 rounded-xl font-bold text-sm shadow-lg hover:translate-y-[-2px] transition-all active:translate-y-[0]"
              >
                Sign Out
              </button>
            ) : (
               <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate("/login")}
                    className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors uppercase tracking-widest"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className="bg-gradient-to-r from-red-600 to-rose-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-red-500/20 hover:-translate-y-1 hover:shadow-2xl transition-all uppercase tracking-widest"
                  >
                    Join Us
                  </button>
               </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Container */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-slate-100 dark:border-slate-800 ${isMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-6 py-8 flex flex-col gap-6 bg-white dark:bg-slate-900 shadow-2xl">
           {/* Navigation Links (Mobile) */}
           <div className="flex flex-col gap-4">
              {!role && (
                <>
                  <MobileNavLink onClick={closeMenu} href="#features" label="Platform" />
                  <MobileNavLink onClick={closeMenu} href="#how" label="Process" />
                  <MobileNavLink onClick={closeMenu} href="#docs" label="Knowledge" />
                  <MobileNavLink onClick={closeMenu} href="#testimonials" label="Stories" />
                </>
              )}
              {role === "donor" && (
                <>
                  <MobileNavLink onClick={() => { navigate("/donor"); closeMenu(); }} label="Dashboard" />
                  <MobileNavLink onClick={() => { navigate("/donor/donate"); closeMenu(); }} label="Donate" />
                  <MobileNavLink onClick={() => { navigate("/donor/profile"); closeMenu(); }} label="Profile" />
                </>
              )}
              {role === "hospital" && (
                <>
                  <MobileNavLink onClick={() => { navigate("/hospital"); closeMenu(); }} label="Requests" />
                  <MobileNavLink onClick={() => { navigate("/hospital/inventory"); closeMenu(); }} label="Inventory" />
                  <MobileNavLink onClick={() => { navigate("/hospital/camps"); closeMenu(); }} label="Camps" />
                  <MobileNavLink onClick={() => { navigate("/hospital/staff"); closeMenu(); }} label="Staff" />
                  <MobileNavLink onClick={() => { navigate("/hospital/profile"); closeMenu(); }} label="Profile" />
                </>
              )}
              {role === "doctor" && (
                <>
                  <MobileNavLink onClick={() => { navigate("/doctor"); closeMenu(); }} label="Patient Requests" />
                  <MobileNavLink onClick={() => { navigate("/doctor?view=handover"); closeMenu(); }} label="Handover" />
                  <MobileNavLink onClick={() => { navigate("/doctor?view=history"); closeMenu(); }} label="History" />
                </>
              )}
              {role === "tester" && (
                <MobileNavLink onClick={() => { navigate("/tester"); closeMenu(); }} label="Lab Screening" />
              )}
              {role === "receptionist" && (
                <MobileNavLink onClick={() => { navigate("/receptionist"); closeMenu(); }} label="Registration" />
              )}
              {role === "admin" && (
                <>
                  <MobileNavLink onClick={() => { navigate("/admin"); closeMenu(); }} label="Management" />
                  <MobileNavLink onClick={() => { navigate("/admin/inventory"); closeMenu(); }} label="Supply" />
                </>
              )}
           </div>

           {/* Mobile Actions */}
           <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
              {role ? (
                <button
                  onClick={handleLogout}
                  className="w-full py-4 bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 rounded-2xl font-bold text-base shadow-xl active:scale-95 transition-all"
                >
                  Sign Out
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => { navigate("/login"); closeMenu(); }}
                    className="w-full py-4 text-rose-600 dark:text-rose-400 font-bold text-sm uppercase tracking-widest border border-rose-100 dark:border-rose-900/30 rounded-2xl"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { navigate("/register"); closeMenu(); }}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-red-500/20 active:scale-95 transition-all uppercase tracking-widest"
                  >
                    Join Us
                  </button>
                </div>
              )}
           </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ onClick, label }) {
  return (
    <button 
      onClick={onClick}
      className="text-sm font-bold text-slate-500 hover:text-rose-500 transition-colors uppercase tracking-widest relative group"
    >
      {label}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-500 transition-all group-hover:w-full" />
    </button>
  );
}

function PublicNavLink({ href, label }) {
    return (
      <a 
        href={href}
        className="text-sm font-bold text-slate-500 hover:text-rose-500 transition-colors uppercase tracking-widest relative group"
      >
        {label}
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-500 transition-all group-hover:w-full" />
      </a>
    );
}

function MobileNavLink({ onClick, label, href }) {
  if (href) {
    return (
      <a 
        href={href}
        onClick={onClick}
        className="text-lg font-bold text-slate-800 dark:text-slate-100 hover:text-rose-600 transition-colors"
      >
        {label}
      </a>
    );
  }
  return (
    <button 
      onClick={onClick}
      className="text-lg font-bold text-slate-800 dark:text-slate-100 hover:text-rose-600 transition-colors text-left"
    >
      {label}
    </button>
  );
}
