import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, 
  Activity, 
  Hospital, 
  Ambulance, 
  PhoneCall, 
  Clock, 
  MapPin, 
  HeartPulse, 
  CheckCircle,
  ArrowRight,
  UserCheck,
  Building,
  Truck
} from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
              <Activity className="w-4 h-4 animate-pulse text-red-500" />
              24/7 Smart Emergency Response Network
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
              Rapid Emergency Care <br />
              <span className="bg-gradient-to-r from-red-500 via-rose-400 to-amber-400 bg-clip-text text-transparent">
                When Every Second Counts
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              Connect instantly with nearby emergency hospitals, check live ICU and bed availability, and dispatch GPS-tracked life support ambulances in real-time.
            </p>

            {/* Main Call to Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={user ? "/patient/sos" : "/login"}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-lg rounded-2xl shadow-xl shadow-red-600/40 pulse-emergency flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5"
              >
                <ShieldAlert className="w-6 h-6" />
                PRESS FOR EMERGENCY SOS
              </Link>

              <Link
                to="/patient/hospitals"
                className="w-full sm:w-auto px-6 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-base rounded-2xl flex items-center justify-center gap-2 transition-colors"
              >
                <Hospital className="w-5 h-5 text-blue-400" />
                Find Nearby Hospitals
              </Link>
            </div>

            {/* Quick Emergency Hotline Bar */}
            <div className="pt-6 inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
              <PhoneCall className="w-4 h-4 text-red-500 animate-bounce" />
              <span>Immediate Helpline: <strong className="text-white font-mono text-sm">108</strong> (Ambulance) / <strong className="text-white font-mono text-sm">112</strong> (Emergency)</span>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-16 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Engineered for Rapid Response</h2>
            <p className="text-sm text-slate-400 mt-2">Connecting Patients, Hospitals, and Ambulance Drivers seamlessly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="glass-card p-6 rounded-2xl hover:border-red-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-5 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Live GPS Location Detection</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatically detects patient coordinates to locate nearest available hospitals and calculate exact ETA for emergency dispatches.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-6 rounded-2xl hover:border-blue-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-5 group-hover:scale-110 transition-transform">
                <Hospital className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Real-Time Bed & ICU Availability</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hospitals update available general beds, ICU beds, ventilators, and oxygen status in real-time to prevent critical transport delays.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-6 rounded-2xl hover:border-emerald-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                <Ambulance className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Interactive Live Ambulance Tracking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track assigned ambulance drivers in real-time via Socket.IO live map updates with status checkpoints from pickup to hospital arrival.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Role Demonstration Quick Access */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-white">Multi-Role Portal Access</h2>
            <p className="text-xs text-slate-400 mt-1">Select a portal role to log in or register for demonstration.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Patient Portal */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-red-500/50 transition-all">
              <div>
                <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center mb-4">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Patient Portal</h3>
                <p className="text-xs text-slate-400 mt-1">Request emergency ambulances, view hospital bed availability, and track live trips.</p>
              </div>
              <Link
                to="/login"
                className="mt-6 text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 group"
              >
                Access Patient Portal <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Hospital Portal */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-blue-500/50 transition-all">
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                  <Building className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Hospital Portal</h3>
                <p className="text-xs text-slate-400 mt-1">Manage emergency admissions, update available beds/ICU, and accept requests.</p>
              </div>
              <Link
                to="/login"
                className="mt-6 text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 group"
              >
                Access Hospital Portal <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Ambulance Driver Portal */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-emerald-500/50 transition-all">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Driver Portal</h3>
                <p className="text-xs text-slate-400 mt-1">Set availability status, accept nearby dispatch alerts, and update trip progress.</p>
              </div>
              <Link
                to="/login"
                className="mt-6 text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group"
              >
                Access Driver Portal <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Admin Dashboard */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-purple-500/50 transition-all">
              <div>
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Admin Dashboard</h3>
                <p className="text-xs text-slate-400 mt-1">Monitor total emergency requests, verify hospitals, and manage platform fleet.</p>
              </div>
              <Link
                to="/login"
                className="mt-6 text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 group"
              >
                Access Admin Portal <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
