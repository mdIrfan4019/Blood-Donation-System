import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-950/30 backdrop-blur-3xl pt-20 pb-10 px-8 lg:px-12">
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
        {/* Brand Column */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
             <span className="text-2xl">🩸</span>
             <span className="font-black text-rose-600 dark:text-rose-500 text-2xl tracking-tight">Drop4Life</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8 max-w-sm">
            Empowering humanity through an AI-architected decentralized blood network. We connect caring donors to hospitals in real-time to completely eliminate blood shortages.
          </p>
          <div className="flex gap-4">
            <SocialLink href="#" icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>} />
            <SocialLink href="#" icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>} />
            <SocialLink href="#" icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>} />
          </div>
        </div>

        {/* Platform Column */}
        <div>
          <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-[11px] mb-6">Platform</h4>
          <ul className="space-y-4">
             <FooterLink href="/#features">Features Engine</FooterLink>
             <FooterLink href="/#how">How It Works</FooterLink>
             <FooterLink href="/#testimonials">Human Stories</FooterLink>
             <FooterLink href="/login">Dashboard Login</FooterLink>
          </ul>
        </div>

        {/* Organization Column */}
        <div>
          <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-[11px] mb-6">Organization</h4>
          <ul className="space-y-4">
             <FooterLink href="#">About AI Healthcare</FooterLink>
             <FooterLink href="#">Careers & Research</FooterLink>
             <FooterLink href="#">Hospital Partners</FooterLink>
             <FooterLink href="#">Press & Media</FooterLink>
          </ul>
        </div>

        {/* Legal Column */}
        <div>
          <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-[11px] mb-6">Legal & Security</h4>
          <ul className="space-y-4">
             <FooterLink href="#">Privacy Policy</FooterLink>
             <FooterLink href="#">Terms of Service</FooterLink>
             <FooterLink href="#">HIPAA Compliance</FooterLink>
             <FooterLink href="#">Security Disclosure</FooterLink>
          </ul>
        </div>
      </div>

      <div className="w-full pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-slate-400 dark:text-slate-500 font-medium text-xs">
          © {new Date().getFullYear()} Drop4Life Network. All rights reserved safely in the cloud.
        </p>
        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[10px]">
          <span>Status:</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-emerald-600 dark:text-emerald-400">All Systems Operational</span>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }) {
    if (href.startsWith('/#')) {
        return (
            <li>
                <a href={href} className="text-slate-500 dark:text-slate-400 font-medium text-sm hover:text-rose-500 transition-colors">
                    {children}
                </a>
            </li>
        );
    }
    return (
        <li>
            <Link to={href} className="text-slate-500 dark:text-slate-400 font-medium text-sm hover:text-rose-500 transition-colors">
                {children}
            </Link>
        </li>
    );
}

function SocialLink({ href, icon }) {
    return (
        <a href={href} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all">
            {icon}
        </a>
    );
}
