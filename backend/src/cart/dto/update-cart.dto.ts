export class UpdateCartDto {
  items: Array<{
    productId: number;
    qty: number;
    price: number;
  }>;
}
