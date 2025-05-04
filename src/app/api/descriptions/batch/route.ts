import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import { Description } from '@/models/Description';
import { handleError, ValidationError } from '@/middleware/errorHandler';
import mongoose from 'mongoose';
import { descriptionBatchSchema } from '@/utils/validation';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = descriptionBatchSchema.parse(body);
    
    await dbConnect();
    
    const session = await mongoose.startSession();
    session.startTransaction();

    const errors: { id: string; error: string }[] = [];
    const results = [];

    try {
      for (const operation of validatedData.operations) {
        try {
          switch (operation.type) {
            case 'create':
              if (!operation.data) {
                throw new ValidationError('Data is required for create operations');
              }
              const newDesc = new Description({
                ...operation.data,
                category: new mongoose.Types.ObjectId(operation.data.categoryId),
                parentId: operation.data.parentId ? 
                  new mongoose.Types.ObjectId(operation.data.parentId) : undefined
              });
              const created = await newDesc.save({ session });
              const populatedCreate = await Description.findById(created._id)
                .populate('category')
                .populate('children')
                .session(session)
                .lean();
              results.push(populatedCreate);
              break;

            case 'update':
              if (!operation.id || !operation.data) {
                throw new ValidationError('ID and data are required for update operations');
              }
              const updateData = {
                ...operation.data,
                category: operation.data.categoryId ? 
                  new mongoose.Types.ObjectId(operation.data.categoryId) : undefined,
                parentId: operation.data.parentId ? 
                  new mongoose.Types.ObjectId(operation.data.parentId) : undefined
              };
              const updated = await Description.findByIdAndUpdate(
                operation.id,
                { $set: updateData },
                { new: true, session, runValidators: true }
              ).populate('category')
               .populate('children');
              
              if (!updated) {
                throw new ValidationError('Description not found');
              }
              results.push(updated);
              break;

            case 'delete':
              if (!operation.id) {
                throw new ValidationError('ID is required for delete operations');
              }
              const doc = await Description.findById(operation.id).session(session);
              if (!doc) {
                throw new ValidationError('Description not found');
              }
              await doc.softDelete();
              results.push(doc);
              break;
          }
        } catch (error) {
          errors.push({
            id: operation.id || 'unknown',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      if (errors.length === validatedData.operations.length) {
        // If all operations failed, roll back
        await session.abortTransaction();
        throw new Error('All operations failed');
      }

      await session.commitTransaction();
      
      // Revalidate the descriptions page
      revalidatePath('/');
      
      return NextResponse.json({
        success: true,
        data: results,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    return handleError(error);
  }
}