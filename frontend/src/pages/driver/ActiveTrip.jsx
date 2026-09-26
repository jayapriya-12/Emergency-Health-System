import React, { useState, useEffect } from 'react';
import { driverAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { 
  Navigation, 
  PhoneCall, 
  CheckCircle2, 
  MapPin, 
  Hospital, 
  User, 
  Play, 
  Square,
  ShieldCheck,
  Radio
} from 'lucide-react';
import MapView from '../../components/MapView';

const ActiveTrip = () => {
  const { socket } = useSocket();
  const [activeRequest, setActiveRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simLocation, setSimLocation] = useState(null);

  const fetchTrip = async () => {
    try {
      setLoading(true);
      const res = await driverAPI.getDashboard();
      setActiveRequest(res.data?.activeRequest);
      if (res.data?.driver) {
        setSimLocation({
          latitude: res.data.driver.latitude || 13.0604,
          longitude: res.data.driver.longitude || 80.2496,
        });
      }
    } catch (err) {
      console.error('Failed to fetch active trip', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, []);

  // Socket listener for trip updates
  useEffect(() => {
    if (!socket || !activeRequest) return;
    socket.emit('join_room', { requestId: activeRequest.id });
  }, [socket, activeRequest?.id]);

  // Driving Simulation Logic
  useEffect(() => {
    let interval = null;
    if (simulating && activeRequest && simLocation) {
      const targetLat = activeRequest.status.includes('PATIENT_PICKED_UP') || activeRequest.status.includes('EN_ROUTE_TO_HOSPITAL')
        ? (activeRequest.hospital?.latitude || 13.0604)
        : activeRequest.pickupLatitude;

      const targetLng = activeRequest.status.includes('PATIENT_PICKED_UP') || activeRequest.status.includes('EN_ROUTE_TO_HOSPITAL')
        ? (activeRequest.hospital?.longitude || 80.2496)
        : activeRequest.pickupLongitude;

      interval = setInterval(async () => {
        setSimLocation(prev => {
          if (!prev) return prev;
          const latDiff = (targetLat - prev.latitude) * 0.15;
          const lngDiff = (targetLng - prev.longitude) * 0.15;

          const newLat = prev.latitude + latDiff;
          const newLng = prev.longitude + lngDiff;

          // Emit live location via Socket.IO & API
          if (socket && activeRequest.id) {
            socket.emit('update_driver_location', {
              requestId: activeRequest.id,
              latitude: newLat,
              longitude: newLng,
              speed: 45,
            });
          }

          driverAPI.updateLocation({
            latitude: newLat,
            longitude: newLng,
            speed: 45,
            requestId: activeRequest.id,
          }).catch(() => {});

          return { latitude: newLat, longitude: newLng };
        });
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [simulating, activeRequest, simLocation, socket]);

  const handleStepUpdate = async (nextStatus) => {
    if (!activeRequest) return;
    setUpdating(true);
    try {
      await driverAPI.updateTripStatus({
        requestId: activeRequest.id,
        status: nextStatus,
      });

      if (nextStatus === 'COMPLETED') {
        setSimulating(false);
        setActiveRequest(null);
      } else {
        fetchTrip();
      }
    } catch (err) {
      console.error('Failed to update trip status', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">Loading GPS trip cockpit...</div>;
  }

  if (!activeRequest) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
          <Navigation className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">No Active Trip In Progress</h2>
        <p className="text-xs text-slate-400">
          You have no active emergency dispatches assigned. Set your status to AVAILABLE on the driver dashboard.
        </p>
      </div>
    );
  }

  const patientLoc = {
    latitude: activeRequest.pickupLatitude,
    longitude: activeRequest.pickupLongitude,
    address: activeRequest.pickupAddress,
  };

  const routePath = simLocation ? [
    [simLocation.latitude, simLocation.longitude],
    [patientLoc.latitude, patientLoc.longitude],
    ...(activeRequest.hospital ? [[activeRequest.hospital.latitude, activeRequest.hospital.longitude]] : [])
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="glass-card p-6 rounded-3xl border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-extrabold text-xs uppercase border border-amber-500/40 animate-pulse">
              CURRENT TRIP STATUS: {activeRequest.status.replace(/_/g, ' ')}
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> Live Streaming to Patient App
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Emergency Dispatch: {activeRequest.patient?.user?.name} ({activeRequest.emergencyType})
          </h1>
        </div>

        {/* GPS Simulation Controls */}
        <button
          onClick={() => setSimulating(!simulating)}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow flex items-center gap-2 transition-all ${
            simulating ? 'bg-red-600 text-white animate-pulse' : 'bg-emerald-600 text-white'
          }`}
        >
          {simulating ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {simulating ? 'Stop GPS Simulation' : 'Start GPS Driving Simulator'}
        </button>
      </div>

      {/* Workflow Step Control Buttons */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trip Workflow Checkpoints</h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <button
            onClick={() => handleStepUpdate('EN_ROUTE_TO_PATIENT')}
            disabled={updating || activeRequest.status === 'EN_ROUTE_TO_PATIENT'}
            className={`p-3.5 rounded-2xl font-bold text-xs text-left transition-all ${
              activeRequest.status === 'EN_ROUTE_TO_PATIENT'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            1. En-Route to Patient
          </button>

          <button
            onClick={() => handleStepUpdate('PATIENT_PICKED_UP')}
            disabled={updating || activeRequest.status === 'PATIENT_PICKED_UP'}
            className={`p-3.5 rounded-2xl font-bold text-xs text-left transition-all ${
              activeRequest.status === 'PATIENT_PICKED_UP'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            2. Patient Picked Up
          </button>

          <button
            onClick={() => handleStepUpdate('EN_ROUTE_TO_HOSPITAL')}
            disabled={updating || activeRequest.status === 'EN_ROUTE_TO_HOSPITAL'}
            className={`p-3.5 rounded-2xl font-bold text-xs text-left transition-all ${
              activeRequest.status === 'EN_ROUTE_TO_HOSPITAL'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            3. En-Route to Hospital
          </button>

          <button
            onClick={() => handleStepUpdate('COMPLETED')}
            disabled={updating}
            className="p-3.5 rounded-2xl font-extrabold text-xs text-left bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all flex items-center justify-between"
          >
            <span>4. Complete Trip</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map & Patient Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Navigation Map */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Navigation className="w-5 h-5 text-emerald-400" />
            Ambulance Navigation Route
          </h2>
          <MapView
            userLocation={patientLoc}
            driverLocation={simLocation}
            routePath={routePath}
            height="420px"
          />
        </div>

        {/* Destination Details */}
        <div className="space-y-4">
          
          <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Information</h3>
            <div className="space-y-2 text-xs">
              <div><span className="text-slate-400">Name:</span> <strong className="text-white text-sm block">{activeRequest.patient?.user?.name}</strong></div>
              <div><span className="text-slate-400">Pickup Address:</span> <strong className="text-slate-200 block">{activeRequest.pickupAddress}</strong></div>
              <div><span className="text-slate-400">Condition Notes:</span> <span className="text-slate-300 block">{activeRequest.notes || 'None'}</span></div>
              
              <a
                href={`tel:${activeRequest.patient?.user?.phone}`}
                className="w-full mt-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow text-center flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                Call Patient ({activeRequest.patient?.user?.phone})
              </a>
            </div>
          </div>

          <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hospital Destination</h3>
            {activeRequest.hospital ? (
              <div className="space-y-2 text-xs">
                <div className="font-bold text-white text-sm">{activeRequest.hospital.name}</div>
                <div className="text-slate-400">{activeRequest.hospital.address}</div>
                <a
                  href={`tel:${activeRequest.hospital.emergencyPhone || activeRequest.hospital.phone}`}
                  className="w-full mt-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl text-center block"
                >
                  Call Hospital Desk
                </a>
              </div>
            ) : (
              <div className="text-xs text-slate-400">Nearest emergency hospital assignment in progress.</div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default ActiveTrip;
