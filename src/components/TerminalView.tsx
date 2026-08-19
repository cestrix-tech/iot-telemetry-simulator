import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Copy, Check, Trash2, ArrowDownCircle, Search, Filter } from 'lucide-react';
import { LogEntry, OutputFormat, TelemetryPayload } from '../types';

interface TerminalViewProps {
  logs: LogEntry[];
  format: OutputFormat;
  onClearLogs: () => void;
  isStreaming: boolean;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  logs,
  format,
  onClearLogs,
  isStreaming,
}) => {
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMachine, setFilterMachine] = useState<string>('ALL');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const machineIds = Array.from(new Set(logs.map((l) => l.machineId)));

  const filteredLogs = logs.filter((log) => {
    if (filterMachine !== 'ALL' && log.machineId !== filterMachine) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.machineId.toLowerCase().includes(term) ||
      log.rawJson.toLowerCase().includes(term) ||
      log.status.toLowerCase().includes(term)
    );
  });

  const handleCopyAll = () => {
    const rawContent = filteredLogs.map((l) => l.rawJson).join('\n');
    navigator.clipboard.writeText(rawContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Soft syntax highlighter for Light Mode telemetry JSON
  const renderSyntaxHighlightedJson = (payload: TelemetryPayload) => {
    return (
      <div className="text-slate-700 font-mono text-[12px] leading-relaxed break-all">
        <span className="text-slate-400">{'{'}</span>
        <div className="pl-4">
          <div>
            <span className="text-[#002D62] font-semibold">"machine_id"</span>
            <span className="text-slate-400">: </span>
            <span className="text-[#047857]">"{payload.machine_id}"</span>
            <span className="text-slate-400">,</span>
          </div>
          <div>
            <span className="text-[#002D62] font-semibold">"timestamp"</span>
            <span className="text-slate-400">: </span>
            <span className="text-[#047857]">"{payload.timestamp}"</span>
            <span className="text-slate-400">,</span>
          </div>
          <div>
            <span className="text-[#002D62] font-semibold">"equipment_metadata"</span>
            <span className="text-slate-400">: {'{'} </span>
            <span className="text-[#002D62] font-semibold">"model"</span>
            <span className="text-slate-400">: </span>
            <span className="text-[#047857]">"{payload.equipment_metadata.model}"</span>
            <span className="text-slate-400">, </span>
            <span className="text-[#002D62] font-semibold">"status"</span>
            <span className="text-slate-400">: </span>
            <span className={payload.equipment_metadata.status === 'CRITICAL' ? 'text-rose-600 font-bold' : payload.equipment_metadata.status === 'WARNING' ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
              "{payload.equipment_metadata.status}"
            </span>
            <span className="text-slate-400"> {'}'},</span>
          </div>
          <div>
            <span className="text-[#002D62] font-semibold">"metrics"</span>
            <span className="text-slate-400">: {'{'} </span>
            <span className="text-[#002D62] font-semibold">"engine_rpm"</span>
            <span className="text-slate-400">: </span>
            <span className="text-[#C2410C] font-semibold">{payload.metrics.engine_rpm}</span>
            <span className="text-slate-400">, </span>
            <span className="text-[#002D62] font-semibold">"engine_temperature_c"</span>
            <span className="text-slate-400">: </span>
            <span className="text-[#C2410C]">{payload.metrics.engine_temperature_c}</span>
            <span className="text-slate-400">, </span>
            <span className="text-[#002D62] font-semibold">"fuel_level_percent"</span>
            <span className="text-slate-400">: </span>
            <span className="text-[#C2410C]">{payload.metrics.fuel_level_percent}</span>
            <span className="text-slate-400">, </span>
            <span className="text-[#002D62] font-semibold">"oil_pressure_kpa"</span>
            <span className="text-slate-400">: </span>
            <span className="text-[#C2410C]">{payload.metrics.oil_pressure_kpa}</span>
            <span className="text-slate-400"> {'}'},</span>
          </div>
          <div>
            <span className="text-[#002D62] font-semibold">"gps"</span>
            <span className="text-slate-400">: {'{'} </span>
            <span className="text-[#002D62] font-semibold">"latitude"</span>
            <span className="text-slate-400">: </span>
            <span className="text-[#00A3E0] font-medium">{payload.gps.latitude}</span>
            <span className="text-slate-400">, </span>
            <span className="text-[#002D62] font-semibold">"longitude"</span>
            <span className="text-slate-400">: </span>
            <span className="text-[#00A3E0] font-medium">{payload.gps.longitude}</span>
            <span className="text-slate-400">, </span>
            <span className="text-[#002D62] font-semibold">"speed_kph"</span>
            <span className="text-slate-400">: </span>
            <span className="text-[#C2410C]">{payload.gps.speed_kph}</span>
            <span className="text-slate-400"> {'}'}</span>
          </div>
        </div>
        <span className="text-slate-400">{'}'}</span>
      </div>
    );
  };

  return (
    <div id="terminal-view-container" className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col h-[560px]">
      {/* Light Theme Mac-Style Terminal Title Bar */}
      <div className="bg-slate-100/90 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center space-x-3">
          {/* Mac-style Window Controls */}
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
          </div>
          
          <div className="flex items-center space-x-2 pl-3 border-l border-slate-300">
            <Terminal className="w-4 h-4 text-[#002D62]" />
            <span className="text-xs font-mono font-semibold text-[#002D62]">
              stdout: node index.js --format={format}
            </span>
          </div>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex items-center space-x-2 text-xs">
          {/* Machine Filter Dropdown */}
          <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-300 shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterMachine}
              onChange={(e) => setFilterMachine(e.target.value)}
              className="bg-transparent text-slate-700 font-mono text-[11px] outline-none cursor-pointer font-medium"
            >
              <option value="ALL">All Machines</option>
              {machineIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Search packet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white text-slate-800 text-[11px] font-mono pl-7 pr-2.5 py-1 rounded-md border border-slate-300 focus:border-[#00A3E0] focus:ring-1 focus:ring-[#00A3E0] outline-none w-32 sm:w-40 shadow-2xs"
            />
          </div>

          {/* Auto Scroll Toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded-md transition-colors border ${
              autoScroll 
                ? 'bg-sky-50 text-[#00A3E0] border-sky-200' 
                : 'text-slate-600 bg-white border-slate-300 hover:bg-slate-50'
            }`}
            title="Toggle Auto-Scroll"
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
          </button>

          {/* Copy */}
          <button
            onClick={handleCopyAll}
            className="p-1.5 rounded-md text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 hover:text-[#002D62] transition-colors"
            title="Copy Output Stream"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Clear */}
          <button
            onClick={onClearLogs}
            className="p-1.5 rounded-md text-slate-600 bg-white border border-slate-300 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
            title="Clear Terminal Buffer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal View Output Buffer (Light Mode with Soft Syntax Highlighting) */}
      <div className="flex-1 p-4 font-mono text-[12px] leading-relaxed overflow-y-auto bg-slate-50/70 select-text scrollbar-thin scrollbar-thumb-slate-300">
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Terminal className="w-8 h-8 opacity-40 text-slate-400" />
            <p className="text-xs font-medium text-slate-500">No telemetry frames in buffer.</p>
            <p className="text-[11px] text-slate-400">Start the simulator to stream live machine IoT packets.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded-lg border transition-all ${
                  log.isAnomaly 
                    ? 'bg-rose-50/80 border-rose-200 shadow-2xs' 
                    : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                }`}
              >
                {format === 'pretty' ? (
                  <div className="text-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
                      <span className="text-slate-500 font-mono">[{log.timestamp.substring(11, 23)}]</span>
                      <span className="text-[#002D62] font-bold">{log.machineId}</span>
                      <span className="text-slate-500 text-[11px]">({log.payload.equipment_metadata.model})</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                          log.status === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-700 border-rose-200'
                            : log.status === 'WARNING'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <div className="text-slate-600 text-[11px] pt-1">
                      RPM: <span className="text-[#002D62] font-bold">{log.payload.metrics.engine_rpm}</span> | Temp:{' '}
                      <span className="text-[#C2410C] font-semibold">{log.payload.metrics.engine_temperature_c}°C</span> | Fuel:{' '}
                      <span className="text-[#002D62] font-semibold">{log.payload.metrics.fuel_level_percent}%</span> | Oil:{' '}
                      <span className="text-slate-700">{log.payload.metrics.oil_pressure_kpa} kPa</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      GPS: {log.payload.gps.latitude}°, {log.payload.gps.longitude}° | Speed: {log.payload.gps.speed_kph} km/h | Heading: {log.payload.gps.heading_deg}°
                    </div>
                    {log.payload.diagnostic_alarms.length > 0 && (
                      <div className="text-rose-600 text-[11px] font-semibold pt-1">
                        ALARMS: {log.payload.diagnostic_alarms.join(', ')}
                      </div>
                    )}
                  </div>
                ) : format === 'compact' ? (
                  <div className="text-slate-800 text-[12px] flex items-center justify-between flex-wrap gap-2">
                    <span className="text-slate-500">{log.timestamp.substring(11, 23)}</span>
                    <span className="text-[#002D62] font-bold">[{log.machineId}]</span>
                    <span className="text-[#047857] font-semibold">RPM:{log.payload.metrics.engine_rpm}</span>
                    <span className="text-[#C2410C] font-semibold">TMP:{log.payload.metrics.engine_temperature_c}°C</span>
                    <span className="text-[#002D62] font-semibold">FUEL:{log.payload.metrics.fuel_level_percent}%</span>
                    <span className="text-slate-600">GPS:{log.payload.gps.latitude.toFixed(4)},{log.payload.gps.longitude.toFixed(4)}</span>
                    <span
                      className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                        log.status === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : log.status === 'WARNING' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      ST:{log.status[0]}
                    </span>
                  </div>
                ) : (
                  // Default High-Craft Light Mode Syntax Highlighted JSON
                  renderSyntaxHighlightedJson(log.payload)
                )}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        )}
      </div>

      {/* Terminal Footer Bar (Light Mode with Blinking Green Dot) */}
      <div className="bg-white px-4 py-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-600">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-2 font-semibold">
            <span className="relative flex h-2.5 w-2.5">
              {isStreaming && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isStreaming ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            </span>
            <span className={isStreaming ? 'text-emerald-700 tracking-wider' : 'text-slate-500'}>
              {isStreaming ? 'STREAMING ACTIVE...' : 'STREAMING PAUSED'}
            </span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 font-normal">Buffer: {filteredLogs.length} frames</span>
        </div>
        <div className="text-slate-500 hidden sm:block">
          POSIX NDJSON / stdout telemetry stream
        </div>
      </div>
    </div>
  );
};
