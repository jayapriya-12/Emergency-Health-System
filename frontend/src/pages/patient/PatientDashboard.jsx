import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { patientAPI } from '../../services/api';
import { 
  ShieldAlert, 
  Hospital, 
  Ambulance, 
  Activity, 
  MapPin, 
  Navigation, 
  Clock, 
  PhoneCall, 
  CheckCircle2, 
  ArrowRight,
  ChevronRight,
  AlertTriangle,
  Flame
} from 'lucide-react';
import MapView from '../../components/MapView';

const PatientDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [activeRequest, setActiveRequest] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);

  const patient = user?.patient;
  const userLocation = {
    latitude: patient?.latitude || 13.0604,
    longitude: patient?.longitude || 80.2496,
    address: patient?.address || 'Chennai Central, Tamil Nadu',
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, hospRes, ambRes] = await Promise.all([
        patientAPI.getActiveRequest(),
        patientAPI.getNearbyHospitals({ lat: userLocation.latitude, lng: userLocation.longitude }),
        patientAPI.getAvailableAmbulances({ lat: userLocation.latitude, lng: userLocation.longitude })
      ]);
      setActiveRequest(reqRes.data);
      setHospitals(hospRes.data.slice(0, 4));
      setAmbulances(ambRes.data.slice(0, 3));
    } catch (err) {
      console.error('Failed to load patient dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Socket listener for emergency status updates
  useEffect(() => {
    if (!socket) return;

    socket.on('emergency_status_changed', (updated) => {
      console.log('⚡ Active request status changed:', updated);
      fetchData();
    });

    socket.on('trip_status_updated', (data) => {
      fetchData();
    });

    return () => {
      socket.off('emergency_status_changed');
      socket.off('trip_status_updated');
    };
  }, [socket]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Welcome & SOS Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-red-950 border border-slate-800 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-red-600/20 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              Patient Emergency Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Live location coordinates registered at <strong className="text-white">{userLocation.address}</strong>. In case of medical emergency, trigger SOS for instant hospital dispatch.
            </p>
          </div>

          {/* Glowing SOS Dispatch Button */}
          <Link
            to="/patient/sos"
            className="px-8 py-5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-lg rounded-2xl shadow-2xl shadow-red-600/50 pulse-emergency flex items-center gap-3 transition-transform hover:scale-105 shrink-0"
          >
            <ShieldAlert className="w-7 h-7" />
            <span>TRIGGER SOS DISPATCH</span>
          </Link>
        </div>
      </div>

      {/* Active Emergency Request Banner (If Active) */}
      {activeRequest && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900 border-2 border-red-500/80 shadow-2xl space-y-4 animate-pulse">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold">
                <Ambulance className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 uppercase">
                    Status: {activeRequest.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-slate-400">{new Date(activeRequest.requestedAt).toLocaleTimeString()}</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  Active Emergency Request: {activeRequest.emergencyType}
                </h3>
              </div>
            </div>

            <Link
              to="/patient/tracking"
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all shrink-0"
            >
              <Navigation className="w-4 h-4" />
              Open Live Ambulance Tracking Map
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-400 block">Assigned Hospital:</span>
              <span className="font-bold text-white">{activeRequest.hospital?.name || 'Searching Nearest Hospital...'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Assigned Ambulance / Driver:</span>
              <span className="font-bold text-white">{activeRequest.driver?.user?.name || 'Dispatching Ambulance...'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Pickup Location:</span>
              <span className="font-bold text-white truncate block">{activeRequest.pickupAddress}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Interactive Map + Hospitals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Interactive Map */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              Emergency Healthcare Radar Map
            </h2>
            <span className="text-xs text-slate-400">Showing nearby hospitals & available units</span>
          </div>

          <MapView
            userLocation={userLocation}
            hospitals={hospitals}
            ambulances={ambulances}
            height="400px"
            onSelectHospital={(hosp) => navigate(`/patient/hospitals/${hosp.id}`)}
          />
        </div>

        {/* Right Column: Nearest Hospitals List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Hospital className="w-5 h-5 text-blue-400" />
              Nearest Hospitals
            </h2>
            <Link to="/patient/hospitals" className="text-xs font-semibold text-red-400 hover:text-red-300">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {hospitals.map((hosp) => (
              <div
                key={hosp.id}
                className="glass-card p-4 rounded-xl hover:border-blue-500/40 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white text-sm line-clamp-1">{hosp.name}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{hosp.address}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs font-bold shrink-0">
                    {hosp.distanceKm} km
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs pt-1 border-t border-slate-800">
                  <div>
                    <span className="text-slate-500">Available Beds: </span>
                    <strong className="text-emerald-400 font-bold">{hosp.availableBeds}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">ICU: </span>
                    <strong className="text-purple-400 font-bold">{hosp.availableICUBeds}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Link
                    to={`/patient/hospitals/${hosp.id}`}
                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded text-center block transition-colors"
                  >
                    Hospital Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Available Ambulances Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Ambulance className="w-5 h-5 text-emerald-400" />
            Available Emergency Ambulances Nearby
          </h2>
          <Link to="/patient/ambulances" className="text-xs font-semibold text-red-400 hover:text-red-300">
            Search Fleet
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ambulances.map((amb) => (
            <div key={amb.id} className="glass-card p-5 rounded-2xl space-y-3 hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    🚑
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{amb.vehicleNumber}</div>
                    <div className="text-[10px] text-slate-400">{amb.type} Life Support</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  {amb.status}
                </span>
              </div>

              <div className="text-xs text-slate-300 flex items-center justify-between pt-2 border-t border-slate-800">
                <span>Estimated Arrival:</span>
                <span className="font-bold text-amber-400">{amb.etaMinutes} mins ({amb.distanceKm} km)</span>
              </div>

              <Link
                to={`/patient/sos?ambulanceId=${amb.id}`}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow text-center block transition-all"
              >
                Dispatch This Ambulance
              </Link>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default PatientDashboard;
