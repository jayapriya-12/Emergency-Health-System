import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Hospital, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

const HospitalManagement = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getHospitals();
      setHospitals(res.data);
    } catch (err) {
      console.error('Failed to fetch hospitals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleToggleVerify = async (id) => {
    try {
      await adminAPI.toggleHospitalVerification(id);
      fetchHospitals();
    } catch (err) {
      console.error('Failed to toggle verification', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Hospital className="w-6 h-6 text-blue-500" />
          Hospital & Trauma Center Verification
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Verify and audit hospitals participating in the emergency assistance network.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hospitals.map((hosp) => (
          <div key={hosp.id} className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-white text-base">{hosp.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{hosp.address}</p>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                hosp.isVerified ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}>
                {hosp.isVerified ? 'Verified' : 'Pending'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center text-xs">
              <div><span className="text-slate-500 block text-[10px]">Total Beds</span><strong className="text-white">{hosp.totalBeds}</strong></div>
              <div><span className="text-slate-500 block text-[10px]">ICU Beds</span><strong className="text-purple-400">{hosp.totalICUBeds}</strong></div>
              <div><span className="text-slate-500 block text-[10px]">Ventilators</span><strong className="text-amber-400">{hosp.totalVentilators}</strong></div>
            </div>

            <button
              onClick={() => handleToggleVerify(hosp.id)}
              className={`w-full py-2 bg-slate-800 hover:bg-slate-700 font-bold text-xs rounded-xl border border-slate-700 transition-colors ${
                hosp.isVerified ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {hosp.isVerified ? 'Revoke Verification' : 'Approve & Verify Hospital'}
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default HospitalManagement;
