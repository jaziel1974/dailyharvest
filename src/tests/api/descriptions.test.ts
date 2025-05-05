import { NextRequest } from 'next/server';
import { GET } from '@/app/api/descriptions/route';
import { Category } from '@/models/Category';
import { Description } from '@/models/Description';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import type { IDescription } from '@/utils/descriptions';

describe('Descriptions API', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Use a different approach to set NODE_ENV for testing
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'test' });
    
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Ensure mongoose is disconnected before connecting
    await mongoose.disconnect();
    
    // Set up the test connection
    await mongoose.connect(mongoUri);
    
    // Set up global mongoose for the application code
    global.mongoose = {
      conn: null,
      promise: null,
      testUri: mongoUri
    };
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear all collections before each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe('GET /api/descriptions', () => {
    it('should return all active descriptions when no category is specified', async () => {
      // Create test categories
      const cat1 = await Category.create({ 
        name: 'Category 1', 
        status: 'active' 
      });
      const cat2 = await Category.create({ 
        name: 'Category 2', 
        status: 'active' 
      });

      // Create test descriptions
      await Description.create([
        {
          description: 'Description 1',
          category: cat1._id,
          createdBy: 'test-user',
          status: 'active'
        },
        {
          description: 'Description 2',
          category: cat2._id,
          createdBy: 'test-user',
          status: 'active'
        },
        {
          description: 'Inactive Description',
          category: cat1._id,
          createdBy: 'test-user',
          status: 'inactive'
        }
      ]);

      const request = new NextRequest(new URL('http://localhost/api/descriptions'));
      const response = await GET(request);
      const { data } = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2); // Only active descriptions
      expect(data.map((d: IDescription) => d.description)).toContain('Description 1');
      expect(data.map((d: IDescription) => d.description)).toContain('Description 2');
    });

    it('should filter descriptions by category when categoryId is provided', async () => {
      // Create test category
      const category = await Category.create({ 
        name: 'Test Category', 
        status: 'active' 
      });
      const otherCategory = await Category.create({ 
        name: 'Other Category', 
        status: 'active' 
      });

      // Create test descriptions in different categories
      await Description.create([
        {
          description: 'Description in category',
          category: category._id,
          createdBy: 'test-user',
          status: 'active'
        },
        {
          description: 'Description in other category',
          category: otherCategory._id,
          createdBy: 'test-user',
          status: 'active'
        }
      ]);

      const url = new URL('http://localhost/api/descriptions');
      url.searchParams.set('category', category._id.toString());
      const request = new NextRequest(url);
      const response = await GET(request);
      const { data } = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].description).toBe('Description in category');
      expect(data[0].category._id.toString()).toBe(category._id.toString());
    });

    it('should return 400 if provided categoryId is invalid', async () => {
      const url = new URL('http://localhost/api/descriptions');
      url.searchParams.set('category', 'invalid-id');
      const request = new NextRequest(url);
      const response = await GET(request);

      expect(response.status).toBe(400);
      const { error } = await response.json();
      expect(error).toBe('Invalid category ID');
    });

    it('should return populated category data with descriptions', async () => {
      const category = await Category.create({ 
        name: 'Test Category', 
        status: 'active' 
      });

      await Description.create({
        description: 'Test Description',
        category: category._id,
        createdBy: 'test-user',
        status: 'active'
      });

      const request = new NextRequest(new URL('http://localhost/api/descriptions'));
      const response = await GET(request);
      const { data } = await response.json();

      expect(response.status).toBe(200);
      expect(data[0].category).toBeDefined();
      expect(data[0].category.name).toBe('Test Category');
    });
  });
});