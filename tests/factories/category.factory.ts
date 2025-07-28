import { type CategoryCreateData } from '../../app/schemas/categories/CategorySchemas.ts';
import { faker } from '@faker-js/faker';

export const createCategoryData = (
  overrides?: Partial<CategoryCreateData>,
): CategoryCreateData => {
  const uniqueId = faker.string.alphanumeric(8).toUpperCase();
  const statuses = ['active', 'draft', 'archived'] as const;

  return {
    name: `${faker.commerce.department()} ${uniqueId}`,
    description: faker.lorem.paragraph(),
    shortDescription: faker.lorem.sentence(),
    status: faker.helpers.arrayElement(statuses),
    isPublished: false,
    sortOrder: faker.number.int({ min: 0, max: 100 }),
    ...overrides,
  };
};

export const createPublishedCategoryData = (
  overrides?: Partial<CategoryCreateData>,
): CategoryCreateData =>
  createCategoryData({
    isPublished: true,
    ...overrides,
  });

export const createMultipleCategoriesData = (count: number): CategoryCreateData[] => {
  return Array.from({ length: count }, () => createCategoryData());
};