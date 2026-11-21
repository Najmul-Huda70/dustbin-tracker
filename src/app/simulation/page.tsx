"use client";

import React, { useState, useCallback } from "react";
import {
  Wifi,
  Cpu,
  Radio,
  Database,
  Mail,
  ChevronRight,
  Send,
  CheckCircle,
  AlertTriangle,
  Info,
  AtSign,
} from "lucide-react";

// ─── Bin definitions (6 bins) ─────────────────────────────────────────────────
const BINS = [
  {
    id: "BIN-SIM-001",
    name: "Dhanmondi Lake Bin",
    zone: "Dhanmondi",
    location: "Road 27, Near Lake Park",
  },
  {
    id: "BIN-SIM-002",
    name: "Gulshan Circle Bin",
    zone: "Gulshan",
    location: "Gulshan Avenue, Circle-1",
  },
  {
    id: "BIN-SIM-003",
    name: "Mirpur 10 Bin",
    zone: "Mirpur",
    location: "Mirpur 10 Roundabout",
  },
  {
    id: "BIN-SIM-004",
    name: "Motijheel Central Bin",
    zone: "Motijheel",
    location: "Shapla Square Area",
  },
  {
    id: "BIN-SIM-005",
    name: "Uttara Sector 7 Bin",
    zone: "Uttara",
    location: "Sector 7, Main Road",
  },
  {
    id: "BIN-SIM-006",
    name: "Old Dhaka Sadarghat Bin",
    zone: "Old Dhaka",
    location: "Sadarghat Launch Terminal",
  },
];

// ─── Fill level gauge ─────────────────────────────────────────────────────────
function FillGauge({ fillLevel, status }: { fillLevel: number; status: string }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (fillLevel / 100) * circumference;
  const color =
    status === "critical" ? "#dc2626" : status === "attention" ? "#d97706" : "#059669";
  return (
    <div className="relative flex items-center justify-center">
      <svg width="98" height="98" viewBox="0 0 98 98" className="-rotate-90">
        <circle cx="49" cy="49" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="9" />
        <circle
          cx="49" cy="49" r={radius} fill="none" stroke={color} strokeWidth="9"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.45s ease, stroke 0.35s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-lg font-black leading-none tabular-nums" style={{ color }}>
          {fillLevel}%
        </div>
        <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide mt-0.5">FILL</div>
      </div>
    </div>
  );
}

