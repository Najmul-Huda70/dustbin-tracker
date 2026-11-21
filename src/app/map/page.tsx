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
  AlertTriangle,
  ChevronRight,
  FlaskConical,
  Compass,
  Navigation,
  RefreshCw,
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
    id: "BIN-SIM-001",
    name: "Dhanmondi Lake Bin",
    zone: "Dhanmondi",
    location: "Road 27, Near Lake Park Walkway",
    lat: 23.7465,
    lng: 90.376,
    xPct: 36.5,
    yPct: 71.5,
    fillLevel: 86,
    distanceCm: 14,
    fillRatePerHour: 7.5,
    lastUpdated: "Just now",
    landmark: "Dhanmondi Lake",
  },
  {
    id: "BIN-SIM-002",
    name: "Gulshan Circle Bin",
    zone: "Gulshan",
    location: "Gulshan Avenue, Circle-1 Roundabout",
    lat: 23.7782,
    lng: 90.418,
    xPct: 78.0,
    yPct: 55.5,
    fillLevel: 38,
    distanceCm: 62,
    fillRatePerHour: 5.0,
    lastUpdated: "2 mins ago",
    landmark: "Gulshan-1 Circle",
  },
  {
    id: "BIN-SIM-003",
    name: "Mirpur 10 Bin",
    zone: "Mirpur",
    location: "Mirpur 10 Metro Pillar 24",
    lat: 23.8071,
    lng: 90.3686,
    xPct: 29.0,
    yPct: 41.5,
    fillLevel: 74,
    distanceCm: 26,
    fillRatePerHour: 6.8,
    lastUpdated: "3 mins ago",
    landmark: "Mirpur-10 Metro",
  },
  {
    id: "BIN-SIM-004",
    name: "Motijheel Central Bin",
    zone: "Motijheel",
    location: "Shapla Square Commercial Zone",
    lat: 23.7289,
    lng: 90.4172,
    xPct: 77.0,
    yPct: 80.5,
    fillLevel: 45,
    distanceCm: 55,
    fillRatePerHour: 4.2,
    lastUpdated: "4 mins ago",
    landmark: "Shapla Square",
  },
  {
    id: "BIN-SIM-005",
    name: "Uttara Sector 7 Bin",
    zone: "Uttara",
    location: "Sector 7, Main Avenue & Park Gate",
    lat: 23.8683,
    lng: 90.3995,
    xPct: 59.5,
    yPct: 11.0,
    fillLevel: 22,
    distanceCm: 78,
    fillRatePerHour: 3.5,
    lastUpdated: "1 min ago",
    landmark: "Uttara Sector 7 Park",
  },
  {
    id: "BIN-SIM-006",
    name: "Old Dhaka Sadarghat Bin",
    zone: "Old Dhaka",
    location: "Sadarghat Launch Terminal Gate 2",
    lat: 23.7058,
    lng: 90.4125,
    xPct: 72.5,
    yPct: 92.0,
    fillLevel: 92,
    distanceCm: 8,
    fillRatePerHour: 9.0,
    lastUpdated: "Just now",
    landmark: "Buriganga Riverfront",
  },
];

