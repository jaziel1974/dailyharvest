import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import { Category } from '@/models/Category';
import { categorySchema } from '@/utils/validation';
import { handleError } from '@/middleware/errorHandler';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 30; // Revalidate every 30 seconds

export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({ status: 'active' }).lean();
    
    const response = NextResponse.json({ 
      data: categories, 
      success: true 
    });
    
    // Add cache control headers
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=59');
    
    return response;
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = categorySchema.parse(body);
    
    await dbConnect();
    
    // Check for existing category
    const existing = await Category.findOne({ 
      name: { $regex: new RegExp(`^${validatedData.name}$`, 'i') }
    });
    
    if (existing) {
      return NextResponse.json({
        data: existing,
        success: true
      });
    }

    const category = new Category(validatedData);
    await category.save();
    
    // Revalidate the categories list
    revalidatePath('/');
    
    return NextResponse.json({
      data: category,
      success: true
    }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}