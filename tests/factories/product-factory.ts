import { type ProductSchema } from '../../app/schemas/product/product.schema.ts';
import { faker } from '@faker-js/faker';
import { validObjectId } from '../setup/schema-helpers.ts';

export const productFactories = {
  minimal: (overrides: Partial<ProductSchema> = {}) => ({
    title: faker.commerce.productName(),
    description: faker.lorem.sentences(2, ' '),
    price: faker.number.int({ min: 100, max: 50000 }),
    ...overrides,
  }),

  complete: (overrides: Partial<ProductSchema> = {}) => {
    const price = faker.number.int({ min: 1000, max: 50000 });
    const discountPrice = faker.number.int({ min: 100, max: price - 1 });

    return {
      title: faker.commerce.productName(),
      description: faker.lorem.paragraph(),
      price,
      discountPrice,
      images: [validObjectId, validObjectId],
      categories: [validObjectId],
      ...overrides,
    };
  },
};

export const productBoundaries = {
  minTitle: (overrides: Partial<ProductSchema> = {}) => ({
    ...productFactories.minimal(overrides),
    title: 'A',
    description: 'A'.repeat(10),
  }),

  maxTitle: (overrides: Partial<ProductSchema> = {}) => ({
    ...productFactories.minimal(overrides),
    title: 'A'.repeat(200),
    description: 'A'.repeat(5000),
  }),

  minPrice: (overrides: Partial<ProductSchema> = {}) => ({
    ...productFactories.minimal(overrides),
    price: 0,
  }),

  maxDiscount: (overrides: Partial<ProductSchema> = {}) => {
    const price = 1000;
    return {
      ...productFactories.minimal(overrides),
      price,
      discountPrice: price - 1,
    };
  },
};

export const invalidProducts = {
  emptyTitle: () => ({
    ...productFactories.minimal(),
    title: '',
  }),

  shortDescription: () => ({
    ...productFactories.minimal(),
    description: 'Too short',
  }),

  negativePrice: () => ({
    ...productFactories.minimal(),
    price: -100,
  }),

  invalidDiscount: () => {
    const price = 1000;
    return {
      ...productFactories.minimal(),
      price,
      discountPrice: price + 100,
    };
  },

  decimalPrice: () => ({
    ...productFactories.minimal(),
    price: 19.99,
  }),
};
