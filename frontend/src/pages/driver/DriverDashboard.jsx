import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { driverAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { 
  Truck, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldAlert, 
  Radio, 
  Navigation,
  Activity
} from 'lucide-react';

const DriverDashboard = () => {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await driverAPI.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch driver dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Socket updates
  useEffect(() => {
    if (!socket) return;

    socket.on('new_emergency_request', () => {
      fetchDashboard();
    });

    socket.on('trip_status_updated', () => {
      fetchDashboard();
    });

    return () => {
      socket.off('new_emergency_request');
      socket.off('trip_status_updated');
    };
  }, [socket]);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await driverAPI.updateStatus(newStatus);
      fetchDashboard();
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await driverAPI.acceptRequest(requestId);
      navigate('/driver/trip');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to accept request');
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">Loading driver cockpit...</div>;
  }

  const { driver, activeRequest, pendingRequests } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner & Status Controls */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-xs uppercase border border-emerald-500/30">
              Paramedic Command Cockpit
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Live Dispatch Network
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{driver?.user?.name}</h1>
          <p className="text-xs text-slate-400">
            Ambulance: <strong className="text-white">{driver?.ambulance?.vehicleNumber || 'Unassigned'}</strong> ({driver?.ambulance?.type} Unit)
          </p>
        </div>

        {/* Status Toggle Switch */}
        <div className="bg-slate-950 p-2 rounded-2xl border border-slate-800 flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold px-2">Set Status:</span>
          {['AVAILABLE', 'ON_TRIP', 'OFFLINE'].map((st) => (
            <button
              key={st}
              onClick={() => handleStatusChange(st)}
              disabled={updatingStatus}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                driver?.status === st
                  ? st === 'AVAILABLE' ? 'bg-emerald-600 text-white shadow-lg' :
                    st === 'ON_TRIP' ? 'bg-amber-600 text-white shadow-lg animate-pulse' :
                    'bg-slate-800 text-slate-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Active Trip Banner */}
      {activeRequest && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border-2 border-amber-500/80 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <Truck className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-extrabold text-xs uppercase border border-amber-500/40">
                  ACTIVE TRIP: {activeRequest.status.replace(/_/g, ' ')}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  Patient: {activeRequest.patient?.user?.name} ({activeRequest.emergencyType})
                </h3>
              </div>
            </div>

            <Link
              to="/driver/trip"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all shrink-0"
            >
              <Navigation className="w-4 h-4" />
              Open GPS Navigation Cockpit
            </Link>
          </div>

          <div className="text-xs bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div><span className="text-slate-400">Pickup Address:</span> <strong className="text-white">{activeRequest.pickupAddress}</strong></div>
            <div><span className="text-slate-400">Patient Contact:</span> <strong className="text-emerald-400">{activeRequest.patient?.user?.phone}</strong></div>
          </div>
        </div>
      )}

      {/* Broadcast Pending Emergency Requests */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            Nearby Emergency Dispatch Requests
          </h2>
          <span className="text-xs text-slate-400">Real-time broadcast stream</span>
        </div>

        {pendingRequests && pendingRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => (
              <div key={req.id} className="glass-card p-6 rounded-3xl border border-red-500/40 space-y-4 hover:border-red-500 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base">{req.patient?.user?.name}</span>
                    <span className="px-2.5 py-0.5 rounded bg-red-500/20 text-red-400 text-xs font-extrabold uppercase">
                      {req.emergencyType}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{new Date(req.requestedAt).toLocaleTimeString()}</span>
                </div>

                <div className="text-xs text-slate-300 space-y-1 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                  <div><span className="text-slate-500">Pickup Address:</span> <strong className="text-white">{req.pickupAddress}</strong></div>
                  {req.hospital && <div><span className="text-slate-500">Target Hospital:</span> <strong className="text-blue-400">{req.hospital.name}</strong></div>}
                  {req.notes && <div><span className="text-slate-500">Notes:</span> {req.notes}</div>}
                </div>

                <button
                  onClick={() => handleAcceptRequest(req.id)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all pulse-emergency"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  ACCEPT DISPATCH & START TRIP
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 rounded-3xl text-center text-slate-400 text-xs">
            No unassigned pending emergency requests broadcasted at this moment.
          </div>
        )}
      </div>

    </div>
  );
};

export default DriverDashboard;
