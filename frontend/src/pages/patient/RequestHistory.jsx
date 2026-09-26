import React, { useState, useEffect } from 'react';
import { patientAPI } from '../../services/api';
import { Clock, ShieldAlert, CheckCircle2, XCircle, MapPin, Hospital, Ambulance } from 'lucide-react';

const RequestHistory = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await patientAPI.getRequestHistory();
        setRequests(res.data);
      } catch (err) {
        console.error('Failed to fetch request history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Clock className="w-6 h-6 text-red-500" />
          Emergency Request History
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete log of emergency SOS dispatches, hospitals, and ambulance trips.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading request history...</div>
      ) : requests.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center text-slate-400 space-y-2">
          <ShieldAlert className="w-12 h-12 mx-auto text-slate-600" />
          <div className="text-base font-bold text-white">No Emergency Requests Found</div>
          <div className="text-xs">Your past emergency dispatch logs will appear here.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="glass-card p-6 rounded-3xl border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-base">{req.emergencyType} Emergency</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      req.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      req.status === 'REJECTED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {req.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Requested: {new Date(req.requestedAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-xs font-mono text-slate-500">
                  ID: #{req.id.substring(0, 8)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block">Pickup Location:</span>
                  <span className="font-bold text-slate-200 truncate block">{req.pickupAddress}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Assigned Hospital:</span>
                  <span className="font-bold text-blue-400">{req.hospital?.name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Assigned Driver / Ambulance:</span>
                  <span className="font-bold text-emerald-400">
                    {req.driver?.user?.name || 'N/A'} ({req.ambulance?.vehicleNumber || 'N/A'})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default RequestHistory;
