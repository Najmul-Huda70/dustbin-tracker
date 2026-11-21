"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  QrCode,
  FlaskConical,
  Mail,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Radio,
  Heart,
  ArrowUp,
} from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-white border-t border-emerald-100/90 text-zinc-700 relative z-10">
      {/* Subtle top eco accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block group focus:outline-none" title="DustbinTracker">
              <Image
                src="/DustbinTracker%20Smart%20Waste%20Logo.png"
                alt="DustbinTracker Logo"
                width={260}
                height={110}
                className="h-14 sm:h-16 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              />
            </Link>
            
            <p className="text-sm text-zinc-600 leading-relaxed max-w-sm">
              <strong className="text-emerald-950 font-bold">DustbinTracker</strong> is a cloud- and IoT-integrated 
              smart waste level monitoring platform. Combining ESP32 microcontrollers, ultrasonic HC-SR04 sensors, 
              real-time city mapping, and automated Nodemailer overflow alerts for cleaner and sustainable smart cities.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>IoT Cloud Telemetry & Alerts Operational</span>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link href="/" className="text-zinc-600 hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link href="/map" className="text-zinc-600 hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  Live City Map
                </Link>
              </li>
              <li>
                <Link href="/report" className="text-zinc-600 hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-teal-600" />
                  Citizen QR Report
                </Link>
              </li>
              <li>
                <Link href="/simulation" className="text-zinc-600 hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
                  Interactive Simulation
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-zinc-600 hover:text-emerald-600 transition-colors">
                  Staff Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Hardware & IoT */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950">
              Hardware & IoT
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li className="flex items-center gap-1.5 text-zinc-600">
                <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                <span>ESP32 Microcontroller</span>
              </li>
              <li className="flex items-center gap-1.5 text-zinc-600">
                <Radio className="w-3.5 h-3.5 text-teal-600" />
                <span>HC-SR04 Ultrasonic</span>
              </li>
              <li>
                <a
                  href="https://wokwi.com/projects/479030344144504833"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-600 hover:text-emerald-600 transition-colors flex items-center gap-1.5 group"
                >
                  <span>Wokwi Virtual Lab</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-emerald-600" />
                </a>
              </li>
              <li className="flex items-center gap-1.5 text-zinc-600">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Critical Alert (≥ 80%)</span>
              </li>
              <li className="text-xs text-zinc-500">
                <span>5-Min Sync to MongoDB Atlas</span>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact & Repos */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950">
              Connect & Source
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <a
                  href="mailto:tempostand7@gmail.com"
                  className="text-zinc-600 hover:text-emerald-600 transition-colors flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  <span>tempostand7@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Najmul-Huda70/dustbin-tracker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-600 hover:text-emerald-600 transition-colors flex items-center gap-1.5 group"
                >
                  <svg className="w-3.5 h-3.5 text-zinc-700 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-emerald-600" />
                </a>
              </li>
              <li className="text-xs text-zinc-500 pt-1">
                Dhaka, Bangladesh · Smart Waste Management
              </li>
            </ul>

            <button
              onClick={scrollToTop}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Back to Top</span>
            </button>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="mt-12 pt-6 border-t border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-medium">
          <p className="flex items-center gap-1 text-center sm:text-left">
            © 2026 DustbinTracker. All rights reserved. Built with
            <Heart className="w-3.5 h-3.5 text-red-500 inline fill-red-500 mx-0.5" />
            for cleaner, greener smart cities.
          </p>
          <div className="flex items-center gap-3 text-zinc-400 text-[11px]">
            <span>Next.js App Router</span>
            <span>•</span>
            <span>MongoDB Atlas</span>
            <span>•</span>
            <span>Nodemailer</span>
            <span>•</span>
            <span>ESP32 IoT</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
