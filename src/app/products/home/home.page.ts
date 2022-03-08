import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';

import { ProductsService } from '../products.service';
import { Product } from '../product.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  loadedProducts: Product[];
  isLoading = false;
  selectedCategoryProducts: Product[];
  private productsSub: Subscription;

  constructor(
    private productsService: ProductsService,
    private menuCtrl: MenuController
  ) {}

  ngOnInit() {
    // API call to fetch products
    this.productsSub = this.productsService.products.subscribe((products) => {
      this.loadedProducts = products;
      this.selectedCategoryProducts = products;
    });
    this.isLoading = true;
    this.productsService.fetchProducts().subscribe(() => {
      this.isLoading = false;
    });
  }

  onOpenMenu() {
    this.menuCtrl.toggle();
  }

  onSelectCategory(event: CustomEvent<SegmentChangeEventDetail>) {
    console.log('help' + event.detail.value);
    switch (event.detail.value) {
      case 'all':
        this.selectedCategoryProducts = this.loadedProducts;
        console.log('all');
        break;
      case 'electronics':
        this.selectedCategoryProducts = this.loadedProducts.filter(
          (product) => product.category == 'electronics'
        );
        console.log(this.selectedCategoryProducts);
        break;
      case 'jewelery':
        this.selectedCategoryProducts = this.loadedProducts.filter(
          (product) => product.category == 'jewelery'
        );
        console.log(this.selectedCategoryProducts);
        break;
      case 'menClothing':
        this.selectedCategoryProducts = this.loadedProducts.filter(
          (product) => product.category == "men's clothing"
        );
        console.log(this.selectedCategoryProducts);
        break;
      case 'womenClothing':
        this.selectedCategoryProducts = this.loadedProducts.filter(
          (product) => product.category == "women's clothing"
        );
        console.log(this.selectedCategoryProducts);
        break;
    }
  }

  ngOnDestroy() {
    if (this.productsSub) {
      this.productsSub.unsubscribe();
    }
  }
}
