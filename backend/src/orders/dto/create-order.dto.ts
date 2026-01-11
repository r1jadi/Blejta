export class CreateOrderDto {
  userId?: number;
  items: any[]; // Array of { productId, name, price, qty }
  name: string;
  address: string;
  phone: string;
  subtotal?: number;
  shippingCost?: number;
  total?: number;
  status?: string;
  paymentStatus?: string;
  paymentIntentId?: string;
}
