import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { take, tap, delay, switchMap, map } from 'rxjs/operators';

import { Booking } from './booking.model';
import { AuthService } from '../auth/auth.service';
import { Storage } from '@ionic/storage';
import { Product } from '../products/product.model';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { CartProduct } from './cart-product.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private _bookings = new BehaviorSubject<Booking[]>([]);
  private _cartProducts = new BehaviorSubject([]);

  private dbInstance: SQLiteObject;
  readonly database_name: string = 'cartDb.db';
  readonly table_name: string = 'cartTable';
  CartProducts: Array<any>;

  // Handle Update Row Operation
  updateActive: boolean;
  to_update_item: any;

  get bookings() {
    return this._bookings.asObservable();
  }

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private platform: Platform,
    private sqlite: SQLite
  ) {
    this.createDB();
  }

  createDB() {
    this.platform.ready().then(() => {
      this.sqlite
        .create({
          name: this.database_name,
          location: 'default',
        })
        .then((sqLite: SQLiteObject) => {
          this.dbInstance = sqLite;
          sqLite
            .executeSql(
              `
              CREATE TABLE IF NOT EXISTS ${this.table_name} (
                product_id INTEGER PRIMARY KEY,
                product_title varchar(255),
                product_price float
                product_image varchar(255)
                product_qty int
              )`,
              []
            )
            .then((res) => {
              // alert(JSON.stringify(res));
            })
            .catch((error) => alert(JSON.stringify(error)));
        })
        .catch((error) => alert(JSON.stringify(error)));
    });
  }

  addToCart(productId, productTitle, productPrice, productImage, productQty) {
    if (
      !productId.length ||
      !productTitle.length ||
      !productPrice.length ||
      !productImage.length ||
      !productQty.length
    ) {
      alert('Something went wrong when adding to cart. Please try again.');
      return;
    }
    return this.dbInstance
      .executeSql(
        `INSERT INTO ${this.table_name} (product_id, product_title, product_price, product_image product_qty) VALUES ('${productId}', '${productTitle}', '${productPrice}', '${productImage}', '${productQty}')`,
        []
      )
      .then(
        () => {
          alert('Success');
          this.fetchCart();
        },
        (e) => {
          alert(JSON.stringify(e.err));
        }
      );
  }

  fetchCart() {
    return this.dbInstance
      .executeSql(`SELECT * FROM ${this.table_name}`, [])
      .then(
        (res) => {
          this.CartProducts = [];
          if (res.rows.length > 0) {
            for (var i = 0; i < res.rows.length; i++) {
              this.CartProducts.push(res.rows.item(i));
            }
            return this.CartProducts;
          }
        },
        // (res) => {
        //   this.CartProducts = [];
        //   for (const key in res) {
        //     if (res.hasOwnProperty(key)) {
        //       if (res.rows.length > 0) {
        //         this.CartProducts.push(

        //         )
        //       }
        //     }
        //   }
        // },
        (e) => {
          alert(JSON.stringify(e));
        }
      );
  }

  updateProductQty(productId, productQty) {
    let data = [productQty];
    return this.dbInstance.executeSql(
      `UPDATE ${this.table_name} SET product_qty = ? WHERE product_id = ${productId}`,
      data
    );
  }

  removeProductFromCart(productId) {
    this.dbInstance
      .executeSql(
        `
    DELETE FROM ${this.table_name} WHERE product_id = ${productId}`,
        []
      )
      .then(() => {
        alert('Product removed!');
        this.fetchCart();
      })
      .catch((e) => {
        alert(JSON.stringify(e));
      });
  }

  addBooking(
    placeId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let generatedId: string;
    const newBooking = new Booking(
      Math.random().toString(),
      placeId,
      this.authService.userId,
      placeTitle,
      placeImage,
      firstName,
      lastName,
      guestNumber,
      dateFrom,
      dateTo
    );
    return this.http
      .post<{ name: string }>(
        'https://ionic-angular-course.firebaseio.com/bookings.json',
        { ...newBooking, id: null }
      )
      .pipe(
        switchMap((resData) => {
          generatedId = resData.name;
          return this.bookings;
        }),
        take(1),
        tap((bookings) => {
          newBooking.id = generatedId;
          this._bookings.next(bookings.concat(newBooking));
        })
      );
  }

  cancelBooking(bookingId: string) {
    // return this.http
    //   .delete(
    //     `https://ionic-angular-course.firebaseio.com/bookings/${bookingId}.json`
    //   )
    //   .pipe(
    //     switchMap(() => {
    //       return this.bookings;
    //     }),
    //     take(1),
    //     tap(bookings => {
    //       this._bookings.next(bookings.filter(b => b.id !== bookingId));
    //     })
    //   );
  }

  fetchBookings() {
    // return this.http
    //   .get<{ [key: string]: BookingData }>(
    //     `https://ionic-angular-course.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${
    //       this.authService.userId
    //     }"`
    //   )
    //   .pipe(
    //     map(bookingData => {
    //       const bookings = [];
    //       for (const key in bookingData) {
    //         if (bookingData.hasOwnProperty(key)) {
    //           bookings.push(
    //             new Booking(
    //               key,
    //               bookingData[key].placeId,
    //               bookingData[key].userId,
    //               bookingData[key].placeTitle,
    //               bookingData[key].placeImage,
    //               bookingData[key].firstName,
    //               bookingData[key].lastName,
    //               bookingData[key].guestNumber,
    //               new Date(bookingData[key].bookedFrom),
    //               new Date(bookingData[key].bookedTo)
    //             )
    //           );
    //         }
    //       }
    //       return bookings;
    //     }),
    //     tap(bookings => {
    //       this._bookings.next(bookings);
    //     })
    //   );
  }
}
