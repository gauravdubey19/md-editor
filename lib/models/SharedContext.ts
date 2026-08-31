import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISharedContextMetadata {
  wordCount: number;
  charCount: number;
  lineCount: number;
  readTimeMinutes: number;
  theme?: string;
}

export interface ISharedContext extends Document {
  shareToken: string;
  title: string;
  markdown: string;
  metadata: ISharedContextMetadata;
  parentToken?: string | null;
  version: number;
  expiresAt: Date;
  isRevoked: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const SharedContextSchema = new Schema<ISharedContext>(
  {
    shareToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: "Untitled.md",
      maxLength: 200,
    },
    markdown: {
      type: String,
      required: true,
      maxLength: 2_000_000, // 2MB max text
    },
    metadata: {
      wordCount: { type: Number, default: 0 },
      charCount: { type: Number, default: 0 },
      lineCount: { type: Number, default: 0 },
      readTimeMinutes: { type: Number, default: 1 },
      theme: { type: String, default: "dark" },
    },
    parentToken: {
      type: String,
      default: null,
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// MongoDB Native TTL index: Auto-purges documents after expiresAt
SharedContextSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SharedContext: Model<ISharedContext> =
  mongoose.models.SharedContext || mongoose.model<ISharedContext>("SharedContext", SharedContextSchema);
