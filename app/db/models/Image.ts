import mongoose, { Schema, Document } from 'mongoose';

export type ImageVariant = {
  s3Key: string;
  s3Url: string;
  width: number;
  height: number;
  size: number;
};

export type ImageVariants = {
  original: ImageVariant;
  thumbnail: ImageVariant;
  medium: ImageVariant;
  large: ImageVariant;
};

export interface ImageInterface extends Document {
  filename: string;
  originalName: string;
  mimeType: string;
  variants: ImageVariants;
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
    variants: {
      type: {
        original: {
          s3Key: { type: String, required: true },
          s3Url: { type: String, required: true },
          width: { type: Number, required: true, min: 1 },
          height: { type: Number, required: true, min: 1 },
          size: { type: Number, required: true, min: 1 },
        },
        thumbnail: {
          s3Key: { type: String, required: true },
          s3Url: { type: String, required: true },
          width: { type: Number, required: true, min: 1 },
          height: { type: Number, required: true, min: 1 },
          size: { type: Number, required: true, min: 1 },
        },
        medium: {
          s3Key: { type: String, required: true },
          s3Url: { type: String, required: true },
          width: { type: Number, required: true, min: 1 },
          height: { type: Number, required: true, min: 1 },
          size: { type: Number, required: true, min: 1 },
        },
        large: {
          s3Key: { type: String, required: true },
          s3Url: { type: String, required: true },
          width: { type: Number, required: true, min: 1 },
          height: { type: Number, required: true, min: 1 },
          size: { type: Number, required: true, min: 1 },
        },
      },
      required: true,
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

ImageSchema.index({ 'variants.original.s3Key': 1 });
ImageSchema.index({ createdAt: -1 });
ImageSchema.index({ deletedAt: 1 });

export default mongoose.model<ImageInterface>('Image', ImageSchema);