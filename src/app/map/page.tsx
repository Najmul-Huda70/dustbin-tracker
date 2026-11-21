"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Search,
  Filter,
  Layers,
  Radio,
  Clock,
  ChevronRight,
  FlaskConical,
  RefreshCw,
  Sparkles,
} from "lucide-react";

// ─── 6 Real-World Dhaka Demo Dustbins (Matches Simulation Page) ───────────────
export interface MapDustbin {
  id: string;
  name: string;
  zone: string;
  location: string;
  lat: number;
  lng: number;
  xPct: number; // percentage from left on Dhaka map
  yPct: number; // percentage from top on Dhaka map
  fillLevel: number;
  distanceCm: number;
  fillRatePerHour: number; // % accumulated per hour
  lastUpdated: string;
  landmark: string;
}

const INITIAL_BINS: MapDustbin[] = [
  {
    id: "BIN-SIM-005",
    name: "Uttara Sector 7 Bin",
    zone: "Uttara",
    location: "Sector 7, Main Avenue & Park Gate",
    lat: 23.8683,
    lng: 90.3995,
    xPct: 52.0,
    yPct: 18.0,
    fillLevel: 22,
    distanceCm: 78,
    fillRatePerHour: 3.5,
    lastUpdated: "1 min ago",
    landmark: "Uttara Sector 7 Park",
  },
  {
    id: "BIN-SIM-003",
    name: "Mirpur 10 Bin",
    zone: "Mirpur",
    location: "Mirpur 10 Metro Pillar 24",
    lat: 23.8071,
    lng: 90.3686,
    xPct: 28.0,
    yPct: 38.0,
    fillLevel: 74,
    distanceCm: 26,
    fillRatePerHour: 6.8,
    lastUpdated: "3 mins ago",
    landmark: "Mirpur-10 Metro",
  },
  {
    id: "BIN-SIM-002",
    name: "Gulshan Circle Bin",
    zone: "Gulshan",
    location: "Gulshan Avenue, Circle-1 Roundabout",
    lat: 23.7782,
    lng: 90.418,
    xPct: 70.0,
    yPct: 50.0,
    fillLevel: 38,
    distanceCm: 62,
    fillRatePerHour: 5.0,
    lastUpdated: "2 mins ago",
    landmark: "Gulshan-1 Circle",
  },
  {
    id: "BIN-SIM-001",
    name: "Dhanmondi Lake Bin",
    zone: "Dhanmondi",
    location: "Road 27, Near Lake Park Walkway",
    lat: 23.7465,
    lng: 90.376,
    xPct: 35.0,
    yPct: 68.0,
    fillLevel: 86,
    distanceCm: 14,
    fillRatePerHour: 7.5,
    lastUpdated: "Just now",
    landmark: "Dhanmondi Lake",
  },
  {
    id: "BIN-SIM-004",
    name: "Motijheel Central Bin",
    zone: "Motijheel",
    location: "Shapla Square Commercial Zone",
    lat: 23.7289,
    lng: 90.4172,
    xPct: 68.0,
    yPct: 76.0,
    fillLevel: 45,
    distanceCm: 55,
    fillRatePerHour: 4.2,
    lastUpdated: "4 mins ago",
    landmark: "Shapla Square",
  },
  {
    id: "BIN-SIM-006",
    name: "Old Dhaka Sadarghat Bin",
    zone: "Old Dhaka",
    location: "Sadarghat Launch Terminal Gate 2",
    lat: 23.7058,
    lng: 90.4125,
    xPct: 60.0,
    yPct: 88.0,
    fillLevel: 92,
    distanceCm: 8,
    fillRatePerHour: 9.0,
    lastUpdated: "Just now",
    landmark: "Buriganga Riverfront",
  },
];

