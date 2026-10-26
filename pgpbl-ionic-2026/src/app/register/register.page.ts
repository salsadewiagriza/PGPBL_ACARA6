import { Component } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage {

  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor() {}

  register() {
    console.log('Email:', this.email);
    console.log('Password:', this.password);
    console.log('Confirm Password:', this.confirmPassword);

    if (this.password !== this.confirmPassword) {
      console.log('Password dan Confirm Password tidak sama');
      return;
    }

    console.log('Register berhasil');
  }

}