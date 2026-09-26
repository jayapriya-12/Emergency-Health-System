import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Ambulance, Truck, CheckCircle2, UserCheck } from 'lucide-react';

const AmbulanceManagement = () => {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAmbulances = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getAmbulances();
        setAmbulances(res.data);
      } catch (err) {
        console.error('Failed to fetch ambulances', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAmbulances();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Ambulance className="w-6 h-6 text-emerald-400" />
          System Ambulance Fleet Oversight
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Registered emergency vehicle units across hospitals and independent paramedics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ambulances.map((amb) => (
          <div key={amb.id} className="glass-card p-6 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-white text-base">{amb.vehicleNumber}</h3>
                <p className="text-xs text-slate-400">{amb.vehicleModel}</p>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                amb.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                amb.status === 'ON_TRIP' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-slate-800 text-slate-400'
              }`}>
                {amb.status}
              </span>
            </div>

            <div className="text-xs text-slate-300 space-y-1 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div><span className="text-slate-500">Unit Type:</span> <strong className="text-emerald-400">{amb.type}</strong></div>
              <div><span className="text-slate-500">Hospital Affiliation:</span> <strong className="text-blue-400">{amb.hospital?.name || 'Independent Unit'}</strong></div>
              <div><span className="text-slate-500">Driver Lead:</span> <strong className="text-white">{amb.driver?.user?.name || 'Unassigned'}</strong></div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AmbulanceManagement;
