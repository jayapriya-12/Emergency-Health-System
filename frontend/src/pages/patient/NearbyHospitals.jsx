import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { patientAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Hospital, 
  MapPin, 
  Phone, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  ShieldCheck,
  Activity,
  BedDouble
} from 'lucide-react';
import MapView from '../../components/MapView';

const NearbyHospitals = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterICUOnly, setFilterICUOnly] = useState(false);
  const [filterOxygenOnly, setFilterOxygenOnly] = useState(false);
  const [showMap, setShowMap] = useState(true);

  const patient = user?.patient;
  const userLocation = {
    latitude: patient?.latitude || 13.0604,
    longitude: patient?.longitude || 80.2496,
  };

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true);
        const res = await patientAPI.getNearbyHospitals({
          lat: userLocation.latitude,
          lng: userLocation.longitude,
        });
        setHospitals(res.data);
      } catch (err) {
        console.error('Error fetching hospitals', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  const filteredHospitals = hospitals.filter((h) => {
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          h.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesICU = filterICUOnly ? h.availableICUBeds > 0 : true;
    const matchesOxygen = filterOxygenOnly ? h.oxygenAvailable : true;
    return matchesSearch && matchesICU && matchesOxygen;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <Hospital className="w-7 h-7 text-blue-500" />
            Nearby Hospitals & Trauma Centers
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time ICU, general bed, and emergency facility availability updated dynamically.
          </p>
        </div>

        <button
          onClick={() => setShowMap(!showMap)}
          className="px-4 py-2 bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 font-semibold text-xs rounded-xl self-start md:self-auto"
        >
          {showMap ? 'Hide Radar Map' : 'Show Radar Map'}
        </button>
      </div>

      {/* Map Section */}
      {showMap && (
        <MapView
          userLocation={userLocation}
          hospitals={filteredHospitals}
          height="350px"
          onSelectHospital={(h) => navigate(`/patient/hospitals/${h.id}`)}
        />
      )}

      {/* Search & Filters */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search hospital name or locality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <label className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={filterICUOnly}
              onChange={(e) => setFilterICUOnly(e.target.checked)}
              className="accent-red-500 rounded"
            />
            <span>ICU Beds Available Only</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={filterOxygenOnly}
              onChange={(e) => setFilterOxygenOnly(e.target.checked)}
              className="accent-blue-500 rounded"
            />
            <span>Oxygen Available</span>
          </label>
        </div>

      </div>

      {/* Hospital Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHospitals.map((hosp) => (
          <div
            key={hosp.id}
            className="glass-card p-6 rounded-3xl border border-slate-800 hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-bold text-white text-base leading-snug">{hosp.name}</h3>
                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="truncate">{hosp.address}</span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 font-extrabold text-xs shrink-0 border border-blue-500/30">
                  {hosp.distanceKm} km
                </span>
              </div>

              {/* Status Pills */}
              <div className="flex flex-wrap gap-2 my-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  hosp.emergencyDeptStatus === 'OPEN' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  ER: {hosp.emergencyDeptStatus}
                </span>

                {hosp.oxygenAvailable && (
                  <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 text-[10px] font-bold border border-sky-500/30">
                    O2 Available
                  </span>
                )}
              </div>

              {/* Bed Metrics */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Available Beds</div>
                  <div className="text-base font-extrabold text-emerald-400">{hosp.availableBeds} <span className="text-xs text-slate-500">/ {hosp.totalBeds}</span></div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">ICU Beds</div>
                  <div className="text-base font-extrabold text-purple-400">{hosp.availableICUBeds} <span className="text-xs text-slate-500">/ {hosp.totalICUBeds}</span></div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Ventilators</div>
                  <div className="text-base font-extrabold text-amber-400">{hosp.availableVentilators} <span className="text-xs text-slate-500">/ {hosp.totalVentilators}</span></div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <Link
                to={`/patient/hospitals/${hosp.id}`}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow text-center transition-colors"
              >
                View Full Hospital Details
              </Link>
              <Link
                to={`/patient/sos?hospitalId=${hosp.id}`}
                className="py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow text-center transition-colors shrink-0"
              >
                SOS Dispatch
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default NearbyHospitals;
