import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100,
    unique: true
  },
  description: {
    type: String,
    trim: true,
    maxLength: 500
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  order: {
    type: Number,
    default: 0
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

// Virtual for descriptions in this category
categorySchema.virtual('descriptions', {
  ref: 'Description',
  localField: '_id',
  foreignField: 'category'
});

// Index for faster queries
categorySchema.index({ status: 1 });
categorySchema.index({ name: 'text' });

// Methods for soft delete and restore
categorySchema.methods.softDelete = async function() {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    this.status = 'inactive';
    await this.save({ session });

    // Soft delete all descriptions in this category
    await mongoose.model('Description').updateMany(
      { category: this._id },
      { status: 'inactive' },
      { session }
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

categorySchema.methods.restore = async function() {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    this.status = 'active';
    await this.save({ session });

    // Restore all descriptions in this category
    await mongoose.model('Description').updateMany(
      { category: this._id },
      { status: 'active' },
      { session }
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Static method to reorder categories
categorySchema.statics.reorder = async function(orderedIds: string[]) {
  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { order: index } }
    }
  }));

  return this.bulkWrite(bulkOps);
};

export const Category = mongoose.models.Category || 
  mongoose.model('Category', categorySchema);