import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order.service';
import { PaymentService } from '../../../services/payment.service';
import { PaymentCardService } from '../../../services/payment-card.service';
import { AuthService } from '../../../services/auth.service';
import { Order } from '../../../types/order.types';
import { PaymentCard } from '../../../types/payment-card.types';

@Component({
  selector: 'app-order-pay',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-pay.page.html',
  styleUrl: './order-pay.page.css'
})
export class OrderPayPage implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private paymentService = inject(PaymentService);
  private cardService = inject(PaymentCardService);
  private auth = inject(AuthService);

  readonly loading = signal(false);
  readonly processing = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly order = signal<Order | null>(null);
  readonly paymentCards = signal<PaymentCard[]>([]);

  selectedCardId: number | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrder(+id);
      this.loadPaymentCards();
    }
  }

  loadOrder(id: number) {
    this.loading.set(true);
    this.orderService.getById(id).subscribe({
      next: (order) => {
        if (order.status !== 'PENDING') {
          this.error.set('This order cannot be paid (status: ' + order.status + ')');
        }
        this.order.set(order);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load order');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  loadPaymentCards() {
    // В реальности userId нужно брать из AuthService или JWT
    const userId = 1;
    this.cardService.getCardsByUserId(userId).subscribe({
      next: (cards) => {
        this.paymentCards.set(cards.filter(c => c.active));
        if (cards.length > 0) {
          this.selectedCardId = cards.find(c => c.active)?.id ?? cards[0].id;
        }
      },
      error: (err) => console.error('Failed to load payment cards', err),
    });
  }

  pay() {
    if (!this.selectedCardId || !this.order()) return;

    this.processing.set(true);
    this.error.set(null);

    const orderId = this.order()!.id;
    const userId = this.order()!.userId;
    const amount = this.order()!.totalPrice;

    this.paymentService.payOrder(orderId, userId, amount).subscribe({
      next: () => {
        this.success.set('Payment successful!');
        this.processing.set(false);
        setTimeout(() => this.router.navigate(['/orders']), 2000);
      },
      error: (err) => {
        this.error.set('Payment failed. Please try again.');
        this.processing.set(false);
        console.error(err);
      },
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}