export class CartProduct {
  constructor(
    public id: string,
    public productId: string,
    public title: string,
    public price: number,
    public image: string,
    public quantity: number
  ) {}
}