// ─── Dustbin SVG ──────────────────────────────────────────────────────────────
function BinSVG({ fillLevel, status, binIndex }: { fillLevel: number; status: string; binIndex: number }) {
  const fillColor = status === "critical" ? "#dc2626" : status === "attention" ? "#d97706" : "#059669";
  const fillHeight = (fillLevel / 100) * 54;
  const clipId = `clip-bin-${binIndex}`;
  return (
    <svg width="52" height="76" viewBox="0 0 52 76" className="flex-shrink-0">
      <rect x="5" y="17" width="42" height="54" rx="4" fill="#e5e7eb" />
      <clipPath id={clipId}>
        <rect x="5" y={17 + (54 - fillHeight)} width="42" height={fillHeight} />
      </clipPath>
      <rect x="5" y="17" width="42" height="54" rx="4" fill={fillColor} opacity="0.75" clipPath={`url(#${clipId})`} />
      <rect x="1" y="11" width="50" height="8" rx="3" fill="#9ca3af" />
      <rect x="18" y="5" width="16" height="8" rx="4" fill="#9ca3af" />
      <line x1="19" y1="27" x2="19" y2="65" stroke="#d1d5db" strokeWidth="1.5" />
      <line x1="33" y1="27" x2="33" y2="65" stroke="#d1d5db" strokeWidth="1.5" />
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
              {step.icon}
              <div className="text-[11px] font-bold leading-tight text-center">{step.label}</div>
              <div className="text-[9px] opacity-70 text-center leading-tight">{step.sub}</div>
            </div>
            {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-zinc-300 flex-shrink-0" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── Bin Card (receives shared email + onResult callback) ─────────────────────
interface BinResult {
  success: boolean;
  message: string;
  binId: string;
}

function BinCard({
  bin,
  binIndex,
  sharedEmail,
  onResult,
}: {
  bin: (typeof BINS)[0];
  binIndex: number;
  sharedEmail: string;
  onResult: (r: BinResult) => void;
}) {
  const [distanceCm, setDistanceCm] = useState(60);
  const [loading, setLoading] = useState(false);
  const [localResult, setLocalResult] = useState<{ success: boolean; message: string } | null>(null);

  const fillLevel = Math.round(((100 - distanceCm) / 100) * 100);
  const status: "normal" | "attention" | "critical" =
    fillLevel >= 80 ? "critical" : fillLevel >= 50 ? "attention" : "normal";

  const sc = {
    critical: { border: "border-red-200", bg: "bg-red-50", badge: "bg-red-100 text-red-700", label: "CRITICAL" },
    attention: { border: "border-amber-200", bg: "bg-amber-50", badge: "bg-amber-100 text-amber-700", label: "ATTENTION" },
    normal:   { border: "border-emerald-200", bg: "bg-emerald-50", badge: "bg-emerald-100 text-emerald-700", label: "NORMAL" },
  }[status];

  const handleSend = useCallback(async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!sharedEmail.trim() || !emailRegex.test(sharedEmail)) {
      setLocalResult({ success: false, message: "⚠️ Please enter a valid email above first." });
      return;
    }
    setLoading(true);
    setLocalResult(null);
    try {
      const res = await fetch("/api/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          binId: bin.id,
          binName: bin.name,
          zone: bin.zone,
          distanceCm,
          recipientEmail: sharedEmail.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        const msg = `✅ Sent! Fill: ${data.fillLevel}% — ${data.status.toUpperCase()}`;
        setLocalResult({ success: true, message: msg });
        onResult({ success: true, message: `${bin.name}: ${msg}`, binId: bin.id });
      } else {
        const msg = `❌ ${data.error || "Failed"}`;
        setLocalResult({ success: false, message: msg });
        onResult({ success: false, message: `${bin.name}: ${msg}`, binId: bin.id });
      }
    } catch {
      setLocalResult({ success: false, message: "❌ Network error." });
    } finally {
      setLoading(false);
    }
  }, [bin, distanceCm, sharedEmail, onResult]);

  const statusColor = status === "critical" ? "#dc2626" : status === "attention" ? "#d97706" : "#059669";

  return (
    <div className={`bg-white rounded-2xl border-2 ${sc.border} shadow-sm overflow-hidden flex flex-col transition-all duration-300`}>
      {/* Header */}
      <div className={`${sc.bg} px-4 py-3 flex items-center justify-between gap-3`}>
        <div className="flex items-center gap-2 min-w-0">
          <BinSVG fillLevel={fillLevel} status={status} binIndex={binIndex} />
          <div className="min-w-0">
            <div className="font-bold text-zinc-900 text-sm leading-tight truncate">{bin.name}</div>
            <div className="text-xs text-zinc-500 mt-0.5 truncate">{bin.location}</div>
            <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.badge}`}>{sc.label}</span>
          </div>
        </div>
        <FillGauge fillLevel={fillLevel} status={status} />
      </div>

      {/* Hardware spec */}
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
          <span className="text-zinc-500">ID: </span><span className="text-yellow-300">{bin.id}</span>
          <span className="text-zinc-500 ml-3">Zone: </span><span className="text-yellow-300">{bin.zone}</span>
        </div>
      </div>

      {/* Slider */}
      <div className="px-4 pt-4 pb-2 flex-1">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-zinc-600 uppercase tracking-wide">📏 HC-SR04 Distance</label>
          <span className="font-mono font-black text-sm text-zinc-900">{distanceCm} cm</span>
        </div>
        <input
          type="range" min={2} max={100} step={1} value={distanceCm}
          onChange={(e) => { setDistanceCm(Number(e.target.value)); setLocalResult(null); }}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(to right, ${statusColor} ${fillLevel}%, #e5e7eb ${fillLevel}%)` }}
        />
        <div className="flex justify-between text-[10px] text-zinc-400 mt-1 font-mono">
          <span>2 cm (100% full)</span>
          <span>100 cm (empty)</span>
        </div>
        {/* Formula */}
        <div className="mt-3 bg-zinc-50 rounded-xl px-3 py-2 text-xs font-mono text-zinc-600">
          <span className="text-zinc-400">Fill = </span>
          <span className="font-bold" style={{ color: statusColor }}>
            (100 − {distanceCm}) / 100 × 100 = {fillLevel}%
          </span>
          {status === "critical" && (
            <span className="ml-2 text-red-600 font-bold animate-pulse"> ⚡ Alert!</span>
          )}
        </div>
      </div>

      {/* Send button */}
      <div className="px-4 pb-4 pt-2">
        <button
          onClick={handleSend}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all ${
            loading
              ? "bg-zinc-300 cursor-not-allowed"
              : status === "critical"
              ? "bg-red-600 hover:bg-red-700 shadow shadow-red-100"
              : status === "attention"
              ? "bg-amber-500 hover:bg-amber-600 shadow shadow-amber-100"
              : "bg-emerald-600 hover:bg-emerald-700 shadow shadow-emerald-100"
          }`}
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          {loading ? "Sending…" : "Send Alert Email"}
        </button>

        {localResult && (
          <div className={`mt-2 flex items-start gap-2 rounded-xl px-3 py-2 text-xs font-medium ${
            localResult.success
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}>
            {localResult.success
              ? <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-600" />
              : <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-red-500" />}
            <span>{localResult.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SimulationPage() {
  const [sharedEmail, setSharedEmail] = useState("");
  const [globalResults, setGlobalResults] = useState<BinResult[]>([]);

  const handleResult = useCallback((r: BinResult) => {
    setGlobalResults((prev) => [r, ...prev].slice(0, 10));
  }, []);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sharedEmail);

  return (
    <div className="min-h-screen bg-[#f7faf8]">

      {/* Hero */}
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
            Enter your email once, then drag any bin&apos;s sensor slider — when it hits{" "}
            <strong className="text-red-600">80%+</strong>, you&apos;ll get an email alert just like a real ESP32 would.
          </p>
        </div>
      </section>

      {/* Shared Email Input — sticky banner */}
      <div className="sticky top-20 z-30 bg-white/95 backdrop-blur border-b border-emerald-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <AtSign className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-bold text-zinc-700">Alert Email:</span>
            </div>
            <input
              type="email"
              placeholder="Enter your email to receive alerts from any bin…"
              value={sharedEmail}
              onChange={(e) => setSharedEmail(e.target.value)}
              className={`flex-1 border-2 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 transition-all ${
                sharedEmail && !emailValid
                  ? "border-red-300 focus:ring-red-300 bg-red-50"
                  : emailValid
                  ? "border-emerald-400 focus:ring-emerald-300 bg-emerald-50/50"
                  : "border-zinc-200 focus:ring-emerald-300 bg-white"
              }`}
            />
            {emailValid && (
              <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold bg-emerald-100 px-3 py-2 rounded-xl flex-shrink-0">
                <CheckCircle className="w-3.5 h-3.5" />
                Ready
              </div>
            )}
            {sharedEmail && !emailValid && (
              <div className="flex items-center gap-1.5 text-red-600 text-xs font-bold bg-red-50 px-3 py-2 rounded-xl flex-shrink-0">
                <AlertTriangle className="w-3.5 h-3.5" />
                Invalid
              </div>
            )}
          </div>
          {!sharedEmail && (
            <p className="text-xs text-zinc-400 mt-1.5 pl-6">
              👆 Enter your email first — then click &quot;Send Alert Email&quot; on any dustbin below.
            </p>
          )}
        </div>
      </div>

      {/* How It Works */}
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
              <div className="text-violet-600 text-xs leading-relaxed">The HC-SR04 fires a sound pulse and measures how far the waste is from the top. Closer = more waste = higher fill%.</div>
            </div>
            <div className="bg-sky-50 border border-sky-100 rounded-xl p-3">
              <div className="font-bold text-sky-800 mb-1">② ESP32 Sends via WiFi</div>
              <div className="text-sky-600 text-xs leading-relaxed">Every 5 minutes (or instantly at ≥80%), the ESP32 sends an HTTP POST with binId and distanceCm to our Vercel API.</div>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
              <div className="font-bold text-orange-800 mb-1">③ Cloud Sends Email Alert</div>
              <div className="text-orange-600 text-xs leading-relaxed">The API stores data in MongoDB Atlas and uses Nodemailer to instantly send a formatted HTML email to your inbox.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bin cards */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h2 className="text-xl font-black text-zinc-800">🗑️ 6 Smart Dustbins — Try Each One</h2>
            <p className="text-zinc-500 text-sm mt-1">
              Drag the distance slider on any bin, then click <strong>Send Alert Email</strong>. Check your inbox!
            </p>
          </div>
          {globalResults.length > 0 && (
            <div className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5">
              {globalResults.filter(r => r.success).length} email{globalResults.filter(r => r.success).length !== 1 ? "s" : ""} sent this session ✓
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {BINS.map((bin, i) => (
            <BinCard
              key={bin.id}
              bin={bin}
              binIndex={i}
              sharedEmail={sharedEmail}
              onResult={handleResult}
            />
          ))}
        </div>

        {/* Activity log */}
        {globalResults.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <h3 className="text-sm font-black text-zinc-700 mb-3 uppercase tracking-wide">📋 Session Activity</h3>
            <div className="space-y-2">
              {globalResults.map((r, i) => (
                <div key={i} className={`flex items-center gap-2 text-xs rounded-xl px-3 py-2 ${
                  r.success ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
                }`}>
                  {r.success
                    ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
                    : <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-red-500" />}
                  <span>{r.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer note */}
        <div className="mt-8 bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 text-center">
          <div className="text-2xl mb-2">🔌</div>
          <h3 className="font-black text-zinc-800 text-base mb-1">Want the Real Hardware Setup?</h3>
          <p className="text-zinc-500 text-sm max-w-xl mx-auto">
            The actual system uses an <strong>ESP32</strong> + <strong>HC-SR04 ultrasonic sensor</strong> mounted inside a real dustbin.
            Try the live Wokwi firmware simulation:{" "}
            <a
              href="https://wokwi.com/projects/479030344144504833"
              target="_blank" rel="noopener noreferrer"
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
