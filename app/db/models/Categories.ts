import mongoose, { Types } from 'mongoose';
const { Schema, model } = mongoose;

export interface CategoryInterface {
  _id?: Types.ObjectId;
  name: string;
  description: string;
  parentId: string | null;
  level: number;
  path: string;
  ancestors: string[]; // Array of ancestor paths for efficient querying
  isActive: boolean;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const categorySchema = new Schema<CategoryInterface>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    parentId: { type: String, default: null },
    level: { type: Number, required: true, min: 0, max: 2 },
    path: { type: String, required: true },
    ancestors: [{ type: String }], // Array of ancestor paths
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

categorySchema.index({ path: 1 }, { unique: true });
categorySchema.index({ parentId: 1, sortOrder: 1 });
categorySchema.index({ level: 1, isActive: 1, sortOrder: 1 });
categorySchema.index({ ancestors: 1 });
categorySchema.index({ isActive: 1, sortOrder: 1 });
categorySchema.index({ name: 'text', description: 'text' }); // Full-text search

const Category = model('Category', categorySchema);
export default Category;
