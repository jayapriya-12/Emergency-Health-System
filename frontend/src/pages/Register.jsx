import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, UserPlus, User, Hospital, Truck, Mail, Lock, Phone, MapPin, AlertCircle } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('PATIENT'); // PATIENT, HOSPITAL, AMBULANCE_DRIVER
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    // Patient specific
    age: '',
    bloodGroup: 'O+',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    // Hospital specific
    hospitalName: '',
    emergencyPhone: '',
    totalBeds: '50',
    totalICUBeds: '10',
    totalVentilators: '5',
    // Driver specific
    licenseNumber: '',
    experienceYears: '3',
    vehicleNumber: '',
    vehicleModel: '',
    ambulanceType: 'ALS',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await register({ ...formData, role });
      if (user.role === 'HOSPITAL') navigate('/hospital/dashboard');
      else if (user.role === 'AMBULANCE_DRIVER') navigate('/driver/dashboard');
      else navigate('/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <Link to="/" className="flex justify-center items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/30">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-2xl text-white tracking-wide">
            RESCOU <span className="text-red-500">24x7</span>
          </span>
        </Link>
        <h2 className="text-center text-2xl font-extrabold text-white">
          Create Emergency Portal Account
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Register your role in the smart healthcare assistance network
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        
        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 mb-6 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => setRole('PATIENT')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              role === 'PATIENT' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" /> Patient
          </button>
          
          <button
            type="button"
            onClick={() => setRole('HOSPITAL')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              role === 'HOSPITAL' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Hospital className="w-4 h-4" /> Hospital
          </button>
          
          <button
            type="button"
            onClick={() => setRole('AMBULANCE_DRIVER')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              role === 'AMBULANCE_DRIVER' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" /> Driver
          </button>
        </div>

        <div className="glass-card py-8 px-6 shadow-2xl rounded-2xl border border-slate-800">
          
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Common Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name / Contact Person
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* PATIENT specific fields */}
            {role === 'PATIENT' && (
              <>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="e.g. 35"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Blood Group</label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Residential Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street, City, State"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Emergency Contact Person</label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleChange}
                      placeholder="Kin / Spouse Name"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Emergency Contact Phone</label>
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleChange}
                      placeholder="Emergency Phone"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            {/* HOSPITAL specific fields */}
            {role === 'HOSPITAL' && (
              <>
                <div className="pt-2 border-t border-slate-800 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Hospital / Trauma Center Name</label>
                    <input
                      type="text"
                      name="hospitalName"
                      required
                      value={formData.hospitalName}
                      onChange={handleChange}
                      placeholder="e.g. City General Trauma Center"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Total Beds</label>
                      <input
                        type="number"
                        name="totalBeds"
                        value={formData.totalBeds}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">ICU Beds</label>
                      <input
                        type="number"
                        name="totalICUBeds"
                        value={formData.totalICUBeds}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Ventilators</label>
                      <input
                        type="number"
                        name="totalVentilators"
                        value={formData.totalVentilators}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* DRIVER specific fields */}
            {role === 'AMBULANCE_DRIVER' && (
              <>
                <div className="pt-2 border-t border-slate-800 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Driving License Number</label>
                      <input
                        type="text"
                        name="licenseNumber"
                        required
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        placeholder="e.g. DL-14201100"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Ambulance Type</label>
                      <select
                        name="ambulanceType"
                        value={formData.ambulanceType}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                      >
                        <option value="ALS">ALS (Advanced Life Support)</option>
                        <option value="BLS">BLS (Basic Life Support)</option>
                        <option value="ICU_MOBILE">Mobile ICU Unit</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Ambulance Vehicle Reg Number</label>
                    <input
                      type="text"
                      name="vehicleNumber"
                      required
                      value={formData.vehicleNumber}
                      onChange={handleChange}
                      placeholder="e.g. TN-01-EM-9999"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
                role === 'HOSPITAL' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30' :
                role === 'AMBULANCE_DRIVER' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30' :
                'bg-red-600 hover:bg-red-700 shadow-red-600/30'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Creating Account...' : `Register as ${role.replace('_', ' ')}`}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-red-400 hover:text-red-300">
              Sign In Instead
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Register;
