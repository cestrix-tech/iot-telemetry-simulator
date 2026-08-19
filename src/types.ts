/**
 * Cestrix Industrial Telemetry Type Definitions
 * RFC-compliant IoT payload definitions and configuration models.
 */

export type OutputFormat = 'json' | 'ndjson' | 'pretty' | 'compact';

export type MachineStatus = 'OPERATIONAL' | 'WARNING' | 'CRITICAL';

export interface EquipmentMetadata {
  model: string;
  operating_hours: number;
  status: MachineStatus;
}

export interface MachineMetrics {
  engine_rpm: number;
  engine_temperature_c: number;
  fuel_level_percent: number;
  oil_pressure_kpa: number;
  hydraulic_pressure_psi: number;
  coolant_level_percent: number;
  battery_voltage: number;
  vibration_rms_g: number;
}

export interface MachineGps {
  latitude: number;
  longitude: number;
  altitude_m: number;
  speed_kph: number;
  heading_deg: number;
}

export interface TelemetryPayload {
  machine_id: string;
  timestamp: string;
  equipment_metadata: EquipmentMetadata;
  metrics: MachineMetrics;
  gps: MachineGps;
  diagnostic_alarms: string[];
}

export interface SimulatorConfig {
  fleetSize: number;
  intervalMs: number;
  outputFormat: OutputFormat;
  anomalyRate: number;
  mqttBroker: string;
  mqttTopic: string;
  baseLat: number;
  baseLng: number;
  siteRadiusKm: number;
}

export interface MachineArchetype {
  prefix: string;
  type: string;
  nominalRpm: number;
  maxRpm: number;
  baseTemp: number;
  fuelBurnRate: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  machineId: string;
  text: string;
  payload: TelemetryPayload;
  rawJson: string;
  isAnomaly: boolean;
  status: MachineStatus;
}

export interface SimulatorStats {
  totalMessages: number;
  totalBytes: number;
  startTime: number;
  messagesPerSecond: number;
  kbPerSecond: number;
  activeAnomalies: number;
}
