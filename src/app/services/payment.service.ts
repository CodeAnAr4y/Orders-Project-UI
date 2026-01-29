import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  Payment,
  CreatePaymentRequest,
  PaymentSearchParams,
  PaymentStatus,
  PageResponse,
} from '../types/payment.types';

interface PageRequest {
  page?: number;
  size?: number;
  sort?: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiGatewayUrl}/api/v1/payments`;

  readonly payments = signal<Payment[]>([]);
  readonly currentPayment = signal<Payment | null>(null);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  getAll(params?: PageRequest): Observable<PageResponse<Payment>> {
    let httpParams = new HttpParams();
    if (params?.page !== undefined) httpParams = httpParams.set('page', params.page);
    if (params?.size !== undefined) httpParams = httpParams.set('size', params.size);
    if (params?.sort) httpParams = httpParams.set('sort', params.sort);

    return this.http.get<PageResponse<Payment>>(this.apiUrl, { params: httpParams }).pipe(
      tap(res => {
        this.payments.set(res.content);
        this.totalPages.set(res.totalPages);
        this.totalElements.set(res.totalElements);
      })
    );
  }

  getById(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/${id}`).pipe(
      tap(payment => this.currentPayment.set(payment))
    );
  }

  getByUserId(userId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/user/${userId}`).pipe(
      tap(payments => this.payments.set(payments))
    );
  }

  getByOrderId(orderId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/order/${orderId}`).pipe(
      tap(payments => this.payments.set(payments))
    );
  }

  getByStatus(status: PaymentStatus): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/status/${status}`).pipe(
      tap(payments => this.payments.set(payments))
    );
  }

  // Поиск платежей по критериям
  searchByCriteria(params: PaymentSearchParams): Observable<Payment[]> {
    let httpParams = new HttpParams();
    if (params.userId !== undefined) httpParams = httpParams.set('userId', params.userId);
    if (params.orderId !== undefined) httpParams = httpParams.set('orderId', params.orderId);
    if (params.status) httpParams = httpParams.set('status', params.status);

    return this.http.get<Payment[]>(`${this.apiUrl}/search`, { params: httpParams }).pipe(
      tap(payments => this.payments.set(payments))
    );
  }

  // Получить общую сумму платежей пользователя за период
  getTotalByUserId(userId: number, startDate: string, endDate: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/user/${userId}/total`, {
      params: { startDate, endDate },
    });
  }

  // Получить общую сумму всех платежей за период
  getTotalAllUsers(startDate: string, endDate: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/total`, {
      params: { startDate, endDate },
    });
  }

  create(req: CreatePaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(this.apiUrl, req);
  }

  // Оплатить заказ (упрощённый метод, если есть отдельный endpoint /pay)
  payOrder(orderId: number, userId: number, amount: number): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/pay`, {
      orderId,
      userId,
      paymentAmount: amount,
      status: 'PENDING',
    });
  }
}