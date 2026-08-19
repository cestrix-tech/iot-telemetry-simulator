/**
 * ============================================================================
 * CESTRIX INDUSTRIAL TELEMETRY SIMULATOR
 * System Architecture : Pure Node.js ES Modules (Zero External Dependencies)
 * Maintainer          : Cestrix Deep-Tech Telemetry Systems Group
 * ============================================================================
 * 
 * DESCRIPTION:
 * High-performance industrial IoT telemetry generator designed to simulate
 * heavy machinery operations (haul trucks, excavators, loaders) in real time.
 * Emits raw, pipeline-safe JSON telemetry strings to standard output with
 * continuous physical kinematics, thermal dynamics, RPM inertia, and GPS drift.
 * 
 * KEY FEATURES:
 *  - 100% Pure Node.js Standard Library (node:events, node:process, node:perf_hooks)
 *  - Robust CLI argument parsing supporting --key=value and --key value syntax
 *  - Accurate periodic dispatching using setInterval
 *  - Pure, unadorned JSON output formatted for pipeability (e.g., | jq .)
 *  - Graceful POSIX signal termination (SIGINT / SIGTERM)
 */

import process from 'node:process';

// ============================================================================
// 1. DEFAULT OPERATIONAL CONFIGURATION
// ============================================================================

/**
 * Baseline parameters governing the simulation loop.
 */
const DEFAULT_CONFIG = {
  fleetSize: 5,        // Number of heavy machinery assets to simulate
  intervalMs: 1000,    // Generation interval in milliseconds
  baseLat: 37.7749,    // Baseline operating latitude (WGS-84)
  baseLng: -122.4194,  // Baseline operating longitude (WGS-84)
  siteRadiusKm: 4.5,   // Geographic dispersion radius in kilometers
};

/**
 * Heavy industrial machinery archetypes and physical baseline parameters.
 */
const MACHINE_ARCHETYPES = [
  { prefix: 'CTX-TRK', model: 'Heavy Haul Truck 797F', nominalRpm: 1750, baseTemp: 88.0, fuelBurnRate: 0.08 },
  { prefix: 'CTX-EXC', model: 'Hydraulic Excavator 6020B', nominalRpm: 1900, baseTemp: 84.0, fuelBurnRate: 0.06 },
  { prefix: 'CTX-LDR', model: 'Wheel Loader 994K', nominalRpm: 1600, baseTemp: 80.0, fuelBurnRate: 0.05 },
  { prefix: 'CTX-DZR', model: 'Track-Type Tractor D11', nominalRpm: 1800, baseTemp: 92.0, fuelBurnRate: 0.09 },
  { prefix: 'CTX-DRL', model: 'Blasthole Drill MD6310', nominalRpm: 2100, baseTemp: 86.0, fuelBurnRate: 0.07 },
];

// ============================================================================
// 2. CLI ARGUMENT PARSER (ZERO-DEPENDENCY)
// ============================================================================

/**
 * Parses command-line arguments from `process.argv` into a typed configuration object.
 * Supports `--fleet=N`, `--interval=N`, `--help`, etc.
 * 
 * @param {string[]} argv - Array of argument strings (typically process.argv.slice(2))
 * @returns {typeof DEFAULT_CONFIG} Sanitized simulator configuration
 */
export function parseArguments(argv = process.argv.slice(2)) {
  const config = { ...DEFAULT_CONFIG };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    // Help documentation request
    if (arg === '--help' || arg === '-h') {
      printHelpAndExit();
    }

    // Match --key=value syntax
    const match = arg.match(/^--([a-zA-Z0-9_-]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      applyConfigOption(config, key, value);
      continue;
    }

    // Match --key value syntax
    if (arg.startsWith('--') || arg.startsWith('-')) {
      const key = arg.replace(/^-+/, '');
      const nextArg = argv[i + 1];
      if (nextArg && !nextArg.startsWith('-')) {
        applyConfigOption(config, key, nextArg);
        i++; // Consume the next argument
      }
    }
  }

  // Validate operational bounds
  if (isNaN(config.fleetSize) || config.fleetSize < 1) {
    console.error('Error: --fleet must be an integer >= 1');
    process.exit(1);
  }

  if (isNaN(config.intervalMs) || config.intervalMs < 10) {
    console.error('Error: --interval must be >= 10 ms');
    process.exit(1);
  }

  return config;
}

