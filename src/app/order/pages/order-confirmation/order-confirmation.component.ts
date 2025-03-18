import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../product/services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../../auth/services/auth-service.service';
import { Order } from '../../interfaces/order.interface';

@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.component.html',
  standalone: true,
  imports: [FormsModule],
})
export class OrderConfirmationComponent implements OnInit {
  cart: any[] = [];
  total: number = 0;
  address: string = '';
  phone: string = '';
  user: any = {};

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.cart = this.cartService.getCart();
    this.total = this.cartService.calculateTotal();

    try {
      // Cargar los datos completos del usuario
      this.user = await this.authService.getCurrentUserFullData();
      console.log('Datos del usuario cargados:', this.user);
    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
      alert('Debes iniciar sesión para realizar un pedido.');
      this.router.navigate(['/login']); // Redirige al login si no hay usuario
    }
  }

  async confirmOrder(): Promise<void> {
    if (!this.address.trim() || !this.phone.trim()) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    const orderData: Order = {
      userId: this.user.uid,
      userName: this.user.name || 'Usuario desconocido',
      products: this.cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name || 'Producto sin nombre',
        quantity: item.quantity,
        price: item.product.price,
      })),
      total: this.total,
      address: this.address,
      phone: this.phone,
    };

    console.log('UID del usuario autenticado:', this.user.uid);
    console.log('UID en orderData:', orderData.userId);
    console.log('Datos del pedido:', orderData);


    try {
      await this.orderService.createOrder(orderData);
      alert('Pedido realizado con éxito.');
      this.router.navigate(['/']);
    } catch (error: any) {
      console.error('Error al confirmar el pedido:', error);

      // Verificar si el error indica que el usuario no está autenticado
      if (error.message === 'Usuario no autenticado') {
        alert('Debes iniciar sesión para realizar un pedido.');
        this.router.navigate(['/login']);
      } else {
        alert('Ocurrió un error al realizar el pedido. Inténtalo de nuevo.');
      }
    }
    this.clearCart();
  }

  clearCart(): void {
    this.cartService.clearCart();
  }
}
