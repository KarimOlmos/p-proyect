import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../interfaces/cart.interface';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cart: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>(this.cart); // Observable para el carrito

  constructor() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
      this.cartSubject.next(this.cart); // Actualiza el BehaviorSubject
    }
  }

  saveCart(): void {
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.cartSubject.next(this.cart); // Notifica a los suscriptores
  }

  getCart(): CartItem[] {
    return this.cart;
  }

  getCartObservable() {
    return this.cartSubject.asObservable(); // Devuelve el Observable del carrito
  }

  calculateTotal(): number {
    return this.cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }

  addToCart(cartItem: CartItem): void {
    const existingItem = this.cart.find((item) => item.product.id === cartItem.product.id);
    if (existingItem) {
      existingItem.quantity += cartItem.quantity; // Suma la cantidad si ya existe
    } else {
      this.cart.push({ ...cartItem }); // Añade el producto con la cantidad especificada
    }
    this.saveCart();
  }

  updateQuantity(productId: string, quantity: number): void {
    const item = this.cart.find((item) => item.product.id === productId);
    if (item) {
      item.quantity = quantity;
      this.saveCart();
    }
  }

  removeFromCart(productId: string): void {
    this.cart = this.cart.filter((item) => item.product.id !== productId);
    this.saveCart();
  }

  clearCart(): void {
    this.cart = [];
    this.saveCart();
  }
}
