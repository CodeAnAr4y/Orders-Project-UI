import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../../services/payment.service';
import { AuthService } from '../../../services/auth.service';
import { Payment, PaymentStatus } from '../../../types/payment.types';

@Component({
  selector: 'app-payments-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments-list.page.html',
  styleUrls: ['./payments-list.page.css'],
})
export class PaymentsListPage implements OnInit {
  readonly auth = inject(AuthService);
  readonly paymentService = inject(PaymentService);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly payments = signal<Payment[]>([]);
  readonly currentPage = signal(0);

  selectedStatus = '';

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    this.loading.set(true);
    this.error.set(null);

    const params = { page: this.currentPage(), size: 10 };

    this.paymentService.getAll(params).subscribe({
      next: (res) => {
        let filtered = res.content;
        if (this.selectedStatus) {
          filtered = filtered.filter((p) => p.status === this.selectedStatus);
        }
        this.payments.set(filtered);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load payments');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  applyFilters() {
    this.currentPage.set(0);
    this.loadPayments();
  }

  resetFilters() {
    this.selectedStatus = '';
    this.currentPage.set(0);
    this.loadPayments();
  }

  changePage(page: number) {
    this.currentPage.set(page);
    this.loadPayments();
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth']);
  }

  getStatusClass(status: PaymentStatus): string {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
