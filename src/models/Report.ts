import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReport extends Document {
  dustbinId: string;
  problemCategory: string;
  status: "pending" | "investigating" | "resolved";
  reportedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema: Schema = new Schema(
  {
    dustbinId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    problemCategory: {
      type: String,
      required: true,
      enum: [
        "Dustbin is Overflowing (Full)",
        "Foul / Severe Odor",
        "Damaged or Broken Bin Lid",
        "Littering Around the Bin Area",
        "Sensor Damaged or Offline",
      ],
    },
    status: {
      type: String,
      enum: ["pending", "investigating", "resolved"],
      default: "pending",
      index: true,
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Report: Model<IReport> =
  mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema);
