import React, { useState, useEffect } from 'react';
import { hospitalAPI } from '../../services/api';
import { BedDouble, Activity, Wind, Flame, Save, CheckCircle2, AlertCircle } from 'lucide-react';

const BedManagement = () => {
  const [formData, setFormData] = useState({
    availableBeds: 20,
    totalBeds: 50,
    availableICUBeds: 4,
    totalICUBeds: 10,
    availableVentilators: 2,
    totalVentilators: 5,
    emergencyDeptStatus: 'OPEN',
    oxygenAvailable: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCurrent = async () => {
      try {
        setLoading(true);
        const res = await hospitalAPI.getDashboard();
        if (res.data?.hospital) {
          const h = res.data.hospital;
          setFormData({
            availableBeds: h.availableBeds,
            totalBeds: h.totalBeds,
            availableICUBeds: h.availableICUBeds,
            totalICUBeds: h.totalICUBeds,
            availableVentilators: h.availableVentilators,
            totalVentilators: h.totalVentilators,
            emergencyDeptStatus: h.emergencyDeptStatus,
            oxygenAvailable: h.oxygenAvailable,
          });
        }
      } catch (err) {
        console.error('Failed to load bed counts', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCurrent();
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      await hospitalAPI.updateAvailability(formData);
      setSuccess('Real-time ICU, ventilator, and bed availability updated broadcast live to patients.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update capacity');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">Loading capacity metrics...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <BedDouble className="w-6 h-6 text-blue-500" />
          ICU & Bed Capacity Management
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Changes saved here are broadcasted in real-time to patient search maps and emergency dispatchers.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        
        {/* Status & Oxygen Switches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Emergency Department Status</label>
            <select
              name="emergencyDeptStatus"
              value={formData.emergencyDeptStatus}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="OPEN">OPEN (Normal Emergency Admissions)</option>
              <option value="BUSY">BUSY (High Admissions Volume)</option>
              <option value="CLOSED">CLOSED (Trauma Unit Diverted)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Oxygen Supply Status</label>
            <label className="flex items-center gap-3 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                name="oxygenAvailable"
                checked={formData.oxygenAvailable}
                onChange={handleChange}
                className="w-4 h-4 accent-blue-500 rounded"
              />
              <span>Medical Oxygen Supply Available 24x7</span>
            </label>
          </div>
        </div>

        {/* General Beds */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <BedDouble className="w-4 h-4" /> General Ward Beds
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Currently Available Beds</label>
              <input
                type="number"
                name="availableBeds"
                value={formData.availableBeds}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Total Ward Beds</label>
              <input
                type="number"
                name="totalBeds"
                value={formData.totalBeds}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-bold"
              />
            </div>
          </div>
        </div>

        {/* ICU Beds */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4" /> Intensive Care Unit (ICU) Beds
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Currently Available ICU Beds</label>
              <input
                type="number"
                name="availableICUBeds"
                value={formData.availableICUBeds}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Total ICU Beds</label>
              <input
                type="number"
                name="totalICUBeds"
                value={formData.totalICUBeds}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-bold"
              />
            </div>
          </div>
        </div>

        {/* Ventilators */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Wind className="w-4 h-4" /> Ventilators & Life Support
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Currently Available Ventilators</label>
              <input
                type="number"
                name="availableVentilators"
                value={formData.availableVentilators}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Total Ventilator Units</label>
              <input
                type="number"
                name="totalVentilators"
                value={formData.totalVentilators}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-bold"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Broadcasting Changes...' : 'Broadcast Real-Time Capacity Update'}
        </button>

      </form>

    </div>
  );
};

export default BedManagement;
