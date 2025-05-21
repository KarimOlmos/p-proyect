import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartService } from '../../../product/services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-payment-complete',
  templateUrl: './payment-complete.component.html',
  standalone: true,
})
export class PaymentCompleteComponent implements OnInit {
  orderId: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  user: any = {};

  constructor(
    private route: ActivatedRoute,
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const isAuthenticated = await this.authService.waitForAuthReady();
      if (!isAuthenticated) throw new Error('Usuario no autenticado');

      this.user = await this.authService.getCurrentUserFullData();
      this.orderId = this.route.snapshot.queryParamMap.get('orderId') || '';

      // Esperar a que los datos se carguen antes de usarlos
      setTimeout(() => {
        const tempOrderData = this.orderService.getTempOrderData();
        console.log('Datos temporales recuperados en pago:', tempOrderData);
        if (!tempOrderData.address || !tempOrderData.phone) {
          console.warn('Datos temporales no encontrados, asegurarse de que fueron guardados correctamente.');
        }
      }, 100); // Retrasa la recuperación un poco para evitar problemas de asincronía.

      if (this.orderId) {
        this.saveOrder();
      } else {
        this.errorMessage = 'No se pudo obtener el ID del pedido.';
      }
    } catch (error: any) {
      console.error('Error al cargar los datos del usuario:', error.message);
      this.errorMessage = 'Debes iniciar sesión para completar el pedido.';
    }
  }


  async saveOrder(): Promise<void> {
    const cart = this.cartService.getCart();
    const total = this.cartService.calculateTotal();

    const tempOrderData = this.orderService.getTempOrderData(); // Obtiene los datos temporales
    console.log('Datos temporales recuperados:', tempOrderData); // Agrega un log para depurar

    const orderData = {
      orderId: this.orderId,
      userId: this.user.uid, // Usa el ID del usuario autenticado
      userName: this.user.name || 'Usuario desconocido',
      products: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      })),
      total: total,
      address: tempOrderData.address || '', // Recupera la dirección
      phone: tempOrderData.phone || '',     // Recupera el teléfono
    };

    try {
      console.log('Datos enviados a Firebase:', orderData); // Agrega un log para depurar
      await this.orderService.createOrder(orderData);
      this.successMessage = '¡Pedido completado con éxito!';
      this.cartService.clearCart(); // Vacía el carrito
      this.orderService.clearTempOrderData(); // Limpia los datos temporales
    } catch (error: any) {
      console.error('Error al guardar el pedido:', error.message);
      this.errorMessage = 'Ocurrió un error al guardar el pedido.';
    }
  }

  goToHome(): void {
    window.location.href = '/'; // Redirige al usuario a la página principal
  }
}
