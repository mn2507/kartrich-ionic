import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of } from 'rxjs';
import { take, tap, delay, switchMap, map } from 'rxjs/operators';
import { CartProduct } from './cart-product.model';

interface CartProductData {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}
@Injectable({ providedIn: 'root' })
export class CartProductService {
  private _cartProducts = new BehaviorSubject<CartProduct[]>([]);

  get cartProducts() {
    return this._cartProducts.asObservable();
  }

  constructor(private http: HttpClient) {}

  addToCart(
    productId: string,
    productTitle: string,
    productPrice: number,
    productImage: string,
    productQty: number
  ) {
    let generatedId: string;
    const newCartProduct = new CartProduct(
      Math.random().toString(),
      productId,
      productTitle,
      productPrice,
      productImage,
      productQty
    );
    return this.http
      .post<{ name: string }>(
        'https://kartrich-ionic-default-rtdb.asia-southeast1.firebasedatabase.app/cart.json',
        { ...newCartProduct, id: null }
      )
      .pipe(
        switchMap((resData) => {
          generatedId = resData.name;
          return this.cartProducts;
        }),
        take(1),
        tap((cartProducts) => {
          newCartProduct.id = generatedId;
          this._cartProducts.next(cartProducts.concat(newCartProduct));
        })
      );
  }

  removeProductFromCart(cartProductId: string) {
    return this.http
      .delete(
        `https://kartrich-ionic-default-rtdb.asia-southeast1.firebasedatabase.app/cart/${cartProductId}.json`
      )
      .pipe(
        switchMap(() => {
          return this.cartProducts;
        }),
        take(1),
        tap((cartProducts) => {
          this._cartProducts.next(
            cartProducts.filter((cP) => cP.id !== cartProductId)
          );
        })
      );
  }

  fetchCart() {
    return this.http
      .get<{ [key: string]: CartProductData }>(
        'https://kartrich-ionic-default-rtdb.asia-southeast1.firebasedatabase.app/cart.json'
      )
      .pipe(
        map((cartProductData) => {
          const cartProducts = [];
          for (const key in cartProductData) {
            if (cartProductData.hasOwnProperty(key)) {
              cartProducts.push(
                new CartProduct(
                  key,
                  cartProductData[key].productId,
                  cartProductData[key].title,
                  cartProductData[key].price,
                  cartProductData[key].image,
                  cartProductData[key].quantity
                )
              );
            }
          }
          return cartProducts;
        }),
        tap((cartProducts) => {
          this._cartProducts.next(cartProducts);
        })
      );
  }

  updateProductInCart(productId: string, quantity: number) {
    let updatedCartProduct: CartProduct[];
    return this.cartProducts.pipe(
      take(1),
      switchMap((product) => {
        if (!product || product.length <= 0) {
          return this.fetchCart();
        } else {
          return of(product);
        }
      }),
      switchMap((products) => {
        const updatedProductIndex = products.findIndex(
          (pl) => pl.id === productId
        );
        updatedCartProduct = [...products];
        const oldCartProduct = updatedCartProduct[updatedProductIndex];
        updatedCartProduct[updatedProductIndex] = new CartProduct(
          oldCartProduct.id,
          oldCartProduct.productId,
          oldCartProduct.title,
          oldCartProduct.price,
          oldCartProduct.image,
          quantity
        );
        return this.http.put(
          `https://kartrich-ionic-default-rtdb.asia-southeast1.firebasedatabase.app/cart/${productId}.json`,
          { ...updatedCartProduct[updatedProductIndex], id: null }
        );
      }),
      tap(() => {
        this._cartProducts.next(updatedCartProduct);
      })
    );
  }
}
