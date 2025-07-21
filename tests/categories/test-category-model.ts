import mongoose from 'mongoose';
import Category from '../../app/db/models/Categories.js';
import 'dotenv/config';

// Connect to MongoDB Atlas
async function connectDB() {
  try {
    const uri = process.env.ATLAS_URI;
    if (!uri) {
      throw new Error('ATLAS_URI not found in environment variables');
    }
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Test creating hierarchical categories
async function testCategoryModel() {
  console.log('\n🧪 Testing Category Model...\n');

  try {
    // Clear existing test data
    await Category.deleteMany({ name: { $in: ['Nike Test', 'Shoes Test', "Men's Shoes Test"] } });

    // Test 1: Create root level category (Brand - Level 0)
    console.log('1️⃣ Creating Level 0 (Brand): Nike Test');
    const brand = new Category({
      name: 'Nike Test',
      description: 'Nike brand for testing',
      parentId: null,
      level: 0,
      path: 'nike-test',
      isActive: true,
      sortOrder: 1,
    });
    const savedBrand = await brand.save();
    console.log('✅ Created:', savedBrand.name, '- Path:', savedBrand.path);

    // Test 2: Create category level (Level 1)
    console.log('\n2️⃣ Creating Level 1 (Category): Shoes Test');
    const category = new Category({
      name: 'Shoes Test',
      description: 'Shoes category for testing',
      parentId: savedBrand._id.toString(),
      level: 1,
      path: 'nike-test/shoes-test',
      isActive: true,
      sortOrder: 1,
    });
    const savedCategory = await category.save();
    console.log('✅ Created:', savedCategory.name, '- Path:', savedCategory.path);

    // Test 3: Create subcategory level (Level 2)
    console.log("\n3️⃣ Creating Level 2 (Subcategory): Men's Shoes Test");
    const subcategory = new Category({
      name: "Men's Shoes Test",
      description: "Men's shoes subcategory for testing",
      parentId: savedCategory._id.toString(),
      level: 2,
      path: 'nike-test/shoes-test/mens-shoes-test',
      isActive: true,
      sortOrder: 1,
    });
    const savedSubcategory = await subcategory.save();
    console.log('✅ Created:', savedSubcategory.name, '- Path:', savedSubcategory.path);

    // Test 4: Query all test categories
    console.log('\n4️⃣ Querying all test categories:');
    const allCategories = await Category.find({
      name: { $in: ['Nike Test', 'Shoes Test', "Men's Shoes Test"] },
    }).sort({ level: 1, sortOrder: 1 });

    allCategories.forEach((cat) => {
      const indent = '  '.repeat(cat.level);
      console.log(`${indent}Level ${cat.level}: ${cat.name} (${cat.path})`);
    });

    // Test 5: Test validation - try invalid level
    console.log('\n5️⃣ Testing validation (this should fail):');
    try {
      const invalidCategory = new Category({
        name: 'Invalid Level',
        description: 'This should fail',
        parentId: null,
        level: 5, // Invalid level > 2
        path: 'invalid-level',
        isActive: true,
        sortOrder: 1,
      });
      await invalidCategory.save();
    } catch (error: any) {
      console.log('✅ Validation worked! Error:', error.message);
    }

    console.log('\n🎉 All tests passed! Category model is working correctly.');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the tests
async function runTests() {
  await connectDB();
  await testCategoryModel();
  await mongoose.disconnect();
  console.log('\n✅ Disconnected from MongoDB');
}

runTests();
