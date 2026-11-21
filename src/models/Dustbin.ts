import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDustbin extends Document {
  binId: string;
  name: string;
  zone: string;
  latitude: number;
  longitude: number;
  totalDepthCm: number;
  currentDistanceCm: number;
  fillLevel: number; // 0 - 100%
  status: "normal" | "attention" | "critical";
  isAnomaly: boolean;
  lastReportedAt: Date;
  moderatorEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DustbinSchema: Schema = new Schema(
  {
    binId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    zone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    totalDepthCm: {
      type: Number,
      default: 100, // standard bin depth in cm
    },
    currentDistanceCm: {
      type: Number,
      default: 100,
    },
    fillLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ["normal", "attention", "critical"],
      default: "normal",
    },
    isAnomaly: {
      type: Boolean,
      default: false,
    },
    lastReportedAt: {
      type: Date,
      default: Date.now,
    },
    moderatorEmail: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose model overwrite in Next.js hot reload
export const Dustbin: Model<IDustbin> =
  mongoose.models.Dustbin || mongoose.model<IDustbin>("Dustbin", DustbinSchema);
