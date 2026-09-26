import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { patientAPI } from '../../services/api';
import { 
  Hospital, 
  MapPin, 
  PhoneCall, 
  ShieldAlert, 
  CheckCircle2, 
  BedDouble, 
  Activity, 
  Wind, 
  Flame, 
  ArrowLeft 
} from 'lucide-react';
import MapView from '../../components/MapView';

const HospitalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await patientAPI.getHospitalById(id);
        setHospital(res.data);
      } catch (err) {
        console.error('Failed to fetch hospital details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading hospital profile...
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        Hospital record not found.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Hospital List
      </button>

      {/* Hospital Hero Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase">
              <Hospital className="w-3.5 h-3.5" /> Verified Emergency Trauma Hospital
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{hospital.name}</h1>
            
            <p className="text-xs text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-red-500 shrink-0" />
              {hospital.address}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`tel:${hospital.emergencyPhone || hospital.phone}`}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-700"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              Call Emergency Line ({hospital.emergencyPhone || hospital.phone || '108'})
            </a>

            <Link
              to={`/patient/sos?hospitalId=${hospital.id}`}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg pulse-emergency flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              Dispatch SOS To This Hospital
            </Link>
          </div>
        </div>

        {/* Realtime Resource Availability Counter Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>General Beds</span>
              <BedDouble className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">
              {hospital.availableBeds} <span className="text-xs font-semibold text-slate-500">/ {hospital.totalBeds} Available</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>ICU Emergency Beds</span>
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-400">
              {hospital.availableICUBeds} <span className="text-xs font-semibold text-slate-500">/ {hospital.totalICUBeds} Available</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Ventilators</span>
              <Wind className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">
              {hospital.availableVentilators} <span className="text-xs font-semibold text-slate-500">/ {hospital.totalVentilators} Available</span>
            </div>
          </div>

        </div>

      </div>

      {/* Facilities & Map Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Facilities List */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Trauma Facilities & Medical Units
          </h2>

          <div className="space-y-3">
            {hospital.facilities && hospital.facilities.length > 0 ? (
              hospital.facilities.map((fac) => (
                <div key={fac.id} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="font-bold text-white text-xs flex items-center justify-between">
                    <span>{fac.facilityName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">Active</span>
                  </div>
                  {fac.description && (
                    <p className="text-[11px] text-slate-400">{fac.description}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">Standard 24/7 Emergency Medical Response & ICU Services active.</p>
            )}
          </div>
        </div>

        {/* Hospital Map Position */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            Hospital Location Map
          </h2>
          <MapView
            hospitals={[hospital]}
            center={[hospital.latitude, hospital.longitude]}
            zoom={14}
            height="320px"
          />
        </div>

      </div>

    </div>
  );
};

export default HospitalDetails;
