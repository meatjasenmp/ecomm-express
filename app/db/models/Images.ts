import mongoose, { Types } from 'mongoose';
const { Schema, model } = mongoose;

export interface ImageInterface {
  url: string;
  isPrimary?: boolean;
  _id?: Types.ObjectId;
}

export const imageSchema = new Schema<ImageInterface>({
  url: { type: String, required: true },
  isPrimary: { type: Boolean },
});

const Image = model('Image', imageSchema);
export default Image;
