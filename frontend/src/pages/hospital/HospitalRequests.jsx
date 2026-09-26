import React, { useState, useEffect } from 'react';
import { hospitalAPI, driverAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  User, 
  Ambulance, 
  AlertCircle,
  PhoneCall
} from 'lucide-react';
import MapView from '../../components/MapView';

const HospitalRequests = () => {
  const { socket } = useSocket();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedRequestForMap, setSelectedRequestForMap] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await hospitalAPI.getRequests();
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching emergency requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('new_emergency_request', (req) => {
      console.log('🚨 New incoming request:', req);
      fetchRequests();
    });

    socket.on('emergency_status_changed', () => {
      fetchRequests();
    });

    return () => {
      socket.off('new_emergency_request');
      socket.off('emergency_status_changed');
    };
  }, [socket]);

  const handleRespond = async (id, status) => {
    setProcessingId(id);
    try {
      await hospitalAPI.respondToRequest(id, { status });
      fetchRequests();
    } catch (err) {
      console.error('Failed to respond to request', err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-500" />
          Emergency Admission Requests
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review incoming patient emergency dispatches and manage hospital admissions.
        </p>
      </div>

      {/* Map Preview of Selected Patient Pickup Location */}
      {selectedRequestForMap && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              Pickup Preview for Patient: {selectedRequestForMap.patient?.user?.name}
            </span>
            <button
              onClick={() => setSelectedRequestForMap(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close Map
            </button>
          </div>
          <MapView
            userLocation={{
              latitude: selectedRequestForMap.pickupLatitude,
              longitude: selectedRequestForMap.pickupLongitude,
              address: selectedRequestForMap.pickupAddress,
            }}
            height="260px"
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading emergency requests...</div>
      ) : requests.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center text-slate-400 space-y-2">
          <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
          <div className="text-base font-bold text-white">No Pending Emergency Requests</div>
          <div className="text-xs">All emergency dispatch admissions are processed.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className={`glass-card p-6 rounded-3xl border space-y-4 transition-all ${
                req.status === 'PENDING' ? 'border-red-500/60 shadow-xl shadow-red-600/10' : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-base">
                      {req.patient?.user?.name}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-extrabold text-xs uppercase border border-red-500/30">
                      {req.emergencyType}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-extrabold text-xs uppercase">
                      {req.severity}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Requested at: {new Date(req.requestedAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  req.status === 'ACCEPTED_BY_HOSPITAL' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  req.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  Status: {req.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block">Pickup Location:</span>
                  <span className="font-bold text-white">{req.pickupAddress}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Patient Phone:</span>
                  <a href={`tel:${req.patient?.user?.phone}`} className="font-bold text-emerald-400 hover:underline">
                    {req.patient?.user?.phone || 'N/A'}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block">Symptoms / Medical Notes:</span>
                  <span className="font-bold text-slate-200">{req.notes || 'None provided'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setSelectedRequestForMap(req)}
                  className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5" /> Preview Pickup Location Map
                </button>

                {req.status === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRespond(req.id, 'ACCEPTED_BY_HOSPITAL')}
                      disabled={processingId === req.id}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                    >
                      Accept Emergency Admission
                    </button>
                    <button
                      onClick={() => handleRespond(req.id, 'REJECTED')}
                      disabled={processingId === req.id}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-red-400 font-bold text-xs rounded-xl border border-slate-700 transition-all"
                    >
                      Reject Request
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default HospitalRequests;
