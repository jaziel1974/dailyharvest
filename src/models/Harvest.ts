import mongoose from 'mongoose';
import { MetadataValue } from '@/types/api';
// Import models in the correct order
import './Category';
import './Description';

interface IHarvest {
  description: mongoose.Types.ObjectId;  // Reference to Description
  amount: number;
  unit: string;
  harvestDate: Date;
  status: 'active' | 'inactive' | 'archived';
  metadata?: Record<string, MetadataValue>;
}

const harvestSchema = new mongoose.Schema({
  description: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Description',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    trim: true,
    enum: ['piece', 'kg', 'g', 'lb', 'oz', 'bunch']
  },
  harvestDate: {
    type: Date,
    required: true,
    default: Date.now
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

// Index for faster queries
harvestSchema.index({ harvestDate: -1 });
harvestSchema.index({ status: 1 });

export const Harvest = mongoose.models.Harvest || mongoose.model<IHarvest>('Harvest', harvestSchema);