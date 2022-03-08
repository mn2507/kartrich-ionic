import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { Product } from './product.model';

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

  constructor(private http: HttpClient) {}

  fetchProducts() {
    return this.http.get<ProductData>('https://fakestoreapi.com/products').pipe(
      map((resData) => {
        const products = [];
        console.log(resData);
        for (const key in resData) {
          products.push(
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
        return products;
      }),
      tap((products) => {
        this._products.next(products);
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

}
