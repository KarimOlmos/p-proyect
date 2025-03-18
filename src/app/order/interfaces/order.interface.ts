export interface Order {
  id?: string; // Hacemos el ID opcional
  userId: string;
  userName: string;
  products: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  address: string;
  phone: string;
}
