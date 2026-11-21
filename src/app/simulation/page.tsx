"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ShieldAlert,
  Sparkles,
} from "lucide-react";

// ─── Bin definitions (6 bins) ─────────────────────────────────────────────────
const BINS = [
  { id: "BIN-SIM-001", name: "Dhanmondi Lake Bin",     zone: "Dhanmondi", location: "Road 27, Near Lake Park" },
  { id: "BIN-SIM-002", name: "Gulshan Circle Bin",      zone: "Gulshan",   location: "Gulshan Avenue, Circle-1" },
  { id: "BIN-SIM-003", name: "Mirpur 10 Bin",           zone: "Mirpur",    location: "Mirpur 10 Roundabout" },
  { id: "BIN-SIM-004", name: "Motijheel Central Bin",   zone: "Motijheel", location: "Shapla Square Area" },
  { id: "BIN-SIM-005", name: "Uttara Sector 7 Bin",     zone: "Uttara",    location: "Sector 7, Main Road" },
  { id: "BIN-SIM-006", name: "Old Dhaka Sadarghat Bin", zone: "Old Dhaka", location: "Sadarghat Launch Terminal" },
];

type SendState = "idle" | "sending" | "sent" | "error" | "blocked";

// ─── Smooth Framer Motion Fill Gauge ──────────────────────────────────────────
function FillGauge({ fillLevel, status }: { fillLevel: number; status: string }) {
  const radius = 38;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (fillLevel / 100) * circ;
  const color = status === "critical" ? "#dc2626" : status === "attention" ? "#d97706" : "#059669";

  return (
    <div className="relative flex items-center justify-center flex-shrink-0">
      <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
        <circle cx="44" cy="44" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <motion.circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeDasharray={circ}
          animate={{
            strokeDashoffset: offset,
            stroke: color,
          }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center">
        <motion.div
          key={fillLevel}
          initial={{ scale: 0.9, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-base font-black leading-none tabular-nums"
          style={{ color }}
        >
          {fillLevel}%
        </motion.div>
        <div className="text-[8px] font-bold text-zinc-400 uppercase tracking-wide mt-0.5">FILL</div>
      </div>
    </div>
  );
}

// ─── Smooth Framer Motion Bin Illustration ────────────────────────────────────
function BinSVG({ fillLevel, status, uid }: { fillLevel: number; status: string; uid: string }) {
  const fillColor = status === "critical" ? "#dc2626" : status === "attention" ? "#d97706" : "#059669";
  const fillH = (fillLevel / 100) * 50;
  const clipId = `clip-${uid}`;

  return (
    <svg width="44" height="68" viewBox="0 0 44 68" className="flex-shrink-0">
      <rect x="4" y="16" width="36" height="50" rx="4" fill="#e5e7eb" />
      <clipPath id={clipId}>
        <motion.rect
          x="4"
          width="36"
          rx="4"
          animate={{
            y: 16 + (50 - fillH),
            height: fillH,
          }}
          transition={{ type: "spring", damping: 18, stiffness: 120 }}
        />
      </clipPath>
      <motion.rect
        x="4"
        y="16"
        width="36"
        height="50"
        rx="4"
        animate={{ fill: fillColor }}
        transition={{ duration: 0.3 }}
        opacity="0.82"
        clipPath={`url(#${clipId})`}
      />
      <rect x="1" y="10" width="42" height="8" rx="3" fill="#9ca3af" />
      <rect x="14" y="4" width="16" height="8" rx="4" fill="#9ca3af" />
      <line x1="16" y1="24" x2="16" y2="58" stroke="#d1d5db" strokeWidth="1.5" />
      <line x1="28" y1="24" x2="28" y2="58" stroke="#d1d5db" strokeWidth="1.5" />
    </svg>
  );
}

// ─── Smooth Hardware Flow Diagram ─────────────────────────────────────────────
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
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ duration: 0.2 }}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 ${s.color} min-w-[70px] shadow-2xs cursor-default`}
            >
              {s.icon}
              <div className="text-[10px] font-bold leading-tight text-center">{s.label}</div>
              <div className="text-[9px] opacity-70 text-center">{s.sub}</div>
            </motion.div>
            {i < steps.length - 1 && (
              <motion.div
                animate={{ x: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
              >
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── Single Bin Card with Framer Motion ────────────────────────────────────────
function BinCard({
  bin,
  idx,
  sharedEmail,
  emailValid,
  onFocusEmail,
}: {
  bin: (typeof BINS)[0];
  idx: number;
  sharedEmail: string;
  emailValid: boolean;
  onFocusEmail: () => void;
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

  // If email becomes valid while currently at critical, allow auto-trigger
  useEffect(() => {
    if (status === "critical" && !hasSentRef.current && emailValid) {
      hasSentRef.current = true;
      setSendState("sending");
      fetch("/api/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          binId: bin.id,
          binName: bin.name,
          zone: bin.zone,
          distanceCm,
          recipientEmail: sharedEmail.trim(),
        }),
      })
        .then((r) => r.json())
        .then((d) => setSendState(d.success ? "sent" : "error"))
        .catch(() => setSendState("error"));
    }
  }, [emailValid, status, bin, distanceCm, sharedEmail]);

  const handleSliderChange = (rawVal: number) => {
    setDistanceCm(rawVal);
    const newFill = Math.round(((100 - rawVal) / 100) * 100);
    const newStatus = newFill >= 80 ? "critical" : newFill >= 50 ? "attention" : "normal";

    if (newStatus !== "critical") {
      // Reset so next critical crossing triggers again
      hasSentRef.current = false;
      setSendState((prev) => (prev === "sent" || prev === "error" || prev === "blocked" ? "idle" : prev));
    } else if (!hasSentRef.current) {
      // STRICT CHECK: Valid email MUST be present
      if (!emailValid) {
        setSendState("blocked");
        return;
      }

      // Valid email present -> dispatch alert
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
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
      className={`bg-white rounded-2xl border-2 ${sc.border} shadow-sm overflow-hidden flex flex-col transition-colors duration-300`}
    >
      {/* ── Header ── */}
      <div className={`${sc.headerBg} px-4 py-3 flex items-center gap-3 transition-colors duration-300`}>
        <BinSVG fillLevel={fillLevel} status={status} uid={`bin-${idx}`} />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-zinc-900 text-sm leading-tight truncate">{bin.name}</div>
          <div className="text-xs text-zinc-500 mt-0.5 truncate">{bin.location}</div>
          <motion.span
            layout
            className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.badge}`}
          >
            {sc.label}
          </motion.span>
        </div>
        <FillGauge fillLevel={fillLevel} status={status} />
      </div>

      {/* ── Hardware Spec ── */}
      <div className="bg-zinc-900 px-4 py-2.5 font-mono text-[10px] text-zinc-400 leading-relaxed">
        <div className="text-emerald-400 font-bold mb-1 text-[9px] uppercase tracking-widest flex items-center justify-between">
          <span>⚙ Hardware Spec</span>
          <span className="text-zinc-500">{bin.id}</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
          <div>MCU: <span className="text-sky-300">ESP32-WROOM</span></div>
          <div>Sensor: <span className="text-sky-300">HC-SR04</span></div>
          <div>Trig Pin: <span className="text-amber-300">GPIO 5</span></div>
          <div>Echo Pin: <span className="text-amber-300">GPIO 18</span></div>
          <div>🔴 Full LED: <span className="text-red-400">GPIO 2</span></div>
          <div>🟢 Normal: <span className="text-emerald-400">GPIO 4</span></div>
        </div>
      </div>

      {/* ── Slider ── */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-600 uppercase tracking-wide">
              📏 HC-SR04 Distance:
            </span>
            <span className="font-mono font-black text-sm" style={{ color: statusColor }}>
              {distanceCm} cm
            </span>
          </div>

          <input
            type="range"
            min={2}
            max={100}
            step={1}
            value={distanceCm}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full h-3 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${statusColor} ${fillLevel}%, #e5e7eb ${fillLevel}%)`,
            }}
          />

          <div className="flex justify-between text-[10px] text-zinc-400 mt-1 font-mono">
            <span>2 cm (100% full)</span>
            <span className="text-amber-600 font-semibold">20 cm (80% alert threshold)</span>
            <span>100 cm (empty)</span>
          </div>

          {/* Formula */}
          <div className="mt-3 bg-zinc-50 rounded-xl px-3 py-2 text-xs font-mono text-zinc-600 border border-zinc-100">
            <span className="text-zinc-400">Fill Calculation: </span>
            <span className="font-bold" style={{ color: statusColor }}>
              (100 - {distanceCm}) / 100 = {fillLevel}%
            </span>
          </div>
        </div>

        {/* ── Status panel with AnimatePresence ── */}
        <div className="mt-4 pt-2 border-t border-zinc-100">
          <AnimatePresence mode="wait">
            {sendState === "sending" && (
              <motion.div
                key="sending"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 text-xs font-bold text-blue-700"
              >
                <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                <span>Sending alert email to {sharedEmail}…</span>
              </motion.div>
            )}

            {sendState === "sent" && (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-start gap-2 bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-2.5 text-xs font-bold text-emerald-800"
              >
                <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <div>Mail Sent Successfully ✓</div>
                  <div className="font-normal text-emerald-700 text-[10px] mt-0.5">
                    Delivered to <strong>{sharedEmail}</strong>! Move slider &gt;20 cm to reset.
                  </div>
                </div>
              </motion.div>
            )}

            {sendState === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-xs font-bold text-red-700"
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-500" />
                <span>Failed to send email. Check SMTP credentials or retry.</span>
              </motion.div>
            )}

            {(sendState === "blocked" || (!emailValid && status === "critical")) && (
              <motion.div
                key="blocked"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2 bg-amber-50 border border-amber-300 rounded-xl px-3 py-2.5 text-xs font-bold text-amber-800"
              >
                <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <div>⚠️ Mail Sending Blocked</div>
                  <div className="font-normal text-amber-700 text-[10px] mt-0.5">
                    No valid email provided.{" "}
                    <button
                      onClick={onFocusEmail}
                      className="underline font-bold text-amber-900 hover:text-black cursor-pointer"
                    >
                      Enter your email above
                    </button>{" "}
                    to enable alerts.
                  </div>
                </div>
              </motion.div>
            )}

            {sendState === "idle" && status === "critical" && emailValid && (
              <motion.div
                key="critical"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-xs font-bold text-red-700"
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Critical fill level reached (≥ 80%).</span>
              </motion.div>
            )}

            {sendState === "idle" && status === "attention" && (
              <motion.div
                key="attention"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 bg-amber-50/80 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-800 font-medium"
              >
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
                <span>Attention (50-79%). Slide ≤ 20 cm (≥ 80%) for auto alert.</span>
              </motion.div>
            )}

            {sendState === "idle" && status === "normal" && (
              <motion.div
                key="normal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 bg-emerald-50/80 border border-emerald-200 rounded-xl px-3 py-2 text-xs text-emerald-800 font-medium"
              >
                <BellOff className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
                <span>Normal status (&lt; 50%). All clear.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SimulationPage() {
  const [sharedEmail, setSharedEmail] = useState("");
  const emailInputRef = useRef<HTMLInputElement>(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailValid = emailRegex.test(sharedEmail.trim());

  const focusEmailInput = () => {
    emailInputRef.current?.focus();
    emailInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] overflow-x-hidden">

      {/* ── Hero Section with Framer Motion ── */}
      <section className="bg-white border-b border-emerald-100 px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-bold px-3.5 py-1.5 rounded-full mb-4 border border-emerald-200 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Software Simulation Lab — No Hardware Required
          </motion.div>

          <h1 className="text-3xl sm:text-5xl font-black text-emerald-950 leading-tight mb-3">
            🔬 Interactive IoT Waste Simulation
          </h1>

          <p className="text-zinc-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Experience the real-life behavior of <strong className="text-emerald-950">DustbinTracker</strong>.
            Configure your email below, then adjust any dustbin&apos;s distance slider. 
            When distance reaches <strong className="text-red-600">≤ 20 cm (≥ 80% full)</strong>, 
            an instant critical overflow alert email will be automatically dispatched to your inbox!
          </p>
        </motion.div>
      </section>

      {/* ── Prominent Email Activation Card with Motion ── */}
      <section className="max-w-4xl mx-auto px-4 -mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="bg-white rounded-2xl border-2 border-emerald-200 shadow-lg shadow-emerald-900/5 p-5 sm:p-6 transition-all"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 shadow-2xs">
                <AtSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wide">
                  Step 1: Set Recipient Email for Alerts
                </h3>
                <p className="text-xs text-zinc-500">
                  Valid email is required. Mails will strictly NOT send without a verified email address.
                </p>
              </div>
            </div>

            {/* Validation Badge with AnimatePresence */}
            <div className="self-start sm:self-auto min-h-[30px] flex items-center">
              <AnimatePresence mode="wait">
                {emailValid ? (
                  <motion.span
                    key="valid"
                    initial={{ opacity: 0, scale: 0.85, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: 4 }}
                    transition={{ duration: 0.2 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Live Dispatch Active
                  </motion.span>
                ) : sharedEmail ? (
                  <motion.span
                    key="invalid"
                    initial={{ opacity: 0, scale: 0.85, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: 4 }}
                    transition={{ duration: 0.2 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    Invalid Email Format
                  </motion.span>
                ) : (
                  <motion.span
                    key="required"
                    initial={{ opacity: 0, scale: 0.85, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: 4 }}
                    transition={{ duration: 0.2 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    Email Required
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Email Input Field */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              ref={emailInputRef}
              type="email"
              placeholder="Enter your email (e.g. tempostand7@gmail.com)"
              value={sharedEmail}
              onChange={(e) => setSharedEmail(e.target.value)}
              className={`flex-1 border-2 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none transition-all ${
                emailValid
                  ? "border-emerald-500 bg-emerald-50/40 text-emerald-950 focus:ring-2 focus:ring-emerald-400"
                  : sharedEmail
                  ? "border-red-400 bg-red-50/40 text-red-950 focus:ring-2 focus:ring-red-300"
                  : "border-zinc-300 bg-white text-zinc-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              }`}
            />
          </div>

          {/* Helper feedback text */}
          <div className="mt-2.5 text-xs">
            {emailValid ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                ✓ Ready! Moving any dustbin slider past 80% will dispatch a real-time email to <strong>{sharedEmail}</strong>.
              </span>
            ) : sharedEmail ? (
              <span className="text-red-600 font-semibold">
                ⚠️ Please provide a valid email address (e.g. name@example.com).
              </span>
            ) : (
              <span className="text-zinc-500">
                💡 Tip: Type your email here first. Then drag the sensor slider on any of the 6 dustbins below!
              </span>
            )}
          </div>
        </motion.div>
      </section>

      {/* ── How It Works Pipeline Section ── */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-black text-emerald-950 uppercase tracking-wide">
              Step 2: Understand The End-to-End IoT Pipeline
            </h2>
          </div>

          <HardwareFlowDiagram />

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-violet-50/80 border border-violet-100 rounded-xl p-3.5">
              <div className="font-bold text-violet-900 text-xs mb-1">① Ultrasonic Distance Read</div>
              <p className="text-violet-700 text-xs leading-relaxed">
                The HC-SR04 sensor bounces sound waves. Closer distance to top means fuller bin.
              </p>
            </div>
            <div className="bg-sky-50/80 border border-sky-100 rounded-xl p-3.5">
              <div className="font-bold text-sky-900 text-xs mb-1">② ESP32 Telemetry Push</div>
              <p className="text-sky-700 text-xs leading-relaxed">
                Microcontroller computes fill level and posts JSON data over Wi-Fi to our Vercel API endpoint.
              </p>
            </div>
            <div className="bg-orange-50/80 border border-orange-100 rounded-xl p-3.5">
              <div className="font-bold text-orange-900 text-xs mb-1">③ Dual-Channel Alert Dispatch</div>
              <p className="text-orange-700 text-xs leading-relaxed">
                When fill reaches ≥ 80%, MongoDB Atlas updates and Nodemailer dispatches an immediate email alert.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── 6 Smart Dustbins Grid with Motion Stagger ── */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-black text-emerald-950">
              🗑️ Step 3: Test With 6 Smart Dustbins Across Dhaka
            </h2>
            <p className="text-zinc-500 text-xs sm:text-sm mt-0.5">
              Move any slider below 20 cm (≥ 80%). The alert will automatically send once without clicking any button!
            </p>
          </div>
          
          <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-900 shadow-2xs self-start sm:self-auto">
            <span>Critical Threshold: </span>
            <span className="text-red-600 font-mono font-black">≥ 80% (≤ 20 cm)</span>
          </div>
        </div>

        {/* 6 Responsive Cards Animated Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {BINS.map((bin, i) => (
            <BinCard
              key={bin.id}
              bin={bin}
              idx={i}
              sharedEmail={sharedEmail}
              emailValid={emailValid}
              onFocusEmail={focusEmailInput}
            />
          ))}
        </motion.div>

        {/* Wokwi Hardware Link Card with Motion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{ y: -3 }}
          className="mt-12 bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 text-center max-w-3xl mx-auto"
        >
          <div className="text-2xl mb-2">🔌</div>
          <h3 className="font-black text-emerald-950 text-base mb-1">
            Looking for the Virtual ESP32 Hardware Lab?
          </h3>
          <p className="text-zinc-600 text-sm max-w-xl mx-auto mb-4 leading-relaxed">
            We have also built the complete circuit simulation on Wokwi with a real virtual ESP32, 
            HC-SR04 ultrasonic sensor, and status LEDs that transmit live telemetry to this cloud backend.
          </p>
          <a
            href="https://wokwi.com/projects/479030344144504833"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white text-sm shadow-md transition-all hover:scale-[1.02]"
          >
            <span>Open Wokwi Simulation Lab</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </motion.div>
      </section>

    </div>
  );
}
