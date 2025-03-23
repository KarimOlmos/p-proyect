import { Routes } from '@angular/router';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { Error404PageComponent } from './pages/error404-page/error404-page.component';
import { ContactPageComponent } from './pages/contact-page/contact-page.component';

import { LoginPageComponent } from './auth/login-page/login-page.component';
import { RegisterPageComponent } from './auth/register-page/register-page.component';
import { AboutUsPageComponent } from './pages/about-us-page/about-us-page.component';
import { ProfilePageComponent } from './auth/profile-page/profile-page.component';
import { OrderConfirmationComponent } from './order/pages/order-confirmation/order-confirmation.component';
import { OrderDetailsComponent } from './order/pages/order-detail/order-detail.component';
import { PaymentCompleteComponent } from './order/pages/payment-complete/payment-complete.component';

export const routes: Routes = [

  { path: '', component: MainPageComponent }, //PAGINA MAIN

  {
     path:'products',
     loadChildren: () => import('./product/product.routes'),
  },

  { path: 'about-us', component: AboutUsPageComponent},

  { path: 'login', component: LoginPageComponent},

  { path: 'register', component: RegisterPageComponent},

  { path: 'contact', component: ContactPageComponent},

  { path: 'profile', component: ProfilePageComponent },

  { path: 'order-confirmation', component: OrderConfirmationComponent},

  { path: 'order-detail', component: OrderDetailsComponent},

  { path: 'payment-complete', component: PaymentCompleteComponent},

  { path: '**', component: Error404PageComponent },




];
