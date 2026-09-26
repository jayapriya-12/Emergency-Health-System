import React from 'react';
import { ShieldAlert, Heart, PhoneCall, Hospital, Ambulance, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900/90 border-t border-slate-800 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: Branding */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">
                RESCOU <span className="text-red-500">24x7</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time emergency healthcare assistance platform connecting Patients, Hospitals, and Ambulance Drivers for rapid emergency response.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Real-Time Socket Tracking Active</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/patient/hospitals" className="hover:text-red-400 transition-colors">Nearby Hospitals</Link></li>
              <li><Link to="/patient/ambulances" className="hover:text-red-400 transition-colors">Find Available Ambulances</Link></li>
              <li><Link to="/patient/sos" className="hover:text-red-400 text-red-400 font-semibold transition-colors">Emergency SOS Dispatch</Link></li>
              <li><Link to="/login" className="hover:text-red-400 transition-colors">Hospital Login Portal</Link></li>
              <li><Link to="/login" className="hover:text-red-400 transition-colors">Ambulance Driver Login</Link></li>
            </ul>
          </div>

          {/* Col 3: Emergency Hotlines */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Emergency Helplines</h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                <span className="font-bold text-red-400">Ambulance Dispatch:</span>
                <span className="font-mono text-white text-sm">108 / 102</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                <span className="font-bold text-amber-400">National Emergency:</span>
                <span className="font-mono text-white text-sm">112</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                <span className="font-bold text-sky-400">Trauma Helpline:</span>
                <span className="font-mono text-white text-sm">1800-111-999</span>
              </div>
            </div>
          </div>

          {/* Col 4: Safety Warning */}
          <div>
            <h4 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3">Safety Disclaimer</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800">
              This digital platform optimizes emergency resource discovery and dispatch tracking. It operates alongside standard municipal emergency infrastructure. In critical, life-threatening scenarios, call 108 or 112 immediately.
            </p>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Smart Emergency Hospital & Ambulance Assistance System. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 mx-1" /> for rapid life-saving response
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
