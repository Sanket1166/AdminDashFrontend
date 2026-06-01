import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { AuthService, User } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { NavigationComponent } from '../navigation/navigation';

@Component({
  selector: 'app-admins',
  standalone: true,
  imports: [CommonModule, FormsModule, NavigationComponent],
  templateUrl: './admins.html',
  styleUrls: ['./admins.css']
})
export class AdminsComponent implements OnInit {
  admins = signal<User[]>([]);
  isLoading = signal(true);
  
  get currentUser() {
    return this.authService.currentUser;
  }

  // Form Drawer states
  isDrawerOpen = false;
  isEditMode = false;
  
  // Model bindings
  adminModel = {
    _id: '',
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.fetchAdmins();
  }

  fetchAdmins() {
    this.isLoading.set(true);
    this.adminService.getAdmins().subscribe({
      next: (data) => {
        this.admins.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching admins:', err);
        this.notificationService.error('Failed to load administrator accounts.');
        this.isLoading.set(false);
      }
    });
  }

  openAddDrawer() {
    this.isEditMode = false;
    this.adminModel = { _id: '', username: '', fullName: '', email: '', password: '', confirmPassword: '' };
    this.isDrawerOpen = true;
  }

  openEditDrawer(admin: User) {
    this.isEditMode = true;
    this.adminModel = {
      _id: admin._id,
      username: admin.username,
      fullName: admin.fullName,
      email: admin.email,
      password: '', // Blank by default, only set if changing password
      confirmPassword: ''
    };
    this.isDrawerOpen = true;
  }

  closeDrawer() {
    this.isDrawerOpen = false;
  }

  onSubmitForm() {
    const { _id, username, fullName, email, password, confirmPassword } = this.adminModel;

    // Password validation for register
    if (!this.isEditMode) {
      if (!username || !fullName || !email || !password) {
        this.notificationService.error('All fields are required for new accounts.');
        return;
      }
      if (password !== confirmPassword) {
        this.notificationService.error('Passwords do not match.');
        return;
      }
    } else {
      // Edit Mode
      if (!fullName || !email) {
        this.notificationService.error('Full Name and Email are required.');
        return;
      }
      if (password && password !== confirmPassword) {
        this.notificationService.error('Passwords do not match.');
        return;
      }
    }

    this.isLoading.set(true);

    if (this.isEditMode && _id) {
      // Update admin
      const updatePayload: { fullName: string; email: string; password?: string } = { fullName, email };
      if (password) {
        updatePayload.password = password;
      }

      this.adminService.updateAdmin(_id, updatePayload).subscribe({
        next: (updated) => {
          this.notificationService.success(`Account details for "${updated.username}" updated.`);
          
          // If we edited the currently logged-in admin, update local state
          const current = this.currentUser();
          if (current && current._id === updated._id) {
            const updatedUser = { ...current, fullName: updated.fullName, email: updated.email };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            this.authService.currentUser.set(updatedUser);
          }

          this.closeDrawer();
          this.fetchAdmins();
        },
        error: (err) => {
          this.isLoading.set(false);
          this.notificationService.error(err.error?.message || 'Failed to update administrator.');
        }
      });
    } else {
      // Register via AuthService API since registration handles creation
      this.authService.register({ username, fullName, email, password }).subscribe({
        next: (created) => {
          this.notificationService.success(`Administrator account "${created.username}" created.`);
          this.closeDrawer();
          this.fetchAdmins();
        },
        error: (err) => {
          this.isLoading.set(false);
          this.notificationService.error(err.error?.message || 'Failed to create admin account.');
        }
      });
    }
  }

  onDeleteAdmin(admin: User) {
    const current = this.currentUser();
    if (current && current._id === admin._id) {
      this.notificationService.error('Self-deletion is forbidden. You cannot delete your own session.');
      return;
    }

    if (confirm(`Are you sure you want to remove administrator "${admin.fullName}" (@${admin.username})?`)) {
      this.isLoading.set(true);
      this.adminService.deleteAdmin(admin._id).subscribe({
        next: () => {
          this.notificationService.success(`Administrator account "${admin.username}" has been removed.`);
          this.fetchAdmins();
        },
        error: (err) => {
          this.isLoading.set(false);
          this.notificationService.error(err.error?.message || 'Failed to delete administrator.');
        }
      });
    }
  }
}
