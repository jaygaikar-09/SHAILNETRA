# SHAILNETRA — Frontend

AI-Based Rockfall Prediction and Alert System for Open-Pit Mines
VIT Bhopal Internal Hackathon 2026 · Team VITBSIH26-100 · Theme: Disaster Management

This is the frontend for SHAILNETRA, built as independent modules that map directly onto
the Technical Approach in the idea submission (data collection → risk prediction →
3D digital twin → dashboard/analytics → alert system).

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build       # production build → dist/
npm run preview     # preview the production build
```

The app runs fully standalone with a built-in simulator, so you can demo it with no backend at all.

## Connecting the real FastAPI backend

Every network call goes through `src/services/api.js`. By default it uses the local
simulator in `src/services/simulator.js` so the UI works offline. To point it at your
real backend, create a `.env` file:

```
VITE_API_BASE_URL=https://your-backend-url
```

and implement these endpoints to match what the frontend already expects:

| Endpoint | Method | Used by |
|---|---|---|
| `/zones` | GET | Zone-wise risk list (Dashboard, Digital Twin, Zone Risk, Analytics) |
| `/zones/:id/history` | GET | 24h trend chart (Analytics) |
| `/alerts` | GET | Alert Center |
| `/predict` | POST | Simulate Input module — send `{ rainfall, slopeAngle, displacement, crackWidth, vibration }` |

No component code needs to change — swapping the simulator for live sensor data is a
one-line environment variable change.

## Module map

| Folder | PPT module(s) it implements |
|---|---|
| `src/modules/DataInput` | 1. Data Collection, 2. Data Preprocessing, 3. AI Model – Risk Prediction |
| `src/modules/RiskPrediction` | 4. Risk Classification |
| `src/modules/DigitalTwin3D` | 6. 3D Visualization (Digital Twin) |
| `src/modules/Analytics` | 7. Dashboard & Analytics |
| `src/modules/AlertSystem` | 8. Alert System, 9. Actionable Output |
| `src/modules/Dashboard` | Operations overview tying all modules together |
| `src/context/RiskDataContext.jsx` | Shared polling layer (mirrors module 5, API & Backend Service, on the client side) |

## Design notes

- **Palette & type** — dark control-room base with an ochre/amber accent (mining, earth,
  caution) and a functional traffic-light risk system (green/amber/red) that is never
  used decoratively — it always means low/medium/high risk.
- **Signature element** — the scrolling seismograph line in the top bar, a nod to the
  ground-vibration sensor parameter that feeds the model.
- Fonts: Chakra Petch (display/technical), Inter (body), JetBrains Mono (data readouts).
- Fully responsive: sidebar nav on desktop, bottom tab bar on mobile; keyboard focus
  states and `prefers-reduced-motion` are respected.

## Tech stack

React 18 · React Router · Tailwind CSS · Three.js (digital twin) · Recharts (trend charts) ·
lucide-react (icons) · Vite
