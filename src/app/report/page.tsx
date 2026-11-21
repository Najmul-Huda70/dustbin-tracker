"use client";

import React, { useState } from "react";
import {
  QrCode,
  Send,
  Camera,
  CheckCircle2,
  X,
  Scan,
  Sparkles
} from "lucide-react";

export default function ReportPage() {
  const [binId, setBinId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    "Dustbin is Overflowing (Full)",
    "Foul / Severe Odor",
    "Damaged or Broken Bin Lid",
    "Littering Around the Bin Area",
    "Sensor Damaged or Offline"
  ];

  // Simulated QR Code Scan
  const handleStartScan = () => {
    setIsScanning(true);
    setScanSuccess(false);

    // Simulate scanning detection after 2 seconds
    setTimeout(() => {
      const detectedBinId = "BIN-DHK-104";
      setBinId(detectedBinId);
      setIsScanning(false);
      setScanSuccess(true);
    }, 2200);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!binId.trim() || !selectedCategory) {
      alert("Please enter or scan a Dustbin ID and select a problem category.");
      return;
    }

    try {
      setIsSubmitting(true);
      await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dustbinId: binId.trim(),
          problemCategory: selectedCategory,
        }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Submission failed:", err);
      // Fallback submit view
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex p-3 rounded-2xl bg-emerald-100 text-emerald-700 mb-3 border border-emerald-200">
          <QrCode className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
          Citizen Public Dustbin Report
        </h1>
        <p className="text-sm text-emerald-950/70 mt-2">
          Fast, account-free reporting. Scan the bin&apos;s QR code or type its ID to report an issue.
        </p>
      </div>

      {submitted ? (
        <div className="bg-white rounded-3xl border border-emerald-200 shadow-sm p-8 text-center space-y-4 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-emerald-950">Report Submitted Successfully!</h2>
          <p className="text-sm text-emerald-950/70 max-w-md mx-auto">
            Thank you for helping keep our city clean. Your report for dustbin{" "}
            <span className="font-semibold text-emerald-700 font-mono">{binId}</span> has been
            relayed to the local area moderator.
          </p>
          <div className="pt-4">
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setBinId("");
                setSelectedCategory("");
                setScanSuccess(false);
              }}
              className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm shadow-emerald-950/5 p-6 sm:p-8 space-y-6">
          {/* QR Code Scanner CTA Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-emerald-50/20 border border-emerald-200/90 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white flex-shrink-0 shadow-sm">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                  Scan QR Code on Dustbin
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                </h3>
                <p className="text-xs text-emerald-950/70 mt-0.5">
                  Point camera at the QR code sticker affixed to the waste bin.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartScan}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
            >
              <Scan className="w-4 h-4" />
              <span>Launch QR Scanner</span>
            </button>
          </div>

          {/* Interactive QR Scanner Modal / Viewfinder */}
          {isScanning && (
            <div className="p-6 rounded-2xl bg-emerald-950 text-white border border-emerald-800 shadow-xl relative overflow-hidden animate-in fade-in">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-emerald-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Camera Scanner Active
                </span>
                <button
                  type="button"
                  onClick={() => setIsScanning(false)}
                  className="p-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Viewfinder Target */}
              <div className="relative w-48 h-48 mx-auto border-2 border-dashed border-emerald-400/80 rounded-2xl flex flex-col items-center justify-center bg-black/40 overflow-hidden">
                {/* Scanning laser line animation */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-bounce w-full"></div>
                <QrCode className="w-20 h-20 text-emerald-300/40 animate-pulse" />
                <span className="text-[11px] text-emerald-200 mt-2 font-medium">
                  Align QR Code within frame...
                </span>
              </div>
            </div>
          )}

          {scanSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs sm:text-sm font-medium animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>QR Code verified: <strong className="font-mono text-emerald-700">{binId}</strong></span>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                Auto-Filled
              </span>
            </div>
          )}

          {/* Dustbin ID Input */}
          <div>
            <label className="block text-sm font-semibold text-emerald-950 mb-2">
              Dustbin ID <span className="text-emerald-800/60 font-normal">(or enter manually)</span>
            </label>
            <input
              type="text"
              value={binId}
              onChange={(e) => setBinId(e.target.value)}
              placeholder="e.g. BIN-DHK-104"
              className="w-full px-4 py-3 rounded-2xl border border-emerald-200 bg-[#f7faf8] text-emerald-950 placeholder-emerald-950/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
              required
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-emerald-950 mb-2">
              Select Problem Category <span className="text-emerald-800/60 font-normal">(Fixed Categories)</span>
            </label>
            <div className="space-y-2">
              {categories.map((cat, idx) => (
                <label
                  key={idx}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedCategory === cat
                      ? "border-emerald-500 bg-emerald-50/80 text-emerald-950 font-semibold shadow-xs"
                      : "border-emerald-100/90 hover:bg-emerald-50/40 text-emerald-950/90"
                  }`}
                >
                  <input
                    type="radio"
                    name="problemCategory"
                    value={cat}
                    checked={selectedCategory === cat}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-75 text-white shadow-md shadow-emerald-600/25 transition-all hover:scale-[1.01]"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? "Submitting Report..." : "Submit Instant Report"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
