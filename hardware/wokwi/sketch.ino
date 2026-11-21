/*
  DustbinTracker - ESP32 Smart Waste IoT Simulation
  Components:
    - ESP32 Wi-Fi Microcontroller Module
    - HC-SR04 Ultrasonic Distance Sensor
    - Red LED (Critical Fill >= 80%)
    - Green LED (Normal Status < 80%)

  Features:
    - Measures distance to waste surface
    - Calculates fill percentage
    - Connects to Wi-Fi (Wokwi-GUEST)
    - Sends HTTP POST telemetry to DustbinTracker Cloud API
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Pin Configuration
#define TRIG_PIN 5
#define ECHO_PIN 18
#define LED_CRITICAL_PIN 2   // Red LED
#define LED_NORMAL_PIN 4     // Green LED

// Bin Hardware Configuration
const char* DUSTBIN_ID = "BIN-DHK-104";
const float TOTAL_BIN_DEPTH_CM = 100.0; // 100 cm bin height

// Wokwi Wi-Fi credentials
const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";

// DustbinTracker Cloud API Endpoint
const char* API_ENDPOINT = "https://dustbintracker.vercel.app/api/bins/telemetry";

unsigned long lastSendTime = 0;
// Periodic interval: Send and save to MongoDB every 5 minutes (300,000 ms)
const unsigned long SEND_INTERVAL_MS = 5 * 60 * 1000; 
bool lastWasCritical = false;

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n==========================================");
  Serial.println("   DustbinTracker - Smart IoT Node v1.0   ");
  Serial.println("==========================================");

  // Initialize Pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(LED_CRITICAL_PIN, OUTPUT);
  pinMode(LED_NORMAL_PIN, OUTPUT);

  digitalWrite(LED_CRITICAL_PIN, LOW);
  digitalWrite(LED_NORMAL_PIN, LOW);

  // Connect to Wi-Fi
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n[WiFi] Connected successfully!");
  Serial.print("[WiFi] IP Address: ");
  Serial.println(WiFi.localIP());
}

// Function to measure distance in centimeters
float measureDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout (~5m max)

  if (duration == 0) {
    // Sensor timeout or obstruction
    return -1.0;
  }

  // Speed of sound = 343 m/s = 0.0343 cm/us
  float distanceCm = (duration * 0.0343) / 2.0;
  return distanceCm;
}

void loop() {
  unsigned long currentMillis = millis();

  // Read distance from ultrasonic sensor
  float distance = measureDistanceCm();

  if (distance >= 0 && distance <= 400.0) {
    float effectiveDistance = constrain(distance, 0.0, TOTAL_BIN_DEPTH_CM);
    float fillPercentage = ((TOTAL_BIN_DEPTH_CM - effectiveDistance) / TOTAL_BIN_DEPTH_CM) * 100.0;
    int roundedFill = round(fillPercentage);
    bool isCritical = (roundedFill >= 80);

    // Update Local Status LEDs immediately
    if (isCritical) {
      digitalWrite(LED_CRITICAL_PIN, HIGH);
      digitalWrite(LED_NORMAL_PIN, LOW);
    } else {
      digitalWrite(LED_CRITICAL_PIN, LOW);
      digitalWrite(LED_NORMAL_PIN, HIGH);
    }

    // Trigger condition:
    // 1. Initial startup (lastSendTime == 0)
    // 2. Periodic 5-minute interval reached (300,000 ms)
    // 3. Urgent overflow event: Bin suddenly crosses 80% without waiting 5 minutes
    bool shouldSendUpdate = (lastSendTime == 0) ||
                            (currentMillis - lastSendTime >= SEND_INTERVAL_MS) ||
                            (isCritical && !lastWasCritical);

    if (shouldSendUpdate) {
      lastSendTime = currentMillis;
      lastWasCritical = isCritical;

      if (isCritical) {
        Serial.println("\n[STATUS] 🚨 CRITICAL FILL DETECTED (>= 80%)! Triggering urgent alert...");
      } else {
        Serial.println("\n[STATUS] ⏱️ 5-Minute Periodic Update Cycle");
      }

      Serial.printf("Dustbin ID    : %s\n", DUSTBIN_ID);
      Serial.printf("Distance      : %.2f cm\n", distance);
      Serial.printf("Fill Level    : %d %%\n", roundedFill);

      // Transmit telemetry to Cloud Backend (MongoDB Atlas via Vercel)
      if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(API_ENDPOINT);
        http.addHeader("Content-Type", "application/json");

        StaticJsonDocument<200> doc;
        doc["binId"] = DUSTBIN_ID;
        doc["distanceCm"] = distance;
        doc["fillLevel"] = roundedFill;

        String requestBody;
        serializeJson(doc, requestBody);

        Serial.print("[HTTP] Transmitting payload to MongoDB: ");
        Serial.println(requestBody);

        int httpResponseCode = http.POST(requestBody);

        if (httpResponseCode > 0) {
          String response = http.getString();
          Serial.printf("[HTTP] Success (Status %d) - Saved in MongoDB!\n", httpResponseCode);
          Serial.println("[HTTP] Server Response: " + response);
        } else {
          Serial.printf("[HTTP] Failed to transmit: %s\n", http.errorToString(httpResponseCode).c_str());
        }

        http.end();
      } else {
        Serial.println("[WiFi] Reconnecting to Wi-Fi...");
        WiFi.reconnect();
      }

      Serial.println("[Schedule] Next regular MongoDB update in 5 minutes (300s)...");
      Serial.println("------------------------------------------------------------");
    }
  }

  delay(2000); // Check sensor every 2 seconds
}
