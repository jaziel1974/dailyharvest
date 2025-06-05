import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import { Description } from '@/models/Description';
import { descriptionUpdateSchema } from '@/utils/validation';
import { handleError, ValidationError } from '@/middleware/errorHandler';
import mongoose from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      throw new ValidationError('Invalid description ID');
    }

    await dbConnect();
    
    const description = await Description.findById(id)
      .populate('category')
      .populate('children')
      .lean();
      
    if (!description) {
      throw new ValidationError('Description not found');
    }
    
    return NextResponse.json({ data: description, success: true });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      throw new ValidationError('Invalid description ID');
    }

    const updates = await request.json();
    const validatedUpdates = descriptionUpdateSchema.parse(updates);

    await dbConnect();
    
    const description = await Description.findById(id);
    if (!description) {
      throw new ValidationError('Description not found');
    }

    Object.assign(description, validatedUpdates);
    await description.save();

    const updatedDescription = await Description.findById(id)
      .populate('category')
      .populate('children')
      .lean();
    
    return NextResponse.json({ data: updatedDescription, success: true });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      throw new ValidationError('Invalid description ID');
    }

    await dbConnect();
    
    const description = await Description.findById(id);
    if (!description) {
      throw new ValidationError('Description not found');
    }

    // Soft delete by updating status
    description.status = 'inactive';
    await description.save();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}