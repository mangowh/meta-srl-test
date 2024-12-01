import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';

interface UsernameAvailability {
  status: 'success' | 'error';
  error_message?: string;
  error_code?: number;
}

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  private http = inject(HttpClient);

  checkUsernameAvailability(username: string) {
    return this.http.post<UsernameAvailability>(
      'http://lab.gruppometa.it/test-js/check-username/',
      {
        username,
      },
    );
  }

  registerNewUser(
    username: string,
    email: string,
    firstName?: string | null,
    lastName?: string | null,
  ) {
    return this.http
      .post('http://lab.gruppometa.it/test-js/registration/', {
        username,
        email,
        firstName,
        lastName,
      })
      .pipe(map((res) => (res as UsernameAvailability).status === 'success'));
  }
}
