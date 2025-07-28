import { type ProductCreateData } from '../../app/schemas/products/ProductSchemas.ts';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';

export const createProductData = (
  overrides?: Partial<ProductCreateData>,
): ProductCreateData => {
  const uniqueId = faker.string.alphanumeric(8).toUpperCase();
  const productTypes = ['shoes', 'clothing', 'accessories'] as const;
  const genders = ['mens', 'womens', 'unisex', 'kids'] as const;
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['Black', 'White', 'Navy', 'Grey', 'Red', 'Blue'];

  return {
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    brand: faker.company.name().split(' ')[0], // First word only for cleaner brand names
    productType: faker.helpers.arrayElement(productTypes),
    gender: faker.helpers.arrayElement(genders),
    categories: [new mongoose.Types.ObjectId().toString()],
    tags: faker.helpers.arrayElements(
      ['running', 'athletic', 'casual', 'performance', 'comfort'],
      { min: 1, max: 3 },
    ),
    status: 'active',
    isPublished: false,
    sortOrder: faker.number.int({ min: 0, max: 100 }),
    variants: [
      {
        sku: `${uniqueId}-${faker.string.alpha(2).toUpperCase()}`,
        size: faker.helpers.arrayElement(sizes),
        color: faker.helpers.arrayElement(colors),
        price: faker.number.float({ min: 19.99, max: 299.99 }),
        quantity: faker.number.int({ min: 0, max: 100 }),
        isActive: true,
      },
    ],
    ...overrides,
  };
};

export const createPublishedProductData = (
  overrides?: Partial<ProductCreateData>,
): ProductCreateData =>
  createProductData({
    isPublished: true,
    ...overrides,
  });
