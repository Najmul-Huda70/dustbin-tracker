"use client";

import React, { useState } from "react";
import { MapPin, Search, Navigation, Layers, Radio } from "lucide-react";

export default function MapPage() {
  const [searchLocation, setSearchLocation] = useState("Dhaka, Bangladesh");
  const [mapQuery, setMapQuery] = useState("Dhaka, Bangladesh");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchLocation.trim()) {
      setMapQuery(searchLocation.trim());
    }
  };

  const quickZones = [
    "Dhanmondi, Dhaka",
    "Mirpur-10, Dhaka",
    "Gulshan-2, Dhaka",
    "Uttara Sector 4, Dhaka"
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 flex items-center gap-2.5">
            <MapPin className="w-7 h-7 text-emerald-600" />
            Live Global & City Map
          </h1>
          <p className="text-sm text-emerald-950/70 mt-1">
            Real-time geospatial tracking of smart waste bins and municipal collection zones.
          </p>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
            Google Maps Live Feed
          </span>
        </div>
      </div>

      {/* Location Search Bar & Quick Zone Filters */}
      <div className="mb-6 bg-white p-4 sm:p-5 rounded-3xl border border-emerald-100 shadow-sm shadow-emerald-950/5">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-emerald-600 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="Search city, sector, or dustbin area (e.g. Dhanmondi, Dhaka)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-emerald-200 bg-[#f7faf8] text-emerald-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium placeholder-emerald-950/40"
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-600/20 hover:scale-[1.01]"
          >
            <Navigation className="w-4 h-4" />
            <span>Search Area</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-3 border-t border-emerald-50">
          <span className="text-xs font-semibold text-emerald-950/60 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Quick Zones:
          </span>
          {quickZones.map((zone, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSearchLocation(zone);
                setMapQuery(zone);
              }}
              className="px-3 py-1 rounded-xl text-xs font-medium bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 transition-colors"
            >
              {zone}
            </button>
          ))}
        </div>
      </div>

      {/* Embedded Google Map */}
      <div className="w-full h-[550px] sm:h-[650px] rounded-3xl bg-white border border-emerald-200 shadow-sm overflow-hidden relative">
        <iframe
          title="Global Live Dustbin Map"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
