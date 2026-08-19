import React, { useState } from 'react';
import { Copy, Check, FileCode, Terminal, Download, FileText, ChevronRight } from 'lucide-react';
import { SimulatorConfig } from '../types';

interface CodeExporterProps {
  currentConfig: SimulatorConfig;
}

export const CodeExporter: React.FC<CodeExporterProps> = ({ currentConfig }) => {
  const [activeTab, setActiveTab] = useState<'index' | 'package' | 'cli'>('index');
  const [copied, setCopied] = useState<string | null>(null);

  const packageJsonContent = `{
  "name": "cestrix-telemetry-simulator",
  "version": "3.4.0",
  "description": "Enterprise-grade high-throughput IoT telemetry generator and physics simulation engine for heavy industrial machinery.",
  "type": "module",
  "bin": {
    "cestrix-telemetry": "./index.js"
  },
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "simulate": "node index.js --fleet=5 --interval=1000",
    "simulate:dense": "node index.js --fleet=20 --interval=250 --format=compact",
    "simulate:pretty": "node index.js --fleet=5 --interval=1000 --format=pretty",
    "simulate:ndjson": "node index.js --fleet=10 --interval=500 --format=ndjson",
    "simulate:stress": "node index.js --fleet=50 --interval=100 --anomaly-rate=0.15"
  },
  "keywords": [
    "iot",
    "telemetry",
    "industrial",
    "simulator",
    "mqtt",
    "fleet-management",
    "heavy-machinery"
  ],
  "author": "Cestrix Deep-Tech Telemetry Systems Group",
  "license": "Apache-2.0",
  "optionalDependencies": {
    "mqtt": "^5.10.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}`;

  const generatedCliCommand = `node index.js --fleet=${currentConfig.fleetSize} --interval=${currentConfig.intervalMs} --format=${currentConfig.outputFormat} --anomaly-rate=${currentConfig.anomalyRate}${
    currentConfig.mqttBroker ? ` --mqtt=${currentConfig.mqttBroker} --topic=${currentConfig.mqttTopic}` : ''
  }`;

  const handleCopy = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="code-exporter" className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* Tab Navigation Header (Light Corporate) */}
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <FileCode className="w-5 h-5 text-[#002D62]" />
          <h3 className="text-sm font-bold text-[#002D62]">
            Enterprise CLI Codebase Exporter
          </h3>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setActiveTab('index')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'index'
                ? 'bg-[#002D62] text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            index.js (Pure ESM Engine)
          </button>
          <button
            onClick={() => setActiveTab('package')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'package'
                ? 'bg-[#002D62] text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            package.json
          </button>
          <button
            onClick={() => setActiveTab('cli')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'cli'
                ? 'bg-[#002D62] text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            CLI Recipes
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="p-4 bg-white">
        {activeTab === 'index' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-mono flex items-center gap-1.5 font-semibold text-[#002D62]">
                <FileCode className="w-4 h-4 text-[#00A3E0]" />
                index.js • Complete Pure Node.js ES Modules Source
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopy('index', indexJsFullCode)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#002D62] rounded-md font-mono text-xs flex items-center gap-1.5 border border-slate-300 font-semibold transition-colors"
                >
                  {copied === 'index' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy index.js
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDownload('index.js', indexJsFullCode)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-[#002D62] rounded-md border border-slate-300 transition-colors"
                  title="Download index.js"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <pre className="p-4 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs text-slate-800 overflow-x-auto max-h-96 leading-relaxed select-text scrollbar-thin scrollbar-thumb-slate-300">
              <code>{indexJsFullCode}</code>
            </pre>
          </div>
        )}

        {activeTab === 'package' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-mono flex items-center gap-1.5 font-semibold text-[#002D62]">
                <FileText className="w-4 h-4 text-emerald-600" />
                package.json • Metadata and executable start scripts
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopy('package', packageJsonContent)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#002D62] rounded-md font-mono text-xs flex items-center gap-1.5 border border-slate-300 font-semibold transition-colors"
                >
                  {copied === 'package' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy package.json
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDownload('package.json', packageJsonContent)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-[#002D62] rounded-md border border-slate-300 transition-colors"
                  title="Download package.json"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <pre className="p-4 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs text-slate-800 overflow-x-auto leading-relaxed select-text">
              <code>{packageJsonContent}</code>
            </pre>
          </div>
        )}

        {activeTab === 'cli' && (
          <div className="space-y-5 text-slate-700">
            {/* Live Command Builder */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#002D62] font-bold flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-[#00A3E0]" /> Dynamic CLI Invocations (Synced with UI Parameters)
                </span>
                <button
                  onClick={() => handleCopy('cli-live', generatedCliCommand)}
                  className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-[#002D62] rounded-md font-mono text-xs border border-sky-200 font-semibold transition-colors flex items-center gap-1"
                >
                  {copied === 'cli-live' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  Copy Command
                </button>
              </div>
              <pre className="bg-white p-3 rounded font-mono text-xs text-emerald-700 overflow-x-auto border border-slate-200 font-semibold">
                <code>{generatedCliCommand}</code>
              </pre>
            </div>

            {/* Industrial Production Recipes */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#002D62] font-mono">
                Standard Execution Recipes
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                  <div className="text-[#002D62] font-bold flex items-center gap-1">
                    <ChevronRight className="w-3.5 h-3.5 text-[#00A3E0]" /> 1. Standard Haul Fleet Simulation
                  </div>
                  <div className="text-slate-500 text-[11px]">Streams 5 machines every 1000ms with standard JSON output.</div>
                  <pre className="bg-white p-2 rounded text-slate-800 border border-slate-200 text-[11px] overflow-x-auto">
                    <code>node index.js --fleet=5 --interval=1000</code>
                  </pre>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                  <div className="text-[#002D62] font-bold flex items-center gap-1">
                    <ChevronRight className="w-3.5 h-3.5 text-[#00A3E0]" /> 2. High-Density Pipeline (NDJSON)
                  </div>
                  <div className="text-slate-500 text-[11px]">Stream directly to log collector (Vector, Fluentd, Kafka).</div>
                  <pre className="bg-white p-2 rounded text-slate-800 border border-slate-200 text-[11px] overflow-x-auto">
                    <code>node index.js --fleet=25 --interval=250 --format=ndjson &gt; fleet.log</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const indexJsFullCode = `/**
 * ============================================================================
 * CESTRIX INDUSTRIAL TELEMETRY SIMULATOR
 * System Version : 3.4.0-enterprise
 * Architecture   : Event-Driven Asynchronous Node.js Telemetry Engine (ESM)
 * Maintainer     : Cestrix Deep-Tech Telemetry & IoT Infrastructure Group
 * ============================================================================
 */

import { EventEmitter } from 'node:events';
import { performance } from 'node:perf_hooks';
import process from 'node:process';
import os from 'node:os';

const DEFAULT_CONFIG = {
  fleetSize: 5,
  intervalMs: 1000,
  durationSec: 0,
  outputFormat: 'json',
  mqttBroker: null,
  mqttTopic: 'cestrix/telemetry/v1',
  anomalyRate: 0.05,
  baseLat: 37.7749,
  baseLng: -122.4194,
  siteRadiusKm: 5.0,
  verbose: false,
};

const MACHINE_ARCHETYPES = [
  { prefix: 'CTX-TRK', type: 'Haul Truck 797F', nominalRpm: 1750, maxRpm: 3200, baseTemp: 88, fuelBurnRate: 0.08 },
  { prefix: 'CTX-EXC', type: 'Hydraulic Excavator 6020B', nominalRpm: 1900, maxRpm: 2800, baseTemp: 84, fuelBurnRate: 0.06 },
  { prefix: 'CTX-LDR', type: 'Wheel Loader 994K', nominalRpm: 1600, maxRpm: 2600, baseTemp: 80, fuelBurnRate: 0.05 },
  { prefix: 'CTX-DZR', type: 'Track-Type Tractor D11', nominalRpm: 1800, maxRpm: 3000, baseTemp: 92, fuelBurnRate: 0.09 },
  { prefix: 'CTX-DRL', type: 'Rotary Blasthole Drill MD6310', nominalRpm: 2100, maxRpm: 3400, baseTemp: 86, fuelBurnRate: 0.07 },
];

export function parseArguments(argv = process.argv.slice(2)) {
  const config = { ...DEFAULT_CONFIG };
  const rawArgs = [...argv];

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];

    if (arg === '--help' || arg === '-h') {
      printHelpAndExit();
    }

    if (arg === '--version' || arg === '-v') {
      console.log('Cestrix Telemetry Simulator v3.4.0 (node:esm)');
      process.exit(0);
    }

    const keyValueMatch = arg.match(/^--([a-zA-Z0-9_-]+)=(.*)$/);
    if (keyValueMatch) {
      const [, key, value] = keyValueMatch;
      applyConfigParam(config, key, value);
      continue;
    }

    if (arg.startsWith('--') || arg.startsWith('-')) {
      const key = arg.replace(/^-+/, '');
      const nextArg = rawArgs[i + 1];

      if (nextArg && !nextArg.startsWith('-')) {
        applyConfigParam(config, key, nextArg);
        i++;
      } else {
        applyConfigParam(config, key, 'true');
      }
    }
  }

  return validateConfig(config);
}

function applyConfigParam(config, key, value) {
  const normalizedKey = key.toLowerCase().replace(/[-_]/g, '');

  switch (normalizedKey) {
    case 'fleet':
    case 'fleetsize':
    case 'f':
      config.fleetSize = parseInt(value, 10);
      break;
    case 'interval':
    case 'intervalms':
    case 'i':
      config.intervalMs = Math.max(50, parseInt(value, 10));
      break;
    case 'duration':
    case 'durationsec':
    case 'd':
      config.durationSec = parseInt(value, 10);
      break;
    case 'format':
    case 'output':
      if (['json', 'ndjson', 'pretty', 'compact'].includes(value.toLowerCase())) {
        config.outputFormat = value.toLowerCase();
      }
      break;
    case 'mqtt':
    case 'broker':
      config.mqttBroker = value;
      break;
    case 'topic':
      config.mqttTopic = value;
      break;
    case 'anomaly':
    case 'anomalyrate':
      config.anomalyRate = Math.min(1.0, Math.max(0.0, parseFloat(value)));
      break;
  }
}

function validateConfig(config) {
  if (isNaN(config.fleetSize) || config.fleetSize < 1) {
    console.error('[FATAL] Invalid --fleet size. Must be an integer >= 1.');
    process.exit(1);
  }
  if (isNaN(config.intervalMs) || config.intervalMs < 10) {
    console.error('[FATAL] Invalid --interval. Must be >= 10 ms.');
    process.exit(1);
  }
  return config;
}

function printHelpAndExit() {
  console.log(\`
======================================================================
  CESTRIX INDUSTRIAL TELEMETRY SIMULATOR v3.4.0 (Enterprise Engine)
======================================================================

USAGE:
  node index.js [OPTIONS]

OPTIONS:
  --fleet=<number>         Number of machines to simulate (Default: 5)
  --interval=<ms>          Telemetry generation tick in ms (Default: 1000)
  --duration=<sec>         Run duration before exit (Default: 0 = infinite)
  --format=<type>          json | ndjson | pretty | compact (Default: json)
  --mqtt=<url>             MQTT Broker URL (e.g. mqtt://localhost:1883)
  --topic=<string>         MQTT topic (Default: cestrix/telemetry/v1)
  --anomaly-rate=<0-1>     Fault injection probability (Default: 0.05)
  --help, -h               Display help manual
\`);
  process.exit(0);
}

export class IndustrialMachine {
  constructor(index, config) {
    const archetype = MACHINE_ARCHETYPES[index % MACHINE_ARCHETYPES.length];
    const unitNumber = (100 + index + 1).toString().padStart(3, '0');

    this.id = \`\${archetype.prefix}-\${unitNumber}\`;
    this.archetype = archetype;
    this.model = archetype.type;
    this.config = config;

    this.currentRpm = archetype.nominalRpm + (Math.random() * 400 - 200);
    this.engineTemp = archetype.baseTemp + (Math.random() * 6 - 3);
    this.fuelLevelPct = 75 + Math.random() * 24;
    this.oilPressureKpa = 320 + (Math.random() * 40 - 20);
    this.hydraulicPressurePsi = 2850 + (Math.random() * 300 - 150);
    this.coolantLevelPct = 94.0 + (Math.random() * 5.0);
    this.operatingHours = 1240.5 + index * 342.1;
    this.batteryVoltage = 27.8;

    const angle = (Math.PI * 2 * index) / config.fleetSize + Math.random() * 0.5;
    const distanceKm = (Math.random() * config.siteRadiusKm) * 0.8;
    const kmPerDegreeLat = 111.0;
    const kmPerDegreeLng = 111.0 * Math.cos((config.baseLat * Math.PI) / 180);

    this.lat = config.baseLat + (Math.sin(angle) * distanceKm) / kmPerDegreeLat;
    this.lng = config.baseLng + (Math.cos(angle) * distanceKm) / kmPerDegreeLng;
    this.headingDeg = Math.floor(Math.random() * 360);
    this.speedKph = 15.0 + Math.random() * 25.0;
    this.altitudeMeters = 145.0 + (Math.random() * 20.0 - 10.0);
    this.vibrationRms = 1.4;
    this.status = 'OPERATIONAL';
    this.activeAlarms = [];
  }

  tick(dtSeconds = 1.0, injectAnomaly = false) {
    this.operatingHours += (dtSeconds / 3600);
    this.activeAlarms = [];

    if (injectAnomaly) {
      this.currentRpm = Math.min(3650, this.currentRpm + 600 + Math.random() * 400);
      this.activeAlarms.push('ALM_ENGINE_OVER_RPM');
    } else {
      const targetRpm = this.archetype.nominalRpm + Math.sin(Date.now() / 4000) * 350;
      const rpmStep = (targetRpm - this.currentRpm) * 0.15 + (Math.random() * 80 - 40);
      this.currentRpm = Math.max(1000, Math.min(3000, this.currentRpm + rpmStep));
    }

    const loadFactor = (this.currentRpm - 1000) / 2000;
    const targetTemp = this.archetype.baseTemp + loadFactor * 22;
    const tempInertia = (targetTemp - this.engineTemp) * (0.05 * dtSeconds);
    this.engineTemp += tempInertia + (Math.random() * 0.4 - 0.2);

    if (injectAnomaly) {
      this.engineTemp += 8.5;
      this.activeAlarms.push('ALM_COOLANT_OVERTEMP');
    }

    const burn = (this.archetype.fuelBurnRate * (0.5 + loadFactor * 0.8) * dtSeconds) / 60;
    this.fuelLevelPct = Math.max(0.0, this.fuelLevelPct - burn);
    if (this.fuelLevelPct < 15.0) {
      this.activeAlarms.push('ALM_LOW_FUEL_RESERVE');
    }

    this.oilPressureKpa = 280 + (this.currentRpm / 3000) * 140 + (Math.random() * 10 - 5);
    this.hydraulicPressurePsi = 2600 + loadFactor * 600 + (Math.random() * 40 - 20);

    this.headingDeg = (this.headingDeg + (Math.random() * 6 - 3) + 360) % 360;
    const headingRad = (this.headingDeg * Math.PI) / 180;
    const distanceTraveledKm = (this.speedKph * dtSeconds) / 3600;

    const kmPerDegreeLat = 111.0;
    const kmPerDegreeLng = 111.0 * Math.cos((this.lat * Math.PI) / 180);

    this.lat += (Math.cos(headingRad) * distanceTraveledKm) / kmPerDegreeLat;
    this.lng += (Math.sin(headingRad) * distanceTraveledKm) / kmPerDegreeLng;
    this.altitudeMeters += (Math.random() * 0.4 - 0.2);

    this.vibrationRms = 1.0 + (this.currentRpm / 3000) * 1.8 + (injectAnomaly ? 3.5 : Math.random() * 0.3);

    if (this.engineTemp > 108 || this.currentRpm > 3200 || this.vibrationRms > 4.5) {
      this.status = 'CRITICAL';
    } else if (this.engineTemp > 98 || this.fuelLevelPct < 20 || this.activeAlarms.length > 0) {
      this.status = 'WARNING';
    } else {
      this.status = 'OPERATIONAL';
    }

    return {
      machine_id: this.id,
      timestamp: new Date().toISOString(),
      equipment_metadata: {
        model: this.model,
        operating_hours: parseFloat(this.operatingHours.toFixed(2)),
        status: this.status,
      },
      metrics: {
        engine_rpm: Math.round(this.currentRpm),
        engine_temperature_c: parseFloat(this.engineTemp.toFixed(2)),
        fuel_level_percent: parseFloat(this.fuelLevelPct.toFixed(2)),
        oil_pressure_kpa: parseFloat(this.oilPressureKpa.toFixed(1)),
        hydraulic_pressure_psi: Math.round(this.hydraulicPressurePsi),
        coolant_level_percent: parseFloat(this.coolantLevelPct.toFixed(1)),
        battery_voltage: parseFloat(this.batteryVoltage.toFixed(1)),
        vibration_rms_g: parseFloat(this.vibrationRms.toFixed(2)),
      },
      gps: {
        latitude: parseFloat(this.lat.toFixed(6)),
        longitude: parseFloat(this.lng.toFixed(6)),
        altitude_m: parseFloat(this.altitudeMeters.toFixed(1)),
        speed_kph: parseFloat(this.speedKph.toFixed(1)),
        heading_deg: Math.round(this.headingDeg),
      },
      diagnostic_alarms: this.activeAlarms,
    };
  }
}

export class TelemetryEngine extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.fleet = [];
    this.timerId = null;
    this.isRunning = false;
    this.totalMessagesEmitted = 0;
    this.totalBytesEmitted = 0;
    this.startTime = null;
    this.lastTickTime = null;
    this.mqttClient = null;

    this.initializeFleet();
  }

  initializeFleet() {
    this.fleet = [];
    for (let i = 0; i < this.config.fleetSize; i++) {
      this.fleet.push(new IndustrialMachine(i, this.config));
    }
  }

  async start() {
    this.isRunning = true;
    this.startTime = performance.now();
    this.lastTickTime = performance.now();

    const tickHandler = () => {
      if (!this.isRunning) return;
      this.executeTick();
      this.timerId = setTimeout(tickHandler, this.config.intervalMs);
    };

    this.timerId = setTimeout(tickHandler, this.config.intervalMs);
  }

  executeTick() {
    const now = performance.now();
    const dtSeconds = Math.max(0.05, (now - this.lastTickTime) / 1000);
    this.lastTickTime = now;

    for (const machine of this.fleet) {
      const hasAnomaly = Math.random() < this.config.anomalyRate;
      const payload = machine.tick(dtSeconds, hasAnomaly);
      this.dispatchPayload(payload);
    }
  }

  dispatchPayload(payload) {
    this.totalMessagesEmitted++;
    const jsonString = JSON.stringify(payload);
    this.totalBytesEmitted += Buffer.byteLength(jsonString, 'utf8');
    this.emit('telemetry', payload);
    process.stdout.write(jsonString + '\\n');
  }

  stop() {
    this.isRunning = false;
    clearTimeout(this.timerId);
    this.emit('stopped');
  }
}

export async function main() {
  const config = parseArguments(process.argv.slice(2));
  const engine = new TelemetryEngine(config);

  process.on('SIGINT', () => {
    engine.stop();
    process.exit(0);
  });

  await engine.start();
}

if (import.meta.url === \`file://\${process.argv[1]}\` || process.argv[1]?.endsWith('index.js')) {
  main().catch((err) => {
    console.error('[CRITICAL UNHANDLED ERROR]', err);
    process.exit(1);
  });
}
`;
