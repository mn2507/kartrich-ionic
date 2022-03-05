import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProductsPage } from './products.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: ProductsPage,
    children: [
      {
        path: 'home',
        children: [
          {
            path: '',
            loadChildren: './home/home.module#HomePageModule',
          },
          {
            path: ':productId',
            loadChildren:
              './home/product-detail/product-detail.module#ProductDetailPageModule',
          },
        ],
      },
      {
        path: 'bookings',
        loadChildren: './../bookings/bookings.module#BookingsPageModule',
      },
      {
        path: '',
        redirectTo: '/products/tabs/home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/products/tabs/home',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductsRoutingModule {}
