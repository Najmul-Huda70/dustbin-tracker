import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "DustbinTracker - Smart IoT Waste Level Tracking System",
  description:
    "Intelligent, automated waste monitoring system with ESP32 IoT sensors, real-time map visualization, QR public reporting, and instant alerts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }}>
      <body className="min-h-full flex flex-col font-sans bg-[#f7faf8] text-[#142217] eco-grid">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