// Helper: Calculate estimated time until full
function getTimeUntilFull(fillLevel: number, fillRate: number) {
  if (fillLevel >= 95) {
    return {
      text: "Overflowing! (< 15 mins)",
      badgeColor: "bg-red-600 text-white",
      urgent: true,
      etaHours: 0.2,
    };
  }
  if (fillLevel >= 80) {
    return {
      text: "Critical: ~45 mins left",
      badgeColor: "bg-red-500 text-white",
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
      ? "bg-amber-100 text-amber-800 border border-amber-300"
      : "bg-emerald-100 text-emerald-800 border border-emerald-300";

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
  const [activeBinId, setActiveBinId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"interactive" | "google">("interactive");

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

  const activeOrHoveredBin = useMemo(() => {
    const targetId = hoveredBinId || activeBinId;
    return INITIAL_BINS.find((b) => b.id === targetId) || null;
  }, [hoveredBinId, activeBinId]);

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
              Real-time geospatial tracking of all 6 smart waste monitoring bins. 
              Hover over any dustbin icon on the map to see its <strong>fill level</strong> and <strong>estimated time until full</strong>.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-white p-1 rounded-2xl border border-emerald-200 shadow-2xs">
            <button
              onClick={() => setViewMode("interactive")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "interactive"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-zinc-600 hover:text-emerald-700"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Interactive Vector Map
            </button>
            <button
              onClick={() => setViewMode("google")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "google"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-zinc-600 hover:text-emerald-700"
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              Google Maps View
            </button>
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

        {/* ── Main Map Canvas & Side List Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Map Viewer (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-emerald-200 shadow-sm overflow-hidden relative">

            {viewMode === "interactive" ? (
              <div className="relative w-full h-[620px] bg-[#f0f5f2] overflow-hidden select-none">
                
                {/* Visual Dhaka Cartographic Background */}
                <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  {/* Grid Lines */}
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#10b981" strokeWidth="0.5" strokeOpacity="0.15" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Buriganga River Curve at bottom (Old Dhaka) */}
                  <path
                    d="M 0 580 Q 250 560 500 590 T 1000 610"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="32"
                    strokeLinecap="round"
                    opacity="0.6"
                  />
                  {/* Turag River curve at west */}
                  <path
                    d="M 80 0 Q 60 250 110 500"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="18"
                    strokeLinecap="round"
                    opacity="0.4"
                  />
                  {/* Dhanmondi Lake */}
                  <ellipse cx="36%" cy="71%" rx="28" ry="14" fill="#38bdf8" opacity="0.6" />
                  {/* Gulshan & Banani Lake */}
                  <path
                    d="M 720 280 Q 750 360 760 420"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="16"
                    opacity="0.6"
                  />
                  {/* Major Highway Arteries */}
                  <line x1="60%" y1="0" x2="75%" y2="600" stroke="#94a3b8" strokeWidth="4" strokeDasharray="6 4" opacity="0.3" />
                  <line x1="30%" y1="200" x2="80%" y2="500" stroke="#94a3b8" strokeWidth="3" opacity="0.25" />
                </svg>

                {/* Map Landmarks Labels */}
                <div className="absolute top-4 left-6 text-[11px] font-black uppercase tracking-wider text-emerald-900/60 bg-white/70 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-emerald-100">
                  📍 Dhaka Metropolitan Area
                </div>
                <div className="absolute top-[8%] left-[62%] text-[10px] font-bold text-zinc-500 pointer-events-none">
                  Uttara
                </div>
                <div className="absolute top-[38%] left-[24%] text-[10px] font-bold text-zinc-500 pointer-events-none">
                  Mirpur
                </div>
                <div className="absolute top-[52%] left-[80%] text-[10px] font-bold text-zinc-500 pointer-events-none">
                  Gulshan / Banani
                </div>
                <div className="absolute top-[68%] left-[28%] text-[10px] font-bold text-zinc-500 pointer-events-none">
                  Dhanmondi
                </div>
                <div className="absolute top-[78%] left-[80%] text-[10px] font-bold text-zinc-500 pointer-events-none">
                  Motijheel
                </div>
                <div className="absolute bottom-6 left-[65%] text-[10px] font-bold text-sky-700 pointer-events-none">
                  🌊 Buriganga River (Old Dhaka)
                </div>

                {/* ── 6 Interactive Dustbin Pins ── */}
                {filteredBins.map((bin) => {
                  const isHovered = hoveredBinId === bin.id;
                  const isActive = activeBinId === bin.id;
                  const isCritical = bin.fillLevel >= 80;
                  const isAttention = bin.fillLevel >= 50 && bin.fillLevel < 80;

                  const pinColor = isCritical
                    ? "bg-red-600 text-white shadow-red-500/40"
                    : isAttention
                    ? "bg-amber-500 text-white shadow-amber-500/40"
                    : "bg-emerald-600 text-white shadow-emerald-500/40";

                  const pulseRing = isCritical
                    ? "border-red-500 bg-red-400"
                    : isAttention
                    ? "border-amber-500 bg-amber-400"
                    : "border-emerald-500 bg-emerald-400";

                  return (
                    <div
                      key={bin.id}
                      style={{
                        position: "absolute",
                        left: `${bin.xPct}%`,
                        top: `${bin.yPct}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      className="z-20 cursor-pointer"
                      onMouseEnter={() => setHoveredBinId(bin.id)}
                      onMouseLeave={() => setHoveredBinId(null)}
                      onClick={() => setActiveBinId(bin.id)}
                    >
                      {/* Pulsing beacon radar */}
                      <span
                        className={`absolute -inset-3 rounded-full opacity-60 animate-ping pointer-events-none ${pulseRing}`}
                      />

                      {/* Main Pin Icon */}
                      <motion.div
                        animate={{
                          scale: isHovered || isActive ? 1.3 : 1,
                          y: isHovered || isActive ? -6 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                        className={`relative w-10 h-10 rounded-2xl flex flex-col items-center justify-center shadow-lg border-2 border-white transition-all ${pinColor}`}
                      >
                        <MapPin className="w-5 h-5 fill-current" />
                        <span className="text-[8px] font-black leading-none mt-0.5">
                          {bin.fillLevel}%
                        </span>
                      </motion.div>

                      {/* Mini Label Badge */}
                      <div className="absolute top-11 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-xs border border-zinc-200 text-[10px] font-bold text-zinc-800 whitespace-nowrap pointer-events-none">
                        {bin.name.split(" ")[0]}
                      </div>

                      {/* ── Hover Popover Card ── */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: -8 }}
                            exit={{ opacity: 0, scale: 0.9, y: 6 }}
                            transition={{ duration: 0.18 }}
                            style={{
                              position: "absolute",
                              bottom: "100%",
                              left: "50%",
                              transform: "translateX(-50%)",
                            }}
                            className="z-50 w-72 pointer-events-auto shadow-2xl rounded-2xl bg-white/98 backdrop-blur-md border border-emerald-200 p-4 mb-2 text-zinc-800"
                          >
                            {/* Card Header */}
                            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-zinc-100">
                              <div>
                                <span className="font-mono text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  {bin.id}
                                </span>
                                <h4 className="text-sm font-black text-emerald-950 mt-1 leading-snug">
                                  {bin.name}
                                </h4>
                                <p className="text-xs text-zinc-500 mt-0.5">{bin.location}</p>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  isCritical
                                    ? "bg-red-100 text-red-700"
                                    : isAttention
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-emerald-100 text-emerald-700"
                                }`}
                              >
                                {isCritical ? "Critical" : isAttention ? "Attention" : "Normal"}
                              </span>
                            </div>

                            {/* Fill Level Metric Bar */}
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
                              <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                                <div
                                  className={`h-full transition-all duration-300 ${
                                    isCritical ? "bg-red-600" : isAttention ? "bg-amber-500" : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${bin.fillLevel}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-[10px] text-zinc-400 mt-1 font-mono">
                                <span>Sensor Dist: {bin.distanceCm} cm</span>
                                <span>Capacity: 100 cm</span>
                              </div>
                            </div>

                            {/* ⏱️ "Kotokkon por fillup hobe" (Estimated Time Until Full) */}
                            {(() => {
                              const eta = getTimeUntilFull(bin.fillLevel, bin.fillRatePerHour);
                              return (
                                <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-start gap-2 ${eta.badgeColor}`}>
                                  <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <div className="text-[10px] uppercase tracking-wide opacity-80">
                                      Estimated Time to Full:
                                    </div>
                                    <div className="font-bold text-xs">{eta.text}</div>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Quick Action Link */}
                            <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                              <Link
                                href="/simulation"
                                className="flex items-center gap-1 hover:text-emerald-900 transition-colors"
                              >
                                <FlaskConical className="w-3.5 h-3.5" />
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

                {/* Map Control Floating Badges */}
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-emerald-200 shadow-md text-xs font-semibold text-zinc-700 flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                    <span>≥80% Full</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>50-79%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span>&lt;50% Normal</span>
                  </div>
                </div>

                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("ALL");
                      setSelectedZone("ALL");
                    }}
                    className="p-2 rounded-xl bg-white/90 hover:bg-white text-zinc-600 hover:text-emerald-700 border border-emerald-200 shadow-sm transition-all"
                    title="Reset Map Filter"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Google Maps Iframe Fallback */
              <div className="w-full h-[620px] relative">
                <iframe
                  title="Google Live Dustbin Map"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=Dhaka+Bangladesh&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full"
                />
              </div>
            )}
          </div>

          {/* ── Dustbin List & Time Predictor Sidebar (4 cols) ── */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Active Selected Bin Details Card */}
            {activeOrHoveredBin && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border-2 border-emerald-300 shadow-md p-5"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {activeOrHoveredBin.id}
                  </span>
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                      activeOrHoveredBin.fillLevel >= 80
                        ? "bg-red-100 text-red-700"
                        : activeOrHoveredBin.fillLevel >= 50
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {activeOrHoveredBin.fillLevel}% FULL
                  </span>
                </div>

                <h3 className="text-base font-black text-emerald-950">{activeOrHoveredBin.name}</h3>
                <p className="text-xs text-zinc-500 mt-0.5">{activeOrHoveredBin.location}</p>

                {/* Estimated Time Badge */}
                {(() => {
                  const eta = getTimeUntilFull(activeOrHoveredBin.fillLevel, activeOrHoveredBin.fillRatePerHour);
                  return (
                    <div className={`mt-3 p-3 rounded-2xl flex items-center gap-2.5 ${eta.badgeColor}`}>
                      <Clock className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-wide opacity-80">
                          Estimated Time Until Full:
                        </div>
                        <div className="font-black text-sm">{eta.text}</div>
                      </div>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-100 text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Zone</span>
                    <strong className="text-zinc-800 font-bold">{activeOrHoveredBin.zone}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Sensor Distance</span>
                    <strong className="text-zinc-800 font-bold">{activeOrHoveredBin.distanceCm} cm</strong>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/report?binId=${encodeURIComponent(activeOrHoveredBin.id)}`}
                    className="flex-1 text-center py-2 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-colors"
                  >
                    Report Issue
                  </Link>
                  <Link
                    href="/simulation"
                    className="flex-1 text-center py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    Simulate Bin
                  </Link>
                </div>
              </motion.div>
            )}

            {/* List of All 6 Dustbins */}
            <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-4 sm:p-5 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  Monitored Dustbins ({filteredBins.length})
                </h3>
                <span className="text-[11px] text-zinc-400 font-semibold">Hover to locate</span>
              </div>

              <div className="space-y-2.5 overflow-y-auto max-h-[460px] pr-1">
                {filteredBins.map((bin) => {
                  const isHovered = hoveredBinId === bin.id;
                  const isActive = activeBinId === bin.id;
                  const eta = getTimeUntilFull(bin.fillLevel, bin.fillRatePerHour);

                  return (
                    <div
                      key={bin.id}
                      onMouseEnter={() => setHoveredBinId(bin.id)}
                      onMouseLeave={() => setHoveredBinId(null)}
                      onClick={() => setActiveBinId(bin.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isHovered || isActive
                          ? "bg-emerald-50/80 border-emerald-400 shadow-xs scale-[1.01]"
                          : "bg-white border-zinc-100 hover:border-emerald-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-bold text-xs text-zinc-900 truncate">
                          {bin.name}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            bin.fillLevel >= 80
                              ? "bg-red-100 text-red-700"
                              : bin.fillLevel >= 50
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {bin.fillLevel}%
                        </span>
                      </div>

                      <div className="text-[11px] text-zinc-500 mt-0.5 truncate">{bin.location}</div>

                      {/* Estimated time indicator */}
                      <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-zinc-600 pt-1.5 border-t border-zinc-100/80">
                        <span className="flex items-center gap-1 text-zinc-500">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          Full in:
                        </span>
                        <span
                          className={`font-bold ${
                            eta.urgent ? "text-red-600" : "text-emerald-800"
                          }`}
                        >
                          {eta.text}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {filteredBins.length === 0 && (
                  <div className="text-center py-10 text-zinc-400 text-xs">
                    <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    No dustbins matched your search or filters.
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
