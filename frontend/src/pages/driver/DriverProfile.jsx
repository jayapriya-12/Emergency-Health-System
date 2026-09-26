import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Truck, ShieldCheck, Phone, Mail, FileText } from 'lucide-react';

const DriverProfile = () => {
  const { user } = useAuth();
  const driver = user?.driver;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <User className="w-6 h-6 text-emerald-400" />
          Driver & Paramedic Profile
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Registered paramedic driver credentials and vehicle assignment details.
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-2xl">
            👨‍✈️
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <div className="text-xs text-emerald-400 font-semibold uppercase">{user?.role}</div>
            <div className="text-xs text-slate-400 mt-0.5">{user?.email} • {user?.phone}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="text-slate-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Commercial Driving License</span>
            </div>
            <div className="font-extrabold text-white text-base font-mono">{driver?.licenseNumber || 'DL-2024-9988'}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Paramedic Experience</span>
            </div>
            <div className="font-extrabold text-white text-base">{driver?.experienceYears || 5} Years Certified</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 sm:col-span-2">
            <div className="text-slate-400 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>Assigned Ambulance Vehicle</span>
            </div>
            <div className="font-extrabold text-white text-base">
              {driver?.ambulance ? `${driver.ambulance.vehicleNumber} (${driver.ambulance.vehicleModel} - ${driver.ambulance.type})` : 'Unassigned'}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DriverProfile;
