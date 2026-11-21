"use client";

import React, { useState, useCallback } from "react";
import { Wifi, Cpu, Radio, Database, Mail, ChevronRight, Send, CheckCircle, AlertTriangle, Info } from "lucide-react";

// ─── Bin definitions ─────────────────────────────────────────────────────────
const BINS = [
  {
    id: "BIN-SIM-001",
    name: "Dhanmondi Lake Bin",
    zone: "Dhanmondi",
    location: "Road 27, Near Lake Park",
    color: "emerald",
  },
  {
    id: "BIN-SIM-002",
    name: "Gulshan Circle Bin",
    zone: "Gulshan",
    location: "Gulshan Avenue, Circle-1",
    color: "teal",
  },
  {
    id: "BIN-SIM-003",
    name: "Mirpur 10 Bin",
    zone: "Mirpur",
    location: "Mirpur 10 Roundabout",
    color: "cyan",
  },
  {
    id: "BIN-SIM-004",
    name: "Motijheel Central Bin",
    zone: "Motijheel",
    location: "Shapla Square Area",
    color: "sky",
  },
  {
    id: "BIN-SIM-005",
    name: "Uttara Sector 7 Bin",
    zone: "Uttara",
    location: "Sector 7, Main Road",
    color: "indigo",
  },
];

// ─── Fill level gauge SVG ─────────────────────────────────────────────────────
function FillGauge({ fillLevel, status }: { fillLevel: number; status: string }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (fillLevel / 100) * circumference;
  const color =
    status === "critical" ? "#dc2626" : status === "attention" ? "#d97706" : "#059669";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="110" height="110" viewBox="0 0 110 110" className="-rotate-90">
        <circle cx="55" cy="55" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.4s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <div
          className="text-xl font-black leading-none tabular-nums"
          style={{ color }}
        >
          {fillLevel}%
        </div>
        <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide mt-0.5">
          FILL
        </div>
      </div>
    </div>
  );
}

// ─── Dustbin SVG illustration ────────────────────────────────────────────────
function BinIllustration({ fillLevel, status }: { fillLevel: number; status: string }) {
  const fillColor =
    status === "critical" ? "#dc2626" : status === "attention" ? "#d97706" : "#059669";
  const fillHeight = (fillLevel / 100) * 56;

  return (
    <svg width="56" height="80" viewBox="0 0 56 80" className="flex-shrink-0">
      {/* Bin body */}
      <rect x="6" y="18" width="44" height="56" rx="4" fill="#e5e7eb" />
      {/* Fill level */}
      <clipPath id={`clip-${fillLevel}`}>
        <rect x="6" y={18 + (56 - fillHeight)} width="44" height={fillHeight} />
      </clipPath>
      <rect x="6" y="18" width="44" height="56" rx="4" fill={fillColor} opacity="0.7" clipPath={`url(#clip-${fillLevel})`} />
      {/* Lid */}
      <rect x="2" y="12" width="52" height="8" rx="3" fill="#9ca3af" />
      {/* Handle */}
      <rect x="20" y="6" width="16" height="8" rx="4" fill="#9ca3af" />
      {/* Lines on bin */}
      <line x1="20" y1="28" x2="20" y2="68" stroke="#d1d5db" strokeWidth="1.5" />
      <line x1="36" y1="28" x2="36" y2="68" stroke="#d1d5db" strokeWidth="1.5" />
    </svg>
  );
}

