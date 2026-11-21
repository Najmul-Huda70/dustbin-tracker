import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Dustbin } from "@/models/Dustbin";

// Sample seed bins for Dhaka city zones
const defaultSampleBins = [
  {
    binId: "BIN-DHK-101",
    name: "Dhanmondi Lake Walkway Bin",
    zone: "Dhanmondi",
    latitude: 23.7461,
    longitude: 90.3742,
    totalDepthCm: 100,
    currentDistanceCm: 18,
    fillLevel: 82,
    status: "critical",
    isAnomaly: false,
    moderatorEmail: "moderator.dhanmondi@dustbintracker.org",
  },
  {
    binId: "BIN-DHK-104",
    name: "Sector 7 Corner Smart Bin",
    zone: "Uttara",
    latitude: 23.8698,
    longitude: 90.3982,
    totalDepthCm: 100,
    currentDistanceCm: 27,
    fillLevel: 73,
    status: "attention",
    isAnomaly: false,
    moderatorEmail: "moderator.uttara@dustbintracker.org",
  },
  {
    binId: "BIN-DHK-108",
    name: "Mirpur-10 Circle West Bin",
    zone: "Mirpur",
    latitude: 23.8069,
    longitude: 90.3687,
    totalDepthCm: 100,
    currentDistanceCm: 65,
    fillLevel: 35,
    status: "normal",
    isAnomaly: false,
    moderatorEmail: "moderator.mirpur@dustbintracker.org",
  },
  {
    binId: "BIN-DHK-112",
    name: "Gulshan-2 Avenue Park Bin",
    zone: "Gulshan",
    latitude: 23.7925,
    longitude: 90.4158,
    totalDepthCm: 100,
    currentDistanceCm: 55,
    fillLevel: 45,
    status: "normal",
    isAnomaly: false,
    moderatorEmail: "moderator.gulshan@dustbintracker.org",
  },
];

export async function GET() {
  try {
    const conn = await connectToDatabase();

    if (!conn) {
      // In-memory fallback if MONGODB_URI is not yet configured in env
      return NextResponse.json({
        success: true,
        source: "mock_fallback",
        count: defaultSampleBins.length,
        bins: defaultSampleBins,
      });
    }

    let bins = await Dustbin.find({}).sort({ updatedAt: -1 });

    // Seed default sample bins if empty
    if (bins.length === 0) {
      await Dustbin.insertMany(defaultSampleBins);
      bins = await Dustbin.find({}).sort({ updatedAt: -1 });
    }

    return NextResponse.json({
      success: true,
      source: "mongodb_atlas",
      count: bins.length,
      bins,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching dustbins";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: "Database not connected. Please set MONGODB_URI." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const newBin = await Dustbin.create(body);

    return NextResponse.json(
      { success: true, message: "Dustbin registered successfully", bin: newBin },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error creating dustbin";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
