import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITelemetryLog extends Document {
  binId: string;
  fillLevel: number;
  distanceCm: number;
  status: "normal" | "attention" | "critical";
  isAnomaly: boolean;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TelemetryLogSchema: Schema = new Schema(
  {
    binId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    fillLevel: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    distanceCm: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["normal", "attention", "critical"],
      required: true,
    },
    isAnomaly: {
      type: Boolean,
      default: false,
    },
    recordedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying time-series historical data per dustbin
TelemetryLogSchema.index({ binId: 1, recordedAt: -1 });

export const TelemetryLog: Model<ITelemetryLog> =
  mongoose.models.TelemetryLog ||
  mongoose.model<ITelemetryLog>("TelemetryLog", TelemetryLogSchema);
