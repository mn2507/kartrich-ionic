import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { CartProductService } from './cart-product.service';
import { CartProduct } from './cart-product.model';

@Component({
  selector: 'app-cart-products',
  templateUrl: './cart-products.page.html',
  styleUrls: ['./cart-products.page.scss'],
})
export class CartProductsPage implements OnInit, OnDestroy {
  loadedCartProducts: CartProduct[];
  isLoading = false;
  private cartSubscription: Subscription;

  constructor(
    private cartProductService: CartProductService,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.cartSubscription = this.cartProductService.cartProducts.subscribe(
      (cartProducts) => {
        this.loadedCartProducts = cartProducts;
        console.log(cartProducts);
      }
    );
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.cartProductService.fetchCart().subscribe(() => {
      this.isLoading = false;
    });
  }

  onRemoveProdFromCart(cartProductId: string, slidingEl: IonItemSliding) {
    slidingEl.close();
    this.loadingCtrl
      .create({ message: 'Removing product...' })
      .then((loadingEl) => {
        loadingEl.present();
        this.cartProductService
          .removeProductFromCart(cartProductId)
          .subscribe(() => {
            loadingEl.dismiss();
            console.log(cartProductId);
          });
      });
  }

  onReduceQuantity(cartProductId: string, cartProductCurrentQty: number) {
    this.loadingCtrl
      .create({ message: 'Updating quantity...' })
      .then((loadingEl) => {
        loadingEl.present();
        this.cartProductService
          .updateProductInCart(cartProductId, cartProductCurrentQty - 1)
          .subscribe(() => {
            loadingEl.dismiss();
            console.log(cartProductId);
          });
      });
  }

  onIncreaseQuantity(cartProductId: string, cartProductCurrentQty: number) {
    this.loadingCtrl
      .create({ message: 'Updating quantity...' })
      .then((loadingEl) => {
        loadingEl.present();
        this.cartProductService
          .updateProductInCart(cartProductId, cartProductCurrentQty + 1)
          .subscribe(() => {
            loadingEl.dismiss();
            console.log(cartProductId);
          });
      });
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }
}
