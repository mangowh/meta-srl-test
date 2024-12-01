import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  checkCredentials(username: string, password: string) {
    if (
      username === environment.magicCredentials.username &&
      password === environment.magicCredentials.password
    ) {
      return true;
    }

    return false;
  }
}
