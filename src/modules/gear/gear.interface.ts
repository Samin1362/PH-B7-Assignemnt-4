export type CreateGearInput = {
  name: string;
  description?: string;
  brand?: string;
  pricePerDay: number;
  stock?: number;
  images?: string[];
  isAvailable?: boolean;
  categoryId: string;
};

export type UpdateGearInput = Partial<CreateGearInput>;
