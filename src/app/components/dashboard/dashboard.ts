import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { CustomerService, Customer } from '../../services/customer.service';
import { AdminService } from '../../services/admin.service';
import { NavigationComponent } from '../navigation/navigation';
import { User } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NavigationComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  isLoading = signal(true);
  
  // Dashboard metrics
  totalCustomers = signal(0);
  activeCustomers = signal(0);
  inactiveCustomers = signal(0);
  totalAdmins = signal(0);
  
  recentCustomers = signal<Customer[]>([]);

  constructor(
    private customerService: CustomerService,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    this.fetchDashboardData();
  }

  fetchDashboardData() {
    this.isLoading.set(true);
    
    forkJoin({
      customers: this.customerService.getCustomers(),
      admins: this.adminService.getAdmins()
    }).subscribe({
      next: ({ customers, admins }) => {
        this.totalCustomers.set(customers.length);
        this.activeCustomers.set(customers.filter(c => c.status === 'active').length);
        this.inactiveCustomers.set(customers.filter(c => c.status === 'inactive').length);
        this.totalAdmins.set(admins.length);
        
        // Grab recent 3 customers
        this.recentCustomers.set(customers.slice(0, 3));
        
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load dashboard data:', err);
        this.isLoading.set(false);
      }
    });
  }
}
