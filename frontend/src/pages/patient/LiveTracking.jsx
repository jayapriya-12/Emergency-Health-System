import React, { useState, useEffect } from 'react';
import { patientAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { 
  Ambulance, 
  MapPin, 
  PhoneCall, 
  CheckCircle2, 
  Clock, 
  Hospital, 
  User, 
  Radio, 
  AlertCircle,
  Navigation,
  ShieldCheck
} from 'lucide-react';
import MapView from '../../components/MapView';

const LiveTracking = () => {
  const { socket } = useSocket();
  const [activeRequest, setActiveRequest] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveRequest = async () => {
    try {
      setLoading(true);
      const res = await patientAPI.getActiveRequest();
      setActiveRequest(res.data);
      if (res.data?.driver) {
        setDriverLocation({
          latitude: res.data.driver.latitude,
          longitude: res.data.driver.longitude,
        });
      }
    } catch (err) {
      console.error('Failed to fetch active request', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveRequest();
  }, []);

  // Listen to Socket.IO events
  useEffect(() => {
    if (!socket) return;

    if (activeRequest?.id) {
      socket.emit('join_room', { requestId: activeRequest.id });
    }

    socket.on('driver_location_changed', (data) => {
      console.log('📍 Realtime driver GPS location updated:', data);
      setDriverLocation({
        latitude: data.latitude,
        longitude: data.longitude,
      });
    });

    socket.on('trip_status_updated', (data) => {
      console.log('⚡ Trip status updated:', data);
      fetchActiveRequest();
    });

    socket.on('emergency_status_changed', (updated) => {
      fetchActiveRequest();
    });

    return () => {
      socket.off('driver_location_changed');
      socket.off('trip_status_updated');
      socket.off('emergency_status_changed');
    };
  }, [socket, activeRequest?.id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        Syncing live ambulance tracking data...
      </div>
    );
  }

  if (!activeRequest) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
          <Ambulance className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">No Active Emergency Trip</h2>
        <p className="text-xs text-slate-400">
          You currently do not have an active emergency dispatch request in progress.
        </p>
      </div>
    );
  }

  const steps = [
    { key: 'PENDING', label: 'Request Sent' },
    { key: 'ACCEPTED_BY_HOSPITAL', label: 'Hospital Accepted' },
    { key: 'DRIVER_ASSIGNED', label: 'Driver Assigned' },
    { key: 'EN_ROUTE_TO_PATIENT', label: 'En-Route to Patient' },
    { key: 'PATIENT_PICKED_UP', label: 'Patient Picked Up' },
    { key: 'EN_ROUTE_TO_HOSPITAL', label: 'En-Route to Hospital' },
    { key: 'COMPLETED', label: 'Reached Hospital' },
  ];

  const getStepIndex = (status) => {
    const idx = steps.findIndex(s => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  const currentStepIdx = getStepIndex(activeRequest.status);

  const patientLoc = {
    latitude: activeRequest.pickupLatitude,
    longitude: activeRequest.pickupLongitude,
    address: activeRequest.pickupAddress,
  };

  const hospitalLoc = activeRequest.hospital ? [
    {
      id: activeRequest.hospital.id,
      name: activeRequest.hospital.name,
      latitude: activeRequest.hospital.latitude,
      longitude: activeRequest.hospital.longitude,
      address: activeRequest.hospital.address,
    }
  ] : [];

  const routePath = driverLocation && driverLocation.latitude ? [
    [driverLocation.latitude, driverLocation.longitude],
    [patientLoc.latitude, patientLoc.longitude],
    ...(activeRequest.hospital ? [[activeRequest.hospital.latitude, activeRequest.hospital.longitude]] : [])
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-3xl border border-red-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-extrabold text-xs uppercase border border-red-500/40 animate-pulse">
              LIVE DISPATCH ACTIVE: {activeRequest.status.replace(/_/g, ' ')}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> Live WebSocket Sync
            </div>
          </div>
          <h1 className="text-2xl font-black text-white">Emergency Response Unit Tracking</h1>
          <p className="text-xs text-slate-400">Request ID: #{activeRequest.id.substring(0, 8)}</p>
        </div>

        {/* Call Driver Button */}
        {activeRequest.driver && (
          <a
            href={`tel:${activeRequest.driver.user?.phone}`}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all shrink-0"
          >
            <PhoneCall className="w-4 h-4" />
            Call Driver ({activeRequest.driver.user?.name})
          </a>
        )}
      </div>

      {/* Stepper Timeline */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[650px] relative">
          
          {/* Progress Line */}
          <div className="absolute top-4 left-6 right-6 h-1 bg-slate-800 z-0" />
          <div
            className="absolute top-4 left-6 h-1 bg-gradient-to-r from-red-600 to-emerald-500 z-0 transition-all duration-500"
            style={{ width: `${(currentStepIdx / (steps.length - 1)) * 90}%` }}
          />

          {steps.map((st, idx) => {
            const isPassed = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            return (
              <div key={st.key} className="flex flex-col items-center relative z-10 space-y-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-xs transition-all ${
                    isCurrent
                      ? 'bg-red-600 text-white border-4 border-slate-900 shadow-lg shadow-red-500/50 scale-110 pulse-emergency'
                      : isPassed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>
                <span className={`text-[11px] font-semibold ${isPassed ? 'text-white' : 'text-slate-500'}`}>
                  {st.label}
                </span>
              </div>
            );
          })}

        </div>
      </div>

      {/* Map & Units Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Live Map View */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Navigation className="w-5 h-5 text-red-500" />
            Live GPS Map Stream
          </h2>
          
          <MapView
            userLocation={patientLoc}
            hospitals={hospitalLoc}
            driverLocation={driverLocation}
            routePath={routePath}
            height="420px"
          />
        </div>

        {/* Assigned Details Sidebar */}
        <div className="space-y-4">
          
          {/* Driver Card */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Driver</h3>
            {activeRequest.driver ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
                  👨‍✈️
                </div>
                <div>
                  <div className="font-bold text-white text-base">{activeRequest.driver.user?.name}</div>
                  <div className="text-xs text-slate-400">Experience: {activeRequest.driver.experienceYears} Years</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">License: {activeRequest.driver.licenseNumber}</div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-amber-400 font-semibold p-3 bg-amber-500/10 rounded-xl border border-amber-500/30">
                Searching & dispatching nearest available paramedic unit...
              </div>
            )}
          </div>

          {/* Vehicle Card */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicle Details</h3>
            {activeRequest.ambulance ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Registration:</span>
                  <span className="font-bold text-white text-sm">{activeRequest.ambulance.vehicleNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Unit Type:</span>
                  <span className="font-bold text-emerald-400">{activeRequest.ambulance.type} Life Support</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Model:</span>
                  <span className="text-slate-200">{activeRequest.ambulance.vehicleModel}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">Ambulance vehicle details pending assignment.</div>
            )}
          </div>

          {/* Hospital Destination Card */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Destination Hospital</h3>
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
              <div className="text-xs text-slate-400">Emergency hospital assignment in progress.</div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default LiveTracking;
