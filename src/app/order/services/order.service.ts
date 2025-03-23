import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Firestore, collection, addDoc, getDocs, where, query } from '@angular/fire/firestore';
import { AuthService } from '../../auth/services/auth-service.service';
import { Order } from '../interfaces/order.interface';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  // Usa un BehaviorSubject para manejar los datos temporales
  private _tempOrderData = new BehaviorSubject<any>(this.loadFromLocalStorage());
  public tempOrderData$ = this._tempOrderData.asObservable();

  constructor(private firestore: Firestore, private authService: AuthService) {}

// Guarda temporalmente los datos del pedido
  setTempOrderData(data: any): void {
    console.log('Almacenando datos temporales:', data);
    const currentData = this._tempOrderData.value;
    const newData = { ...currentData, ...data };
    this._tempOrderData.next(newData);
    this.saveToLocalStorage(newData); // Guarda en sessionStorage
  }

  // Obtiene los datos del pedido almacenados temporalmente
  getTempOrderData(): any {
    const data = this._tempOrderData.value;
    console.log('Recuperando datos temporales:', data);
    return data;
  }

  // Limpia los datos temporales
  clearTempOrderData(): void {
    console.log('Limpiando datos temporales');
    this._tempOrderData.next({});
    this.clearLocalStorage(); // Limpia sessionStorage
  }

  private saveToLocalStorage(data: any): void {
    localStorage.setItem('tempOrderData', JSON.stringify(data));
  }

  // Carga los datos desde localStorage
  private loadFromLocalStorage(): any {
    const data = localStorage.getItem('tempOrderData');
    return data ? JSON.parse(data) : {};
  }

  // Limpia los datos de localStorage
  private clearLocalStorage(): void {
    localStorage.removeItem('tempOrderData');
  }


  // Crea un nuevo pedido en Firebase
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

    const ordersCollection = collection(this.firestore, 'orders');
    const q = query(ordersCollection, where('userId', '==', user.uid));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
  }

}
