import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, lastValueFrom, of, switchMap, tap } from 'rxjs';
import { ButtonComponent } from '../../components/button/button.component';
import { InputComponent } from '../../components/input/input.component';
import { LinkComponent } from '../../components/link/link.component';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { RegistrationService } from '../../services/registration.service';

@Component({
  selector: 'app-registration',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputComponent,
    RouterModule,
    SpinnerComponent,
    ButtonComponent,
    LinkComponent,
  ],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss',
  providers: [HttpClient],
})
export class RegistrationComponent {
  private router = inject(Router);
  private registration = inject(RegistrationService);

  registrationForm = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.maxLength(50),
      Validators.pattern('[a-zA-Z0-9 ]*'),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.maxLength(255),
    ]),
    firstName: new FormControl('', [
      Validators.required,
      Validators.pattern('[a-zA-Z0-9 ]*'),
    ]),
    lastName: new FormControl('', [
      Validators.required,
      Validators.pattern('[a-zA-Z0-9 ]*'),
    ]),
  });

  usernameCheckIsLoading = signal(false);
  registrationSuccess = signal(false);

  usernameAvailability$ =
    this.registrationForm.controls.username.valueChanges.pipe(
      tap(() => this.usernameCheckIsLoading.set(true)),
      debounceTime(300), // debounce evento di scrittura sulla tastiera per evitare alto numero di richieste
      switchMap((newUsername) => {
        if (!newUsername || newUsername.length === 0) {
          return of(null);
        }

        return this.registration.checkUsernameAvailability(newUsername!);
      }),
      tap((v) => {
        if (v?.status !== 'success') {
          this.registrationForm.controls.username.setErrors({ invalid: true });
        }
      }),
      tap(() => this.usernameCheckIsLoading.set(false)),
    );

  async onSubmit() {
    this.registrationForm.markAllAsTouched();

    if (this.registrationForm.valid) {
      const newUser = this.registrationForm.value;

      if (!newUser.username) {
        this.registrationForm.controls.username.setErrors({ invalid: true });
        return;
      }

      if (!newUser.password) {
        this.registrationForm.controls.password.setErrors({ invalid: true });
        return;
      }

      const success = await lastValueFrom(
        this.registration.registerNewUser(
          newUser.username,
          newUser.password,
          newUser.firstName,
          newUser.lastName,
        ),
      );

      if (success) {
        this.registrationSuccess.set(true);
        setTimeout(() => this.router.navigate(['home']), 2000);
      } else {
        this.registrationForm.setErrors({ invalid: true });
      }
    }
  }
}
