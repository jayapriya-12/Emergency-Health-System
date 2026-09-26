import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { Activity, Clock, ShieldAlert, Radio, CheckCircle2, MapPin } from 'lucide-react';

const EmergencyMonitoring = () => {
  const { socket } = useSocket();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getEmergencyRequests();
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch emergency requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_emergency_request', () => fetchRequests());
    socket.on('trip_status_updated', () => fetchRequests());
    return () => {
      socket.off('new_emergency_request');
      socket.off('trip_status_updated');
    };
  }, [socket]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-red-500 animate-pulse" />
            Global Emergency Response Surveillance
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time monitoring stream of all patient SOS dispatches system-wide.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 font-extrabold text-xs flex items-center gap-1.5 border border-red-500/40">
          <Radio className="w-4 h-4 animate-pulse text-red-500" />
          Live Socket Surveillance
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading emergency monitoring stream...</div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="glass-card p-6 rounded-3xl border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-base">{req.patient?.user?.name}</span>
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-extrabold text-xs uppercase border border-red-500/30">
                      {req.emergencyType}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-extrabold text-xs uppercase">
                      {req.severity}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Requested: {new Date(req.requestedAt).toLocaleString()}</span>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-200 text-xs font-bold uppercase border border-slate-700">
                  Status: {req.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs">
                <div><span className="text-slate-400 block">Pickup Location:</span> <strong className="text-white truncate block">{req.pickupAddress}</strong></div>
                <div><span className="text-slate-400 block">Hospital:</span> <strong className="text-blue-400">{req.hospital?.name || 'Unassigned'}</strong></div>
                <div><span className="text-slate-400 block">Driver / Ambulance:</span> <strong className="text-emerald-400">{req.driver?.user?.name || 'Unassigned'} ({req.ambulance?.vehicleNumber || 'N/A'})</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default EmergencyMonitoring;
