import { Component, OnDestroy, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { Subscription } from 'rxjs';
import { CartItem } from '../../interfaces/cart.interface';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: './cart.component.html',
  imports: [RouterLink, CommonModule],
})
export class CartComponent implements OnInit, OnDestroy {
  cart: CartItem[] = [];
  total: number = 0;
  private cartSubscription!: Subscription;

  constructor(
    private cartService: CartService,
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cartSubscription = this.cartService.getCartObservable().subscribe((updatedCart) => {
      this.cart = updatedCart;
      this.total = this.cartService.calculateTotal();
    });
  }

  ngOnDestroy(): void {
    this.cartSubscription.unsubscribe();
  }

  removeFromCart(productId: string): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  confirmOrder(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/order-confirmation']);
    } else {
      this.router.navigate(['/login']); // Redirige al login si no está autenticado
    }
  }
}
