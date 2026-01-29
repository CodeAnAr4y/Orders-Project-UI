import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  PaymentCard,
  CreatePaymentCardRequest,
  UpdatePaymentCardRequest,
  PageResponse,
} from '../types/payment-card.types';

interface PageRequest {
  page?: number;
  size?: number;
  sort?: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentCardService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiGatewayUrl}/api/v1/users`;

  readonly cards = signal<PaymentCard[]>([]);
  readonly currentCard = signal<PaymentCard | null>(null);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  // Получить все карты пользователя (массив)
  getCardsByUserId(userId: number): Observable<PaymentCard[]> {
    return this.http.get<PaymentCard[]>(`${this.apiUrl}/${userId}/payment-cards`).pipe(
      tap(cards => this.cards.set(cards))
    );
  }

  // Получить карты пользователя с пагинацией
  getCardsByUserIdPaged(userId: number, params?: PageRequest): Observable<PageResponse<PaymentCard>> {
    let httpParams = new HttpParams();
    if (params?.page !== undefined) httpParams = httpParams.set('page', params.page);
    if (params?.size !== undefined) httpParams = httpParams.set('size', params.size);
    if (params?.sort) httpParams = httpParams.set('sort', params.sort);

    return this.http
      .get<PageResponse<PaymentCard>>(`${this.apiUrl}/${userId}/payment-cards/paged`, {
        params: httpParams,
      })
      .pipe(
        tap(res => {
          this.cards.set(res.content);
          this.totalPages.set(res.totalPages);
          this.totalElements.set(res.totalElements);
        })
      );
  }

  create(userId: number, req: CreatePaymentCardRequest): Observable<PaymentCard> {
    return this.http.post<PaymentCard>(`${this.apiUrl}/${userId}/payment-cards`, req);
  }

  update(userId: number, cardId: number, req: UpdatePaymentCardRequest): Observable<PaymentCard> {
    return this.http.put<PaymentCard>(`${this.apiUrl}/${userId}/payment-cards/${cardId}`, req);
  }

  updateStatus(userId: number, cardId: number, active: boolean): Observable<PaymentCard> {
    return this.http.patch<PaymentCard>(
      `${this.apiUrl}/${userId}/payment-cards/${cardId}/status`,
      null,
      { params: { active } }
    );
  }

  delete(userId: number, cardId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}/payment-cards/${cardId}`);
  }
}