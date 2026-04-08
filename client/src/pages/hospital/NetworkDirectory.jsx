import { useState } from "react";
import { useLocation } from "react-router-dom";
import StaffManagement from "./StaffManagement";
import PatientRegistration from "./PatientRegistration";

export default function NetworkDirectory() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    location.pathname.includes("patients") ? "patients" : "staff"
  );

  const tabs = [
    { id: "staff", label: "Internal Staff", icon: "👨‍⚕️" },
    { id: "patients", label: "Patient Records", icon: "📋" }
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

       </div>
    </div>
  )
}
