export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface MetadataValue {
  type: 'string' | 'number' | 'boolean' | 'date';
  value: string;
}

export interface CategoryResponse {
  _id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'archived';
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryCreateRequest {
  name: string;
  description?: string;
}

export interface DescriptionResponse {
  _id: string;
  description: string;
  category: {
    _id: string;
    name: string;
    status: 'active' | 'inactive' | 'archived';
    order: number;
    createdAt: string;
    updatedAt: string;
  };
  parentId?: string;
  createdBy: string;
  status: 'active' | 'inactive' | 'archived';
  metadata?: Record<string, MetadataValue>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDescriptionRequest {
  description: string;
  categoryId: string;
  userId: string;
  parentId?: string;
}

export interface UpdateDescriptionRequest {
  description?: string;
  categoryId?: string;
  parentId?: string;
  status?: 'active' | 'inactive' | 'archived';
  metadata?: Record<string, MetadataValue>;
}

export interface HarvestResponse {
  _id: string;
  description: {
    _id: string;
    description: string;
    category: {
      _id: string;
      name: string;
      status: string;
    };
    status: string;
  };
  amount: number;
  unit: string;
  harvestDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface BatchOperationRequest {
  id?: string;
  type: 'create' | 'update' | 'delete';
  data?: Partial<CreateDescriptionRequest> | Partial<UpdateDescriptionRequest>;
}

export interface BatchOperationResponse {
  success: boolean;
  errors?: string[];
  results?: any[];
}