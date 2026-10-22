# Find My Soulmate — Documentation

Welcome to the documentation for **Find My Soulmate** (ነፍስ ጓደኛዬን አግኝ) — the developer-themed dating simulation and real-time social matchmaking platform.

## Documentation Index

* [**Architecture & Design Guide**](./ARCHITECTURE.md):
  - Dual-Engine architecture (Mode 1: Virtual AI Simulation vs Mode 2: Real WebSocket & Social Network)
  - Backend database & storage overview
  - Cross-device local connectivity (PC ↔ Mobile)
  - Directory structure & tech stack

* [**System Flow & Protocol Specs**](./SYSTEM_FLOW.md):
  - End-to-end user journey & registration flowcharts
  - Complete REST API specification (Port 8080)
  - WebSocket event protocol & life-cycle
  - Criteria matching compatibility algorithm

---

## Quick Start Reference

1. **Start WebSocket & Database Backend**:
   ```bash
   node server/server.js
   # Listening on ws://localhost:8080 & http://localhost:8080
   ```

2. **Start Frontend Web App**:
   ```bash
   npm run dev -- --host
   # Accessible on PC at http://localhost:5173
   # Accessible on Mobile at http://<YOUR_LOCAL_IP>:5173
   ```

3. **Production Build**:
   ```bash
   npm run build
   ```
