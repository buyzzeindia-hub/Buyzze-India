export type ProductFormData = {
  title: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  model: string;
  condition: string;
  city: string;
  state: string;
  images: string[];
};

export type Product = ProductFormData & {
  id: number;
  owner_id: string;
};
