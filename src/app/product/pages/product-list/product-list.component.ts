import { Component } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { ProductCardComponent } from "../../components/product-card/product-card.component";
import { CartComponent } from '../../components/cart/cart.component';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  standalone: true,
  imports: [CartComponent, ProductCardComponent],
})
export class ProductListComponent {
  constructor(public productService: ProductService) {}
}
