import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { BookingService } from './booking.service';
import { Booking } from './booking.model';
import { CartProduct } from './cart-product.model';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {
  loadedCartProducts: CartProduct[];
  isLoading = false;
  private cartSubscription: Subscription;

  constructor(
    private bookingService: BookingService,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.cartSubscription = this.bookingService.cartProducts.subscribe(
      (cartProducts) => {
        this.loadedCartProducts = cartProducts;
        console.log(cartProducts);
      }
    );
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.bookingService.fetchCart().subscribe(() => {
      this.isLoading = false;
    });
  }

  onRemoveProdFromCart(cartProductId: string, slidingEl: IonItemSliding) {
    slidingEl.close();
    this.loadingCtrl
      .create({ message: 'Removing product...' })
      .then((loadingEl) => {
        loadingEl.present();
        this.bookingService
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
        this.bookingService
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
        this.bookingService
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
