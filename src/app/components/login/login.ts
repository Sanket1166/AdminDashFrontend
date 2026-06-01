import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  isLoginTab = true;

  // Form Models
  loginData = { username: '', password: '' };
  registerData = { username: '', fullName: '', email: '', password: '', confirmPassword: '' };

  isLoading = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    // If already logged in, send to dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  toggleTab(isLogin: boolean) {
    this.isLoginTab = isLogin;
  }

  onLogin() {
    if (!this.loginData.username || !this.loginData.password) {
      this.notificationService.error('Please enter both username and password.');
      return;
    }

    this.isLoading = true;
    this.authService.login(this.loginData).subscribe({
      next: () => {
        this.isLoading = false;
        this.notificationService.success('Logged in successfully! Welcome back.');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.notificationService.error(err.error?.message || 'Login failed. Please check credentials.');
      }
    });
  }

  onRegister() {
    const { username, fullName, email, password, confirmPassword } = this.registerData;

    if (!username || !fullName || !email || !password) {
      this.notificationService.error('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      this.notificationService.error('Passwords do not match.');
      return;
    }

    this.isLoading = true;
    this.authService.register({ username, fullName, email, password }).subscribe({
      next: () => {
        this.isLoading = false;
        this.notificationService.success('Registration successful! Session started.');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.notificationService.error(err.error?.message || 'Registration failed. Try a different username/email.');
      }
    });
  }
}