/**
 * Applies and maps CLI key-value pairs to the target configuration structure.
 */
function applyConfigOption(config, key, value) {
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
      config.intervalMs = Math.max(10, parseInt(value, 10));
      break;

    case 'lat':
    case 'latitude':
      config.baseLat = parseFloat(value);
      break;

    case 'lng':
    case 'lon':
    case 'longitude':
      config.baseLng = parseFloat(value);
      break;

    default:
      // Unknown arguments ignored for forward-compatibility
      break;
  }
}

/**
 * Prints usage instructions and exits.
 */
function printHelpAndExit() {
  const helpText = `
Cestrix Industrial Telemetry Simulator
Usage: node index.js [OPTIONS]

Options:
  --fleet=<number>       Number of vehicles in the simulated fleet (Default: 5)
  --interval=<ms>        Interval between telemetry payloads in milliseconds (Default: 1000)
  --lat=<float>          Base operational latitude (Default: 37.7749)
  --lng=<float>          Base operational longitude (Default: -122.4194)
  --help, -h             Display this help message

Examples:
  node index.js --fleet=10 --interval=500
  node index.js --fleet=20 --interval=250 > telemetry_stream.json
`;
  process.stdout.write(helpText);
  process.exit(0);
}

// ============================================================================
// 3. INDUSTRIAL MACHINE ASSET MODEL & PHYSICS ENGINE
// ============================================================================

/**
 * Represents a single heavy industrial vehicle generating realistic telemetry.
 */
export class IndustrialMachine {
  /**
   * @param {number} index - Machine index in the fleet
   * @param {typeof DEFAULT_CONFIG} config - Master simulation parameters
   */
  constructor(index, config) {
    const archetype = MACHINE_ARCHETYPES[index % MACHINE_ARCHETYPES.length];
    const unitId = (100 + index + 1).toString().padStart(3, '0');

    this.id = `${archetype.prefix}-${unitId}`;
    this.archetype = archetype;
    this.model = archetype.model;
    this.config = config;

    // Physical state initial conditions
    this.currentRpm = archetype.nominalRpm + (Math.random() * 400 - 200);
    this.engineTemp = archetype.baseTemp + (Math.random() * 4 - 2);
    this.fuelLevelPct = 75.0 + Math.random() * 24.0;
    this.oilPressureKpa = 320.0 + (Math.random() * 30 - 15);
    this.operatingHours = 1200.0 + index * 245.5;

    // Initial GPS coordinates distributed around baseline
    const angle = (Math.PI * 2 * index) / Math.max(1, config.fleetSize) + Math.random() * 0.4;
    const distanceKm = Math.random() * config.siteRadiusKm * 0.7;
    const kmPerDegreeLat = 111.0;
    const kmPerDegreeLng = 111.0 * Math.cos((config.baseLat * Math.PI) / 180);

    this.lat = config.baseLat + (Math.sin(angle) * distanceKm) / kmPerDegreeLat;
    this.lng = config.baseLng + (Math.cos(angle) * distanceKm) / kmPerDegreeLng;
    this.headingDeg = Math.floor(Math.random() * 360);
    this.speedKph = 18.0 + Math.random() * 22.0;
    this.altitudeMeters = 140.0 + (Math.random() * 15 - 7.5);
  }

