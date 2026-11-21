"use client";

import React, { useState, useRef } from "react";
import {
  Wifi,
  Cpu,
  Radio,
  Database,
  Mail,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Info,
  AtSign,
  Loader2,
  BellOff,
} from "lucide-react";

// ─── Bin definitions (6 bins) ─────────────────────────────────────────────────
const BINS = [
  { id: "BIN-SIM-001", name: "Dhanmondi Lake Bin",       zone: "Dhanmondi", location: "Road 27, Near Lake Park" },
  { id: "BIN-SIM-002", name: "Gulshan Circle Bin",        zone: "Gulshan",   location: "Gulshan Avenue, Circle-1" },
  { id: "BIN-SIM-003", name: "Mirpur 10 Bin",             zone: "Mirpur",    location: "Mirpur 10 Roundabout" },
  { id: "BIN-SIM-004", name: "Motijheel Central Bin",     zone: "Motijheel", location: "Shapla Square Area" },
  { id: "BIN-SIM-005", name: "Uttara Sector 7 Bin",       zone: "Uttara",    location: "Sector 7, Main Road" },
  { id: "BIN-SIM-006", name: "Old Dhaka Sadarghat Bin",   zone: "Old Dhaka", location: "Sadarghat Launch Terminal" },
];

type SendState = "idle" | "sending" | "sent" | "error";

// ─── Fill gauge ───────────────────────────────────────────────────────────────
function FillGauge({ fillLevel, status }: { fillLevel: number; status: string }) {
  const radius = 40;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (fillLevel / 100) * circ;
  const color = status === "critical" ? "#dc2626" : status === "attention" ? "#d97706" : "#059669";
  return (
    <div className="relative flex items-center justify-center flex-shrink-0">
      <svg width="92" height="92" viewBox="0 0 92 92" className="-rotate-90">
        <circle cx="46" cy="46" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle cx="46" cy="46" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.4s ease, stroke 0.3s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-base font-black leading-none tabular-nums" style={{ color }}>{fillLevel}%</div>
        <div className="text-[8px] font-bold text-zinc-400 uppercase tracking-wide mt-0.5">FILL</div>
      </div>
    </div>
  );
}

// ─── Bin SVG ──────────────────────────────────────────────────────────────────
function BinSVG({ fillLevel, status, uid }: { fillLevel: number; status: string; uid: string }) {
  const fillColor = status === "critical" ? "#dc2626" : status === "attention" ? "#d97706" : "#059669";
  const fillH = (fillLevel / 100) * 54;
  const clipId = `clip-${uid}`;
  return (
    <svg width="48" height="72" viewBox="0 0 48 72" className="flex-shrink-0">
      <rect x="4" y="16" width="40" height="52" rx="4" fill="#e5e7eb" />
      <clipPath id={clipId}>
        <rect x="4" y={16 + (52 - fillH)} width="40" height={fillH} />
      </clipPath>
      <rect x="4" y="16" width="40" height="52" rx="4" fill={fillColor} opacity="0.75" clipPath={`url(#${clipId})`} />
      <rect x="1" y="10" width="46" height="8" rx="3" fill="#9ca3af" />
      <rect x="16" y="4"  width="16" height="8" rx="4" fill="#9ca3af" />
      <line x1="17" y1="26" x2="17" y2="62" stroke="#d1d5db" strokeWidth="1.5" />
      <line x1="31" y1="26" x2="31" y2="62" stroke="#d1d5db" strokeWidth="1.5" />
    </svg>
  );
}

