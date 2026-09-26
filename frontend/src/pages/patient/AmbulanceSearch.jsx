import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { patientAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Ambulance, MapPin, Clock, Phone, ShieldAlert, Truck, UserCheck, Activity } from 'lucide-react';
import MapView from '../../components/MapView';

const AmbulanceSearch = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  const patient = user?.patient;
  const userLocation = {
    latitude: patient?.latitude || 13.0604,
    longitude: patient?.longitude || 80.2496,
  };

  useEffect(() => {
    const fetchAmbulances = async () => {
      try {
        setLoading(true);
        const res = await patientAPI.getAvailableAmbulances({
          lat: userLocation.latitude,
          lng: userLocation.longitude,
        });
        setAmbulances(res.data);
      } catch (err) {
        console.error('Error fetching available ambulances', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAmbulances();
  }, []);

  const filteredAmbulances = ambulances.filter(amb => {
    if (filterType === 'ALL') return true;
    return amb.type === filterType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <Ambulance className="w-7 h-7 text-emerald-400" />
            Find Available Ambulances
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time ambulance fleet availability and GPS distance calculations.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          {['ALL', 'ALS', 'BLS', 'ICU_MOBILE'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === type ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {type === 'ICU_MOBILE' ? 'Mobile ICU' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Map View */}
      <MapView
        userLocation={userLocation}
        ambulances={filteredAmbulances}
        height="320px"
        onSelectAmbulance={(amb) => navigate(`/patient/sos?ambulanceId=${amb.id}`)}
      />

      {/* Ambulances Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAmbulances.map((amb) => (
          <div
            key={amb.id}
            className="glass-card p-6 rounded-3xl border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-extrabold text-white text-base">{amb.vehicleNumber}</h3>
                  <div className="text-xs text-slate-400">{amb.vehicleModel}</div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-xs shrink-0 border border-emerald-500/30">
                  {amb.type}
                </span>
              </div>

              {amb.hospital && (
                <div className="text-xs text-slate-300 flex items-center gap-1.5 mb-2">
                  <span className="text-slate-500">Affiliated Hospital:</span>
                  <span className="font-bold text-white truncate">{amb.hospital.name}</span>
                </div>
              )}

              {amb.driver && (
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Driver: <strong className="text-white">{amb.driver.user?.name}</strong></span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    License: {amb.driver.licenseNumber} ({amb.driver.experienceYears} Years Exp)
                  </div>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800">
                <span className="text-slate-400">Estimated Dispatch Time:</span>
                <span className="font-bold text-amber-400">~{amb.etaMinutes} Mins ({amb.distanceKm} km)</span>
              </div>
            </div>

            <Link
              to={`/patient/sos?ambulanceId=${amb.id}`}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg text-center block transition-all pulse-emergency"
            >
              Dispatch This Unit Now
            </Link>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AmbulanceSearch;
