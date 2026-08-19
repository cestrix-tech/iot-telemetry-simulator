/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Terminal, 
  HelpCircle, 
  Code2,
  Radio,
  Server
} from 'lucide-react';
import { SimulatorConfig, LogEntry, TelemetryPayload, SimulatorStats } from './types';
import { VirtualMachine } from './services/simulatorEngine';
import { ControlPanel } from './components/ControlPanel';
import { TerminalView } from './components/TerminalView';
import { FleetMonitor } from './components/FleetMonitor';
import { CodeExporter } from './components/CodeExporter';
import { SchemaDocumentation } from './components/SchemaDocumentation';

export default function App() {
  const [config, setConfig] = useState<SimulatorConfig>({
    fleetSize: 5,
    intervalMs: 1000,
    outputFormat: 'json',
    anomalyRate: 0.05,
    mqttBroker: '',
    mqttTopic: 'cestrix/telemetry/v1',
    baseLat: 37.7749,
    baseLng: -122.4194,
    siteRadiusKm: 5.0,
  });

  const [activeTab, setActiveTab] = useState<'terminal' | 'fleet' | 'code' | 'schema'>('terminal');
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [latestPayloads, setLatestPayloads] = useState<Record<string, TelemetryPayload>>({});
  
  const [stats, setStats] = useState<SimulatorStats>({
    totalMessages: 0,
    totalBytes: 0,
    startTime: Date.now(),
    messagesPerSecond: 0,
    kbPerSecond: 0,
    activeAnomalies: 0,
  });

  const fleetRef = useRef<VirtualMachine[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const injectAnomalyNextTick = useRef<boolean>(false);
  const startTimeRef = useRef<number>(Date.now());
  const messagesCountRef = useRef<number>(0);
  const bytesCountRef = useRef<number>(0);

  // Initialize or update virtual fleet whenever fleetSize changes
  useEffect(() => {
    const newFleet: VirtualMachine[] = [];
    for (let i = 0; i < config.fleetSize; i++) {
      newFleet.push(new VirtualMachine(i, config));
    }
    fleetRef.current = newFleet;
  }, [config.fleetSize, config.baseLat, config.baseLng, config.siteRadiusKm]);

  // Telemetry Simulation Tick Loop
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const tick = () => {
      const isAnomaly = injectAnomalyNextTick.current || Math.random() < config.anomalyRate;
      injectAnomalyNextTick.current = false;

      const newEntries: LogEntry[] = [];
      const newLatest: Record<string, TelemetryPayload> = {};
      let anomalyCount = 0;

      const dt = config.intervalMs / 1000;

      fleetRef.current.forEach((machine) => {
        const payload = machine.tick(dt, isAnomaly);
        newLatest[payload.machine_id] = payload;
        
        if (payload.diagnostic_alarms.length > 0 || payload.equipment_metadata.status !== 'OPERATIONAL') {
          anomalyCount++;
        }

        const rawJson = JSON.stringify(payload);
        const byteLen = new Blob([rawJson]).size;
        bytesCountRef.current += byteLen;
        messagesCountRef.current += 1;

        newEntries.push({
          id: `${payload.machine_id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: payload.timestamp,
          machineId: payload.machine_id,
          text: rawJson,
          payload,
          rawJson,
          isAnomaly: payload.diagnostic_alarms.length > 0,
          status: payload.equipment_metadata.status,
        });
      });

      setLatestPayloads((prev) => ({ ...prev, ...newLatest }));

      setLogs((prev) => {
        const combined = [...prev, ...newEntries];
        return combined.slice(-200);
      });

      const elapsedSec = Math.max(0.1, (Date.now() - startTimeRef.current) / 1000);
      setStats({
        totalMessages: messagesCountRef.current,
        totalBytes: bytesCountRef.current,
        startTime: startTimeRef.current,
        messagesPerSecond: messagesCountRef.current / elapsedSec,
        kbPerSecond: (bytesCountRef.current / 1024) / elapsedSec,
        activeAnomalies: anomalyCount,
      });

      timerRef.current = setTimeout(tick, config.intervalMs);
    };

    timerRef.current = setTimeout(tick, config.intervalMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, config.intervalMs, config.anomalyRate]);

  const handleConfigChange = (newValues: Partial<SimulatorConfig>) => {
    setConfig((prev) => ({ ...prev, ...newValues }));
  };

  const handleToggleRunning = () => {
    setIsRunning((prev) => !prev);
  };

  const handleInjectAnomaly = () => {
    injectAnomalyNextTick.current = true;
  };

  const handleReset = () => {
    messagesCountRef.current = 0;
    bytesCountRef.current = 0;
    startTimeRef.current = Date.now();
    setLogs([]);
    const newFleet: VirtualMachine[] = [];
    for (let i = 0; i < config.fleetSize; i++) {
      newFleet.push(new VirtualMachine(i, config));
    }
    fleetRef.current = newFleet;
    setStats({
      totalMessages: 0,
      totalBytes: 0,
      startTime: Date.now(),
      messagesPerSecond: 0,
      kbPerSecond: 0,
      activeAnomalies: 0,
    });
  };

  return (
    <div id="cestrix-app-root" className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans antialiased selection:bg-[#00A3E0] selection:text-white">
      {/* Header Section */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#002D62] flex items-center justify-center text-white font-bold shadow-xs">
              <Radio className="w-5 h-5 text-[#00A3E0]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-extrabold tracking-tight text-[#002D62]">
                  CESTRIX <span className="text-[#00A3E0] font-mono text-sm font-semibold">v3.4.0-ESM</span>
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Industrial Fleet IoT Telemetry Engine & CLI
              </p>
            </div>
          </div>

          {/* Action Buttons on the Right */}
          <div className="flex items-center space-x-2">
            <button
              id="nav-live-terminal"
              onClick={() => setActiveTab('terminal')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold font-mono flex items-center gap-1.5 transition-all ${
                activeTab === 'terminal'
                  ? 'bg-[#002D62] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-[#002D62]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Live Terminal</span>
            </button>

            <button
              id="nav-fleet-gauges"
              onClick={() => setActiveTab('fleet')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold font-mono flex items-center gap-1.5 transition-all ${
                activeTab === 'fleet'
                  ? 'bg-[#002D62] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-[#002D62]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Fleet Gauges</span>
            </button>

            <button
              id="nav-export-codebase"
              onClick={() => setActiveTab('code')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold font-mono flex items-center gap-1.5 transition-all ${
                activeTab === 'code'
                  ? 'bg-[#002D62] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-[#002D62]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Codebase</span>
            </button>

            <button
              id="nav-spec-docs"
              onClick={() => setActiveTab('schema')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold font-mono flex items-center gap-1.5 transition-all ${
                activeTab === 'schema'
                  ? 'bg-[#002D62] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-[#002D62]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Spec Docs</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Controls Section */}
        <ControlPanel
          config={config}
          onChangeConfig={handleConfigChange}
          isRunning={isRunning}
          onToggleRunning={handleToggleRunning}
          onInjectAnomaly={handleInjectAnomaly}
          onReset={handleReset}
          stats={stats}
        />

        {/* Dynamic Main View */}
        {activeTab === 'terminal' && (
          <div className="space-y-4">
            <TerminalView
              logs={logs}
              format={config.outputFormat}
              onClearLogs={() => setLogs([])}
              isStreaming={isRunning}
            />
          </div>
        )}

        {activeTab === 'fleet' && (
          <div className="space-y-4">
            <FleetMonitor latestPayloads={latestPayloads} />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-4">
            <CodeExporter currentConfig={config} />
          </div>
        )}

        {activeTab === 'schema' && (
          <div className="space-y-4">
            <SchemaDocumentation />
          </div>
        )}
      </main>

      {/* Corporate Light Footer */}
      <footer className="bg-white border-t border-slate-200 py-3.5 px-4 text-xs font-mono text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[#002D62] font-semibold">CESTRIX Industrial Fleet Telemetry Engine</span>
            <span className="text-slate-400">•</span>
            <span>Pure Node.js ES Modules</span>
          </div>
          <div className="text-slate-500 text-[11px]">
            WGS84 Kinematics • Stochastic RPM Dynamics • Zero Runtime Dependencies
          </div>
        </div>
      </footer>
    </div>
  );
}