// ─── Hardware flow ────────────────────────────────────────────────────────────
function HardwareFlowDiagram() {
  const steps = [
    { icon: <Radio className="w-4 h-4" />,    label: "HC-SR04",    sub: "Ultrasonic",   color: "bg-violet-100 text-violet-700 border-violet-200" },
    { icon: <Cpu className="w-4 h-4" />,       label: "ESP32",      sub: "MCU",          color: "bg-blue-100 text-blue-700 border-blue-200" },
    { icon: <Wifi className="w-4 h-4" />,      label: "WiFi",       sub: "HTTP POST",    color: "bg-sky-100 text-sky-700 border-sky-200" },
    { icon: <Database className="w-4 h-4" />,  label: "MongoDB",    sub: "Atlas Cloud",  color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    { icon: <Mail className="w-4 h-4" />,      label: "Nodemailer", sub: "Email Alert",  color: "bg-orange-100 text-orange-700 border-orange-200" },
  ];
  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className="flex items-center gap-1 min-w-max mx-auto justify-center">
        {steps.map((s, i) => (
          <React.Fragment key={s.label}>
            <div className={`flex flex-col items-center gap-1 px-2.5 py-2 rounded-xl border-2 ${s.color} min-w-[64px]`}>
              {s.icon}
              <div className="text-[10px] font-bold leading-tight text-center">{s.label}</div>
              <div className="text-[9px] opacity-60 text-center">{s.sub}</div>
            </div>
            {i < steps.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-zinc-300 flex-shrink-0" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── Bin Card ─────────────────────────────────────────────────────────────────
function BinCard({
  bin,
  idx,
  sharedEmail,
}: {
  bin: (typeof BINS)[0];
  idx: number;
  sharedEmail: string;
}) {
  const [distanceCm, setDistanceCm] = useState(70);
  const [sendState, setSendState] = useState<SendState>("idle");
  const hasSentRef = useRef(false);

  const fillLevel = Math.round(((100 - distanceCm) / 100) * 100);
  const status: "normal" | "attention" | "critical" =
    fillLevel >= 80 ? "critical" : fillLevel >= 50 ? "attention" : "normal";

  const statusColor = status === "critical" ? "#dc2626" : status === "attention" ? "#d97706" : "#059669";

  const sc = {
    critical: { border: "border-red-300",     headerBg: "bg-red-50",     badge: "bg-red-100 text-red-700",        label: "CRITICAL" },
    attention: { border: "border-amber-200",  headerBg: "bg-amber-50",   badge: "bg-amber-100 text-amber-700",    label: "ATTENTION" },
    normal:    { border: "border-emerald-200", headerBg: "bg-emerald-50", badge: "bg-emerald-100 text-emerald-700", label: "NORMAL" },
  }[status];

  const handleSliderChange = (rawVal: number) => {
    setDistanceCm(rawVal);
    const newFill = Math.round(((100 - rawVal) / 100) * 100);
    const newStatus = newFill >= 80 ? "critical" : newFill >= 50 ? "attention" : "normal";

    if (newStatus !== "critical") {
      // Reset so next critical crossing triggers again
      hasSentRef.current = false;
      setSendState((prev) => (prev === "sent" || prev === "error" ? "idle" : prev));
    } else if (!hasSentRef.current) {
      // First entry into critical — auto-send
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sharedEmail);
      if (emailValid) {
        hasSentRef.current = true;
        setSendState("sending");
        fetch("/api/simulation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            binId: bin.id,
            binName: bin.name,
            zone: bin.zone,
            distanceCm: rawVal,
            recipientEmail: sharedEmail.trim(),
          }),
        })
          .then((r) => r.json())
          .then((d) => setSendState(d.success ? "sent" : "error"))
          .catch(() => setSendState("error"));
      }
    }
  };

  return (
    <div className={`bg-white rounded-2xl border-2 ${sc.border} shadow-sm overflow-hidden flex flex-col transition-colors duration-300`}>
      {/* ── Header ── */}
      <div className={`${sc.headerBg} px-3 py-3 flex items-center gap-3`}>
        <BinSVG fillLevel={fillLevel} status={status} uid={`bin-${idx}`} />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-zinc-900 text-sm leading-tight">{bin.name}</div>
          <div className="text-xs text-zinc-500 mt-0.5 truncate">{bin.location}</div>
          <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.badge}`}>
            {sc.label}
          </span>
        </div>
        <FillGauge fillLevel={fillLevel} status={status} />
      </div>

      {/* ── Hardware spec ── */}
      <div className="bg-zinc-900 px-3 py-2.5 font-mono text-[10px] text-zinc-400 leading-relaxed">
        <div className="text-emerald-400 font-bold mb-1 text-[9px] uppercase tracking-widest">⚙ Hardware</div>
        <div className="grid grid-cols-2 gap-x-3">
          <div>MCU: <span className="text-sky-300">ESP32-WROOM</span></div>
          <div>Sensor: <span className="text-sky-300">HC-SR04</span></div>
          <div>Trig: <span className="text-amber-300">GPIO 5</span></div>
          <div>Echo: <span className="text-amber-300">GPIO 18</span></div>
          <div>🔴 LED: <span className="text-red-400">GPIO 2</span></div>
          <div>🟢 LED: <span className="text-emerald-400">GPIO 4</span></div>
        </div>
        <div className="mt-1.5 pt-1.5 border-t border-zinc-700 flex gap-3">
          <span><span className="text-zinc-500">ID: </span><span className="text-yellow-300">{bin.id}</span></span>
          <span><span className="text-zinc-500">Zone: </span><span className="text-yellow-300">{bin.zone}</span></span>
        </div>
      </div>

      {/* ── Slider ── */}
      <div className="px-3 pt-3 pb-2 flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">📏 HC-SR04 Distance</span>
          <span className="font-mono font-black text-sm" style={{ color: statusColor }}>{distanceCm} cm</span>
        </div>
        <input
          type="range" min={2} max={100} step={1} value={distanceCm}
          onChange={(e) => handleSliderChange(Number(e.target.value))}
          className="w-full h-2.5 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(to right, ${statusColor} ${fillLevel}%, #e5e7eb ${fillLevel}%)` }}
        />
        <div className="flex justify-between text-[9px] text-zinc-400 mt-1 font-mono">
          <span>2 cm (100% full)</span>
          <span>100 cm (empty)</span>
        </div>

        {/* Formula */}
        <div className="mt-2 bg-zinc-50 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-zinc-500">
          Fill = (100 − {distanceCm}) ÷ 100 × 100 ={" "}
          <strong style={{ color: statusColor }}>{fillLevel}%</strong>
        </div>
      </div>

      {/* ── Status panel (auto-send feedback) ── */}
      <div className="px-3 pb-3 pt-1">
        {sendState === "sending" && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-blue-700">
            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
            <span>Sending alert email…</span>
          </div>
        )}

        {sendState === "sent" && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-2.5 text-xs font-bold text-emerald-700">
            <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <div>
              <div>Mail Sent Successfully ✓</div>
              <div className="font-normal text-emerald-600 text-[10px] mt-0.5">
                Alert delivered — slide back below 80% to reset
              </div>
            </div>
          </div>
        )}

        {sendState === "error" && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-xs font-bold text-red-700">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <div>
              <div>Failed to send email</div>
              <div className="font-normal text-red-500 text-[10px] mt-0.5">Check email address above & try again</div>
            </div>
          </div>
        )}

        {sendState === "idle" && status === "critical" && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-red-700 animate-pulse">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Critical! Enter a valid email above to auto-send alert.</span>
          </div>
        )}

        {sendState === "idle" && status === "attention" && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Bin needs attention soon. Slide to ≥ 80 cm fill for auto alert.</span>
          </div>
        )}

        {sendState === "idle" && status === "normal" && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs text-emerald-700">
            <BellOff className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Bin is OK. Drag slider ↑ above 20 cm to trigger a critical alert.</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SimulationPage() {
  const [sharedEmail, setSharedEmail] = useState("");
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sharedEmail);

  return (
    <div className="min-h-screen bg-[#f7faf8]">

      {/* Hero */}
      <section className="bg-white border-b border-emerald-100 px-4 py-8 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Software Simulation — No Hardware Needed
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 leading-tight mb-2">
            🔬 Interactive IoT Simulation
          </h1>
          <p className="text-zinc-500 text-sm max-w-xl mx-auto leading-relaxed">
            Enter your email once below. Then drag any bin&apos;s slider past{" "}
            <strong className="text-red-600">80% fill</strong> — an alert email will be sent
            to you automatically, just like a real ESP32 sensor would.
          </p>
        </div>
      </section>

      {/* Sticky shared email bar */}
      <div className="sticky top-20 z-30 bg-white/96 backdrop-blur border-b border-emerald-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-2.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <AtSign className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-bold text-zinc-700 whitespace-nowrap">Alert Email:</span>
            </div>
            <input
              type="email"
              placeholder="your@email.com — alerts auto-send when any bin crosses 80%"
              value={sharedEmail}
              onChange={(e) => setSharedEmail(e.target.value)}
              className={`flex-1 border-2 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all ${
                sharedEmail && !emailValid
                  ? "border-red-300 focus:ring-red-300 bg-red-50"
                  : emailValid
                  ? "border-emerald-400 focus:ring-emerald-300 bg-emerald-50/60"
                  : "border-zinc-200 focus:ring-emerald-300 bg-white"
              }`}
            />
            <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl flex-shrink-0 ${
              emailValid
                ? "bg-emerald-100 text-emerald-700"
                : sharedEmail
                ? "bg-red-50 text-red-600"
                : "bg-zinc-100 text-zinc-400"
            }`}>
              {emailValid
                ? <><CheckCircle className="w-3.5 h-3.5" /> Ready</>
                : sharedEmail
                ? <><AlertTriangle className="w-3.5 h-3.5" /> Invalid</>
                : <><Mail className="w-3.5 h-3.5" /> Enter email</>}
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-black text-zinc-800 uppercase tracking-wide">How the System Works</h2>
          </div>
          <HardwareFlowDiagram />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-3">
              <div className="font-bold text-violet-800 text-xs mb-1">① Sensor Reads Distance</div>
              <div className="text-violet-600 text-[11px] leading-relaxed">HC-SR04 fires a sound pulse and measures distance to the waste surface. Closer = fuller bin.</div>
            </div>
            <div className="bg-sky-50 border border-sky-100 rounded-xl p-3">
              <div className="font-bold text-sky-800 text-xs mb-1">② ESP32 Sends via WiFi</div>
              <div className="text-sky-600 text-[11px] leading-relaxed">Every 5 min (or instantly at ≥80%), ESP32 sends HTTP POST to our Vercel cloud API.</div>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
              <div className="font-bold text-orange-800 text-xs mb-1">③ Cloud Sends Email</div>
              <div className="text-orange-600 text-[11px] leading-relaxed">API saves to MongoDB Atlas and Nodemailer sends a formatted HTML alert to the email address.</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Bin cards */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="mb-5">
          <h2 className="text-lg font-black text-zinc-800">🗑️ 6 Smart Dustbins</h2>
          <p className="text-zinc-500 text-sm mt-1">
            Drag any slider past <strong className="text-red-600">80% fill</strong> — email auto-sends. No button needed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {BINS.map((bin, i) => (
            <BinCard key={bin.id} bin={bin} idx={i} sharedEmail={sharedEmail} />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 text-center">
          <div className="text-xl mb-1.5">🔌</div>
          <h3 className="font-black text-zinc-800 text-sm mb-1">Want the Real Hardware?</h3>
          <p className="text-zinc-500 text-sm max-w-lg mx-auto">
            Actual system: <strong>ESP32</strong> + <strong>HC-SR04</strong> inside a real dustbin.{" "}
            <a href="https://wokwi.com/projects/479030344144504833" target="_blank" rel="noopener noreferrer"
              className="text-emerald-600 font-bold hover:underline">
              Open Wokwi Simulation →
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
