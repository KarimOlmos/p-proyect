import { Component, OnDestroy, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { Subscription } from 'rxjs';
import { CartItem } from '../../interfaces/cart.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: './cart.component.html',
  imports: [RouterLink],
})
export class CartComponent implements OnInit, OnDestroy {
  cart: CartItem[] = [];
  total: number = 0;
  private cartSubscription!: Subscription;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    // Suscribirse al Observable del carrito
    this.cartSubscription = this.cartService.getCartObservable().subscribe((updatedCart) => {
      this.cart = updatedCart; // Actualiza el carrito
      this.total = this.cartService.calculateTotal(); // Recalcula el total
    });
  }

  ngOnDestroy(): void {
    // Desuscribirse para evitar fugas de memoria
    this.cartSubscription.unsubscribe();
  }

  removeFromCart(productId: string): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }
}
