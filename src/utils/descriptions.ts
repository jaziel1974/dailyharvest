import dbConnect from './db';
import { Description } from '@/models/Description';
import { Category } from '@/models/Category';
import { MetadataValue } from '@/types/api';
import mongoose from 'mongoose';

export interface IDescription {
  _id?: string;
  description: string;
  category: string;
  parentId?: string;
  createdBy: string;
  status: 'active' | 'inactive' | 'archived';
  metadata?: Record<string, MetadataValue>;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function getDescriptions(): Promise<IDescription[]> {
  await dbConnect();
  const descriptions = await Description.find({ status: 'active' })
    .populate('category')
    .populate('children')
    .lean();
  
  return descriptions.map((desc: any) => ({
    _id: desc._id.toString(),
    description: desc.description,
    category: desc.category._id.toString(),
    parentId: desc.parentId?.toString(),
    createdBy: desc.createdBy,
    status: desc.status,
    metadata: desc.metadata,
    createdAt: desc.createdAt,
    updatedAt: desc.updatedAt,
  }));
}

export async function getDescriptionsByCategory(categoryId: string): Promise<IDescription[]> {
  await dbConnect();
  const descriptions = await Description.find({ 
    category: new mongoose.Types.ObjectId(categoryId),
    status: 'active'
  })
    .populate('category')
    .populate('children')
    .lean();
  
  return descriptions.map((desc: any) => ({
    _id: desc._id.toString(),
    description: desc.description,
    category: desc.category._id.toString(),
    parentId: desc.parentId?.toString(),
    createdBy: desc.createdBy,
    status: desc.status,
    metadata: desc.metadata,
    createdAt: desc.createdAt,
    updatedAt: desc.updatedAt,
  }));
}

export async function getChildDescriptions(parentId: string): Promise<IDescription[]> {
  await dbConnect();
  const descriptions = await Description.find({ 
    parentId: new mongoose.Types.ObjectId(parentId),
    status: 'active'
  })
    .populate('category')
    .populate('children')
    .lean();
  
  return descriptions.map((desc: any) => ({
    _id: desc._id.toString(),
    description: desc.description,
    category: desc.category._id.toString(),
    parentId: desc.parentId?.toString(),
    createdBy: desc.createdBy,
    status: desc.status,
    metadata: desc.metadata,
    createdAt: desc.createdAt,
    updatedAt: desc.updatedAt,
  }));
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
    const existingObj = existing.toObject() as any;
    return {
      _id: existingObj._id.toString(),
      description: existingObj.description,
      category: existingObj.category.toString(),
      parentId: existingObj.parentId?.toString(),
      createdBy: existingObj.createdBy,
      status: existingObj.status,
      metadata: existingObj.metadata,
      createdAt: existingObj.createdAt,
      updatedAt: existingObj.updatedAt,
    };
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
  const savedObj = newDescription.toObject() as any;
  return {
    _id: savedObj._id.toString(),
    description: savedObj.description,
    category: savedObj.category.toString(),
    parentId: savedObj.parentId?.toString(),
    createdBy: savedObj.createdBy,
    status: savedObj.status,
    metadata: savedObj.metadata,
    createdAt: savedObj.createdAt,
    updatedAt: savedObj.updatedAt,
  };
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

  const savedObj = description.toObject() as any;
  return {
    _id: savedObj._id.toString(),
    description: savedObj.description,
    category: savedObj.category.toString(),
    parentId: savedObj.parentId?.toString(),
    createdBy: savedObj.createdBy,
    status: savedObj.status,
    metadata: savedObj.metadata,
    createdAt: savedObj.createdAt,
    updatedAt: savedObj.updatedAt,
  };
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