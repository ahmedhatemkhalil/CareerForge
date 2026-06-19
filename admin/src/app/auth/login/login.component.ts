import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  showPassword = false;
  isSubmitting = false;

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  onSubmit() {
    if (this.loginForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {

        localStorage.setItem('user', JSON.stringify(res.user));
        localStorage.setItem('accessToken', res.accessToken);

        this.toastr.success("Welcome back!", "Login Successful");

        const role = res.user.role?.toLowerCase();

        if (role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/access-denied']);
        }

        this.isSubmitting = false;
      },
      error: (err) => {
        this.isSubmitting = false;

        const errorMessage = err.error?.message || err.error?.error || "Login failed, please check your credentials.";
        this.toastr.error(errorMessage, "Login Error");
      }
    });
  }
}
