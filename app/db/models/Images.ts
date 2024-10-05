import mongoose from 'mongoose';
const { Schema, model } = mongoose;

export interface ImageInterface {
  url: string;
  isPrimary?: boolean;
}

const imageSchema = new Schema<ImageInterface>({
  url: { type: String, required: true },
  isPrimary: { type: Boolean },
});

const Image = model('Image', imageSchema);
export default Image;
