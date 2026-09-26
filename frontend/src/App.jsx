import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import SOSAssistance from './pages/patient/SOSAssistance';
import NearbyHospitals from './pages/patient/NearbyHospitals';
import HospitalDetails from './pages/patient/HospitalDetails';
import AmbulanceSearch from './pages/patient/AmbulanceSearch';
import LiveTracking from './pages/patient/LiveTracking';
import RequestHistory from './pages/patient/RequestHistory';
import PatientProfile from './pages/patient/PatientProfile';

// Hospital Pages
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import HospitalRequests from './pages/hospital/HospitalRequests';
import BedManagement from './pages/hospital/BedManagement';
import FleetManagement from './pages/hospital/FleetManagement';

// Driver Pages
import DriverDashboard from './pages/driver/DriverDashboard';
import ActiveTrip from './pages/driver/ActiveTrip';
import DriverTripHistory from './pages/driver/DriverTripHistory';
import DriverProfile from './pages/driver/DriverProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import HospitalManagement from './pages/admin/HospitalManagement';
import AmbulanceManagement from './pages/admin/AmbulanceManagement';
import EmergencyMonitoring from './pages/admin/EmergencyMonitoring';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Patient Routes */}
                <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}><PatientDashboard /></ProtectedRoute>} />
                <Route path="/patient/sos" element={<ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}><SOSAssistance /></ProtectedRoute>} />
                <Route path="/patient/hospitals" element={<ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}><NearbyHospitals /></ProtectedRoute>} />
                <Route path="/patient/hospitals/:id" element={<ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}><HospitalDetails /></ProtectedRoute>} />
                <Route path="/patient/ambulances" element={<ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}><AmbulanceSearch /></ProtectedRoute>} />
                <Route path="/patient/tracking" element={<ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}><LiveTracking /></ProtectedRoute>} />
                <Route path="/patient/history" element={<ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}><RequestHistory /></ProtectedRoute>} />
                <Route path="/patient/profile" element={<ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}><PatientProfile /></ProtectedRoute>} />

                {/* Hospital Routes */}
                <Route path="/hospital/dashboard" element={<ProtectedRoute allowedRoles={['HOSPITAL', 'ADMIN']}><HospitalDashboard /></ProtectedRoute>} />
                <Route path="/hospital/requests" element={<ProtectedRoute allowedRoles={['HOSPITAL', 'ADMIN']}><HospitalRequests /></ProtectedRoute>} />
                <Route path="/hospital/beds" element={<ProtectedRoute allowedRoles={['HOSPITAL', 'ADMIN']}><BedManagement /></ProtectedRoute>} />
                <Route path="/hospital/fleet" element={<ProtectedRoute allowedRoles={['HOSPITAL', 'ADMIN']}><FleetManagement /></ProtectedRoute>} />

                {/* Driver Routes */}
                <Route path="/driver/dashboard" element={<ProtectedRoute allowedRoles={['AMBULANCE_DRIVER', 'ADMIN']}><DriverDashboard /></ProtectedRoute>} />
                <Route path="/driver/trip" element={<ProtectedRoute allowedRoles={['AMBULANCE_DRIVER', 'ADMIN']}><ActiveTrip /></ProtectedRoute>} />
                <Route path="/driver/history" element={<ProtectedRoute allowedRoles={['AMBULANCE_DRIVER', 'ADMIN']}><DriverTripHistory /></ProtectedRoute>} />
                <Route path="/driver/profile" element={<ProtectedRoute allowedRoles={['AMBULANCE_DRIVER', 'ADMIN']}><DriverProfile /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><UserManagement /></ProtectedRoute>} />
                <Route path="/admin/hospitals" element={<ProtectedRoute allowedRoles={['ADMIN']}><HospitalManagement /></ProtectedRoute>} />
                <Route path="/admin/ambulances" element={<ProtectedRoute allowedRoles={['ADMIN']}><AmbulanceManagement /></ProtectedRoute>} />
                <Route path="/admin/monitoring" element={<ProtectedRoute allowedRoles={['ADMIN']}><EmergencyMonitoring /></ProtectedRoute>} />

                {/* Catch All Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
