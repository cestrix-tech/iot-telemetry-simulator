import React from 'react';
import { Play, Pause, AlertTriangle, RefreshCw, Activity, Radio, Cpu, Settings2, BarChart2, Layers } from 'lucide-react';
import { SimulatorConfig, OutputFormat, SimulatorStats } from '../types';

interface ControlPanelProps {
  config: SimulatorConfig;
  onChangeConfig: (newConfig: Partial<SimulatorConfig>) => void;
  isRunning: boolean;
  onToggleRunning: () => void;
  onInjectAnomaly: () => void;
  onReset: () => void;
  stats: SimulatorStats;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  config,
  onChangeConfig,
  isRunning,
  onToggleRunning,
  onInjectAnomaly,
  onReset,
  stats,
}) => {
  const handlePreset = (fleetSize: number, intervalMs: number, format: OutputFormat, anomalyRate: number) => {
    onChangeConfig({
      fleetSize,
      intervalMs,
      outputFormat: format,
      anomalyRate,
    });
  };

  return (
    <div id="simulator-control-panel" className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-slate-800 space-y-5">
      {/* Header & Primary Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-lg text-[#002D62]">
            <Cpu className="w-5 h-5 text-[#00A3E0]" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-[#002D62] flex items-center gap-2">
              Simulator Control Matrix
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border ${
                isRunning 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                {isRunning ? 'TRANSMITTING' : 'IDLE'}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Deterministic & stochastic heavy machinery telemetry generation
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-simulation"
            onClick={onToggleRunning}
            className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono tracking-wider flex items-center gap-2 transition-all shadow-xs ${
              isRunning
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-[#002D62] hover:bg-[#001f44] text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" /> Pause Feed
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-[#00A3E0]" /> Start Simulator
              </>
            )}
          </button>

          <button
            id="btn-inject-anomaly"
            onClick={onInjectAnomaly}
            title="Inject over-rev thermal fault anomaly on next cycle"
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Inject Fault</span>
          </button>

          <button
            id="btn-reset-simulator"
            onClick={onReset}
            title="Reset telemetry counters and reinitialize fleet"
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip (Light Corporate Theme) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">Throughput</div>
          <div className="text-xl font-bold font-mono text-[#002D62] mt-0.5">
            {stats.messagesPerSecond.toFixed(1)} <span className="text-xs text-slate-500 font-normal">msg/s</span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">Frames Emitted</div>
          <div className="text-xl font-bold font-mono text-[#002D62] mt-0.5">
            {stats.totalMessages.toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">Total Bandwidth</div>
          <div className="text-xl font-bold font-mono text-[#00A3E0] mt-0.5">
            {(stats.totalBytes / 1024).toFixed(1)} <span className="text-xs text-slate-500 font-normal">KB</span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">Active Alarms</div>
          <div className={`text-xl font-bold font-mono mt-0.5 ${stats.activeAnomalies > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {stats.activeAnomalies} <span className="text-xs text-slate-500 font-normal">units</span>
          </div>
        </div>
      </div>

      {/* Primary Interactive Controls (Format Toggle Group & Fleet Profile Chips) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
        {/* Toggle Group for Data Format */}
        <div className="space-y-2">
          <label className="text-xs text-[#002D62] font-bold flex items-center gap-1.5 uppercase tracking-wide">
            <Settings2 className="w-3.5 h-3.5 text-[#00A3E0]" />
            Data Format Toggle Group (<code className="text-[#00A3E0] font-mono lowercase">--format</code>)
          </label>
          <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {(['json', 'ndjson', 'pretty', 'compact'] as OutputFormat[]).map((fmt) => (
              <button
                key={fmt}
                id={`btn-format-${fmt}`}
                type="button"
                onClick={() => onChangeConfig({ outputFormat: fmt })}
                className={`py-1.5 px-2 rounded-md text-xs font-mono uppercase tracking-wider transition-all font-semibold ${
                  config.outputFormat === fmt
                    ? 'bg-white text-[#002D62] shadow-xs border border-slate-200 font-bold'
                    : 'text-slate-600 hover:text-[#002D62]'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Fleet Profiles Selector Chips */}
        <div className="space-y-2">
          <label className="text-xs text-[#002D62] font-bold flex items-center gap-1.5 uppercase tracking-wide">
            <Layers className="w-3.5 h-3.5 text-[#00A3E0]" />
            Fleet Profiles
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => handlePreset(5, 1000, 'json', 0.05)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                config.fleetSize === 5 && config.intervalMs === 1000
                  ? 'bg-[#002D62] text-white border-[#002D62] shadow-2xs font-semibold'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              Standard Haul (5 units)
            </button>
            <button
              onClick={() => handlePreset(12, 500, 'compact', 0.02)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                config.fleetSize === 12 && config.intervalMs === 500
                  ? 'bg-[#002D62] text-white border-[#002D62] shadow-2xs font-semibold'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              High Density (12 units)
            </button>
            <button
              onClick={() => handlePreset(20, 250, 'ndjson', 0.08)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                config.fleetSize === 20
                  ? 'bg-[#002D62] text-white border-[#002D62] shadow-2xs font-semibold'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              Mining Fleet (20 units)
            </button>
          </div>
        </div>

        {/* Fleet Size Range Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-700 font-semibold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#00A3E0]" />
              Active Fleet Size (<code className="text-[#002D62] font-mono font-bold">--fleet</code>)
            </span>
            <span className="font-mono text-[#002D62] font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {config.fleetSize} Machines
            </span>
          </div>
          <input
            id="input-fleet-size"
            type="range"
            min="1"
            max="30"
            step="1"
            value={config.fleetSize}
            onChange={(e) => onChangeConfig({ fleetSize: parseInt(e.target.value, 10) })}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#002D62]"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>1 unit</span>
            <span>15 units</span>
            <span>30 units</span>
          </div>
        </div>

        {/* Interval Range Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-700 font-semibold flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#00A3E0]" />
              Tick Interval (<code className="text-[#002D62] font-mono font-bold">--interval</code>)
            </span>
            <span className="font-mono text-[#002D62] font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {config.intervalMs} ms
            </span>
          </div>
          <input
            id="input-interval-ms"
            type="range"
            min="100"
            max="3000"
            step="50"
            value={config.intervalMs}
            onChange={(e) => onChangeConfig({ intervalMs: parseInt(e.target.value, 10) })}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#002D62]"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>100ms (10Hz)</span>
            <span>1000ms (1Hz)</span>
            <span>3000ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};
