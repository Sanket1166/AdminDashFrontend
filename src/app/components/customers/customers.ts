import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService, Customer } from '../../services/customer.service';
import { NotificationService } from '../../services/notification.service';
import { NavigationComponent } from '../navigation/navigation';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, NavigationComponent],
  templateUrl: './customers.html',
  styleUrls: ['./customers.css']
})
export class CustomersComponent implements OnInit {
  customers = signal<Customer[]>([]);
  isLoading = signal(true);

  // Search & Filter State
  searchQuery = '';
  statusFilter = '';

  // Side Drawer State
  isDrawerOpen = false;
  isEditMode = false;
  
  // Current active customer model for form
  currentCustomer: Customer = this.getEmptyCustomer();

  constructor(
    private customerService: CustomerService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.fetchCustomers();
  }

  fetchCustomers() {
    this.isLoading.set(true);
    this.customerService.getCustomers(this.searchQuery, this.statusFilter).subscribe({
      next: (data) => {
        this.customers.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching customers:', err);
        this.notificationService.error('Failed to retrieve customer listing.');
        this.isLoading.set(false);
      }
    });
  }

  onSearch() {
    this.fetchCustomers();
  }

  onFilterChange() {
    this.fetchCustomers();
  }

  openAddDrawer() {
    this.isEditMode = false;
    this.currentCustomer = this.getEmptyCustomer();
    this.isDrawerOpen = true;
  }

  openEditDrawer(customer: Customer) {
    this.isEditMode = true;
    // Clone customer to avoid direct binding mutations in table before saving
    this.currentCustomer = { ...customer };
    this.isDrawerOpen = true;
  }

  closeDrawer() {
    this.isDrawerOpen = false;
  }

  onSubmitForm() {
    if (!this.currentCustomer.name || !this.currentCustomer.email) {
      this.notificationService.error('Name and Email are required fields.');
      return;
    }

    this.isLoading.set(true);
    if (this.isEditMode && this.currentCustomer._id) {
      // Update
      this.customerService.updateCustomer(this.currentCustomer._id, this.currentCustomer).subscribe({
        next: (updated) => {
          this.notificationService.success(`Customer "${updated.name}" updated successfully.`);
          this.closeDrawer();
          this.fetchCustomers();
        },
        error: (err) => {
          this.isLoading.set(false);
          this.notificationService.error(err.error?.message || 'Failed to update customer details.');
        }
      });
    } else {
      // Create
      this.customerService.createCustomer(this.currentCustomer).subscribe({
        next: (created) => {
          this.notificationService.success(`Customer "${created.name}" registered successfully.`);
          this.closeDrawer();
          this.fetchCustomers();
        },
        error: (err) => {
          this.isLoading.set(false);
          this.notificationService.error(err.error?.message || 'Failed to create new customer.');
        }
      });
    }
  }

  onDeleteCustomer(customer: Customer) {
    if (!customer._id) return;
    
    if (confirm(`Are you sure you want to delete customer "${customer.name}"?`)) {
      this.isLoading.set(true);
      this.customerService.deleteCustomer(customer._id).subscribe({
        next: () => {
          this.notificationService.success(`Customer "${customer.name}" has been deleted.`);
          this.fetchCustomers();
        },
        error: (err) => {
          this.isLoading.set(false);
          this.notificationService.error(err.error?.message || 'Failed to delete customer.');
        }
      });
    }
  }

  private getEmptyCustomer(): Customer {
    return {
      name: '',
      email: '',
      phone: '',
      company: '',
      status: 'active',
      address: '',
      notes: ''
    };
  }
}
