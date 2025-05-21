import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../product/services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../../auth/services/auth.service';
import { PaymentService } from '../../../product/services/payment.service';

@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class OrderConfirmationComponent implements OnInit {
  cart: any[] = [];
  total: number = 0;
  address: string = '';
  phone: string = '';
  user: any = {};

  constructor(
    private cartService: CartService,
    private paymentService: PaymentService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      // Espera a que el estado del usuario esté listo
      const isAuthenticated = await this.authService.waitForAuthReady();
      if (!isAuthenticated) {
        throw new Error('Usuario no autenticado');
      }

      // Obtiene los datos completos del usuario
      this.user = await this.authService.getCurrentUserFullData();

      // Carga el carrito y calcula el total
      this.cart = this.cartService.getCart();
      this.total = this.cartService.calculateTotal();

      // Recupera los datos temporales almacenados en el servicio
      const tempOrderData = this.orderService.getTempOrderData();
      this.address = tempOrderData.address || '';
      this.phone = tempOrderData.phone || '';
    } catch (error: any) {
      console.error('Error al cargar los datos del usuario:', error.message);
      alert('Debes iniciar sesión para realizar un pedido.');
      this.router.navigate(['/login']); // Redirige al login si no hay usuario
    }
  }

  proceedToPayment(): void {
    if (!this.address.trim() || !this.phone.trim()) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    // Guarda los datos ingresados en el servicio
    this.orderService.setTempOrderData({ address: this.address, phone: this.phone });
    console.log('Datos almacenados temporalmente:', { address: this.address, phone: this.phone });

    const orderId = 'pedido-' + Math.random().toString(36).substr(2, 9); // Genera un ID único
    const amount = this.total; // Total en céntimos

    // Verifica que los datos se hayan guardado correctamente
    const tempOrderData = this.orderService.getTempOrderData();
    console.log('Datos temporales después de setTempOrderData:', tempOrderData);

    this.paymentService.createPayment(amount, orderId).subscribe(
      (response: any) => {
        // Abre el formulario de pago en una nueva pestaña sin recargar la página
        window.open(response.paymentUrl, '_blank');
      },
      (error) => {
        alert('Error al procesar el pago');
      }
    );
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  ngOnDestroy(): void {
    console.log('El componente OrderConfirmationComponent ha sido destruido.');
  }

}
