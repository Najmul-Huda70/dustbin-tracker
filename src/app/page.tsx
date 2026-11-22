"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, animate } from "framer-motion";
import SmartBin3D from "@/components/SmartBin3D";
import {
  Wifi,
  BellRing,
  MapPin,
  QrCode,
  ArrowRight,
  Cpu,
  Zap,
  CheckCircle2,
  Mail,
  MessageSquare,
  Trash2,
  Scan,
  ShieldAlert,
  Sparkles
} from "lucide-react";

/* ─── Reusable animation helpers ─── */
function FadeSlideIn({
  children,
  direction = "up",
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  direction?: "up" | "left" | "right";
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const initial =
    direction === "up"
      ? { opacity: 0, y: 48 }
      : direction === "left"
      ? { opacity: 0, x: -60 }
      : { opacity: 0, x: 60 };

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : initial}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Animated counter ─── */
function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
}: {
  target: number;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, target, {
      duration: 2,
      ease: "easeOut",
      onUpdate(v) {
        if (ref.current) ref.current.textContent = prefix + Math.round(v).toLocaleString() + suffix;
      },
    });
    return () => controls.stop();
  }, [inView, target, suffix, prefix]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}

/* ─── Circular fill gauge ─── */
function FillGauge({ percent }: { percent: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const r = 70;
  const circ = 2 * Math.PI * r;
  const color = percent >= 80 ? "#ef4444" : percent >= 50 ? "#f59e0b" : "#10b981";
  const label = percent >= 80 ? "Critical" : percent >= 50 ? "Attention" : "Normal";
  const labelColor = percent >= 80 ? "text-red-600" : percent >= 50 ? "text-amber-500" : "text-emerald-600";
  const bgColor = percent >= 80 ? "bg-red-50 border-red-200" : percent >= 50 ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200";

  return (
    <div ref={ref} className="flex flex-col items-center">
      <svg width="168" height="168" className="-rotate-90">
        <circle cx="84" cy="84" r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
        <motion.circle
          cx="84"
          cy="84"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={inView ? { strokeDashoffset: circ - (percent / 100) * circ } : { strokeDashoffset: circ }}
          transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="relative -mt-[104px] flex flex-col items-center justify-center h-[168px]">
        <motion.span
          className="text-4xl font-black text-emerald-950"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.6 }}
        >
          <AnimatedCounter target={percent} suffix="%" />
        </motion.span>
        <span className="text-xs font-semibold text-zinc-500 mt-0.5">Fill Level</span>
      </div>
      <span className={`mt-3 px-3 py-1 rounded-full text-xs font-bold border ${bgColor} ${labelColor}`}>
        ● {label}
      </span>
    </div>
  );
}

