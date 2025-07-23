import mongoose, { Types } from 'mongoose';
const { Schema, model } = mongoose;

export interface CategoryInterface {
  _id?: Types.ObjectId;
  name: string;
  description: string;
  parentId: string | null;
  level: number;
  path: string;
  ancestors: string[];
  isActive: boolean;
  sortOrder: number;
  deletedAt?: Date | null;
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
    deletedAt: { type: Date, default: null },
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
categorySchema.index({ name: 'text', description: 'text' });
categorySchema.index({ deletedAt: 1 });

const Category = model('Category', categorySchema);
export default Category;
