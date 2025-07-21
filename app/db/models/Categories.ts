import mongoose, { Types } from 'mongoose';
const { Schema, model } = mongoose;

export interface CategoryInterface {
  _id?: Types.ObjectId;
  name: string;
  description: string;
  parentId: string | null;
  level: number;
  path: string;
  isActive: boolean;
  sortOrder: number;
}

const categorySchema = new Schema<CategoryInterface>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  parentId: { type: String, default: null },
  level: { type: Number, required: true, min: 0, max: 2 },
  path: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
});

const Category = model('Category', categorySchema);
export default Category;
