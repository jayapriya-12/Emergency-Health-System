import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  ShieldAlert, 
  Activity, 
  Hospital, 
  Ambulance, 
  User, 
  LogOut, 
  PhoneCall, 
  Menu, 
  X,
  LayoutDashboard,
  Clock,
  Radio
} from 'lucide-react';
import EmergencyCallModal from './EmergencyCallModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user?.role || 'GUEST';

  const getDashboardLink = () => {
    switch (role) {
      case 'HOSPITAL': return '/hospital/dashboard';
      case 'AMBULANCE_DRIVER': return '/driver/dashboard';
      case 'ADMIN': return '/admin/dashboard';
      default: return '/patient/dashboard';
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-40 glass-nav shadow-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-wide flex items-center gap-1.5">
                  RESCOU <span className="text-red-500">24x7</span>
                </span>
                <span className="block text-[10px] text-slate-400 font-medium tracking-wider uppercase -mt-1">
                  Smart Emergency Health
                </span>
              </div>
            </Link>

            {/* Socket Status & Direct Call Button */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
                <Radio className={`w-3.5 h-3.5 ${connected ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                <span>{connected ? 'Live Network Connected' : 'Connecting Realtime...'}</span>
              </div>

              {/* Call Emergency Direct Call Button */}
              <button
                onClick={() => setCallModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 rounded-full font-semibold text-xs transition-colors shadow-sm"
              >
                <PhoneCall className="w-3.5 h-3.5 text-red-500 animate-bounce" />
                <span>Call Emergency (108/911)</span>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {user ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                      isActive(getDashboardLink()) ? 'text-red-400 font-semibold' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>

                  {role === 'PATIENT' && (
                    <>
                      <Link
                        to="/patient/hospitals"
                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                          isActive('/patient/hospitals') ? 'text-red-400 font-semibold' : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        <Hospital className="w-4 h-4" />
                        Hospitals
                      </Link>
                      <Link
                        to="/patient/ambulances"
                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                          isActive('/patient/ambulances') ? 'text-red-400 font-semibold' : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        <Ambulance className="w-4 h-4" />
                        Ambulances
                      </Link>
                      <Link
                        to="/patient/sos"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/40 pulse-emergency transition-all"
                      >
                        <Activity className="w-4 h-4" />
                        SOS DISPATCH
                      </Link>
                    </>
                  )}

                  {role === 'HOSPITAL' && (
                    <Link
                      to="/hospital/requests"
                      className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                        isActive('/hospital/requests') ? 'text-red-400 font-semibold' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <Activity className="w-4 h-4" />
                      Emergency Requests
                    </Link>
                  )}

                  {role === 'AMBULANCE_DRIVER' && (
                    <Link
                      to="/driver/trip"
                      className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                        isActive('/driver/trip') ? 'text-red-400 font-semibold' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <Ambulance className="w-4 h-4" />
                      Active Trip
                    </Link>
                  )}

                  {/* Profile Pill */}
                  <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                    <Link
                      to={role === 'PATIENT' ? '/patient/profile' : role === 'HOSPITAL' ? '/hospital/profile' : role === 'AMBULANCE_DRIVER' ? '/driver/profile' : '/admin/dashboard'}
                      className="flex items-center gap-2 group"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 group-hover:border-red-500 transition-colors">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="text-left hidden lg:block">
                        <div className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">{user.name}</div>
                        <div className="text-[10px] text-red-400 font-medium uppercase">{user.role}</div>
                      </div>
                    </Link>

                    <button
                      onClick={handleLogout}
                      title="Logout"
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-semibold text-white bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded-lg shadow-lg shadow-red-600/30 transition-all"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setCallModalOpen(true)}
                className="p-2 bg-red-600/20 text-red-400 border border-red-500/40 rounded-full"
              >
                <PhoneCall className="w-4 h-4" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{user.name}</div>
                    <div className="text-xs text-red-400 font-medium uppercase">{user.role}</div>
                  </div>
                </div>

                <Link
                  to={getDashboardLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-slate-300 hover:text-white text-sm font-medium"
                >
                  Dashboard
                </Link>

                {role === 'PATIENT' && (
                  <>
                    <Link
                      to="/patient/hospitals"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-slate-300 hover:text-white text-sm font-medium"
                    >
                      Nearby Hospitals
                    </Link>
                    <Link
                      to="/patient/ambulances"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-slate-300 hover:text-white text-sm font-medium"
                    >
                      Ambulance Search
                    </Link>
                    <Link
                      to="/patient/sos"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-red-400 font-bold text-sm"
                    >
                      Emergency SOS Dispatch
                    </Link>
                  </>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 text-red-400 text-sm font-medium flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-slate-200 bg-slate-800 rounded-lg text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-white bg-red-600 rounded-lg text-sm font-semibold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Emergency Hotline Modal */}
      <EmergencyCallModal isOpen={callModalOpen} onClose={() => setCallModalOpen(false)} />
    </>
  );
};

export default Navbar;
