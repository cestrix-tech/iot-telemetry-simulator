import React from 'react';
import { Database, ShieldCheck, Cpu, MapPin, Gauge } from 'lucide-react';

export const SchemaDocumentation: React.FC = () => {
  return (
    <div id="schema-documentation" className="bg-white border border-slate-200 rounded-xl p-5 space-y-6 text-slate-800 shadow-xs">
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
        <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-lg text-[#002D62]">
          <Database className="w-5 h-5 text-[#00A3E0]" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#002D62]">
            Cestrix Telemetry Payload Specification (v1.2)
          </h3>
          <p className="text-xs text-slate-500 font-mono">
            RFC 3339 / ISO 8601 High-Precision Industrial IoT Telemetry Standard
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        {/* Core Identifiers & Metadata */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
          <div className="text-[#002D62] font-bold flex items-center gap-1.5 pb-1 border-b border-slate-200">
            <Cpu className="w-3.5 h-3.5 text-[#00A3E0]" /> 1. Asset Metadata & Identification
          </div>
          <ul className="space-y-1.5 text-slate-700">
            <li>
              <span className="text-slate-500 font-semibold">machine_id:</span> String (e.g., <code className="text-[#002D62] font-bold">"CTX-TRK-101"</code>)
            </li>
            <li>
              <span className="text-slate-500 font-semibold">timestamp:</span> ISO 8601 UTC timestamp (<code className="text-indigo-700 font-medium">"2026-08-19T09:41:00.000Z"</code>)
            </li>
            <li>
              <span className="text-slate-500 font-semibold">equipment_metadata.model:</span> Vehicle classification (<code className="text-slate-800">"Haul Truck 797F"</code>)
            </li>
            <li>
              <span className="text-slate-500 font-semibold">equipment_metadata.status:</span> Enum: <span className="text-emerald-700 font-bold">OPERATIONAL</span> | <span className="text-amber-700 font-bold">WARNING</span> | <span className="text-rose-700 font-bold">CRITICAL</span>
            </li>
          </ul>
        </div>

        {/* Engine Dynamics & Metrics */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
          <div className="text-[#002D62] font-bold flex items-center gap-1.5 pb-1 border-b border-slate-200">
            <Gauge className="w-3.5 h-3.5 text-[#C2410C]" /> 2. Powertrain & Mechanical Metrics
          </div>
          <ul className="space-y-1.5 text-slate-700">
            <li>
              <span className="text-slate-500 font-semibold">metrics.engine_rpm:</span> Integer (<code className="text-[#002D62] font-bold">1000 - 3000 RPM</code> nominal, redline 3650)
            </li>
            <li>
              <span className="text-slate-500 font-semibold">metrics.engine_temperature_c:</span> Float Celsius (<code className="text-[#C2410C] font-semibold">75.0 - 118.0 °C</code>)
            </li>
            <li>
              <span className="text-slate-500 font-semibold">metrics.fuel_level_percent:</span> Float percentage (<code className="text-[#002D62] font-bold">0.00 - 100.00%</code>)
            </li>
            <li>
              <span className="text-slate-500 font-semibold">metrics.oil_pressure_kpa:</span> Float (<code className="text-slate-800">250.0 - 450.0 kPa</code>)
            </li>
          </ul>
        </div>

        {/* Kinematics & Geodesic Positioning */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
          <div className="text-[#002D62] font-bold flex items-center gap-1.5 pb-1 border-b border-slate-200">
            <MapPin className="w-3.5 h-3.5 text-[#00A3E0]" /> 3. Geodesic Positioning & Kinematics
          </div>
          <ul className="space-y-1.5 text-slate-700">
            <li>
              <span className="text-slate-500 font-semibold">gps.latitude:</span> Float WGS84 (<code className="text-[#00A3E0] font-bold">±90.000000°</code> 6-decimal precision)
            </li>
            <li>
              <span className="text-slate-500 font-semibold">gps.longitude:</span> Float WGS84 (<code className="text-[#00A3E0] font-bold">±180.000000°</code>)
            </li>
            <li>
              <span className="text-slate-500 font-semibold">gps.speed_kph:</span> Ground velocity (<code className="text-slate-800 font-medium">0.0 - 65.0 km/h</code>)
            </li>
          </ul>
        </div>

        {/* Diagnostics & Alarms */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
          <div className="text-[#002D62] font-bold flex items-center gap-1.5 pb-1 border-b border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600" /> 4. Diagnostic Alarm Codes
          </div>
          <ul className="space-y-1.5 text-slate-700">
            <li><code className="text-rose-700 font-semibold">ALM_ENGINE_OVER_RPM</code>: RPM exceeds safe nominal boundary</li>
            <li><code className="text-rose-700 font-semibold">ALM_COOLANT_OVERTEMP</code>: Thermal spike exceeding 108°C</li>
            <li><code className="text-amber-700 font-semibold">ALM_LOW_FUEL_RESERVE</code>: Fuel reserves lower than 15.0%</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
