import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, where, getDocs, DocumentData } from '@angular/fire/firestore';
import { AuthService } from '../../auth/services/auth-service.service';
import { Order } from '../interfaces/order.interface';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private firestore: Firestore, private authService: AuthService) {}

  async createOrder(orderData: Order): Promise<void> {
    const user = this.authService.currentUserValue;
    console.log('Usuario autenticado:', user);

    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      console.log('Intentando guardar el pedido:', orderData);

      const ordersCollection = collection(this.firestore, 'orders');
      const docRef = await addDoc(ordersCollection, orderData);

      console.log('Pedido guardado con éxito. ID del documento:', docRef.id);
    } catch (error) {
      console.error('Error al crear el pedido:', error);
      throw error;
    }
  }

  async getUserOrders(): Promise<Order[]> {
    const user = this.authService.currentUserValue;
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const ordersCollection = collection(this.firestore, 'orders');
      const q = query(ordersCollection, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);

      const orders: Order[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;

        // Validar que los datos coincidan con la interfaz Order
        if (
          typeof data['userId'] === 'string' &&
          typeof data['userName'] === 'string' &&
          Array.isArray(data['products']) &&
          typeof data['total'] === 'number' &&
          typeof data['address'] === 'string' &&
          typeof data['phone'] === 'string'
        ) {
          const orderData: Order = {
            id: doc.id,
            userId: data['userId'],
            userName: data['userName'],
            products: data['products'],
            total: data['total'],
            address: data['address'],
            phone: data['phone'],
          };
          orders.push(orderData);
        } else {
          console.warn('Datos del pedido incompletos:', doc.id, data);
        }
      });

      return orders;
    } catch (error) {
      console.error('Error al obtener los pedidos del usuario:', error);
      throw error;
    }
  }
}
