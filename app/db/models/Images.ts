import mongoose, { Types } from 'mongoose';
const { Schema, model } = mongoose;

export type ImageInterface = {
  name: string;
  url: string;
  key: string;
  createdAt: { type: Date };
  _id?: Types.ObjectId;
};

export const imageSchema = new Schema<ImageInterface>({
  name: { type: String, required: true },
  key: { type: String, required: true },
  url: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Image = model('Image', imageSchema);
export default Image;
