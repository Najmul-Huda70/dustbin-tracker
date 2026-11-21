"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, QrCode, Menu, X, LogOut } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-emerald-100"
          : "bg-white/90 backdrop-blur-sm border-b border-emerald-100/70"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24">

          {/* Left: Brand Logo */}
          <Link href="/" className="flex items-center group focus:outline-none py-1" title="DustbinTracker">
            <Image
              src="/DustbinTracker%20Smart%20Waste%20Logo.png"
              alt="DustbinTracker Logo"
              width={320}
              height={136}
              className="h-12 sm:h-16 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              priority
            />
          </Link>

          {/* Right: Nav Links + Login */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link href="/" className="px-3.5 py-2 rounded-xl text-sm font-semibold text-emerald-950/80 hover:text-emerald-700 hover:bg-emerald-50/80 transition-colors">
              Home
            </Link>
            <Link href="/map" className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-emerald-950/80 hover:text-emerald-700 hover:bg-emerald-50/80 transition-colors">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Live Map
            </Link>
            <Link href="/report" className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-emerald-950/80 hover:text-emerald-700 hover:bg-emerald-50/80 transition-colors">
              <QrCode className="w-4 h-4 text-teal-600" />
              Report Issue
            </Link>

            {/* Divider */}
            <div className="w-px h-6 bg-emerald-200 mx-1"></div>

            {/* Login / User */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold text-emerald-900 max-w-[100px] truncate">{user.name}</span>
                </div>
                <button onClick={() => setUser(null)} className="p-2 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white hover:bg-emerald-50 text-emerald-950 border border-emerald-200 shadow-sm hover:border-emerald-300 transition-all hover:scale-[1.02]"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-emerald-950 hover:bg-emerald-50 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-emerald-100 bg-white/98 px-4 pt-3 pb-6 shadow-lg">
          <div className="flex flex-col space-y-1">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="px-3.5 py-2.5 rounded-xl text-base font-semibold text-emerald-950 hover:bg-emerald-50">Home</Link>
            <Link href="/map" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-base font-semibold text-emerald-950 hover:bg-emerald-50">
              <MapPin className="w-5 h-5 text-emerald-600" /> Live Map
            </Link>
            <Link href="/report" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-base font-semibold text-emerald-950 hover:bg-emerald-50">
              <QrCode className="w-5 h-5 text-teal-600" /> Report Issue
            </Link>
            <div className="pt-3 mt-2 border-t border-emerald-100">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold bg-white border border-emerald-200 text-emerald-950 hover:bg-emerald-50 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
