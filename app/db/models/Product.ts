import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const productSchema = new Schema({
  title: String,
  description: String,
});

const Product = model('Product', productSchema);
export default Product;
