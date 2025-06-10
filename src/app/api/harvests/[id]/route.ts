import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import { Harvest } from '@/models/Harvest';
import { handleError, ValidationError } from '@/middleware/errorHandler';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const body = await request.json();
    const { id } = await params;

    if (!id) throw new ValidationError('Harvest ID is required');
    if (body.amount !== undefined && (typeof body.amount !== 'number' || body.amount < 0)) {
      throw new ValidationError('Amount must be a non-negative number');
    }
    if (body.unit && !['unidade', 'kg', 'gramas', 'maço'].includes(body.unit)) {
      throw new ValidationError('Invalid unit');
    }
    if (body.harvestDate && isNaN(Date.parse(body.harvestDate))) {
      throw new ValidationError('Invalid harvest date format');
    }
    
    await dbConnect();
    
    // Process harvestDate to avoid timezone issues
    const updateData: any = {};
    if (body.descriptionId) updateData.description = body.descriptionId;
    if (body.amount !== undefined) updateData.amount = body.amount;
    if (body.unit) updateData.unit = body.unit;
    if (body.harvestDate) {
      // Set to noon UTC to avoid timezone conversion issues
      updateData.harvestDate = new Date(body.harvestDate + 'T12:00:00.000Z');
    }
    
    const harvest = await Harvest.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate({
      path: 'description',
      populate: {
        path: 'category'
      }
    });
    
    if (!harvest) {
      throw new ValidationError('Harvest not found');
    }
    
    return NextResponse.json({ data: harvest });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    
    if (!id) {
      throw new ValidationError('Missing harvest ID');
    }
    
    await dbConnect();
    
    const harvest = await Harvest.findByIdAndDelete(id);
    
    if (!harvest) {
      throw new ValidationError('Harvest not found');
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}