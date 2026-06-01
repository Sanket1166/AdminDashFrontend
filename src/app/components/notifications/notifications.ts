import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div 
        *ngFor="let toast of toasts()" 
        class="toast" 
        [ngClass]="{
          'toast-success': toast.type === 'success',
          'toast-error': toast.type === 'error',
          'toast-info': toast.type === 'info'
        }">
        <span class="toast-icon">
          <ng-container [ngSwitch]="toast.type">
            <span *ngSwitchCase="'success'">✓</span>
            <span *ngSwitchCase="'error'">✗</span>
            <span *ngSwitchCase="'info'">ℹ</span>
          </ng-container>
        </span>
        <div class="toast-message">{{ toast.message }}</div>
        <button class="toast-close" (click)="remove(toast.id)">&times;</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-icon {
      font-weight: 800;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
    }
    .toast-success .toast-icon { color: var(--success); }
    .toast-error .toast-icon { color: var(--danger); }
    .toast-info .toast-icon { color: var(--accent); }
    
    .toast-message {
      flex: 1;
      font-size: 0.9rem;
      font-weight: 500;
    }
    
    .toast-close {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 1.2rem;
      cursor: pointer;
      line-height: 1;
      padding: 0 0.2rem;
      transition: var(--transition-smooth);
    }
    .toast-close:hover {
      color: var(--text-main);
    }
  `]
})
export class NotificationsComponent {
  get toasts() {
    return this.notificationService.toasts;
  }

  constructor(private notificationService: NotificationService) {}

  remove(id: number) {
    this.notificationService.remove(id);
  }
}
