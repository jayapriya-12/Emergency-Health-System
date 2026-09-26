import React, { useState, useEffect } from 'react';
import { hospitalAPI } from '../../services/api';
import { Ambulance, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

const FleetManagement = () => {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleModel: '',
    type: 'ALS',
  });
  const [saving, setSaving] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await hospitalAPI.getDashboard();
      if (res.data?.hospital?.ambulances) {
        setAmbulances(res.data.hospital.ambulances);
      }
    } catch (err) {
      console.error('Failed to fetch fleet', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await hospitalAPI.addAmbulance(formData);
      setFormData({ vehicleNumber: '', vehicleModel: '', type: 'ALS' });
      setShowForm(false);
      fetchDashboard();
    } catch (err) {
      console.error('Failed to add ambulance', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Ambulance className="w-6 h-6 text-emerald-400" />
            Hospital Ambulance Fleet Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage hospital-owned ambulance units and register emergency vehicles.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Ambulance Unit
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Register New Emergency Vehicle</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Vehicle Registration Number</label>
              <input
                type="text"
                required
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                placeholder="e.g. TN-01-EM-4099"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Vehicle Model / Chassis</label>
              <input
                type="text"
                required
                value={formData.vehicleModel}
                onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                placeholder="e.g. Force Traveller ICU"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Life Support Equipment Level</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
              >
                <option value="ALS">ALS (Advanced Life Support)</option>
                <option value="BLS">BLS (Basic Life Support)</option>
                <option value="ICU_MOBILE">Mobile ICU Unit</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all"
          >
            {saving ? 'Adding Unit...' : 'Confirm Registration'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ambulances.map((amb) => (
          <div key={amb.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-white text-base">{amb.vehicleNumber}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] uppercase">
                {amb.status}
              </span>
            </div>
            <div className="text-xs text-slate-400">{amb.vehicleModel}</div>
            <div className="text-xs font-bold text-blue-400 pt-2 border-t border-slate-800">
              Equipment: {amb.type}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default FleetManagement;