  /**
   * Advances the vehicle's dynamic physical state over an elapsed time delta.
   * 
   * @param {number} dtSeconds - Elapsed seconds since last tick
   * @returns {object} Pure telemetry payload frame
   */
  tick(dtSeconds = 1.0) {
    this.operatingHours += (dtSeconds / 3600);

    // 1. Realistic Engine RPM: Stochastic drift bounded between 1000 and 3000 RPM
    const targetRpm = this.archetype.nominalRpm + Math.sin(Date.now() / 3500) * 400;
    const rpmInertia = (targetRpm - this.currentRpm) * 0.12 + (Math.random() * 80 - 40);
    this.currentRpm = Math.max(1000, Math.min(3000, this.currentRpm + rpmInertia));

    // 2. Thermodynamic Model: Temperature rises under elevated RPM load
    const loadRatio = (this.currentRpm - 1000) / 2000;
    const targetTemp = this.archetype.baseTemp + loadRatio * 20.0;
    const tempDrift = (targetTemp - this.engineTemp) * (0.04 * dtSeconds);
    this.engineTemp += tempDrift + (Math.random() * 0.3 - 0.15);

    // 3. Fuel Consumption Dynamics
    const fuelBurn = (this.archetype.fuelBurnRate * (0.6 + loadRatio * 0.7) * dtSeconds) / 60;
    this.fuelLevelPct = Math.max(0.0, this.fuelLevelPct - fuelBurn);

    // 4. Oil Pressure Variation
    this.oilPressureKpa = 290.0 + (this.currentRpm / 3000) * 120.0 + (Math.random() * 8 - 4);

    // 5. Geodesic GPS Kinematics & Translation
    this.headingDeg = (this.headingDeg + (Math.random() * 6 - 3) + 360) % 360;
    const headingRad = (this.headingDeg * Math.PI) / 180;
    const distanceKm = (this.speedKph * dtSeconds) / 3600;

    const kmPerDegreeLat = 111.0;
    const kmPerDegreeLng = 111.0 * Math.cos((this.lat * Math.PI) / 180);

    this.lat += (Math.cos(headingRad) * distanceKm) / kmPerDegreeLat;
    this.lng += (Math.sin(headingRad) * distanceKm) / kmPerDegreeLng;
    this.altitudeMeters += (Math.random() * 0.3 - 0.15);

    // Return the pure, standardized JSON payload structure
    return {
      machine_id: this.id,
      timestamp: new Date().toISOString(),
      equipment_metadata: {
        model: this.model,
        operating_hours: parseFloat(this.operatingHours.toFixed(2)),
      },
      metrics: {
        engine_rpm: Math.round(this.currentRpm),
        engine_temperature_c: parseFloat(this.engineTemp.toFixed(2)),
        fuel_level_percent: parseFloat(this.fuelLevelPct.toFixed(2)),
        oil_pressure_kpa: parseFloat(this.oilPressureKpa.toFixed(1)),
      },
      gps: {
        latitude: parseFloat(this.lat.toFixed(6)),
        longitude: parseFloat(this.lng.toFixed(6)),
        altitude_m: parseFloat(this.altitudeMeters.toFixed(1)),
        speed_kph: parseFloat(this.speedKph.toFixed(1)),
        heading_deg: Math.round(this.headingDeg),
      },
    };
  }
}

// ============================================================================
// 4. SIMULATOR DISPATCH ENGINE
// ============================================================================

/**
 * Orchestrates fleet instantiation and the setInterval simulation loop.
 */
export class TelemetrySimulator {
  /**
   * @param {typeof DEFAULT_CONFIG} config - Runtime configuration
   */
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.fleet = [];
    this.intervalHandle = null;
    this.lastTickTime = Date.now();

    this.initializeFleet();
  }

  /**
   * Populates the fleet array with instances of IndustrialMachine.
   */
  initializeFleet() {
    this.fleet = [];
    for (let i = 0; i < this.config.fleetSize; i++) {
      this.fleet.push(new IndustrialMachine(i, this.config));
    }
  }

  /**
   * Starts the periodic simulation timer using setInterval.
   */
  start() {
    this.lastTickTime = Date.now();

    // Use setInterval as required by specification
    this.intervalHandle = setInterval(() => {
      this.executeTick();
    }, this.config.intervalMs);
  }

  /**
   * Generates and prints pure JSON telemetry frames for every machine in the fleet.
   */
  executeTick() {
    const now = Date.now();
    const dtSeconds = Math.max(0.05, (now - this.lastTickTime) / 1000);
    this.lastTickTime = now;

    for (const machine of this.fleet) {
      const payload = machine.tick(dtSeconds);
      
      // Output pure valid JSON to stdout without ANSI escape codes
      console.log(JSON.stringify(payload));
    }
  }

  /**
   * Halts the active setInterval timer.
   */
  stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }
}

// ============================================================================
// 5. APPLICATION ENTRYPOINT & SIGNAL HANDLING
// ============================================================================

/**
 * Bootstrap function executing the CLI simulator.
 */
export function main() {
  const config = parseArguments(process.argv.slice(2));
  const simulator = new TelemetrySimulator(config);

  // Graceful termination handling for POSIX signals
  const shutdown = () => {
    simulator.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Start periodic generation
  simulator.start();
}

// Auto-execute if invoked directly from CLI
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('index.js')) {
  main();
}
