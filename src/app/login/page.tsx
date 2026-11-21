import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-900/8 overflow-hidden">

          {/* Top green accent strip */}
          <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

          <div className="px-8 py-10 flex flex-col items-center gap-6">

            {/* Logo */}
            <Link href="/" className="focus:outline-none">
              <Image
                src="/DustbinTracker%20Smart%20Waste%20Logo.png"
                alt="DustbinTracker Logo"
                width={200}
                height={80}
                className="h-12 w-auto mx-auto object-contain"
                priority
              />
            </Link>

            {/* Title */}
            <div className="text-center">
              <h1 className="text-2xl font-black text-emerald-950">Authorized Access</h1>
              <p className="text-sm text-emerald-950/60 mt-1.5 leading-relaxed">
                Sign in with your organization Google account to access the Admin or Area Moderator dashboard.
              </p>
            </div>

            {/* Info badge */}
            <div className="w-full flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-800 leading-relaxed">
                Only <strong>pre-approved moderator and admin</strong> Google accounts can access the system.
                Public citizen reporting does not require login — use{" "}
                <Link href="/report" className="underline underline-offset-2 font-semibold hover:text-emerald-700">
                  Report a Dustbin
                </Link>{" "}
                instead.
              </p>
            </div>

            {/* Google SSO Button */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl font-semibold bg-white hover:bg-emerald-50/80 text-emerald-950 border border-emerald-200 shadow-sm hover:border-emerald-300 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span className="text-sm">Continue with Google</span>
            </button>

            {/* Lock note */}
            <div className="flex items-center gap-2 text-xs text-emerald-950/50">
              <Lock className="w-3.5 h-3.5" />
              <span>Secured via Google OAuth 2.0 Single Sign-On</span>
            </div>

            {/* Back link */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </Link>
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="text-center text-xs text-emerald-950/40 mt-6 font-medium">
          DustbinTracker · Smart Waste. Cleaner Tomorrow.
        </p>
      </div>
    </div>
  );
}
