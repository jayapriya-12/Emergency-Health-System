import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Hospital as HospitalIcon, Ambulance as AmbulanceIcon, User, Activity } from 'lucide-react';

// Custom Marker Icons using HTML L.divIcon
const createCustomIcon = (type, label = '', status = 'DEFAULT') => {
  let bgClass = 'bg-red-600 text-white';
  let iconSvg = '🚨';

  if (type === 'PATIENT') {
    bgClass = 'bg-rose-500 text-white pulse-emergency shadow-lg shadow-rose-500/50';
    iconSvg = '📍';
  } else if (type === 'HOSPITAL') {
    bgClass = 'bg-blue-600 text-white shadow-lg shadow-blue-500/40';
    iconSvg = '🏥';
  } else if (type === 'AMBULANCE') {
    bgClass = status === 'ON_TRIP' ? 'bg-amber-500 text-slate-950 animate-bounce' : 'bg-emerald-600 text-white';
    iconSvg = '🚑';
  }

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${bgClass} border-2 border-white shadow-md transform -translate-x-1/2 -translate-y-1/2 cursor-pointer">
        <span className="text-sm">${iconSvg}</span>
        ${label ? `<span className="truncate max-w-[100px]">${label}</span>` : ''}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// Component to dynamically re-center map when center prop changes
const MapRecenter = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 13);
    }
  }, [center, zoom, map]);
  return null;
};

const MapView = ({
  center = [13.0604, 80.2496],
  zoom = 13,
  userLocation,
  hospitals = [],
  ambulances = [],
  driverLocation,
  routePath = [],
  onSelectHospital,
  onSelectAmbulance,
  height = '450px',
}) => {
  const mapCenter = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : center;

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative z-10">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', background: '#090d16' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter center={mapCenter} zoom={zoom} />

        {/* Patient Location Marker */}
        {userLocation && userLocation.latitude && userLocation.longitude && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={createCustomIcon('PATIENT', 'My Location')}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-2 text-slate-900 font-sans">
                <div className="font-bold text-sm text-red-600 flex items-center gap-1">
                  📍 Emergency Patient Location
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  {userLocation.address || 'Detected GPS Location'}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Lat: {userLocation.latitude.toFixed(4)}, Lng: {userLocation.longitude.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Hospitals Markers */}
        {hospitals.map((hosp) => (
          <Marker
            key={hosp.id}
            position={[hosp.latitude, hosp.longitude]}
            icon={createCustomIcon('HOSPITAL', hosp.name)}
          >
            <Popup>
              <div className="p-2 text-slate-900 font-sans min-w-[200px]">
                <div className="font-bold text-sm text-blue-700 flex items-center gap-1">
                  🏥 {hosp.name}
                </div>
                <div className="text-xs text-slate-600 mt-1">{hosp.address}</div>
                
                {hosp.distanceKm !== undefined && (
                  <div className="text-xs font-semibold text-red-600 mt-1">
                    Distance: {hosp.distanceKm} km
                  </div>
                )}

                <div className="mt-2.5 pt-2 border-t border-slate-200 grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="bg-emerald-50 p-1.5 rounded border border-emerald-200">
                    <span className="text-slate-500 block">Available Beds:</span>
                    <span className="font-bold text-emerald-700 text-xs">{hosp.availableBeds} / {hosp.totalBeds}</span>
                  </div>
                  <div className="bg-purple-50 p-1.5 rounded border border-purple-200">
                    <span className="text-slate-500 block">ICU Beds:</span>
                    <span className="font-bold text-purple-700 text-xs">{hosp.availableICUBeds} / {hosp.totalICUBeds}</span>
                  </div>
                </div>

                {onSelectHospital && (
                  <button
                    onClick={() => onSelectHospital(hosp)}
                    className="w-full mt-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded shadow transition-colors"
                  >
                    Select Hospital
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Ambulances / Driver Markers */}
        {ambulances.map((amb) => (
          <Marker
            key={amb.id}
            position={[amb.latitude, amb.longitude]}
            icon={createCustomIcon('AMBULANCE', amb.type, amb.status)}
          >
            <Popup>
              <div className="p-2 text-slate-900 font-sans">
                <div className="font-bold text-sm text-amber-700 flex items-center gap-1">
                  🚑 {amb.vehicleNumber} ({amb.type})
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Model: {amb.vehicleModel}
                </div>
                <div className="text-xs font-semibold text-emerald-700 mt-1">
                  Status: {amb.status}
                </div>
                {amb.distanceKm !== undefined && (
                  <div className="text-xs font-semibold text-red-600">
                    Distance: {amb.distanceKm} km (~{amb.etaMinutes} mins)
                  </div>
                )}
                {onSelectAmbulance && amb.status === 'AVAILABLE' && (
                  <button
                    onClick={() => onSelectAmbulance(amb)}
                    className="w-full mt-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded"
                  >
                    Dispatch Ambulance
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Dedicated Live Driver Marker */}
        {driverLocation && driverLocation.latitude && driverLocation.longitude && (
          <Marker
            position={[driverLocation.latitude, driverLocation.longitude]}
            icon={createCustomIcon('AMBULANCE', 'Assigned Driver', 'ON_TRIP')}
          >
            <Popup>
              <div className="p-2 text-slate-900 font-sans">
                <div className="font-bold text-sm text-red-600">🚑 Live Ambulance Unit</div>
                <div className="text-xs text-slate-600 mt-1">En-route to destination</div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Lat: {driverLocation.latitude.toFixed(4)}, Lng: {driverLocation.longitude.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Polyline (e.g. between patient and driver/hospital) */}
        {routePath.length > 1 && (
          <Polyline
            positions={routePath}
            pathOptions={{ color: '#ef4444', weight: 5, opacity: 0.8, dashArray: '8, 8' }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
