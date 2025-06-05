import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import { Description } from '@/models/Description';
import { Category } from '@/models/Category';
import { descriptionSchema } from '@/utils/validation';
import { handleError, ValidationError } from '@/middleware/errorHandler';
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 30; // Revalidate every 30 seconds

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category');
    const parentId = searchParams.get('parent');
    
    await dbConnect();
    
    const query: any = { status: 'active' };
    
    if (categoryId) {
      if (!mongoose.isValidObjectId(categoryId)) {
        throw new ValidationError('Invalid category ID');
      }
      query.category = new mongoose.Types.ObjectId(categoryId);
    }
    
    if (parentId) {
      if (!mongoose.isValidObjectId(parentId)) {
        throw new ValidationError('Invalid parent ID');
      }
      query.parentId = new mongoose.Types.ObjectId(parentId);
    }
    
    const descriptions = await Description.find(query)
      .populate({
        path: 'category',
        match: { status: 'active' }
      })
      .populate('children')
      .lean();

    // Filter out descriptions where category population failed (inactive categories)
    const filteredDescriptions = descriptions.filter(desc => desc.category);
      
    return NextResponse.json({ 
      data: filteredDescriptions, 
      success: true 
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = descriptionSchema.parse(body);
    
    if (!mongoose.isValidObjectId(validatedData.categoryId)) {
      throw new ValidationError('Invalid category ID');
    }

    await dbConnect();
    
    // Validate category exists
    const category = await Category.findById(validatedData.categoryId);
    if (!category) {
      throw new ValidationError('Category not found');
    }

    // Check for existing description in the same category
    const existing = await Description.findOne({
      description: { $regex: new RegExp(`^${validatedData.description}$`, 'i') },
      category: validatedData.categoryId
    });
    
    if (existing) {
      return NextResponse.json({
        data: existing,
        success: true
      });
    }

    // Create new description
    const newDescription = new Description({
      description: validatedData.description,
      category: new mongoose.Types.ObjectId(validatedData.categoryId),
      parentId: validatedData.parentId ? 
        new mongoose.Types.ObjectId(validatedData.parentId) : undefined,
      createdBy: validatedData.userId,
      status: 'active',
      metadata: validatedData.metadata
    });

    await newDescription.save();
    
    const populatedDescription = await Description.findById(newDescription._id)
      .populate('category')
      .populate('children')
      .lean();

    // Revalidate the descriptions page
    revalidatePath('/');
    
    return NextResponse.json({
      data: populatedDescription,
      success: true
    }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, updates } = await request.json();
    
    if (!id || !updates) {
      throw new ValidationError('ID and updates are required');
    }

    if (!mongoose.isValidObjectId(id)) {
      throw new ValidationError('Invalid description ID');
    }

    await dbConnect();
    
    const description = await Description.findById(id);
    if (!description) {
      throw new ValidationError('Description not found');
    }

    Object.assign(description, updates);
    await description.save();

    const updatedDescription = await Description.findById(id)
      .populate('category')
      .populate('children')
      .lean();
    
    return NextResponse.json({
      data: updatedDescription,
      success: true
    });
  } catch (error) {
    return handleError(error);
  }
}