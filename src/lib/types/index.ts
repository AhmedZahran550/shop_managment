export interface User {
  id: string;
  username: string;
  role: "admin" | "worker";
}

export interface Product {
  id: string;
  name: string;
  sellingPrice: number;
  basePrice: number;
  size?: string;
  imageUrl?: string;
  categoryId?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Activity {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  createdAt: string;
}