/* ═══════════════════════════════
   HOME PAGE
═══════════════════════════════ */
export default function HomePage() {
  /* Countdown timer state */
  const [mins, setMins] = useState(27);
  const [secs, setSecs] = useState(43);
  useEffect(() => {
    const id = setInterval(() => {
      setSecs((s) => {
        if (s === 0) { setMins((m) => (m === 0 ? 0 : m - 1)); return 59; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="overflow-x-hidden">

      {/* ══════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════ */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20 sm:pt-20 sm:pb-28">
        {/* ambient glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-emerald-200/30 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Interactive 3D Smart Dustbin Model */}
          <FadeSlideIn direction="left">
            <SmartBin3D initialFill={65} />
          </FadeSlideIn>

          {/* Right: Text */}
          <div className="flex flex-col gap-6">
            <FadeSlideIn direction="right" delay={0.1}>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                IoT-Powered Smart Waste Monitoring
              </span>
            </FadeSlideIn>

            <FadeSlideIn direction="right" delay={0.2}>
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black text-emerald-950 leading-[1.1] tracking-tight">
                Cleaner City.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                  Greener Tomorrow.
                </span>
              </h1>
            </FadeSlideIn>

            <FadeSlideIn direction="right" delay={0.3}>
              <p className="text-lg text-emerald-950/70 leading-relaxed">
                DustbinTracker uses <strong>ESP32 IoT sensors</strong> to monitor dustbin fill levels in real time, 
                predict overflow before it happens, and automatically alert field moderators via <strong>Email & SMS</strong>.
              </p>
            </FadeSlideIn>

            <FadeSlideIn direction="right" delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/report"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.03]"
                >
                  <QrCode className="w-5 h-5" />
                  Report a Dustbin
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/map"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold bg-white border border-emerald-200 text-emerald-900 hover:bg-emerald-50 shadow-sm transition-all"
                >
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  View Live Map
                </Link>
              </div>
            </FadeSlideIn>

            {/* Quick stats */}
            <FadeSlideIn direction="right" delay={0.5}>
              <div className="flex items-center gap-6 pt-2">
                {[
                  { label: "Bins Monitored", value: 128, suffix: "+" },
                  { label: "Alerts Sent", value: 2400, suffix: "+" },
                  { label: "Cities Covered", value: 6, suffix: "" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-2xl font-black text-emerald-700">
                      <AnimatedCounter target={s.value} suffix={s.suffix} />
                    </div>
                    <div className="text-xs text-emerald-950/60 font-medium mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </FadeSlideIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          SECTION 2 — FILL LEVEL MONITORING (Pure Code)
      ══════════════════════════════════ */}
      <section className="bg-white border-y border-emerald-100 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: Text */}
            <FadeSlideIn direction="left">
              <div className="flex flex-col gap-5">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold w-fit">
                  <Wifi className="w-3.5 h-3.5" />
                  Real-Time Fill Level Detection
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-emerald-950 leading-tight">
                  Know Exactly How Full Every Bin Is — Right Now
                </h2>
                <p className="text-base text-emerald-950/70 leading-relaxed">
                  The <strong>HC-SR04 ultrasonic sensor</strong> inside the bin measures the distance to 
                  the waste surface every 30 seconds. The <strong>ESP32</strong> converts this into a fill 
                  percentage and sends it over Wi-Fi to our cloud backend.
                </p>
                <ul className="flex flex-col gap-3 mt-1">
                  {[
                    { icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />, text: "Updates every 30 seconds via Wi-Fi" },
                    { icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />, text: "Anomalous / noisy readings are auto-filtered" },
                    { icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />, text: "Predicts overflow time using fill history" },
                    { icon: <CheckCircle2 className="w-4 h-4 text-amber-500" />, text: "Alert triggered at ≥ 80% fill level" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-emerald-950/80 font-medium">
                      {item.icon}
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeSlideIn>

            {/* Right: Animated Live Bin Card */}
            <FadeSlideIn direction="right" delay={0.15}>
              <div className="bg-[#f7faf8] rounded-3xl border border-emerald-200 shadow-xl shadow-emerald-900/8 p-7 flex flex-col gap-6">
                {/* Card header */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Live Bin Status</div>
                    <div className="text-lg font-black text-emerald-950 font-mono mt-0.5">BIN-DHK-104</div>
                    <div className="text-xs text-emerald-950/60 mt-0.5">📍 Sector 7, Dhanmondi, Dhaka</div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-emerald-700">LIVE</span>
                  </div>
                </div>

                {/* Gauge + details row */}
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <FillGauge percent={73} />

                  <div className="flex flex-col gap-3 flex-1">
                    {/* Countdown */}
                    <div className="p-3.5 rounded-2xl bg-white border border-amber-200 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Time to Overflow</div>
                        <div className="text-xl font-black text-amber-600 font-mono tabular-nums">
                          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")} min
                        </div>
                      </div>
                    </div>

                    {/* Fill bar */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-emerald-950/70 mb-1.5">
                        <span>Fill Progress</span><span>73%</span>
                      </div>
                      <div className="h-3 bg-emerald-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400"
                          initial={{ width: 0 }}
                          whileInView={{ width: "73%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.6, ease: "easeOut", delay: 0.4 }}
                        />
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-3 text-[11px] font-semibold">
                      <span className="flex items-center gap-1 text-emerald-600"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"/>0–49% Normal</span>
                      <span className="flex items-center gap-1 text-amber-500"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"/>50–79% Attention</span>
                      <span className="flex items-center gap-1 text-red-500"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"/>≥80% Critical</span>
                    </div>
                  </div>
                </div>

                {/* Last updated */}
                <div className="text-[11px] text-center text-emerald-950/40 font-medium border-t border-emerald-100 pt-3">
                  Last reading: just now · Next in ~27 seconds
                </div>
              </div>
            </FadeSlideIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          SECTION 3 — ALERT SYSTEM
      ══════════════════════════════════ */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: Alert image */}
          <FadeSlideIn direction="left">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-emerald-900/10 border border-emerald-100">
              <Image
                src="/Smart%20Bin%20Alert%20Dashboard.png"
                alt="SMS and Email alert for full dustbin"
                width={760}
                height={560}
                className="w-full h-auto object-cover"
              />
            </div>
          </FadeSlideIn>

          {/* Right: Explanation */}
          <FadeSlideIn direction="right" delay={0.15}>
            <div className="flex flex-col gap-5">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold w-fit">
                <BellRing className="w-3.5 h-3.5" />
                Instant Dual-Channel Alerts at 80%+
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-emerald-950 leading-tight">
                Nobody Misses a Critical Alert — Ever
              </h2>
              <p className="text-base text-emerald-950/70 leading-relaxed">
                The moment a bin crosses the <strong>80% fill threshold</strong>, the system simultaneously 
                dispatches an <strong>Email via Nodemailer</strong> and an <strong>SMS via gateway API</strong> 
                to the responsible area moderator — even without an active internet connection on their end.
              </p>

              {/* Alert channel cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3"
                >
                  <div className="p-2 rounded-xl bg-blue-100 text-blue-700 flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-blue-800">Email Alert</div>
                    <div className="text-xs text-blue-700/80 mt-0.5">Nodemailer delivers detailed alerts with bin ID, fill %, location & map link.</div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3"
                >
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 flex-shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-emerald-800">SMS Alert</div>
                    <div className="text-xs text-emerald-700/80 mt-0.5">BulkSMS / SSL Wireless API sends instant SMS even without data or email access.</div>
                  </div>
                </motion.div>
              </div>

              <div className="flex items-center gap-2 mt-1 text-sm text-emerald-950/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Only <strong>confirmed, non-anomalous</strong> readings trigger alerts — no false alarms.</span>
              </div>
            </div>
          </FadeSlideIn>
        </div>
      </section>

      {/* ══════════════════════════════════
          SECTION 4 — CITIZEN QR SCAN & REPORT
      ══════════════════════════════════ */}
      <section className="bg-white border-y border-emerald-100 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: Explanation */}
            <FadeSlideIn direction="left">
              <div className="flex flex-col gap-5">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold w-fit">
                  <QrCode className="w-3.5 h-3.5" />
                  Zero-Friction Citizen Participation
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-emerald-950 leading-tight">
                  Scan the QR Code on Any Bin — Report in 5 Seconds
                </h2>
                <p className="text-base text-emerald-950/70 leading-relaxed">
                  Empowering every citizen to participate in city cleanliness. When you notice an overflowing bin 
                  or foul odor, simply scan the unique QR code on the dustbin. The system automatically populates 
                  the <strong>Dustbin ID</strong>, verifies location, and lets you submit in two taps — <strong>no account or password needed</strong>.
                </p>

                {/* Feature Highlights */}
                <div className="flex flex-col gap-3 mt-1">
                  {[
                    {
                      icon: <Scan className="w-4 h-4 text-emerald-600" />,
                      title: "Instant QR Auto-Fill",
                      desc: "Point your smartphone camera at the sticker; Dustbin ID is populated automatically."
                    },
                    {
                      icon: <ShieldAlert className="w-4 h-4 text-teal-600" />,
                      title: "Fixed Problem Categories",
                      desc: "Choose from verified options (Overflowing, Foul Odor, Broken Lid) to keep data structured."
                    },
                    {
                      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
                      title: "100% Account-Free Reporting",
                      desc: "Frictionless public access with automatic timestamping and moderator routing."
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#f7faf8] border border-emerald-100">
                      <div className="p-2 rounded-xl bg-white shadow-2xs border border-emerald-100 flex-shrink-0 mt-0.5">
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-emerald-950">{item.title}</div>
                        <div className="text-xs text-emerald-950/70 mt-0.5 leading-relaxed">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <Link
                    href="/report"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] text-sm"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Try Public Report Tool</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </FadeSlideIn>

            {/* Right: QR Scan Success Image */}
            <FadeSlideIn direction="right" delay={0.15}>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-emerald-900/10 border border-emerald-100 group">
                <Image
                  src="/DustbinTracker%20QR%20Scan%20Success.png"
                  alt="Citizen scanning QR code on DustbinTracker smart bin"
                  width={760}
                  height={510}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                />
              </div>
            </FadeSlideIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          SECTION 5 — CLEANER TAKES ACTION
      ══════════════════════════════════ */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: Cleaner image */}
          <FadeSlideIn direction="left">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-emerald-900/10 border border-emerald-100">
              <Image
                src="/Smart%20Waste%20Tracking%20in%20Action.png"
                alt="Waste collector checking live map on phone"
                width={760}
                height={560}
                className="w-full h-auto object-cover"
              />
            </div>
          </FadeSlideIn>

          {/* Right: Text */}
          <FadeSlideIn direction="right" delay={0.15}>
            <div className="flex flex-col gap-5">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold w-fit">
                <MapPin className="w-3.5 h-3.5" />
                Smart Field Operations
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-emerald-950 leading-tight">
                The Cleaner Knows Exactly Where to Go
              </h2>
              <p className="text-base text-emerald-950/70 leading-relaxed">
                Once alerted, the area moderator opens the <strong>DustbinTracker Live Map</strong> on their 
                phone. <strong className="text-red-600">Red markers</strong> show bins at ≥80% — requiring 
                immediate collection. <strong className="text-emerald-600">Green markers</strong> are normal. 
                No more blind routes or wasted fuel.
              </p>

              {/* Steps */}
              <div className="flex flex-col gap-3 mt-2">
                {[
                  { step: "01", title: "Alert received via SMS + Email", desc: "Bin ID, fill %, location sent instantly." },
                  { step: "02", title: "Open Live Map on phone", desc: "Red pins highlight critical bins in zone." },
                  { step: "03", title: "Drive to flagged bins only", desc: "Skip empty bins — save fuel & time." },
                  { step: "04", title: "Collect & system auto-resets", desc: "Fill level drops, pin turns green again." },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12, duration: 0.5 }}
                    className="flex items-start gap-4 p-3.5 rounded-2xl bg-[#f7faf8] border border-emerald-100"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center justify-center flex-shrink-0">
                      {s.step}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-emerald-950">{s.title}</div>
                      <div className="text-xs text-emerald-950/60 mt-0.5">{s.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeSlideIn>
        </div>
      </section>

      {/* ══════════════════════════════════
          SECTION 6 — HARDWARE
      ══════════════════════════════════ */}
      <section className="bg-white border-y border-emerald-100 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <FadeSlideIn direction="up">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-semibold mb-4">
                <Cpu className="w-3.5 h-3.5" />
                Hardware Layer
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-emerald-950 leading-tight">
                The IoT Components Inside Every Smart Bin
              </h2>
              <p className="text-base text-emerald-950/70 mt-3 leading-relaxed">
                Low-cost, widely available hardware that turns any ordinary dustbin into a connected IoT device.
              </p>
            </div>
          </FadeSlideIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Hardware image */}
            <FadeSlideIn direction="left" delay={0.1}>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-emerald-900/8 border border-emerald-100 bg-white p-6">
                <Image
                  src="/ESP32%20and%20Ultrasonic%20Sensor%20Kit.png"
                  alt="ESP32 and HC-SR04 Ultrasonic Sensor hardware kit"
                  width={760}
                  height={560}
                  className="w-full h-auto object-contain"
                />
              </div>
            </FadeSlideIn>

            {/* Right: Component cards */}
            <FadeSlideIn direction="right" delay={0.2}>
              <div className="flex flex-col gap-4">
                {[
                  {
                    name: "ESP32 Wi-Fi Microcontroller",
                    badge: "ESP-WROOM-32",
                    desc: "The brain of the system. Reads sensor data, processes fill percentage, and transmits readings to the cloud backend over Wi-Fi every 30 seconds.",
                    color: "bg-blue-50 border-blue-200",
                    badgeColor: "bg-blue-100 text-blue-700",
                    icon: <Wifi className="w-5 h-5 text-blue-600" />,
                  },
                  {
                    name: "HC-SR04 Ultrasonic Sensor",
                    badge: "Distance Sensor",
                    desc: "Mounted inside the bin lid. Emits ultrasonic pulses to measure the distance from the top to the waste surface, converted to fill percentage.",
                    color: "bg-teal-50 border-teal-200",
                    badgeColor: "bg-teal-100 text-teal-700",
                    icon: <Zap className="w-5 h-5 text-teal-600" />,
                  },
                  {
                    name: "Jumper Wires (M-to-F)",
                    badge: "Wiring",
                    desc: "Connect VCC, Trig, Echo, and GND pins of HC-SR04 to the ESP32 GPIO pins. Standard breadboard-compatible jumper wires.",
                    color: "bg-orange-50 border-orange-200",
                    badgeColor: "bg-orange-100 text-orange-700",
                    icon: <Cpu className="w-5 h-5 text-orange-500" />,
                  },
                  {
                    name: "Smart Dustbin with Lid",
                    badge: "Housing",
                    desc: "Standard plastic bin with a secure lid. The sensor assembly is fixed inside the lid facing downward for consistent distance measurement.",
                    color: "bg-emerald-50 border-emerald-200",
                    badgeColor: "bg-emerald-100 text-emerald-700",
                    icon: <Trash2 className="w-5 h-5 text-emerald-600" />,
                  },
                ].map((hw, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.015, y: -2 }}
                    transition={{ duration: 0.45, delay: i * 0.1 }}
                    className={`p-4 rounded-2xl border flex items-start gap-4 ${hw.color}`}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-white/80">
                      {hw.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-emerald-950">{hw.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${hw.badgeColor}`}>{hw.badge}</span>
                      </div>
                      <p className="text-xs text-emerald-950/70 mt-1 leading-relaxed">{hw.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </FadeSlideIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          SECTION 7 — CTA FOOTER STRIP
      ══════════════════════════════════ */}
      <section className="bg-emerald-700 py-16">
        <FadeSlideIn direction="up">
          <div className="max-w-3xl mx-auto px-4 text-center flex flex-col items-center gap-6">
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Ready to Make Your City Cleaner?
            </h2>
            <p className="text-emerald-100 text-base leading-relaxed">
              Scan a bin&apos;s QR code and report an issue in seconds — no account needed. 
              Or explore the live map to see all bins in your city right now.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/report"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold bg-white hover:bg-emerald-50 text-emerald-800 shadow-lg transition-all hover:scale-[1.03]"
              >
                <QrCode className="w-5 h-5" />
                Report a Dustbin Now
              </Link>
              <Link
                href="/map"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold bg-emerald-800 hover:bg-emerald-900 text-white border border-emerald-600 transition-all"
              >
                <MapPin className="w-5 h-5" />
                Open Live Map
              </Link>
            </div>
          </div>
        </FadeSlideIn>
      </section>
    </div>
  );
}
