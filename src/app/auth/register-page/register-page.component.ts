import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-register',
  templateUrl: './register-page.component.html',
  standalone: true,
  imports:[ReactiveFormsModule]
})
export class RegisterPageComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router  // Inyectado
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(18)]],
    });
  }


  onRegister() {
    if (this.registerForm.valid) {
      const { username, password, name, email, address, age } = this.registerForm.value;
      this.authService.register(email, password, name, address, age)
        .then(user => {
          console.log('Usuario registrado con éxito', user);
          // Redirigir a la ruta deseada
          this.router.navigate(['/']);  // Redirige a la ruta principal
        })
        .catch(error => {
          console.error('Error al registrar usuario:', error);
        });
    } else {
      console.log('Formulario no válido', this.registerForm.errors);
    }
  }

}
