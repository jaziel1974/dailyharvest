import dbConnect from './db';
import { Description } from '@/models/Description';
import { Category } from '@/models/Category';
import mongoose from 'mongoose';

export interface IDescription {
  _id?: string;
  description: string;
  category: string;
  parentId?: string;
  createdBy: string;
  status: 'active' | 'inactive';
  metadata?: Record<string, string | number | boolean | null>;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function getDescriptions(): Promise<IDescription[]> {
  await dbConnect();
  return Description.find({ status: 'active' })
    .populate('category')
    .populate('children')
    .lean();
}

export async function getDescriptionsByCategory(categoryId: string): Promise<IDescription[]> {
  await dbConnect();
  return Description.find({ 
    category: new mongoose.Types.ObjectId(categoryId),
    status: 'active'
  })
    .populate('category')
    .populate('children')
    .lean();
}

export async function getChildDescriptions(parentId: string): Promise<IDescription[]> {
  await dbConnect();
  return Description.find({ 
    parentId: new mongoose.Types.ObjectId(parentId),
    status: 'active'
  })
    .populate('category')
    .populate('children')
    .lean();
}

export async function addDescription(
  description: string,
  categoryId: string,
  userId: string,
  parentId?: string
): Promise<IDescription> {
  await dbConnect();

  // Validate category exists
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new Error('Category not found');
  }

  // Check if description already exists in the same category
  const existing = await Description.findOne({
    description: { $regex: new RegExp(`^${description}$`, 'i') },
    category: categoryId
  });

  if (existing) {
    return existing.toObject();
  }

  // Create new description
  const newDescription = new Description({
    description,
    category: categoryId,
    parentId: parentId ? new mongoose.Types.ObjectId(parentId) : undefined,
    createdBy: userId,
    status: 'active'
  });

  await newDescription.save();
  return newDescription.toObject();
}

export async function updateDescription(
  id: string,
  updates: Partial<Omit<IDescription, '_id' | 'createdAt' | 'createdBy'>>
): Promise<IDescription | null> {
  await dbConnect();
  
  const description = await Description.findById(id);
  if (!description) return null;

  Object.assign(description, updates);
  await description.save();

  return description.toObject();
}

export async function deactivateDescription(id: string): Promise<boolean> {
  const result = await updateDescription(id, { status: 'inactive' });
  return result !== null;
}

// Category management functions
export async function getCategories() {
  await dbConnect();
  return Category.find({ status: 'active' }).lean();
}

export async function addCategory(name: string, description?: string) {
  await dbConnect();
  
  const existing = await Category.findOne({ 
    name: { $regex: new RegExp(`^${name}$`, 'i') }
  });
  
  if (existing) {
    return existing.toObject();
  }

  const category = new Category({ name, description });
  await category.save();
  return category.toObject();
}

export async function updateCategory(
  id: string,
  updates: { name?: string; description?: string; status?: 'active' | 'inactive' }
) {
  await dbConnect();
  
  const category = await Category.findByIdAndUpdate(
    id,
    { ...updates, updatedAt: new Date() },
    { new: true }
  );
  
  return category?.toObject() || null;
}