import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth-service.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';  // Importa ReactiveFormsModule

@Component({
  selector: 'login-page',
  standalone: true,  // Este es para asegurar que no estás usando módulos
  imports: [ReactiveFormsModule],  // Importa ReactiveFormsModule aquí
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {
  loginForm: FormGroup;
  errorMessage: string = '';  // Variable para manejar el mensaje de error

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password)
        .then((userCredential) => {
          console.log('Usuario logueado con éxito', userCredential.user);
          this.router.navigate(['']);
        })
        .catch((error) => {
          console.error('Error al iniciar sesión:', error);
          if (error.code === 'auth/invalid-credential') {
            this.errorMessage = 'Error de credenciales. Por favor, revisa tu correo o contraseña.';
          } else {
            this.errorMessage = 'Hubo un error al iniciar sesión. Intenta nuevamente.';
          }
        });
    } else {
      this.errorMessage = 'El email o contraseña no son correctos.';
    }
  }
}

