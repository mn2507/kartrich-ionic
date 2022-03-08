import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';

import { Product } from './product.model';
import { AuthService } from '../auth/auth.service';

interface ProductData {
  description: string;
  image: string;
  price: number;
  title: string;
  category: string;
  id: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private _products = new BehaviorSubject<Product[]>([]);

  get products() {
    return this._products.asObservable();
  }

  constructor(private authService: AuthService, private http: HttpClient) {}

  fetchProducts() {
    return this.http.get<ProductData>('https://fakestoreapi.com/products').pipe(
      map((resData) => {
        const places = [];
        console.log(resData);
        for (const key in resData) {
          places.push(
            new Product(
              resData[key].id,
              resData[key].title,
              resData[key].category,
              resData[key].description,
              resData[key].image,
              resData[key].price,
            )
          );
        }
        return places;
        // return [];
      }),
      tap((places) => {
        this._products.next(places);
      })
    );
  }

  getProduct(id: string) {
    return this.http
      .get<ProductData>(
        `https://fakestoreapi.com/products/${id}`
      )
      .pipe(
        map((productData) => {
          return new Product(
            id,
            productData.title,
            productData.category,
            productData.description,
            productData.image,
            productData.price
          );
        })
      );
  }

  getProductByCategory(category: string) {
    return this.http
      .get<ProductData>(
        `https://fakestoreapi.com/products/category/${category}`
      )
      .pipe(
        map((productData) => {
          return new Product(
            productData.id,
            productData.title,
            category,
            productData.description,
            productData.image,
            productData.price
          );
        })
      );
  }

  // addPlace(
  //   title: string,
  //   description: string,
  //   price: number,
  //   dateFrom: Date,
  //   dateTo: Date
  // ) {
    // let generatedId: string;
    // const newPlace = new Place(
    //   Math.random().toString(),
    //   title,
    //   description,
    //   'https://lonelyplanetimages.imgix.net/mastheads/GettyImages-538096543_medium.jpg?sharp=10&vib=20&w=1200',
    //   price,
    //   dateFrom,
    //   dateTo,
    //   this.authService.userId
    // );
    // return this.http
    //   .post<{ name: string }>(
    //     'https://ionic-angular-course.firebaseio.com/offered-places.json',
    //     {
    //       ...newPlace,
    //       id: null,
    //     }
    //   )
    //   .pipe(
    //     switchMap((resData) => {
    //       generatedId = resData.name;
    //       return this.places;
    //     }),
    //     take(1),
    //     tap((places) => {
    //       newPlace.id = generatedId;
    //       this._places.next(places.concat(newPlace));
    //     })
    //   );
    // return this.places.pipe(
    //   take(1),
    //   delay(1000),
    //   tap(places => {
    //     this._places.next(places.concat(newPlace));
    //   })
    // );
  // }

  // updatePlace(placeId: string, title: string, description: string) {
    // let updatedPlaces: Place[];
    // return this.places.pipe(
    //   take(1),
    //   switchMap((places) => {
    //     if (!places || places.length <= 0) {
    //       return this.fetchProducts();
    //     } else {
    //       return of(places);
    //     }
    //   }),
    //   switchMap((places) => {
    //     const updatedPlaceIndex = places.findIndex((pl) => pl.id === placeId);
    //     updatedPlaces = [...places];
    //     const oldPlace = updatedPlaces[updatedPlaceIndex];
    //     updatedPlaces[updatedPlaceIndex] = new Place(
    //       oldPlace.id,
    //       title,
    //       description,
    //       oldPlace.imageUrl,
    //       oldPlace.price,
    //       oldPlace.availableFrom,
    //       oldPlace.availableTo,
    //       oldPlace.userId
    //     );
    //     return this.http.put(
    //       `https://ionic-angular-course.firebaseio.com/offered-places/${placeId}.json`,
    //       { ...updatedPlaces[updatedPlaceIndex], id: null }
    //     );
    //   }),
    //   tap(() => {
    //     this._places.next(updatedPlaces);
    //   })
    // );
  // }
}
