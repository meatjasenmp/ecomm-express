import mongoose, { Types } from 'mongoose';
const { Schema, model } = mongoose;

export interface ImageInterface {
  name: string;
  url: string;
  key: string;
  createdAt: { type: Date };
  isPrimary?: boolean;
  _id?: Types.ObjectId;
}

export const imageSchema = new Schema<ImageInterface>({
  name: { type: String, required: true },
  key: { type: String, required: true },
  url: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isPrimary: { type: Boolean, default: false },
});

const Image = model('Image', imageSchema);
export default Image;
