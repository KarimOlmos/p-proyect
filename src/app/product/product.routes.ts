import { Routes } from "@angular/router";
import { ProductListComponent } from "./pages/product-list/product-list.component";
import { ProductCardComponent } from "./components/product-card/product-card.component";

export const productRoute: Routes = [

  {
    path: '',
    component: ProductListComponent,
  },


  {
    path: ':id',
    component: ProductCardComponent,
  },


  {
    path: '**',
    redirectTo: '',
  }
];

export default productRoute;
