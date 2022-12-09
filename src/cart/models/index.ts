export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
};

export type UpdateCartItem = {
  product: Omit<Product, 'title' | 'description' | 'price'>;
  count: number;
};

export type CartItem = {
  product: Product;
  count: number;
};

export type Cart = {
  id: string;
  items: CartItem[];
};
