// components/product-card/product-card.component.ts
import { Component, Input } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { Product } from '../../interfaces/product.interface';
import { CartItem } from '../../interfaces/cart.interface'; // Importa CartItem
import { CommonModule } from '@angular/common';

@Component({
  selector: 'product-card',
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  standalone: true,
})
export class ProductCardComponent {
  @Input() product!: Product;
  quantity: number = 1;

  constructor(private cartService: CartService) {}

  increaseQuantity(): void {
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    const cartItem: CartItem = {
      product: this.product, // El producto seleccionado
      quantity: this.quantity, // La cantidad seleccionada
    };
    this.cartService.addToCart(cartItem); // Pasa el objeto CartItem al servicio
    this.quantity = 1; // Restablece la cantidad después de agregar
  }
}
