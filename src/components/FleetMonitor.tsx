import React from 'react';
import { Gauge, Flame, Fuel, AlertOctagon, Zap, Navigation } from 'lucide-react';
import { TelemetryPayload } from '../types';

interface FleetMonitorProps {
  latestPayloads: Record<string, TelemetryPayload>;
}

export const FleetMonitor: React.FC<FleetMonitorProps> = ({ latestPayloads }) => {
  const machines: TelemetryPayload[] = Object.values(latestPayloads);

  if (machines.length === 0) {
    return (
      <div id="fleet-monitor-empty" className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-xs">
        <Gauge className="w-10 h-10 mx-auto opacity-30 mb-2 text-slate-400" />
        <p className="text-sm font-semibold text-[#002D62]">Fleet Telemetry Stream Offline</p>
        <p className="text-xs text-slate-400 mt-1">Start the simulation engine to view real-time heavy equipment telemetry gauges.</p>
      </div>
    );
  }

  return (
    <div id="fleet-monitor-grid" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#002D62] tracking-tight flex items-center gap-2">
          <span>Active Asset Telemetry Gauges</span>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-[#002D62] border border-sky-200">
            {machines.length} Units Online
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {machines.map((payload) => {
          const m = payload.metrics;
          const g = payload.gps;
          const status = payload.equipment_metadata.status;

          const rpmPercent = Math.min(100, Math.max(0, ((m.engine_rpm - 800) / (3200 - 800)) * 100));
          const tempPercent = Math.min(100, Math.max(0, ((m.engine_temperature_c - 60) / (120 - 60)) * 100));

          return (
            <div
              key={payload.machine_id}
              id={`card-${payload.machine_id}`}
              className={`bg-white border rounded-xl p-4 transition-all shadow-xs relative overflow-hidden ${
                status === 'CRITICAL'
                  ? 'border-rose-300 bg-rose-50/20'
                  : status === 'WARNING'
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              {/* Asset Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-bold text-[#002D62] tracking-wide">
                      {payload.machine_id}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full border ${
                      status === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-700 border-rose-200'
                        : status === 'WARNING'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}>
                      {status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">{payload.equipment_metadata.model}</p>
                </div>

                <div className="text-right font-mono text-[11px] text-slate-500">
                  <div className="font-medium text-slate-700">{payload.equipment_metadata.operating_hours.toFixed(1)} hrs</div>
                  <div className="text-[10px] text-slate-400">{payload.timestamp.substring(11, 19)}</div>
                </div>
              </div>

              {/* Alarms Banner */}
              {payload.diagnostic_alarms.length > 0 && (
                <div className="mt-3 py-1.5 px-2.5 bg-rose-100 border border-rose-200 rounded-md text-rose-800 text-xs font-mono flex items-center gap-1.5 animate-pulse">
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                  <span className="truncate font-semibold">{payload.diagnostic_alarms.join(' | ')}</span>
                </div>
              )}

              {/* Gauge Metrics */}
              <div className="mt-4 space-y-3">
                {/* RPM Gauge Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-600 font-medium flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-[#00A3E0]" /> Engine RPM
                    </span>
                    <span className={`font-bold ${m.engine_rpm > 2900 ? 'text-rose-600' : 'text-[#002D62]'}`}>
                      {m.engine_rpm} RPM
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div
                      className={`h-full transition-all duration-300 ${
                        m.engine_rpm > 2900 ? 'bg-rose-500' : m.engine_rpm > 2500 ? 'bg-amber-500' : 'bg-[#002D62]'
                      }`}
                      style={{ width: `${rpmPercent}%` }}
                    />
                  </div>
                </div>

                {/* Engine Temp Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-600 font-medium flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-[#C2410C]" /> Temperature
                    </span>
                    <span className={`font-bold ${m.engine_temperature_c > 100 ? 'text-rose-600' : 'text-[#C2410C]'}`}>
                      {m.engine_temperature_c}°C
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div
                      className={`h-full transition-all duration-300 ${
                        m.engine_temperature_c > 105 ? 'bg-rose-500' : m.engine_temperature_c > 95 ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${tempPercent}%` }}
                    />
                  </div>
                </div>

                {/* Fuel Level & Oil Pressure Row */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold flex items-center gap-1">
                      <Fuel className="w-3 h-3 text-[#00A3E0]" /> Fuel Level
                    </div>
                    <div className="text-xs font-mono font-bold text-[#002D62] mt-0.5">
                      {m.fuel_level_percent}%
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-600" /> Oil Pressure
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-800 mt-0.5">
                      {m.oil_pressure_kpa} kPa
                    </div>
                  </div>
                </div>

                {/* GPS Telemetry Vector */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] font-mono space-y-1">
                  <div className="flex items-center justify-between text-slate-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-[#00A3E0]" /> GPS Kinematics
                    </span>
                    <span className="text-[#002D62] font-bold">{g.speed_kph} km/h</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Lat: {g.latitude.toFixed(5)}°</span>
                    <span>Lng: {g.longitude.toFixed(5)}°</span>
                    <span>Hdg: {g.heading_deg}°</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
