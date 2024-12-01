import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonComponent } from '../../components/button/button.component';
import { InputComponent } from '../../components/input/input.component';
import { LinkComponent } from '../../components/link/link.component';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    InputComponent,
    ButtonComponent,
    LinkComponent,
    SpinnerComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private router = inject(Router);
  private auth = inject(AuthService);

  signInIsLoading = signal(false);

  loginForm = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.maxLength(50),
      Validators.pattern('[a-zA-Z0-9 ]*'),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.maxLength(255),
    ]),
  });
  showPassword: boolean = false;

  async onSubmit() {
    this.signInIsLoading.set(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.loginForm.markAllAsTouched();

    if (this.loginForm.valid) {
      const vals = this.loginForm.value;

      if (
        vals.username &&
        vals.password &&
        this.auth.checkCredentials(vals.username, vals.password)
      ) {
        this.router.navigate(['home']);
      } else {
        this.loginForm.setErrors({ invalid: true });
      }
    }

    this.signInIsLoading.set(false);
  }
}
