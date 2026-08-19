import { SimulatorConfig, TelemetryPayload, MachineStatus, MachineArchetype } from '../types';

export const MACHINE_ARCHETYPES: MachineArchetype[] = [
  { prefix: 'CTX-TRK', type: 'Haul Truck 797F', nominalRpm: 1750, maxRpm: 3200, baseTemp: 88, fuelBurnRate: 0.08 },
  { prefix: 'CTX-EXC', type: 'Hydraulic Excavator 6020B', nominalRpm: 1900, maxRpm: 2800, baseTemp: 84, fuelBurnRate: 0.06 },
  { prefix: 'CTX-LDR', type: 'Wheel Loader 994K', nominalRpm: 1600, maxRpm: 2600, baseTemp: 80, fuelBurnRate: 0.05 },
  { prefix: 'CTX-DZR', type: 'Track-Type Tractor D11', nominalRpm: 1800, maxRpm: 3000, baseTemp: 92, fuelBurnRate: 0.09 },
  { prefix: 'CTX-DRL', type: 'Rotary Blasthole Drill MD6310', nominalRpm: 2100, maxRpm: 3400, baseTemp: 86, fuelBurnRate: 0.07 },
];

export class VirtualMachine {
  id: string;
  archetype: MachineArchetype;
  model: string;
  config: SimulatorConfig;

  currentRpm: number;
  engineTemp: number;
  fuelLevelPct: number;
  oilPressureKpa: number;
  hydraulicPressurePsi: number;
  coolantLevelPct: number;
  operatingHours: number;
  batteryVoltage: number;

  lat: number;
  lng: number;
  headingDeg: number;
  speedKph: number;
  altitudeMeters: number;
  vibrationRms: number;

  status: MachineStatus = 'OPERATIONAL';
  activeAlarms: string[] = [];

  constructor(index: number, config: SimulatorConfig) {
    this.config = config;
    const archetype = MACHINE_ARCHETYPES[index % MACHINE_ARCHETYPES.length];
    const unitNumber = (100 + index + 1).toString().padStart(3, '0');

    this.id = `${archetype.prefix}-${unitNumber}`;
    this.archetype = archetype;
    this.model = archetype.type;

    this.currentRpm = archetype.nominalRpm + (Math.random() * 400 - 200);
    this.engineTemp = archetype.baseTemp + (Math.random() * 6 - 3);
    this.fuelLevelPct = 75 + Math.random() * 24;
    this.oilPressureKpa = 320 + (Math.random() * 40 - 20);
    this.hydraulicPressurePsi = 2850 + (Math.random() * 300 - 150);
    this.coolantLevelPct = 94.0 + Math.random() * 5.0;
    this.operatingHours = 1240.5 + index * 342.1;
    this.batteryVoltage = 27.8;

    const angle = (Math.PI * 2 * index) / Math.max(1, config.fleetSize) + Math.random() * 0.5;
    const distanceKm = Math.random() * config.siteRadiusKm * 0.8;
    const kmPerDegreeLat = 111.0;
    const kmPerDegreeLng = 111.0 * Math.cos((config.baseLat * Math.PI) / 180);

    this.lat = config.baseLat + (Math.sin(angle) * distanceKm) / kmPerDegreeLat;
    this.lng = config.baseLng + (Math.cos(angle) * distanceKm) / kmPerDegreeLng;
    this.headingDeg = Math.floor(Math.random() * 360);
    this.speedKph = 15.0 + Math.random() * 25.0;
    this.altitudeMeters = 145.0 + (Math.random() * 20.0 - 10.0);
    this.vibrationRms = 1.4;
  }

  tick(dtSeconds: number = 1.0, injectAnomaly: boolean = false): TelemetryPayload {
    this.operatingHours += dtSeconds / 3600;
    this.activeAlarms = [];

    // RPM Dynamics
    if (injectAnomaly) {
      this.currentRpm = Math.min(3650, this.currentRpm + 600 + Math.random() * 400);
      this.activeAlarms.push('ALM_ENGINE_OVER_RPM');
    } else {
      const targetRpm = this.archetype.nominalRpm + Math.sin(Date.now() / 4000) * 350;
      const rpmStep = (targetRpm - this.currentRpm) * 0.15 + (Math.random() * 80 - 40);
      this.currentRpm = Math.max(1000, Math.min(3000, this.currentRpm + rpmStep));
    }

    // Thermal Dynamics
    const loadFactor = (this.currentRpm - 1000) / 2000;
    const targetTemp = this.archetype.baseTemp + loadFactor * 22;
    const tempInertia = (targetTemp - this.engineTemp) * (0.05 * dtSeconds);
    this.engineTemp += tempInertia + (Math.random() * 0.4 - 0.2);

    if (injectAnomaly) {
      this.engineTemp += 8.5;
      this.activeAlarms.push('ALM_COOLANT_OVERTEMP');
    }

    // Fuel Decay
    const burn = (this.archetype.fuelBurnRate * (0.5 + loadFactor * 0.8) * dtSeconds) / 60;
    this.fuelLevelPct = Math.max(0.0, this.fuelLevelPct - burn);
    if (this.fuelLevelPct < 15.0) {
      this.activeAlarms.push('ALM_LOW_FUEL_RESERVE');
    }

    // Pressures
    this.oilPressureKpa = 280 + (this.currentRpm / 3000) * 140 + (Math.random() * 10 - 5);
    this.hydraulicPressurePsi = 2600 + loadFactor * 600 + (Math.random() * 40 - 20);

    // Kinematics
    this.headingDeg = (this.headingDeg + (Math.random() * 6 - 3) + 360) % 360;
    const headingRad = (this.headingDeg * Math.PI) / 180;
    const distanceTraveledKm = (this.speedKph * dtSeconds) / 3600;

    const kmPerDegreeLat = 111.0;
    const kmPerDegreeLng = 111.0 * Math.cos((this.lat * Math.PI) / 180);

    this.lat += (Math.cos(headingRad) * distanceTraveledKm) / kmPerDegreeLat;
    this.lng += (Math.sin(headingRad) * distanceTraveledKm) / kmPerDegreeLng;
    this.altitudeMeters += Math.random() * 0.4 - 0.2;

    // Vibration
    this.vibrationRms = 1.0 + (this.currentRpm / 3000) * 1.8 + (injectAnomaly ? 3.5 : Math.random() * 0.3);

    // Status Resolution
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
