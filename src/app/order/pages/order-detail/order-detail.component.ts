import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../../auth/services/auth-service.service';
import { Router } from '@angular/router';
import { Order } from '../../interfaces/order.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-detail.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class OrderDetailsComponent implements OnInit {
  // Define la lista de pedidos y el estado de carga
  orders: Order[] = [];
  loading: boolean = true;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      // Espera a que Firebase Authentication termine de inicializarse
      const isAuthenticated = await this.authService.waitForAuthReady();

      if (!isAuthenticated) {
        alert('Debes iniciar sesión para ver tus pedidos.');
        this.router.navigate(['/login']);
        return;
      }

      // Carga los pedidos solo si el usuario está autenticado
      await this.loadOrders();
    } catch (error) {
      console.error('Error al verificar el estado de autenticación:', error);
      alert('Ocurrió un error al verificar tu estado de autenticación.');
      this.router.navigate(['/login']);
    }
  }

  private async loadOrders(): Promise<void> {
    try {
      this.loading = true;

      // Obtiene los pedidos del usuario autenticado
      this.orders = await this.orderService.getUserOrders();
    } catch (error) {
      console.error('Error al cargar los pedidos:', error);

      if (error instanceof Error && error.message === 'Usuario no autenticado') {
        alert('Debes iniciar sesión para ver tus pedidos.');
      } else {
        alert('Ocurrió un error al cargar los pedidos. Inténtalo más tarde.');
      }
    } finally {
      this.loading = false;
    }
  }
  trackById(index: number, order: Order): string {
    return order.id ?? `temp-${index}`; // Si `id` es undefined, usa un valor temporal único
  }

}