// Helper: Calculate estimated time until full
function getTimeUntilFull(fillLevel: number, fillRate: number) {
  if (fillLevel >= 90) {
    return {
      text: "🚨 Overflowing! Immediate pickup (< 15m)",
      badgeColor: "bg-red-600 text-white border-red-700",
      urgent: true,
      etaHours: 0.2,
    };
  }
  if (fillLevel >= 80) {
    return {
      text: "⚠️ Critical: ~45 mins left until overflow",
      badgeColor: "bg-red-500 text-white border-red-600",
      urgent: true,
      etaHours: 0.75,
    };
  }

  const remainingCap = 100 - fillLevel;
  const hoursLeft = remainingCap / fillRate;
  const hours = Math.floor(hoursLeft);
  const minutes = Math.round((hoursLeft - hours) * 60);

  let text = "";
  if (hours > 0) {
    text = `Approx. ${hours}h ${minutes > 0 ? `${minutes}m` : ""} until full`;
  } else {
    text = `Approx. ${minutes} mins until full`;
  }

  const badgeColor =
    fillLevel >= 50
      ? "bg-amber-100 text-amber-900 border border-amber-300"
      : "bg-emerald-100 text-emerald-900 border border-emerald-300";

  return {
    text,
    badgeColor,
    urgent: false,
    etaHours: hoursLeft,
  };
}

