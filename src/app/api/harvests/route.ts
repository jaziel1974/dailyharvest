import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import { Harvest } from '@/models/Harvest';
import { FilterQuery } from 'mongoose';
import { handleError, ValidationError } from '@/middleware/errorHandler';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Validate dates if provided
    if (startDate && isNaN(Date.parse(startDate))) {
      throw new ValidationError('Invalid start date format');
    }
    if (endDate && isNaN(Date.parse(endDate))) {
      throw new ValidationError('Invalid end date format');
    }

    await dbConnect();
    
    const query: FilterQuery<typeof Harvest> = { status: 'active' };
    if (startDate || endDate) {
      query.harvestDate = {};
      if (startDate) query.harvestDate.$gte = new Date(startDate + 'T00:00:00');
      if (endDate) query.harvestDate.$lte = new Date(endDate + 'T23:59:59.999');
    }
    
    const harvests = await Harvest.find(query)
      .populate({
        path: 'description',
        match: { status: 'active' },
        populate: {
          path: 'category',
          match: { status: { $ne: 'deleted' } }
        }
      })
      .sort({ harvestDate: -1 });
    
    // Filter out any harvests where population failed
    const validHarvests = harvests.filter(harvest => harvest.description && harvest.description.category);
    
    return NextResponse.json({ data: validHarvests });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.descriptionId) throw new ValidationError('Description ID is required');
    if (typeof body.amount !== 'number' || body.amount < 0) {
      throw new ValidationError('Amount must be a non-negative number');
    }
    if (!body.unit || !['unidade', 'kg', 'gramas', 'maço'].includes(body.unit)) {
      throw new ValidationError('Invalid unit');
    }
    if (body.harvestDate && isNaN(Date.parse(body.harvestDate))) {
      throw new ValidationError('Invalid harvest date format');
    }

    await dbConnect();
    
    // Create a date object that preserves the local date by setting it to noon UTC
    // This avoids timezone conversion issues that could shift the date by ±1 day
    const harvestDate = body.harvestDate ? new Date(body.harvestDate + 'T12:00:00.000Z') : new Date();
    
    const harvest = await Harvest.create({
      description: body.descriptionId,
      amount: body.amount,
      unit: body.unit,
      harvestDate,
      status: 'active'
    });
    
    const populatedHarvest = await harvest.populate({
      path: 'description',
      populate: {
        path: 'category'
      }
    });
    
    return NextResponse.json({ data: populatedHarvest });
  } catch (error) {
    return handleError(error);
  }
}