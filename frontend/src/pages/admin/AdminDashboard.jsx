import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { 
  ShieldCheck, 
  Users, 
  Hospital, 
  Ambulance, 
  Activity, 
  Clock, 
  Radio, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

const AdminDashboard = () => {
  const { socket } = useSocket();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch admin dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_emergency_request', () => fetchDashboard());
    socket.on('trip_status_updated', () => fetchDashboard());
    return () => {
      socket.off('new_emergency_request');
      socket.off('trip_status_updated');
    };
  }, [socket]);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">Loading admin metrics...</div>;
  }

  const { stats, recentRequests } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 font-extrabold text-xs uppercase border border-purple-500/30">
              System Control & Monitoring Center
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> Platform Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Global System Administration</h1>
          <p className="text-xs text-slate-400">Real-time surveillance of emergency requests, hospital verifications, and fleet.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to="/admin/users" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700">
            User Accounts
          </Link>
          <Link to="/admin/hospitals" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700">
            Hospitals ({stats?.totalHospitals})
          </Link>
          <Link to="/admin/monitoring" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow">
            Emergency Monitor
          </Link>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Registered Users</span>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats?.totalUsers}</div>
          <div className="text-[11px] text-slate-400">Patients, Hospitals & Drivers</div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Registered Hospitals</span>
            <Hospital className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-blue-400">{stats?.totalHospitals}</div>
          <div className="text-[11px] text-blue-300">Verified trauma centers</div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Ambulance Fleet</span>
            <Ambulance className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">
            {stats?.availableAmbulances} <span className="text-xs font-semibold text-slate-500">/ {stats?.totalAmbulances} Available</span>
          </div>
          <div className="text-[11px] text-emerald-300">ALS & ICU Units</div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Emergencies</span>
            <Activity className="w-5 h-5 text-red-500 animate-pulse" />
          </div>
          <div className="text-3xl font-black text-red-400">{stats?.activeEmergencyRequests}</div>
          <div className="text-[11px] text-red-300">Currently in dispatch</div>
        </div>

      </div>

      {/* Recent Global Requests Log */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Recent Platform Emergency Dispatches
          </h2>
          <Link to="/admin/monitoring" className="text-xs font-semibold text-purple-400 hover:text-purple-300">
            View All Monitoring Logs
          </Link>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase">
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Hospital</th>
                <th className="py-3 px-4">Driver</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentRequests?.map((req) => (
                <tr key={req.id} className="hover:bg-slate-900/50">
                  <td className="py-3.5 px-4 font-bold text-white">{req.patient?.user?.name}</td>
                  <td className="py-3.5 px-4 font-bold text-red-400">{req.emergencyType}</td>
                  <td className="py-3.5 px-4 text-blue-400">{req.hospital?.name || 'Searching...'}</td>
                  <td className="py-3.5 px-4 text-emerald-400">{req.driver?.user?.name || 'Searching...'}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 font-bold uppercase text-[10px]">
                      {req.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{new Date(req.requestedAt).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
