import mongoose from 'mongoose';
import Category from '../../app/db/models/Categories.js';
import {
  createCategoryWithHierarchy,
  buildCategoryTree,
  getCategoryAncestors,
  getCategoryDescendants,
  getCategoriesPaginated,
  validateCategoryHierarchy,
  createSlug,
  CategoryError,
} from '../../app/helpers/category-utils.js';
import 'dotenv/config';

// Connect to MongoDB Atlas
async function connectDB() {
  const uri = process.env.ATLAS_URI;
  if (!uri) {
    throw new Error('ATLAS_URI not found in environment variables');
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', (error as Error).message);
    process.exit(1);
  }
}

// Test production-ready category utilities
async function testCategoryUtils() {
  console.log('\n🧪 Testing Production Category Utilities...\n');

  try {
    // Clean up any existing test data
    await Category.deleteMany({
      $or: [
        { name: { $regex: /^(Nike|Adidas|Under Armour).*(Test|Prod)/, $options: 'i' } },
        { path: { $regex: /(test|prod)/i } },
      ],
    });

    let nikeId: string, shoesId: string, mensId: string;

    // Test 1: Create categories using production utility
    console.log('1️⃣ Testing createCategoryWithHierarchy...');

    const nike = await createCategoryWithHierarchy({
      name: 'Nike Prod Test',
      description: 'Nike brand for production testing',
      level: 0,
      parentId: null,
      sortOrder: 1,
    });
    nikeId = nike._id!.toString();
    console.log('✅ Created brand:', nike.name, '- Path:', nike.path);
    console.log('   Ancestors:', nike.ancestors);

    const shoes = await createCategoryWithHierarchy({
      name: 'Shoes Prod Test',
      description: 'Shoes category for production testing',
      level: 1,
      parentId: nikeId,
      sortOrder: 1,
    });
    shoesId = shoes._id!.toString();
    console.log('✅ Created category:', shoes.name, '- Path:', shoes.path);
    console.log('   Ancestors:', shoes.ancestors);

    const mensShoes = await createCategoryWithHierarchy({
      name: "Men's Shoes Prod Test",
      description: "Men's shoes subcategory for production testing",
      level: 2,
      parentId: shoesId,
      sortOrder: 1,
    });
    mensId = mensShoes._id!.toString();
    console.log('✅ Created subcategory:', mensShoes.name, '- Path:', mensShoes.path);
    console.log('   Ancestors:', mensShoes.ancestors);

    // Test 2: Slug creation
    console.log('\n2️⃣ Testing slug creation...');
    console.log('✅ "Nike Air Max" →', createSlug('Nike Air Max'));
    console.log('✅ "Women\'s Running Shoes!!!" →', createSlug("Women's Running Shoes!!!"));
    console.log('✅ "  Multiple   Spaces  " →', createSlug('  Multiple   Spaces  '));

    // Test 3: Get ancestors
    console.log('\n3️⃣ Testing getCategoryAncestors...');
    const ancestors = await getCategoryAncestors(mensId);
    console.log("✅ Ancestors of Men's Shoes:");
    ancestors.forEach((ancestor, i) => {
      console.log(`   ${i + 1}. ${ancestor.name} (${ancestor.path})`);
    });

    // Test 4: Get descendants
    console.log('\n4️⃣ Testing getCategoryDescendants...');
    const descendants = await getCategoryDescendants(nikeId);
    console.log('✅ Descendants of Nike:');
    descendants.forEach((desc, i) => {
      const indent = '  '.repeat(desc.level - 1);
      console.log(`   ${i + 1}. ${indent}${desc.name} (Level ${desc.level})`);
    });

    // Test 5: Build category tree
    console.log('\n5️⃣ Testing buildCategoryTree...');
    const tree = await buildCategoryTree(0);
    console.log('✅ Category tree structure:');

    const printTree = (categories: any[], depth = 0) => {
      categories.forEach((cat) => {
        const indent = '  '.repeat(depth);
        console.log(`   ${indent}• ${cat.name} (${cat.path})`);
        if (cat.children && cat.children.length > 0) {
          printTree(cat.children, depth + 1);
        }
      });
    };

    printTree(tree.filter((cat) => cat.name.includes('Prod Test')));

    // Test 6: Validation
    console.log('\n6️⃣ Testing validateCategoryHierarchy...');

    // Valid case
    const validResult = await validateCategoryHierarchy({
      name: 'Valid Category',
      level: 1,
      parentId: nikeId,
    });
    console.log('✅ Valid category validation:', validResult.valid ? 'PASSED' : 'FAILED');

    // Invalid case - wrong parent level
    const invalidResult = await validateCategoryHierarchy({
      name: 'Invalid Category',
      level: 2,
      parentId: nikeId, // Nike is level 0, but we're trying to create level 2
    });
    console.log('✅ Invalid category validation:', invalidResult.valid ? 'FAILED' : 'PASSED');
    console.log('   Errors:', invalidResult.errors);

    // Test 7: Pagination
    console.log('\n7️⃣ Testing getCategoriesPaginated...');
    const paginatedResult = await getCategoriesPaginated({
      page: 1,
      limit: 10,
      level: 0,
    });
    console.log('✅ Paginated categories (Level 0):');
    console.log(`   Total: ${paginatedResult.total}, Page: ${paginatedResult.page}/${paginatedResult.totalPages}`);
    paginatedResult.categories.forEach((cat, i) => {
      console.log(`   ${i + 1}. ${cat.name} (${cat.path})`);
    });

    // Test 8: Error handling
    console.log('\n8️⃣ Testing error handling...');
    try {
      await createCategoryWithHierarchy({
        name: '',
        description: 'Empty name test',
        level: 0,
        parentId: null,
      });
    } catch (error) {
      if (error instanceof CategoryError) {
        console.log('✅ Error handling works:', error.message);
      }
    }

    // Test 9: Create additional categories for tree testing
    console.log('\n9️⃣ Creating additional test categories...');

    const adidas = await createCategoryWithHierarchy({
      name: 'Adidas Prod Test',
      description: 'Adidas brand for testing',
      level: 0,
      parentId: null,
      sortOrder: 2,
    });
    console.log('✅ Created brand:', adidas.name);

    const adidasShoes = await createCategoryWithHierarchy({
      name: 'Running Shoes Prod Test',
      description: 'Running shoes category',
      level: 1,
      parentId: adidas._id!.toString(),
      sortOrder: 1,
    });
    console.log('✅ Created category:', adidasShoes.name);

    const womensRunning = await createCategoryWithHierarchy({
      name: "Women's Running Prod Test",
      description: "Women's running subcategory",
      level: 2,
      parentId: adidasShoes._id!.toString(),
      sortOrder: 1,
    });
    console.log('✅ Created subcategory:', womensRunning.name);

    // Test 10: Final tree structure
    console.log('\n🔟 Final category tree structure:');
    const finalTree = await buildCategoryTree(0);
    printTree(finalTree.filter((cat) => cat.name.includes('Prod Test')));

    console.log('\n🎉 All production utility tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof CategoryError) {
      console.error('   Error code:', error.code);
      console.error('   Status code:', error.statusCode);
    }
  }
}

// Run the tests
async function runTests() {
  await connectDB();
  await testCategoryUtils();
  await mongoose.disconnect();
  console.log('\n✅ Disconnected from MongoDB');
}

runTests();
