import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private apiUrl = 'http://localhost:3000/create-payment'; // URL del backend

  constructor(private http: HttpClient) {}

  createPayment(amount: number, orderId: string): Observable<any> {
    const body = { amount: amount * 100, orderId }; // Multiplica por 100
    return this.http.post(this.apiUrl, body);
  }

}
