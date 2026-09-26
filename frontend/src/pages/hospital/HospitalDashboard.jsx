import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hospitalAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { 
  Hospital, 
  BedDouble, 
  Activity, 
  Wind, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Ambulance, 
  MapPin, 
  Radio 
} from 'lucide-react';

const HospitalDashboard = () => {
  const { socket } = useSocket();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await hospitalAPI.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch hospital dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Real-time socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('new_emergency_request', (req) => {
      console.log('🚨 New incoming emergency request for hospital:', req);
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

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">Loading hospital metrics...</div>;
  }

  const { hospital, stats, activeRequests } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-blue-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 font-extrabold text-xs uppercase border border-blue-500/30">
              Hospital Emergency Command
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> Socket Stream Connected
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{hospital?.name}</h1>
          <p className="text-xs text-slate-400">{hospital?.address}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/hospital/beds"
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            Update Bed & ICU Status
          </Link>
          <Link
            to="/hospital/requests"
            className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 pulse-emergency"
          >
            <ShieldAlert className="w-4 h-4" />
            Emergency Requests ({stats?.pendingRequestsCount || 0})
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Available Beds</span>
            <BedDouble className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {stats?.availableBeds} <span className="text-xs font-semibold text-slate-500">/ {stats?.totalBeds}</span>
          </div>
          <div className="text-[11px] text-emerald-400">General admission capacity</div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Available ICU Beds</span>
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-purple-400">
            {stats?.availableICUBeds} <span className="text-xs font-semibold text-slate-500">/ {stats?.totalICUBeds}</span>
          </div>
          <div className="text-[11px] text-purple-300">Intensive care units</div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Available Ventilators</span>
            <Wind className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">
            {stats?.availableVentilators} <span className="text-xs font-semibold text-slate-500">/ {stats?.totalVentilators}</span>
          </div>
          <div className="text-[11px] text-amber-300">Respiratory life support</div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Incoming Emergency Trips</span>
            <Ambulance className="w-5 h-5 text-red-500 animate-pulse" />
          </div>
          <div className="text-3xl font-black text-red-400">
            {stats?.activeRequestsCount}
          </div>
          <div className="text-[11px] text-red-300">Ambulances en-route to hospital</div>
        </div>

      </div>

      {/* Active Incoming Ambulances List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Ambulance className="w-5 h-5 text-red-500" />
            Active Emergency Admissions & Incoming Ambulances
          </h2>
          <Link to="/hospital/requests" className="text-xs font-semibold text-blue-400 hover:text-blue-300">
            Manage All Requests
          </Link>
        </div>

        {activeRequests && activeRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRequests.map((req) => (
              <div key={req.id} className="glass-card p-5 rounded-3xl border border-red-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{req.patient?.user?.name}</span>
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-extrabold text-[10px] uppercase">
                      {req.emergencyType}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase">
                    {req.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-1 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                  <div><span className="text-slate-500">Pickup:</span> {req.pickupAddress}</div>
                  <div><span className="text-slate-500">Assigned Driver:</span> {req.driver?.user?.name || 'N/A'} ({req.ambulance?.vehicleNumber || 'N/A'})</div>
                  {req.notes && <div><span className="text-slate-500">Notes:</span> {req.notes}</div>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 rounded-3xl text-center text-slate-400 text-xs">
            No active incoming emergency trips at this moment.
          </div>
        )}
      </div>

    </div>
  );
};

export default HospitalDashboard;
