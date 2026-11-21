# DustbinTracker - Wokwi ESP32 IoT Simulation Guide

This folder contains everything needed to simulate the **ESP32 + HC-SR04 Ultrasonic Distance Sensor** in the free web-based [Wokwi Simulator](https://wokwi.com/).

---

## 🚀 How to Run in Wokwi (Step-by-Step)

### Option 1: Direct Web Simulator Setup
1. Go to [https://wokwi.com/projects/new/esp32](https://wokwi.com/projects/new/esp32).
2. Click on the **`diagram.json`** tab in Wokwi and paste the contents of `hardware/wokwi/diagram.json`.
3. Click on the **`sketch.ino`** tab and paste the contents of `hardware/wokwi/sketch.ino`.
4. Click on the **`Library Manager`** tab (or `libraries.txt`) and add:
   ```text
   ArduinoJson
   ```
5. Click the green **Play (Start Simulation)** button!

---

## 🎛️ How to Test Distance & Fill Levels in Wokwi

1. While the simulation is running, **click on the HC-SR04 Ultrasonic Sensor** in the simulation canvas.
2. A slider will appear showing the distance in centimeters.
3. **Move the slider:**
   - **Distance = 15 cm:** Fill level = 85% (**🚨 Red LED turns ON**, Serial monitor triggers critical alert).
   - **Distance = 75 cm:** Fill level = 25% (**🟢 Green LED turns ON**, normal state).
4. Watch the Serial Monitor print real-time sensor distance, computed fill percentage, and the HTTP response from your DustbinTracker API!

---

## 🌐 Connecting Wokwi to your Live Next.js Cloud Backend

In `sketch.ino`:
```cpp
const char* API_ENDPOINT = "https://your-vercel-deployment-url.vercel.app/api/bins/telemetry";
```
Replace this with your deployed Vercel domain or your public ngrok forwarding URL. Wokwi connects to the real internet through its simulated `Wokwi-GUEST` Wi-Fi gateway.
