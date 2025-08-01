import mongoose, { Schema, Document } from 'mongoose';

export interface ImageInterface extends Document {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  s3Key: string;
  s3Bucket: string;
  s3Url: string;
  width?: number;
  height?: number;
  altText?: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

const ImageSchema = new Schema<ImageInterface>(
  {
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      enum: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    },
    size: {
      type: Number,
      required: true,
      min: 1,
      max: 10 * 1024 * 1024, // 10MB
    },
    s3Key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    s3Bucket: {
      type: String,
      required: true,
      trim: true,
    },
    s3Url: {
      type: String,
      required: true,
      trim: true,
    },
    width: {
      type: Number,
      min: 1,
    },
    height: {
      type: Number,
      min: 1,
    },
    altText: {
      type: String,
      maxlength: 255,
      trim: true,
    },
    title: {
      type: String,
      maxlength: 255,
      trim: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

ImageSchema.index({ s3Key: 1 });
ImageSchema.index({ createdAt: -1 });
ImageSchema.index({ deletedAt: 1 });

export default mongoose.model<ImageInterface>('Image', ImageSchema);