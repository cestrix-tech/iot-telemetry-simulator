<div align="center">
  <img src="https://cestrixgroup.com/logo.webp" alt="Cestrix Group" width="150"/>
  <h1>Cestrix Industrial Telemetry Simulator (IIoT)</h1>
  <p><b>High-frequency mock telemetry generator for heavy machinery and civil fleets.</b></p>
  
  [![Version](https://img.shields.io/badge/version-1.0.0-00A3E0?style=for-the-badge)]()
  [![Node.js](https://img.shields.io/badge/Node.js-%3E%3D_18.0-43853D?style=for-the-badge&logo=node.js)]()
  [![License](https://img.shields.io/badge/License-MIT-002D62?style=for-the-badge)]()
</div>

<br/>

## 📡 Overview

In heavy civil engineering and logistics, testing SCADA systems and IoT dashboards requires massive amounts of real-time data. The **Cestrix Telemetry Simulator** is a lightweight, high-performance Node.js CLI tool designed to generate and stream realistic mock telemetry data (RPM, Fuel Levels, GPS coordinates, Engine Temperature) for heavy machinery such as excavators, dump trucks, and batching plants.

This tool is internally used by **Cestrix Tech** to stress-test our custom ERP and Live Tracking dashboards before deploying them to live construction sites.

## 🚀 Key Features

- **High-Frequency Streaming:** Simulate thousands of data points per second via MQTT or WebSockets.
- **Dynamic Fleet Profiles:** Pre-configured profiles for Heavy Dump Trucks, Cranes, and Concrete Mixers.
- **Anomaly Injection:** Automatically simulate mechanical failures (e.g., sudden fuel drops, engine overheating) to test dashboard alert systems.
- **Geofenced GPS Simulation:** Generate realistic moving coordinates within specified construction site boundaries.

## 💻 Quick Start

### Installation

Clone the repository and install dependencies:

```bash
git clone [https://github.com/cestrix-tech/iot-telemetry-simulator.git](https://github.com/cestrix-tech/iot-telemetry-simulator.git)
cd iot-telemetry-simulator
npm install
