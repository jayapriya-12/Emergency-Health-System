import React, { useState, useEffect } from 'react';
import { driverAPI } from '../../services/api';
import { Clock, Truck, CheckCircle2, MapPin } from 'lucide-react';

const DriverTripHistory = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await driverAPI.getTripHistory();
        setTrips(res.data);
      } catch (err) {
        console.error('Failed to fetch trip history', err);
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
          <Clock className="w-6 h-6 text-emerald-400" />
          Driver Trip History
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Historical log of completed emergency transport trips.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading trip history...</div>
      ) : trips.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center text-slate-400 text-xs">
          No completed trips logged yet.
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((tr) => (
            <div key={tr.id} className="glass-card p-6 rounded-3xl border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-base">
                    Patient: {tr.patient?.user?.name}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
                    {tr.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Requested: {new Date(tr.requestedAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-xs">
                <div><span className="text-slate-400">Pickup Address:</span> <strong className="text-white">{tr.pickupAddress}</strong></div>
                <div><span className="text-slate-400">Destination Hospital:</span> <strong className="text-blue-400">{tr.hospital?.name || 'N/A'}</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default DriverTripHistory;
