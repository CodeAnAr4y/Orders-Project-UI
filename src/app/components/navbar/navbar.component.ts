import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-8">
            <h1 class="text-2xl font-bold text-blue-600">OrderApp</h1>
            <div class="flex gap-4">
              <a
                routerLink="/orders"
                routerLinkActive="text-blue-600 border-b-2 border-blue-600"
                class="px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition"
              >
                Orders
              </a>
              <a
                routerLink="/payments"
                routerLinkActive="text-blue-600 border-b-2 border-blue-600"
                class="px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition"
              >
                Payments
              </a>
              @if (auth.isAdmin()) {
                <a
                  routerLink="/users"
                  routerLinkActive="text-blue-600 border-b-2 border-blue-600"
                  class="px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition"
                >
                  Users
                </a>
              }
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-sm">
              <p class="font-medium text-gray-900">{{ auth.email() }}</p>
              <p class="text-gray-500">{{ auth.role() }}</p>
            </div>
            <button
              (click)="logout()"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth']);
  }
}