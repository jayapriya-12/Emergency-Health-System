import React, { useState } from 'react';
import { PhoneCall, ShieldAlert, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

const EmergencyCallModal = ({ isOpen, onClose }) => {
  const [callingState, setCallingState] = useState('IDLE'); // IDLE, DIALING, CONNECTED

  if (!isOpen) return null;

  const handleSimulateCall = (number) => {
    setCallingState('DIALING');
    setTimeout(() => {
      setCallingState('CONNECTED');
    }, 2000);
  };

  const handleReset = () => {
    setCallingState('IDLE');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-red-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        
        {/* Top Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

        <button
          onClick={handleReset}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-500">
            <PhoneCall className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              National Emergency Hotlines
            </h3>
            <p className="text-xs text-slate-400">Immediate 24/7 Dispatch Helplines</p>
          </div>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="p-3.5 mb-5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-200">Critical Medical Disclaimer: </span>
            This application is designed to assist emergency coordination. In immediate life-threatening situations, dial local national emergency services (108 / 112 / 911) directly without delay.
          </div>
        </div>

        {callingState === 'IDLE' && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between hover:border-red-500/50 transition-all">
              <div>
                <div className="text-lg font-extrabold text-white flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-red-600/30 text-red-400 text-sm">108</span>
                  National Ambulance & Medical Dispatch
                </div>
                <div className="text-xs text-slate-400">Free 24/7 Emergency Medical Response</div>
              </div>
              <button
                onClick={() => handleSimulateCall('108')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-md flex items-center gap-1.5 transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Call 108
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between hover:border-red-500/50 transition-all">
              <div>
                <div className="text-lg font-extrabold text-white flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-600/30 text-amber-400 text-sm">112</span>
                  All-in-One Emergency Helpline
                </div>
                <div className="text-xs text-slate-400">Integrated Police, Fire & Health Emergency</div>
              </div>
              <button
                onClick={() => handleSimulateCall('112')}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-md flex items-center gap-1.5 transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Call 112
              </button>
            </div>
          </div>
        )}

        {callingState === 'DIALING' && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-red-500 pulse-emergency">
              <PhoneCall className="w-8 h-8 animate-bounce" />
            </div>
            <div className="text-lg font-bold text-white">Connecting to Emergency Dispatcher...</div>
            <div className="text-xs text-slate-400">Routing GPS coordinates & emergency profile</div>
          </div>
        )}

        {callingState === 'CONNECTED' && (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="text-lg font-bold text-emerald-400">Emergency Dispatch Connected</div>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Simulated Emergency Line Active. Dispatcher has received live GPS coordinates and patient medical notes.
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700"
            >
              End Call & Return to App
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default EmergencyCallModal;
