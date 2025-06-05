import { 
  DescriptionResponse, 
  CategoryResponse, 
  CreateDescriptionRequest,
  UpdateDescriptionRequest,
  HarvestResponse
} from '@/types/api';

const BASE_URL = '/api';

export async function fetchCategories(): Promise<CategoryResponse[]> {
  const response = await fetch(`${BASE_URL}/categories`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  const { data } = await response.json();
  return data;
}

export async function createCategory(name: string, description?: string): Promise<CategoryResponse> {
  const response = await fetch(`${BASE_URL}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, description }),
  });

  if (!response.ok) {
    throw new Error('Failed to create category');
  }

  const { data } = await response.json();
  return data;
}

export async function fetchDescriptions(params?: { categoryId?: string; parentId?: string }): Promise<DescriptionResponse[]> {
  const searchParams = new URLSearchParams();
  if (params?.categoryId) searchParams.append('category', params.categoryId); // Changed from categoryId to category
  if (params?.parentId) searchParams.append('parent', params.parentId); // Changed from parentId to parent for consistency

  const url = `${BASE_URL}/descriptions${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch descriptions');
  }

  const data = await response.json();
  return data.data;
}

export async function createDescription(data: CreateDescriptionRequest): Promise<DescriptionResponse> {
  const response = await fetch(`${BASE_URL}/descriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create description');
  }

  const result = await response.json();
  return result.data;
}

export async function updateDescription(
  id: string,
  updates: UpdateDescriptionRequest
): Promise<DescriptionResponse> {
  const response = await fetch(`${BASE_URL}/descriptions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update description');
  }

  const result = await response.json();
  return result.data;
}

export async function deleteDescription(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/descriptions/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete description');
  }
}

export async function fetchHarvests(startDate?: string, endDate?: string): Promise<HarvestResponse[]> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await fetch(`${BASE_URL}/harvests${params.toString() ? `?${params.toString()}` : ''}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch harvests');
  }

  const data = await response.json();
  return data.data;
}

export async function createHarvest(data: {
  descriptionId: string;
  amount: number;
  unit: string;
  harvestDate: string;
}): Promise<HarvestResponse> {
  const response = await fetch(`${BASE_URL}/harvests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create harvest');
  }

  const result = await response.json();
  return result.data;
}

export async function updateHarvest(data: {
  id: string;
  descriptionId?: string;
  amount?: number;
  unit?: string;
  harvestDate?: string;
}): Promise<HarvestResponse> {
  const response = await fetch(`${BASE_URL}/harvests/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update harvest');
  }

  const result = await response.json();
  return result.data;
}

export async function deleteHarvest(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/harvests/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete harvest');
  }
}