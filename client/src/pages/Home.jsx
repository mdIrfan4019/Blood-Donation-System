import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../services/apiNode";

export default function Home() {
  const { role } = useSelector((s) => s.auth);
  const [donors, setDonors] = useState(0);
  const [hospitals, setHospitals] = useState(0);
  const [requests, setRequests] = useState(0);
  const [inventory, setInventory] = useState(0);

  const [stories, setStories] = useState([]);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeManualTab, setActiveManualTab] = useState("donor");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [storyForm, setStoryForm] = useState({ name: "", role: "Verified User", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await api.get("/stories");
        if (res.data && res.data.length > 0) {
          setStories(res.data);
        } else {
          setStories(defaultStories);
        }
      } catch (err) {
        setStories(defaultStories);
      }
    };
    fetchStories();
  }, []);

  const defaultStories = [
    {
      name: "City Hospital, Delhi",
      text: "Drop4Life helped us fulfill urgent requests 3x faster. The forecasting feature is an absolute lifesaver!",
      role: "Medical Administrator"
    },
    {
      name: "Rahul Verma",
      text: "I donated blood effortlessly and got a beautiful notification when my blood was used to save someone. Best experience ever.",
      role: "Verified Donor"
    },
    {
      name: "Neha Sharma",
      text: "This platform mapped compatible donors to my father's surgery in minutes. Drop4Life truly cares about humanity.",
      role: "Recipient Family"
    },
  ];

  const currentStories = stories.length > 0 ? stories : defaultStories;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % currentStories.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentStories.length]);

  const handleStorySubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await api.post("/stories", storyForm);
      setStories([res.data, ...stories]);
      setIsModalOpen(false);
      setStoryForm({ name: "", role: "Verified User", text: "" });
      setActiveTestimonial(0);
      alert("Your story has been safely shared with the community! ❤️");
    } catch (err) {
       alert("Could not post story. Please try again.");
    } finally {
       setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchAndAnimateStats = async () => {
      let targets = { donors: 4820, hospitals: 314, requests: 1205, inventory: 8430 };
      
      try {
        const res = await api.get("/public/stats");
        if (res.data) {
          targets = {
             donors: res.data.donors || 0,
             hospitals: res.data.hospitals || 0,
             requests: res.data.requests || 0,
             inventory: res.data.inventory || 0
          };
        }
      } catch (err) {
        console.warn("Could not fetch live stats, using fallbacks");
      }

      const animate = (setter, target) => {
        if (target === 0) {
           setter(0);
           return;
        }
        let start = 0;
        const step = Math.max(1, Math.ceil(target / 60));
        const timer = setInterval(() => {
          start += step;
          if (start >= target) {
            setter(target);
            clearInterval(timer);
          } else {
            setter(start);
          }
        }, 30);
      };

      animate(setDonors, targets.donors);
      animate(setHospitals, targets.hospitals);
      animate(setRequests, targets.requests);
      animate(setInventory, targets.inventory);
    };
    
    fetchAndAnimateStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-outfit relative overflow-hidden text-slate-800 dark:text-slate-200">
      
      {/* Decorative Ambient Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-rose-400/20 dark:bg-rose-900/20 blur-[120px] animate-pulse"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[50%] rounded-full bg-orange-400/20 dark:bg-orange-900/20 blur-[120px] mix-blend-multiply dark:mix-blend-lighten animate-pulse delay-1000"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-red-400/10 dark:bg-red-900/20 blur-[100px] animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}

        {/* Hero Section */}
        <section className="px-6 lg:px-12 pt-16 pb-24 flex flex-col lg:flex-row items-center justify-between gap-16 max-w-7xl mx-auto min-h-[80vh]">
          {/* Left Hero */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-sm mb-6">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Live AI System Tracking</span>
            </div>
            
            <h2 className="text-5xl lg:text-7xl font-black leading-[1.1] text-slate-900 dark:text-white tracking-tight">
              Humanity's <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-red-500 to-orange-500">
                Blood Network
              </span>
            </h2>

            <p className="mt-8 text-slate-500 dark:text-slate-400 text-lg lg:text-xl font-medium leading-relaxed max-w-xl">
              We connect caring donors with patients in urgent need. Powered by profound AI matching logic and warm human compassion to eliminate blood shortages forever.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-5 w-full justify-center lg:justify-start">
              <Link to="/register" className="bg-gradient-to-r from-rose-500 to-red-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-rose-500/20 hover:shadow-2xl hover:shadow-rose-500/40 hover:-translate-y-1 transition-all text-center flex items-center justify-center gap-3">
                <span className="text-xl">❤️</span> Become a Donor
              </Link>
              <Link to="/login" className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-white dark:hover:bg-slate-900 hover:-translate-y-1 transition-all text-center">
                Access Platform
              </Link>
            </div>
            
            <div className="mt-10 flex items-center gap-4 border-t border-slate-200 dark:border-slate-800 pt-6">
                <div className="flex -space-x-4">
                   <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white dark:border-slate-950 flex items-center justify-center text-xs">👩🏽</div>
                   <div className="w-10 h-10 rounded-full bg-rose-200 border-2 border-white dark:border-slate-950 flex items-center justify-center text-xs">👨🏻‍🦳</div>
                   <div className="w-10 h-10 rounded-full bg-blue-200 border-2 border-white dark:border-slate-950 flex items-center justify-center text-xs">👦🏾</div>
                   <div className="w-10 h-10 rounded-full bg-orange-200 border-2 border-white dark:border-slate-950 flex items-center justify-center text-xs">🧑🏼‍⚕️</div>
                </div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Trusted by over 12,000+ humans daily.</p>
            </div>
          </div>

          {/* Right Hero Visuals */}
          <div className="w-full lg:w-1/2 relative group">
             {/* Premium Generated Illustration */}
             <div className="relative rounded-[3rem] overflow-hidden shadow-2xl shadow-rose-500/20 border border-white/40 dark:border-slate-700/40 transform transition-transform duration-700 group-hover:scale-[1.02]">
                <img src="/hero-illustration.png" alt="Drop4Life Human Connection" className="w-full h-auto object-cover aspect-square sm:aspect-video lg:aspect-[4/3]"/>
                <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/20 to-transparent mix-blend-overlay"></div>
             </div>
             
             {/* Floating UI Elements */}
             <div className="absolute -bottom-8 -left-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 p-5 rounded-3xl shadow-2xl flex items-center gap-4 animate-bounce hover:scale-105 transition-transform" style={{animationDuration: '3s'}}>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xl shadow-lg">✅</div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</p>
                  <p className="font-bold text-slate-800 dark:text-slate-100">Match Found</p>
                </div>
             </div>
             
             <div className="absolute -top-10 -right-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 p-4 rounded-3xl shadow-xl flex items-center gap-4 animate-bounce float-delay hover:scale-105 transition-transform" style={{animationDuration: '4s'}}>
                 <div className="flex -space-x-2">
                   <div className="w-8 h-8 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold z-20">A+</div>
                   <div className="w-8 h-8 rounded-full bg-red-600 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold z-10">O-</div>
                 </div>
                 <p className="font-black text-slate-800 dark:text-slate-100 text-sm pr-2">Requested</p>
             </div>
          </div>
        </section>

        {/* Global Stats */}
        <section className="px-6 lg:px-12 pb-24 max-w-7xl mx-auto">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/40 dark:border-slate-800 shadow-2xl shadow-rose-500/5 rounded-[2.5rem] p-10 md:p-14 grid grid-cols-2 lg:grid-cols-4 gap-10 text-center relative overflow-hidden">
             
             {/* Inner Stat Glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[200%] bg-gradient-to-r from-transparent via-white/50 dark:via-slate-800/20 to-transparent -rotate-45 block"></div>
             
             <StatCard title="Active Donors" value={donors} color="text-rose-500" />
             <StatCard title="Hospitals Saved" value={hospitals} color="text-emerald-500" />
             <StatCard title="Emergency Requests" value={requests} color="text-orange-500" />
             <StatCard title="Inventory Units" value={inventory} color="text-blue-500" />
          </div>
        </section>



        {/* Features Platform */}
        <section id="features" className="px-6 lg:px-12 pb-32 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
             <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
               Built for <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-orange-500">Humanity.</span>
             </h3>
             <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium text-lg">Sophisticated medical mechanics folded closely underneath a warm, beautiful, human-first ecosystem.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard title="Eligibility Engine" desc="AI instantly screens your health history safely and privately before you even arrive." icon="🛡️" color="from-emerald-400 to-emerald-600" />
            <FeatureCard title="Live Tracking" desc="We watch the global inventory network pulse in real-time, detecting shortages immediately." icon="📡" color="from-blue-400 to-blue-600" />
            <FeatureCard title="Smart Matching" desc="When disaster strikes, our algorithm physically pages the exact compatible blood types nearby." icon="🧬" color="from-rose-400 to-rose-600" />
            <FeatureCard title="Predictive Needs" desc="Hospitals can look weeks into the future and prepare their banks using our demand forecasts." icon="🔮" color="from-orange-400 to-orange-600" />
          </div>
        </section>

        {/* Knowledge Hub Section */}
        <section id="docs" className="px-6 lg:px-12 pb-32 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-500 text-2xl mb-6 shadow-inner">
               📚
             </div>
             <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
               Blood <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-red-600">Knowledge Hub</span>
             </h3>
             <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium text-lg">
               Education acts as the finest medicine. Discover medical rules, compatibility charts, and international guidelines from trusted medical sources.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <DocCard 
               title="Compatibility Matrix" 
               desc="Understand exactly who can receive your blood type and who you can safely accept from." 
               icon="🧬" 
               color="from-rose-500 to-red-600" 
               link="https://www.redcrossblood.org/donate-blood/blood-types.html"
             />
             <DocCard 
               title="Donor Eligibility" 
               desc="Check age, weight, and hemoglobin health rules to ensure safe donation conditions." 
               icon="🛡️" 
               color="from-blue-500 to-blue-700" 
               link="https://www.redcrossblood.org/donate-blood/how-to-donate/eligibility-requirements.html"
             />
             <DocCard 
               title="WHO Safety Standards" 
               desc="Examine the World Health Organization directives for handling medical transfusions." 
               icon="🌍" 
               color="from-emerald-500 to-emerald-700" 
               link="https://www.who.int/health-topics/blood-products"
             />
             <DocCard 
               title="The Donation Journey" 
               desc="Step-by-step transparency on the physical processing, testing, and delivery of your donation." 
               icon="⏱️" 
               color="from-orange-500 to-orange-700" 
               link="https://www.nhs.uk/conditions/blood-donation/"
             />
          </div>
        </section>

        {/* Stories Section */}
        <section id="testimonials" className="px-6 lg:px-12 pb-32 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-rose-600 via-red-600 to-orange-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-rose-600/30">
            {/* Soft Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            <h3 className="text-3xl font-black text-white/90 uppercase tracking-widest text-[11px] mb-8 relative z-10">
              Real Human Stories
            </h3>

            <div className="max-w-4xl mx-auto relative z-10">
              <p className="text-2xl md:text-4xl font-medium text-white leading-tight tracking-wide min-h-[120px]">
                "{currentStories[activeTestimonial]?.text}"
              </p>

              <div className="mt-12 flex flex-col items-center gap-3">
                 <h4 className="text-white font-black text-xl">
                   {currentStories[activeTestimonial]?.name}
                 </h4>
                 <p className="text-rose-200 font-bold uppercase tracking-widest text-[10px] bg-white/10 px-4 py-1.5 rounded-full inline-block">
                   {currentStories[activeTestimonial]?.role}
                 </p>
              </div>

              <div className="flex justify-center items-center gap-6 mt-12">
                <div className="flex gap-2">
                  {currentStories.map((_, idx) => (
                    <button key={idx} onClick={() => setActiveTestimonial(idx)} className={`transition-all duration-300 rounded-full ${idx === activeTestimonial ? "w-10 h-2 bg-white" : "w-2 h-2 bg-white/30 hover:bg-white/50"}`}></button>
                  ))}
                </div>
                
                {/* Share Button Divider */}
                <div className="w-px h-6 bg-white/20"></div>

                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-white text-xs font-bold uppercase tracking-widest transition-all">
                  <span>✍️</span> Share Your Story
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Story Modal Wrapper */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             {/* Backdrop */}
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
             
             {/* Modal Content */}
             <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-800">
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                       <span className="text-rose-500">❤️</span> Your Story
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors">✕</button>
                  </div>
                  
                  <form onSubmit={handleStorySubmit} className="flex flex-col gap-5">
                     <div>
                       <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-2 mb-1 block">Your Real Name</label>
                       <input required type="text" value={storyForm.name} onChange={e => setStoryForm({...storyForm, name: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-none text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-rose-500" placeholder="John Doe" />
                     </div>
                     <div>
                       <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-2 mb-1 block">Your Role in the Network</label>
                       <select value={storyForm.role} onChange={e => setStoryForm({...storyForm, role: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-none text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-rose-500">
                          <option value="Verified Donor">Verified Donor</option>
                          <option value="Recipient Family">Recipient Family</option>
                          <option value="Hospital Staff">Hospital Staff</option>
                          <option value="Verified User">Verified User</option>
                       </select>
                     </div>
                     <div>
                       <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-2 mb-1 block">Your Experience</label>
                       <textarea required maxLength="500" rows="4" value={storyForm.text} onChange={e => setStoryForm({...storyForm, text: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-none text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-rose-500 resize-none custom-scrollbar" placeholder="How did this platform help you save or find a life?"></textarea>
                     </div>
                     <button type="submit" disabled={isSubmitting} className="w-full mt-2 bg-gradient-to-r from-rose-500 to-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-rose-500/20 hover:shadow- rose-500/40 hover:-translate-y-1 transition-all">
                       {isSubmitting ? "Sharing..." : "Publish to World"}
                     </button>
                  </form>
                </div>
             </div>
          </div>
        )}


      </div>
    </div>
  );
}

/* =======================
   COMPONENTS
======================= */

function StatCard({ title, value, color }) {
  return (
    <div className="relative group">
      <h4 className={`text-5xl lg:text-6xl font-black tracking-tighter ${color} mb-2`}>
        {value.toLocaleString()}<span className="text-4xl opacity-50">+</span>
      </h4>
      <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[11px]">{title}</p>
    </div>
  );
}

function FeatureCard({ title, desc, icon, color }) {
  return (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-3xl p-8 hover:-translate-y-2 hover:shadow-2xl hover:bg-white dark:hover:bg-slate-800 transition-all duration-500 group">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-2xl shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500`}>
         {icon}
      </div>
      <h4 className="text-xl font-black text-slate-900 dark:text-white mb-3">{title}</h4>
      <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

function DocCard({ title, desc, icon, color, link }) {
  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className="block bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-3xl p-8 hover:-translate-y-2 hover:shadow-2xl hover:bg-white dark:hover:bg-slate-800 transition-all duration-500 group relative overflow-hidden">
      {/* Subtle Color Overlay on Hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
      
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-xl shadow-lg mb-5 group-hover:scale-110 transition-transform duration-500`}>
         {icon}
      </div>
      <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">{title}</h4>
      <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed mb-6">{desc}</p>
      
      <div className="absolute bottom-6 right-6 text-slate-300 dark:text-slate-600 group-hover:text-rose-500 transition-colors">
         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
      </div>
    </a>
  );
}

function ManualStep({ number, title, desc, color }) {
  return (
    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group border border-transparent hover:border-slate-200 dark:hover:border-slate-800 p-4 rounded-3xl transition-colors">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10 
      bg-white dark:bg-slate-900 border-4 border-slate-50 dark:border-slate-950">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${color} group-hover:scale-110 transition-transform`}>
          {number}
        </div>
      </div>
      
      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-white/50 dark:border-slate-700/50 shadow-sm group-hover:shadow-xl transition-shadow">
        <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">{title}</h4>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
