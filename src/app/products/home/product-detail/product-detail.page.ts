import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NavController,
  ModalController,
  ActionSheetController,
  LoadingController,
  AlertController,
} from '@ionic/angular';
import { Subscription } from 'rxjs';

import { ProductsService } from '../../products.service';
import { Product } from '../../product.model';
import { BookingService } from '../../../bookings/booking.service';
import { AuthService } from '../../../auth/auth.service';
import { CartProduct } from 'src/app/bookings/cart-product.model';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
})
export class ProductDetailPage implements OnInit, OnDestroy {
  product: Product;
  isLoading = false;
  form: FormGroup;
  private productSub: Subscription;

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private productsService: ProductsService,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingService,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    // Create form
    this.form = new FormGroup({
      quantity: new FormControl(1, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.min(1)],
      }),
    });

    // Call single product API
    this.route.paramMap.subscribe((paramMap) => {
      if (!paramMap.has('productId')) {
        this.navCtrl.navigateBack('/products/tabs/home');
        return;
      }
      this.isLoading = true;
      this.productSub = this.productsService
        .getProduct(paramMap.get('productId'))
        .subscribe(
          (product) => {
            this.product = product;
            this.isLoading = false;
          },
          (error) => {
            this.alertCtrl
              .create({
                header: 'An error ocurred!',
                message: 'Could not load product.',
                buttons: [
                  {
                    text: 'Okay',
                    handler: () => {
                      this.router.navigate(['/products/tabs/home']);
                    },
                  },
                ],
              })
              .then((alertEl) => alertEl.present());
          }
        );
    });
  }

  onAddToCart() {
    this.loadingCtrl
      .create({ message: 'Adding product to cart...' })
      .then((loadingEl) => {
        loadingEl.present();
        console.log('add to cart');
        this.bookingService.fetchCart().subscribe((cartProducts) => {
          var cartProduct: CartProduct;
          cartProducts.forEach((cartProductRes) => {
            if (cartProductRes.productId === this.product.id) {
              cartProduct = cartProductRes;
            }
          });
          console.log(this.product.id);
          if (cartProduct) {
            this.bookingService
              .updateProductInCart(
                cartProduct.id,
                cartProduct.quantity + +this.form.value.quantity
              )
              .subscribe(() => {
                loadingEl.dismiss();
              });
            return;
          }
          this.bookingService
            .addToCart(
              this.product.id,
              this.product.title,
              this.product.price,
              this.product.image,
              +this.form.value.quantity
            )
            .subscribe(() => {
              loadingEl.dismiss();
            });
        });
      });
  }

  ngOnDestroy() {
    if (this.productSub) {
      this.productSub.unsubscribe();
    }
  }
}
