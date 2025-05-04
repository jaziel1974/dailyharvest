import mongoose, { Model } from 'mongoose';
import { MetadataValue } from '@/types/api';
// Import Category model to ensure it's registered
import './Category';

// Define operation types
interface BatchOperation {
  type: 'create' | 'update' | 'delete';
  id?: string;
  data?: Partial<IDescription>;
}

interface BatchError {
  id?: string;
  error: string;
}

// Define an interface for the Description document
interface IDescription {
  description: string;
  category: mongoose.Types.ObjectId;
  parentId?: mongoose.Types.ObjectId;
  createdBy: string;
  status: 'active' | 'inactive' | 'archived';
  metadata?: Record<string, MetadataValue>;
  softDelete(): Promise<void>;
  restore(): Promise<void>;
}

interface DescriptionModel extends Model<IDescription> {
  batchUpdate(
    operations: BatchOperation[], 
    session: mongoose.ClientSession
  ): Promise<{ 
    results: IDescription[]; 
    errors: BatchError[]; 
  }>;
}

const descriptionSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
    maxLength: 1000
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true // Add index for better query performance
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Description',
    default: null
  },
  createdBy: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: () => new Map()
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      if (ret.metadata instanceof Map) {
        ret.metadata = Object.fromEntries(ret.metadata);
      }
      return ret;
    }
  }
});

// Virtual for child descriptions
descriptionSchema.virtual('children', {
  ref: 'Description',
  localField: '_id',
  foreignField: 'parentId'
});

// Index for faster queries
descriptionSchema.index({ category: 1, status: 1 });
descriptionSchema.index({ parentId: 1, status: 1 });
descriptionSchema.index({ description: 'text' });

// Methods for soft delete and restore
descriptionSchema.methods.softDelete = async function() {
  this.status = 'inactive';
  await this.save();
};

descriptionSchema.methods.restore = async function() {
  this.status = 'active';
  await this.save();
};

// Middleware to handle cascading soft deletes
descriptionSchema.pre('save', async function(next) {
  if (this.isModified('status') && this.status === 'inactive') {
    await mongoose.model('Description').updateMany(
      { parentId: this._id },
      { status: 'inactive' }
    );
  }
  next();
});

// Update batch operations with proper error handling
descriptionSchema.statics.batchUpdate = async function(
  operations: BatchOperation[], 
  session: mongoose.ClientSession
) {
  const results: IDescription[] = [];
  const errors: BatchError[] = [];

  for (const op of operations) {
    try {
      switch (op.type) {
        case 'create':
          const created = await this.create([op.data as IDescription], { session });
          results.push(created[0]);
          break;
        case 'update':
          const updated = await this.findByIdAndUpdate(op.id, op.data, { 
            new: true, 
            session,
            runValidators: true 
          });
          if (updated) results.push(updated);
          break;
        case 'delete':
          const doc = await this.findById(op.id).session(session);
          if (doc) {
            await doc.softDelete();
            results.push(doc);
          }
          break;
      }
    } catch (error) {
      errors.push({ 
        id: op.id, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  return { results, errors };
};

export const Description = (mongoose.models.Description as unknown as DescriptionModel) || 
  mongoose.model<IDescription, DescriptionModel>('Description', descriptionSchema);