export default function MapPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "CRITICAL" | "ATTENTION" | "NORMAL">("ALL");
  const [selectedZone, setSelectedZone] = useState<string>("ALL");
  const [hoveredBinId, setHoveredBinId] = useState<string | null>(null);

  const zones = useMemo(() => ["ALL", "Dhanmondi", "Gulshan", "Mirpur", "Motijheel", "Uttara", "Old Dhaka"], []);

  // Filtered dustbins
  const filteredBins = useMemo(() => {
    return INITIAL_BINS.filter((bin) => {
      // Search filter
      const matchesSearch =
        searchQuery.trim() === "" ||
        bin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bin.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bin.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bin.location.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      let matchesStatus = true;
      if (statusFilter === "CRITICAL") matchesStatus = bin.fillLevel >= 80;
      else if (statusFilter === "ATTENTION") matchesStatus = bin.fillLevel >= 50 && bin.fillLevel < 80;
      else if (statusFilter === "NORMAL") matchesStatus = bin.fillLevel < 50;

      // Zone filter
      const matchesZone = selectedZone === "ALL" || bin.zone === selectedZone;

      return matchesSearch && matchesStatus && matchesZone;
    });
  }, [searchQuery, statusFilter, selectedZone]);

  return (
    <div className="min-h-screen bg-[#f7faf8] py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live City GIS Telemetry Map
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 flex items-center gap-2.5">
              <MapPin className="w-7 h-7 text-emerald-600" />
              Dhaka Smart Dustbins Live Map
            </h1>
            <p className="text-sm text-zinc-600 mt-1 max-w-2xl">
              Hover over any dustbin on the map to see its <strong>live fill level</strong> and <strong>estimated time until full</strong>.
            </p>
          </div>

          {/* Live System Indicator */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-white px-4 py-2 rounded-2xl border border-emerald-200 shadow-2xs text-xs font-bold text-emerald-900">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>6 Real-Time IoT Dustbins Active</span>
          </div>
        </div>

        {/* ── Search & Filter Controls Bar ── */}
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-4 sm:p-5 mb-6">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-emerald-600 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search by Dustbin ID, location or area (e.g. Dhanmondi, Mirpur 10)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-emerald-200 bg-[#f7faf8] text-sm font-medium text-emerald-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-3 text-xs text-zinc-400 hover:text-zinc-700 bg-zinc-200 hover:bg-zinc-300 rounded-full w-5 h-5 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-zinc-500 flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5" /> Status:
              </span>

              {[
                { label: "All (6)", val: "ALL", color: "hover:bg-zinc-100" },
                { label: "Critical (≥80%)", val: "CRITICAL", color: "text-red-700 border-red-200 bg-red-50/50" },
                { label: "Attention (50-79%)", val: "ATTENTION", color: "text-amber-700 border-amber-200 bg-amber-50/50" },
                { label: "Normal (<50%)", val: "NORMAL", color: "text-emerald-700 border-emerald-200 bg-emerald-50/50" },
              ].map((btn) => (
                <button
                  key={btn.val}
                  onClick={() => setStatusFilter(btn.val as typeof statusFilter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    statusFilter === btn.val
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-xs scale-102"
                      : `bg-white text-zinc-600 border-zinc-200 ${btn.color}`
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

          </div>

          {/* Quick Zone Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-3 border-t border-emerald-50">
            <span className="text-xs font-bold text-zinc-500 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Zone:
            </span>
            {zones.map((zone) => (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border ${
                  selectedZone === zone
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-emerald-50/60 hover:bg-emerald-100 text-emerald-800 border-emerald-200/60"
                }`}
              >
                {zone === "ALL" ? "All Zones" : zone}
              </button>
            ))}

            <div className="ml-auto text-xs font-bold text-emerald-800">
              Showing <strong>{filteredBins.length}</strong> of 6 dustbins
            </div>
          </div>
        </div>

        {/* ── FULL-WIDTH MAP CANVAS ── */}
        <div className="w-full bg-white rounded-3xl border border-emerald-200 shadow-md p-2 sm:p-3 relative">
          <div className="relative w-full h-[660px] sm:h-[720px] bg-[#edf4f0] rounded-2xl select-none overflow-hidden">
              
              {/* Visual Dhaka Cartographic Canvas */}
              <svg className="absolute inset-0 w-full h-full opacity-45 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="dhakaGrid" width="45" height="45" patternUnits="userSpaceOnUse">
                    <path d="M 45 0 L 0 0 0 45" fill="none" stroke="#059669" strokeWidth="0.5" strokeOpacity="0.18" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dhakaGrid)" />

                {/* Buriganga River Curve at south (Old Dhaka) */}
                <path
                  d="M 0 630 Q 300 600 650 635 T 1400 650"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="38"
                  strokeLinecap="round"
                  opacity="0.65"
                />
                {/* Turag River curve at west */}
                <path
                  d="M 120 0 Q 90 320 150 600"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="20"
                  strokeLinecap="round"
                  opacity="0.45"
                />
                {/* Dhanmondi Lake */}
                <ellipse cx="35%" cy="68%" rx="35" ry="16" fill="#38bdf8" opacity="0.65" />
                {/* Gulshan & Banani Lake */}
                <path
                  d="M 680 300 Q 720 380 730 450"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="22"
                  strokeLinecap="round"
                  opacity="0.65"
                />
                {/* Major Highway Arteries */}
                <line x1="52%" y1="0" x2="65%" y2="720" stroke="#94a3b8" strokeWidth="5" strokeDasharray="8 6" opacity="0.35" />
                <line x1="25%" y1="240" x2="80%" y2="560" stroke="#94a3b8" strokeWidth="4" opacity="0.3" />
              </svg>

              {/* Map Landmarks Labels */}
              <div className="absolute top-4 left-5 text-[11px] font-black uppercase tracking-wider text-emerald-900 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
                📍 Dhaka Metropolitan Area
              </div>
              
              <div className="absolute top-[12%] left-[54%] text-xs font-bold text-zinc-500 pointer-events-none">
                Uttara Sector 7
              </div>
              <div className="absolute top-[34%] left-[22%] text-xs font-bold text-zinc-500 pointer-events-none">
                Mirpur-10
              </div>
              <div className="absolute top-[46%] left-[72%] text-xs font-bold text-zinc-500 pointer-events-none">
                Gulshan Circle-1
              </div>
              <div className="absolute top-[64%] left-[26%] text-xs font-bold text-zinc-500 pointer-events-none">
                Dhanmondi Lake
              </div>
              <div className="absolute top-[73%] left-[71%] text-xs font-bold text-zinc-500 pointer-events-none">
                Motijheel Commercial
              </div>
              <div className="absolute bottom-6 left-[56%] text-xs font-bold text-sky-800 pointer-events-none">
                🌊 Buriganga Riverfront (Old Dhaka)
              </div>

              {/* ── 6 Interactive Dustbin Pins on Map ── */}
              {filteredBins.map((bin) => {
                const isHovered = hoveredBinId === bin.id;
                const isCritical = bin.fillLevel >= 80;
                const isAttention = bin.fillLevel >= 50 && bin.fillLevel < 80;

                const pinColor = isCritical
                  ? "bg-red-600 text-white shadow-red-500/50"
                  : isAttention
                  ? "bg-amber-500 text-white shadow-amber-500/50"
                  : "bg-emerald-600 text-white shadow-emerald-500/50";

                const pulseRing = isCritical
                  ? "border-red-500 bg-red-400"
                  : isAttention
                  ? "border-amber-500 bg-amber-400"
                  : "border-emerald-500 bg-emerald-400";

                // Intelligent Popover Placement: Never cut off at edges!
                const isNearTop = bin.yPct < 30; // e.g. Uttara -> place popover BELOW pin
                const isNearRight = bin.xPct > 60; // e.g. Gulshan, Motijheel, Sadarghat -> anchor right edge
                const isNearLeft = bin.xPct < 30; // e.g. Mirpur -> anchor left edge

                const popoverPositionStyle: React.CSSProperties = {
                  position: "absolute",
                  ...(isNearTop ? { top: "110%" } : { bottom: "110%" }),
                  ...(isNearRight
                    ? { right: "-10px" }
                    : isNearLeft
                    ? { left: "-10px" }
                    : { left: "50%", transform: "translateX(-50%)" }),
                };

                return (
                  <div
                    key={bin.id}
                    style={{
                      position: "absolute",
                      left: `${bin.xPct}%`,
                      top: `${bin.yPct}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    className={`cursor-pointer ${isHovered ? "z-50" : "z-20"}`}
                    onMouseEnter={() => setHoveredBinId(bin.id)}
                    onMouseLeave={() => setHoveredBinId(null)}
                  >
                    {/* Pulsing beacon ring */}
                    <span
                      className={`absolute -inset-3.5 rounded-full opacity-60 animate-ping pointer-events-none ${pulseRing}`}
                    />

                    {/* Pin Marker */}
                    <motion.div
                      animate={{
                        scale: isHovered ? 1.35 : 1,
                        y: isHovered ? -6 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                      className={`relative w-11 h-11 rounded-2xl flex flex-col items-center justify-center shadow-lg border-2 border-white transition-all ${pinColor}`}
                    >
                      <MapPin className="w-5 h-5 fill-current" />
                      <span className="text-[9px] font-black leading-none mt-0.5">
                        {bin.fillLevel}%
                      </span>
                    </motion.div>

                    {/* Bottom Pin Label */}
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-md shadow-xs border border-zinc-200 text-[10px] font-bold text-zinc-800 whitespace-nowrap pointer-events-none">
                      {bin.name.split(" ")[0]}
                    </div>

                    {/* ── Hover Popover Card (Properly Positioned Directly Above Location) ── */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.92, y: isNearTop ? -8 : 8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.92, y: isNearTop ? -8 : 8 }}
                          transition={{ duration: 0.16 }}
                          style={popoverPositionStyle}
                          className="w-80 shadow-2xl rounded-2xl bg-white border-2 border-emerald-200 p-4 text-zinc-800 z-50 pointer-events-auto"
                        >
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-zinc-100">
                            <div>
                              <span className="font-mono text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                {bin.id}
                              </span>
                              <h4 className="text-sm font-black text-emerald-950 mt-1 leading-snug">
                                {bin.name}
                              </h4>
                              <p className="text-xs text-zinc-500 mt-0.5 leading-tight">{bin.location}</p>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase whitespace-nowrap ${
                                isCritical
                                  ? "bg-red-100 text-red-700 border border-red-200"
                                  : isAttention
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              }`}
                            >
                              {bin.fillLevel}% {isCritical ? "Critical" : isAttention ? "Attention" : "Normal"}
                            </span>
                          </div>

                          {/* Waste Fill Level Bar */}
                          <div className="py-2.5">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-bold text-zinc-600">Current Waste Fill:</span>
                              <span
                                className="font-black text-sm font-mono"
                                style={{
                                  color: isCritical ? "#dc2626" : isAttention ? "#d97706" : "#059669",
                                }}
                              >
                                {bin.fillLevel}% ({100 - bin.distanceCm} cm waste)
                              </span>
                            </div>
                            <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  isCritical ? "bg-red-600" : isAttention ? "bg-amber-500" : "bg-emerald-500"
                                }`}
                                style={{ width: `${bin.fillLevel}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-zinc-400 mt-1 font-mono">
                              <span>Sensor Distance: {bin.distanceCm} cm</span>
                              <span>Total Depth: 100 cm</span>
                            </div>
                          </div>

                          {/* ⏱️ "Kotokkon por fillup hobe" (Estimated Time Until Full) */}
                          {(() => {
                            const eta = getTimeUntilFull(bin.fillLevel, bin.fillRatePerHour);
                            return (
                              <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-start gap-2 ${eta.badgeColor}`}>
                                <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <div>
                                  <div className="text-[10px] uppercase font-bold tracking-wide opacity-80">
                                    ESTIMATED TIME UNTIL FULL:
                                  </div>
                                  <div className="font-black text-xs leading-snug">{eta.text}</div>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Quick Actions & Links */}
                          <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                            <Link
                              href="/simulation"
                              className="flex items-center gap-1 hover:text-emerald-900 transition-colors"
                            >
                              <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
                              <span>Test in Simulation Lab</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                            <span className="text-[10px] font-normal text-zinc-400">
                              Updated {bin.lastUpdated}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* Floating Legend Badge at Bottom Left */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-emerald-200 shadow-md text-xs font-bold text-zinc-700 flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-600" />
                  <span>≥80% Critical</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>50-79% Attention</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-600" />
                  <span>&lt;50% Normal</span>
                </div>
              </div>

              {/* Reset Map Filter button at top right */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("ALL");
                    setSelectedZone("ALL");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white text-zinc-700 hover:text-emerald-700 border border-emerald-200 shadow-sm text-xs font-bold transition-all"
                  title="Reset Map Filter"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Filter</span>
                </button>
              </div>

            </div>
        </div>

        {/* ── Bottom Summary Row: 6 Bins Status Strip ── */}
        <div className="mt-6 bg-white rounded-3xl border border-emerald-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              Real-Time Monitored Dustbins Summary ({filteredBins.length})
            </h3>
            <span className="text-xs text-zinc-400">Hover over any pin above to see details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {filteredBins.map((bin) => {
              const eta = getTimeUntilFull(bin.fillLevel, bin.fillRatePerHour);
              const isCritical = bin.fillLevel >= 80;
              const isAttention = bin.fillLevel >= 50 && bin.fillLevel < 80;

              return (
                <div
                  key={bin.id}
                  onMouseEnter={() => setHoveredBinId(bin.id)}
                  onMouseLeave={() => setHoveredBinId(null)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    hoveredBinId === bin.id
                      ? "bg-emerald-50 border-emerald-400 shadow-sm scale-102"
                      : "bg-[#f7faf8] border-zinc-200/80 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs text-zinc-900 truncate">{bin.name.split(" ")[0]}</span>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                        isCritical
                          ? "bg-red-100 text-red-700"
                          : isAttention
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {bin.fillLevel}%
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate mt-0.5">{bin.zone}</div>
                  <div className="mt-2 text-[10px] font-semibold text-zinc-600 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-emerald-600" />
                    <span className="truncate">{eta.text.replace("Approx. ", "")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Link to Simulation Lab ── */}
        <div className="mt-8 bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 text-center max-w-2xl mx-auto">
          <div className="inline-flex p-2 rounded-xl bg-emerald-100 text-emerald-700 mb-2">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-black text-emerald-950 text-base mb-1">
            Want to test these sensor fill levels in real time?
          </h3>
          <p className="text-zinc-600 text-xs sm:text-sm mb-4 leading-relaxed">
            Go to the <strong>Simulation Lab</strong> to adjust the distance slider for each of these 6 bins and receive instant email overflow alerts!
          </p>
          <Link
            href="/simulation"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-md transition-all hover:scale-[1.02]"
          >
            <FlaskConical className="w-4 h-4" />
            <span>Open Interactive Simulation Lab</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
