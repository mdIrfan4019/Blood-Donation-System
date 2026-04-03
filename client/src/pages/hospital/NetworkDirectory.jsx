import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import StaffManagement from "./StaffManagement";
import PatientRegistration from "./PatientRegistration";
import api from "../../services/apiNode";

export default function NetworkDirectory() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    location.pathname.includes("patients") ? "patients" : "staff"
  );
  const [bloodBanks, setBloodBanks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "bloodbanks") {
      fetchBloodBanks();
    }
  }, [activeTab]);

  const fetchBloodBanks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/hospital/bloodbanks");
      setBloodBanks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action, id) => {
    if (action === 'delete' && !window.confirm("Are you sure you want to permanently delete this Blood Bank from the network?")) return;
    try {
      if (action === 'delete') await api.delete(`/hospital/user/${id}`);
      if (action === 'block') await api.patch(`/hospital/user/${id}/block`);
      if (action === 'unblock') await api.patch(`/hospital/user/${id}/unblock`);
      fetchBloodBanks();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const tabs = [
    { id: "staff", label: "Internal Staff", icon: "👨‍⚕️" },
    { id: "patients", label: "Patient Records", icon: "📋" },
    { id: "bloodbanks", label: "Regional Blood Banks", icon: "🏢" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
       <div className="flex justify-between items-end">
         <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100">Network Directory</h2>
            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Unified Operations & Contacts</p>
         </div>
       </div>

       {/* Tabs Navigation */}
       <div className="flex gap-4 p-2 bg-slate-200 dark:bg-slate-900 rounded-3xl w-fit">
         {tabs.map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`px-8 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${
               activeTab === tab.id 
                 ? "bg-white dark:bg-slate-800 text-primary shadow-lg scale-105" 
                 : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-800/50"
             }`}
           >
             <span className="text-lg">{tab.icon}</span> 
             {tab.label}
           </button>
         ))}
       </div>

       {/* Tab Content Rendering */}
       <div className="mt-8 transition-all duration-300">
         {activeTab === "staff" && <StaffManagement />}
         {activeTab === "patients" && <PatientRegistration />}
         {activeTab === "bloodbanks" && (
           <div className="glass-card p-8 rounded-[2.5rem]">
              <h3 className="text-xl font-black mb-6 text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">
                Available Blood Banks
              </h3>
              
              {loading ? (
                <div className="py-20 text-center animate-pulse text-slate-400 font-bold uppercase tracking-widest text-xs">
                   Fetching Network...
                </div>
              ) : bloodBanks.length === 0 ? (
                 <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                   <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No blood banks registered yet</p>
                 </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {bloodBanks.map(bank => (
                      <div key={bank._id} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:border-primary/30 transition-all flex items-start gap-4">
                         <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-2xl flex items-center justify-center text-xl shrink-0">
                           🩸
                         </div>
                         <div className="flex-1">
                            <h4 className="font-black text-slate-800 dark:text-slate-100">{bank.name}</h4>
                            <p className="text-xs text-slate-500 font-medium mt-1">✉️ {bank.email}</p>
                            <p className="text-xs text-slate-500 font-medium mt-1">📞 {bank.phone}</p>
                         </div>
                         <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                               onClick={() => handleAction(bank.isBlocked ? 'unblock' : 'block', bank._id)}
                               className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded ${bank.isBlocked ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-500'}`}
                             >
                               {bank.isBlocked ? 'Blocked' : 'Block'}
                             </button>
                             <button 
                               onClick={() => handleAction('delete', bank._id)}
                               className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded bg-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                             >
                               Del
                             </button>
                         </div>
                      </div>
                   ))}
                </div>
              )}
           </div>
         )}
       </div>
    </div>
  )
}
