export interface Description {
  _id: string;
  description: string;
  category: {
    _id: string;
    name: string;
  };
}

export interface Harvest {
  _id: string;
  description: Description;
  amount: number;
  unit: string;
  harvestDate: string;
}

export interface EditFormData {
  descriptionId?: string;
  amount?: number;
  unit?: string;
  harvestDate?: string;
}

export interface CreateDescriptionInput {
  description: string;
  categoryId: string;
  userId: string;
  parentId?: string;
}