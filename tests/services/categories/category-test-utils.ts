import { faker } from '@faker-js/faker';
import Category from '../../../app/db/models/Categories.ts';

export type CategoryTestData = {
  brandName: string;
  categoryName: string;
  subcategoryName: string;
  brandId: string;
  categoryId: string;
  subcategoryId: string;
};

export const setupCategoryTestSuite = () => {
  let testData: CategoryTestData;

  beforeAll(() => {
    faker.seed(123);
  });

  beforeEach(async () => {
    await Category.deleteMany({
      $or: [{ path: { $regex: /^(brand|category|subcategory)-/i } }, { description: { $regex: /faker/i } }],
    });
  });

  afterEach(async () => {
    if (testData) {
      const idsToDelete = [testData.brandId, testData.categoryId, testData.subcategoryId].filter(
        (id) => id && id.length > 0,
      );

      if (idsToDelete.length > 0) {
        await Category.deleteMany({
          _id: { $in: idsToDelete },
        });
      }
    }
  });

  return {
    setCategoryTestData: (data: CategoryTestData) => {
      testData = data;
    },
  };
};
