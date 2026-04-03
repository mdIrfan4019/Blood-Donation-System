import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiNode from "../../services/apiNode";

export default function Certificate() {
  const { donationId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const res = await apiNode.get(`/donor/certificate/${donationId}`);
        setData(res.data);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load certificate");
      } finally {
        setLoading(false);
      }
    };
    fetchCert();
  }, [donationId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="glass-card p-8 rounded-3xl text-center">
        <p className="text-red-500 font-bold mb-4">⚠️ {error}</p>
        <button onClick={() => navigate("/donor")} className="btn-primary">Back to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 shadow-2xl rounded-none border-[16px] border-double border-red-600 p-12 mt-10 relative overflow-hidden">
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <span className="text-[200px] font-black rotate-[-30deg]">SAVIOR</span>
        </div>

        {/* Certificate Header */}
        <div className="text-center relative z-10">
          <div className="text-red-600 text-6xl mb-4">🩸</div>
          <h1 className="text-5xl font-serif font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-2">Certificate of Appreciation</h1>
          <p className="text-xl font-medium text-slate-500 italic">This award is proudly presented to</p>
        </div>

        {/* Recipient Name */}
        <div className="text-center mt-12 mb-8 relative z-10">
           <h2 className="text-6xl font-serif font-bold premium-gradient-text border-b-4 border-slate-200 dark:border-slate-800 inline-block px-12 py-2">
             {data?.donorName}
           </h2>
        </div>

        {/* Achievement Text */}
        <div className="text-center max-w-2xl mx-auto space-y-4 relative z-10">
          <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed uppercase tracking-wide">
            In recognition of your selfless act of humanity. By donating <strong>{data?.units} Units</strong> of 
            <span className="text-red-600 font-bold mx-1">({data?.bloodGroup})</span> blood on <strong>{new Date(data?.donationDate).toLocaleDateString()}</strong>, 
            you have contributed to saving precious lives.
          </p>
        </div>

        {/* Footer info */}
        <div className="mt-20 flex justify-between items-end border-t border-slate-100 dark:border-slate-800 pt-8 relative z-10">
          <div className="text-left">
            <p className="text-xs font-bold text-slate-400 uppercase mb-4">Verification ID</p>
            <p className="text-sm font-mono text-slate-500">{donationId?.toUpperCase()}</p>
          </div>

          <div className="text-center">
             <div className="w-32 h-1 bg-slate-800 dark:bg-slate-200 mb-2 mx-auto"></div>
             <p className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase">System Administrator</p>
             <p className="text-xs text-slate-500">AI Blood Management System</p>
          </div>

          <div className="text-right">
             <p className="text-6xl text-red-600/20 font-black">SAVE LIVES</p>
          </div>
        </div>
      </div>

      <button 
        onClick={() => window.print()}
        className="mt-10 btn-primary flex items-center gap-2"
      >
        🖨️ Print Certificate
      </button>
    </div>
  );
}