// ─── Hardware flow diagram ───────────────────────────────────────────────────
function HardwareFlowDiagram() {
  const steps = [
    { icon: <Radio className="w-5 h-5" />, label: "HC-SR04", sub: "Ultrasonic Sensor", color: "bg-violet-100 text-violet-700 border-violet-200" },
    { icon: <Cpu className="w-5 h-5" />, label: "ESP32", sub: "Microcontroller", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { icon: <Wifi className="w-5 h-5" />, label: "WiFi", sub: "HTTP POST", color: "bg-sky-100 text-sky-700 border-sky-200" },
    { icon: <Database className="w-5 h-5" />, label: "MongoDB", sub: "Atlas Cloud", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    { icon: <Mail className="w-5 h-5" />, label: "Nodemailer", sub: "Email Alert", color: "bg-orange-100 text-orange-700 border-orange-200" },
  ];

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex items-center gap-1 min-w-max mx-auto justify-center">
        {steps.map((step, i) => (
          <React.Fragment key={step.label}>
            <div className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border-2 ${step.color} min-w-[72px]`}>
              <div>{step.icon}</div>
              <div className="text-[11px] font-bold leading-tight text-center">{step.label}</div>
              <div className="text-[9px] opacity-70 text-center leading-tight">{step.sub}</div>
            </div>
            {i < steps.length - 1 && (
              <ChevronRight className="w-4 h-4 text-zinc-300 flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── Single Bin Card ──────────────────────────────────────────────────────────
function BinCard({ bin }: { bin: typeof BINS[0] }) {
  const [distanceCm, setDistanceCm] = useState(60);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; status?: string } | null>(null);

  const fillLevel = Math.round(((100 - distanceCm) / 100) * 100);
  const status: "normal" | "attention" | "critical" =
    fillLevel >= 80 ? "critical" : fillLevel >= 50 ? "attention" : "normal";

  const statusConfig = {
    critical: { label: "CRITICAL", bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-100 text-red-700" },
    attention: { label: "ATTENTION", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-700" },
    normal: { label: "NORMAL", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700" },
  };

  const sc = statusConfig[status];

  const handleSend = useCallback(async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setResult({ success: false, message: "Please enter a valid email address." });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          binId: bin.id,
          binName: bin.name,
          zone: bin.zone,
          distanceCm,
          recipientEmail: email.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({
          success: true,
          message: `✅ Email sent to ${email}! Fill: ${data.fillLevel}% — Status: ${data.status.toUpperCase()}`,
          status: data.status,
        });
      } else {
        setResult({ success: false, message: `❌ ${data.error || "Failed to send email"}` });
      }
    } catch {
      setResult({ success: false, message: "❌ Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }, [bin, distanceCm, email]);

  return (
    <div className={`bg-white rounded-2xl border-2 ${sc.border} shadow-sm overflow-hidden transition-all duration-300`}>
      {/* Card header */}
      <div className={`${sc.bg} px-4 py-3 flex items-center justify-between gap-3`}>
        <div className="flex items-center gap-2 min-w-0">
          <BinIllustration fillLevel={fillLevel} status={status} />
          <div className="min-w-0">
            <div className="font-bold text-zinc-900 text-sm leading-tight truncate">{bin.name}</div>
            <div className="text-xs text-zinc-500 mt-0.5 truncate">{bin.location}</div>
            <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.badge}`}>
              {sc.label}
            </span>
          </div>
        </div>
        <FillGauge fillLevel={fillLevel} status={status} />
      </div>

      {/* Hardware spec panel */}
      <div className="bg-zinc-900 px-4 py-3 font-mono text-[11px] text-zinc-400 leading-relaxed">
        <div className="text-emerald-400 font-bold mb-1.5 text-[10px] uppercase tracking-widest">⚙ Hardware Specs</div>
        <div className="grid grid-cols-2 gap-x-4">
          <div>MCU: <span className="text-sky-300">ESP32-WROOM-32</span></div>
          <div>Sensor: <span className="text-sky-300">HC-SR04</span></div>
          <div>Trigger Pin: <span className="text-amber-300">GPIO 5</span></div>
          <div>Echo Pin: <span className="text-amber-300">GPIO 18</span></div>
          <div>Red LED: <span className="text-red-400">GPIO 2</span></div>
          <div>Green LED: <span className="text-emerald-400">GPIO 4</span></div>
          <div>WiFi: <span className="text-violet-300">Wokwi-GUEST</span></div>
          <div>Interval: <span className="text-violet-300">5 min</span></div>
        </div>
        <div className="mt-2 pt-2 border-t border-zinc-700">
          <span className="text-zinc-500">ID: </span>
          <span className="text-yellow-300">{bin.id}</span>
          <span className="text-zinc-500 ml-3">Zone: </span>
          <span className="text-yellow-300">{bin.zone}</span>
        </div>
      </div>

      {/* Sensor slider */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-zinc-600 uppercase tracking-wide">
            📏 HC-SR04 Distance
          </label>
          <span className="font-mono font-black text-sm text-zinc-900">
            {distanceCm} cm
          </span>
        </div>
        <input
          type="range"
          min={2}
          max={100}
          step={1}
          value={distanceCm}
          onChange={(e) => { setDistanceCm(Number(e.target.value)); setResult(null); }}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${
              status === "critical" ? "#dc2626" : status === "attention" ? "#d97706" : "#059669"
            } ${fillLevel}%, #e5e7eb ${fillLevel}%)`
          }}
        />
        <div className="flex justify-between text-[10px] text-zinc-400 mt-1 font-mono">
          <span>2 cm (100% full)</span>
          <span>100 cm (empty)</span>
        </div>

        {/* Live calculation */}
        <div className="mt-3 bg-zinc-50 rounded-xl px-3 py-2.5 text-xs font-mono text-zinc-600">
          <span className="text-zinc-400">Fill = </span>
          <span className="text-emerald-700 font-bold">(100 - {distanceCm}) / 100 × 100</span>
          <span className="text-zinc-400"> = </span>
          <span className="font-black" style={{ color: status === "critical" ? "#dc2626" : status === "attention" ? "#d97706" : "#059669" }}>
            {fillLevel}%
          </span>
          {status === "critical" && (
            <span className="ml-2 text-red-600 font-bold animate-pulse">⚡ Alert threshold crossed!</span>
          )}
        </div>
      </div>

      {/* Email input + send */}
      <div className="px-4 pb-4 pt-2">
        <label className="text-xs font-bold text-zinc-600 uppercase tracking-wide mb-1.5 block">
          ✉️ Your Email (Receive Alert)
        </label>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setResult(null); }}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white"
          />
          <button
            onClick={handleSend}
            disabled={loading || !email}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all ${
              loading || !email
                ? "bg-zinc-300 cursor-not-allowed"
                : status === "critical"
                ? "bg-red-600 hover:bg-red-700 shadow-sm shadow-red-200"
                : "bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-200"
            }`}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            {loading ? "Sending…" : "Send"}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div
            className={`mt-2.5 flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs font-medium ${
              result.success
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {result.success ? (
              <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-red-500" />
            )}
            <span>{result.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SimulationPage() {
  return (
    <div className="min-h-screen bg-[#f7faf8]">
      {/* Page hero */}
      <section className="bg-white border-b border-emerald-100 px-4 py-10 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Software Simulation — No Hardware Needed
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 leading-tight mb-3">
            🔬 Interactive IoT Simulation
          </h1>
          <p className="text-zinc-500 text-base max-w-2xl mx-auto leading-relaxed">
            See exactly how <strong className="text-zinc-800">DustbinTracker</strong> works in real life.
            Drag the sensor slider to change the bin fill level — when it hits <strong className="text-red-600">80%+</strong>,
            the system triggers an email alert just like a real ESP32 would.
          </p>
        </div>
      </section>

      {/* How It Works flow */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-black text-zinc-800 uppercase tracking-wide">How the System Works</h2>
          </div>
          <HardwareFlowDiagram />
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-3">
              <div className="font-bold text-violet-800 mb-1">① Sensor Reads Distance</div>
              <div className="text-violet-600 text-xs leading-relaxed">The HC-SR04 ultrasonic sensor on the ESP32 fires a sound pulse and measures how far the waste is from the sensor at the top. Closer distance = more waste = higher fill%.</div>
            </div>
            <div className="bg-sky-50 border border-sky-100 rounded-xl p-3">
              <div className="font-bold text-sky-800 mb-1">② ESP32 Sends via WiFi</div>
              <div className="text-sky-600 text-xs leading-relaxed">Every 5 minutes (or immediately when ≥80%), the ESP32 sends an HTTP POST request with the binId and distanceCm to our Vercel cloud API endpoint.</div>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
              <div className="font-bold text-orange-800 mb-1">③ Cloud Sends Email Alert</div>
              <div className="text-orange-600 text-xs leading-relaxed">The API stores the data in MongoDB Atlas and uses Nodemailer to instantly send a formatted HTML email alert to the responsible moderator or the email you provide below.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bin cards grid */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="mb-6">
          <h2 className="text-xl font-black text-zinc-800">🗑️ 5 Smart Dustbins — Try Each One</h2>
          <p className="text-zinc-500 text-sm mt-1">
            Enter your email, drag the distance slider, and click <strong>Send</strong>. Check your inbox!
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {BINS.map((bin) => (
            <BinCard key={bin.id} bin={bin} />
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-10 bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 text-center">
          <div className="text-2xl mb-2">🔌</div>
          <h3 className="font-black text-zinc-800 text-base mb-1">Want the Real Hardware Setup?</h3>
          <p className="text-zinc-500 text-sm max-w-xl mx-auto">
            The actual system uses an <strong>ESP32</strong> + <strong>HC-SR04 ultrasonic sensor</strong> mounted inside a real dustbin.
            The firmware is available in our <strong>Wokwi simulation</strong>:{" "}
            <a
              href="https://wokwi.com/projects/479030344144504833"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 font-bold hover:underline"
            >
              Open Wokwi →
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
