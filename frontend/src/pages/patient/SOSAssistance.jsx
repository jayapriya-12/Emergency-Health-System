import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { patientAPI } from '../../services/api';
import { 
  ShieldAlert, 
  MapPin, 
  Hospital, 
  Ambulance, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  Radio, 
  Navigation,
  Heart,
  Car,
  Wind,
  Brain,
  Baby,
  Activity
} from 'lucide-react';
import MapView from '../../components/MapView';

const SOSAssistance = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const preselectedAmbulanceId = searchParams.get('ambulanceId') || '';
  const preselectedHospitalId = searchParams.get('hospitalId') || '';

  const patient = user?.patient;

  const [emergencyType, setEmergencyType] = useState('CARDIAC');
  const [severity, setSeverity] = useState('CRITICAL');
  const [pickupAddress, setPickupAddress] = useState(patient?.address || '124 Anna Salai, Thousand Lights, Chennai');
  const [latitude, setLatitude] = useState(patient?.latitude || 13.0604);
  const [longitude, setLongitude] = useState(patient?.longitude || 80.2496);
  const [hospitalId, setHospitalId] = useState(preselectedHospitalId);
  const [ambulanceId, setAmbulanceId] = useState(preselectedAmbulanceId);
  const [notes, setNotes] = useState('');

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await patientAPI.getNearbyHospitals({ lat: latitude, lng: longitude });
        setHospitals(res.data);
      } catch (err) {
        console.error('Failed to fetch hospitals', err);
      }
    };
    fetchHospitals();
  }, [latitude, longitude]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setPickupAddress(`GPS Position: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setError('Location access denied. Using default coordinates.');
      }
    );
  };

  const handleDispatchSOS = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await patientAPI.createSOSRequest({
        emergencyType,
        severity,
        pickupLatitude: latitude,
        pickupLongitude: longitude,
        pickupAddress,
        hospitalId: hospitalId || null,
        ambulanceId: ambulanceId || null,
        notes,
      });

      navigate('/patient/tracking');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to dispatch SOS request');
    } finally {
      setLoading(false);
    }
  };

  const emergencyCategories = [
    { id: 'CARDIAC', name: 'Cardiac / Heart Attack', icon: Heart, color: 'text-red-500 bg-red-500/10' },
    { id: 'ACCIDENT', name: 'Trauma / Road Accident', icon: Car, color: 'text-amber-500 bg-amber-500/10' },
    { id: 'RESPIRATORY', name: 'Breathing / Oxygen Failure', icon: Wind, color: 'text-blue-400 bg-blue-400/10' },
    { id: 'STROKE', name: 'Stroke / Brain Trauma', icon: Brain, color: 'text-purple-400 bg-purple-400/10' },
    { id: 'PREGNANCY', name: 'Maternity / Pregnancy', icon: Baby, color: 'text-pink-400 bg-pink-400/10' },
    { id: 'GENERAL', name: 'General Emergency', icon: Activity, color: 'text-emerald-400 bg-emerald-400/10' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
          Emergency SOS Dispatch Center
        </div>

        <h1 className="text-3xl font-black text-white">Request Immediate Medical Dispatch</h1>
        <p className="text-xs text-slate-400">
          Specify emergency type and confirm GPS location. Nearby available hospitals and ambulance drivers will be alerted instantly via Socket.IO.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleDispatchSOS} className="space-y-8">
        
        {/* Step 1: Category Selection */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-extrabold">1</span>
            Select Emergency Condition
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {emergencyCategories.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = emergencyType === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setEmergencyType(cat.id)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-28 ${
                    isSelected
                      ? 'bg-red-600/20 border-red-500 shadow-lg shadow-red-500/20 text-white'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.color}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-xs line-clamp-1">{cat.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Location Verification */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-extrabold">2</span>
              Confirm Emergency Pickup Location
            </h2>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={locating}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors"
            >
              <Navigation className={`w-3.5 h-3.5 text-red-400 ${locating ? 'animate-spin' : ''}`} />
              {locating ? 'Detecting GPS...' : 'Detect Current GPS'}
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Pickup Address / Landmark</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <MapPin className="w-4 h-4 text-red-500" />
              </div>
              <input
                type="text"
                required
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Map Preview */}
          <MapView
            userLocation={{ latitude, longitude, address: pickupAddress }}
            height="220px"
          />
        </div>

        {/* Step 3: Preferred Hospital & Additional Notes */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-extrabold">3</span>
            Target Hospital & Dispatch Notes
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Hospital (Optional)</label>
              <select
                value={hospitalId}
                onChange={(e) => setHospitalId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
              >
                <option value="">Auto-Assign Nearest Hospital (Recommended)</option>
                {hospitals.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.distanceKm} km - {h.availableBeds} beds available)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Severity Level</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
              >
                <option value="CRITICAL">Critical (Life Threatening)</option>
                <option value="HIGH">High (Immediate Care Required)</option>
                <option value="MEDIUM">Medium (Stable Urgent)</option>
                <option value="LOW">Low (Routine Transport)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Medical Symptoms / Special Instructions</label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe symptoms, patient consciousness, specific medical history..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Big Submit Dispatch Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xl rounded-2xl shadow-2xl shadow-red-600/50 pulse-emergency flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] disabled:opacity-50"
        >
          <Send className="w-6 h-6" />
          {loading ? 'Dispatching Emergency Unit...' : 'CONFIRM & DISPATCH AMBULANCE NOW'}
        </button>

      </form>

    </div>
  );
};

export default SOSAssistance;
