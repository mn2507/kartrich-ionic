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
export class BookingService {
  private _cartProducts = new BehaviorSubject<CartProduct[]>([]);

  // private dbInstance: SQLiteObject;
  // readonly database_name: string = 'cartDb.db';
  // readonly table_name: string = 'cartTable';
  // CartProducts: Array<any>;

  // Handle Update Row Operation
  // updateActive: boolean;
  // to_update_item: any;

  get cartProducts() {
    return this._cartProducts.asObservable();
  }

  constructor(
    // private authService: AuthService,
    private http: HttpClient,
    // private platform: Platform,
    // private sqlite: SQLite
  ) {
    // this.createDB();
  }

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
      switchMap(places => {
        if (!places || places.length <= 0) {
          return this.fetchCart();
        } else {
          return of(places);
        }
      }),
      switchMap(products => {
        const updatedPlaceIndex = products.findIndex(pl => pl.id === productId);
        updatedCartProduct = [...products];
        const oldCartProduct = updatedCartProduct[updatedPlaceIndex];
        updatedCartProduct[updatedPlaceIndex] = new CartProduct(
          oldCartProduct.id,
          oldCartProduct.productId,
          oldCartProduct.title,
          oldCartProduct.price,
          oldCartProduct.image,
          quantity
        );
        return this.http.put(
          `https://kartrich-ionic-default-rtdb.asia-southeast1.firebasedatabase.app/cart/${productId}.json`,
          { ...updatedCartProduct[updatedPlaceIndex], id: null }
        );
      }),
      tap(() => {
        this._cartProducts.next(updatedCartProduct);
      })
    );
  }

  // createDB() {
  //   this.platform.ready().then(() => {
  //     this.sqlite
  //       .create({
  //         name: this.database_name,
  //         location: 'default',
  //       })
  //       .then((sqLite: SQLiteObject) => {
  //         this.dbInstance = sqLite;
  //         sqLite
  //           .executeSql(
  //             `
  //             CREATE TABLE IF NOT EXISTS ${this.table_name} (
  //               product_id INTEGER PRIMARY KEY,
  //               product_title varchar(255),
  //               product_price float
  //               product_image varchar(255)
  //               product_qty int
  //             )`,
  //             []
  //           )
  //           .then((res) => {
  //             // alert(JSON.stringify(res));
  //           })
  //           .catch((error) => alert(JSON.stringify(error)));
  //       })
  //       .catch((error) => alert(JSON.stringify(error)));
  //   });
  // }

  // addToCart(productId, productTitle, productPrice, productImage, productQty) {
  //   console.log('Test123');
  //   if (
  //     !productId ||
  //     !productTitle ||
  //     !productPrice ||
  //     !productImage ||
  //     !productQty
  //   ) {
  //     console.log('Test1234');
  //     alert('Something went wrong when adding to cart. Please try again.');
  //     return;
  //   }
  //   console.log(this.table_name + ' Hello');
  //   return this.dbInstance
  //     .executeSql(
  //       `INSERT INTO ${this.table_name} (product_id, product_title, product_price, product_image product_qty) VALUES ('${productId}', '${productTitle}', '${productPrice}', '${productImage}', '${productQty}')`,
  //       []
  //     )
  //     .then(
  //       () => {
  //         alert('Success');
  //         this.fetchCart();
  //       },
  //       (e) => {
  //         alert(JSON.stringify(e.err));
  //       }
  //     );
  // }

  // fetchCart() {
  //   return this.dbInstance
  //     .executeSql(`SELECT * FROM ${this.table_name}`, [])
  //     .then(
  //       (res) => {
  //         this.CartProducts = [];
  //         if (res.rows.length > 0) {
  //           for (var i = 0; i < res.rows.length; i++) {
  //             this.CartProducts.push(res.rows.item(i));
  //           }
  //           return this.CartProducts;
  //         }
  //       },
  //       (e) => {
  //         alert(JSON.stringify(e));
  //       }
  //     );
  // }

  // updateProductQty(productId, productQty) {
  //   let data = [productQty];
  //   return this.dbInstance.executeSql(
  //     `UPDATE ${this.table_name} SET product_qty = ? WHERE product_id = ${productId}`,
  //     data
  //   );
  // }

  // removeProductFromCart(productId) {
  //   this.dbInstance
  //     .executeSql(
  //       `
  //   DELETE FROM ${this.table_name} WHERE product_id = ${productId}`,
  //       []
  //     )
  //     .then(() => {
  //       alert('Product removed!');
  //       this.fetchCart();
  //     })
  //     .catch((e) => {
  //       alert(JSON.stringify(e));
  //     });
  // }
}
