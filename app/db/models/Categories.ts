import mongoose, { Types } from 'mongoose';
const { Schema, model } = mongoose;

export interface CategoryInterface {
  _id?: Types.ObjectId;
  name: string;
  description: string;
}

export interface CategoryRequest extends CategoryInterface {
  id: string;
}

const categorySchema = new Schema<CategoryInterface>({
  name: { type: String, required: true },
  description: { type: String, required: true },
});

const Category = model('Category', categorySchema);
export default Category;
