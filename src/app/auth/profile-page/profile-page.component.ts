import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth-service.service'; // Importamos el servicio de autenticación
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  imports: [ReactiveFormsModule],
  standalone: true, // Asegúrate de que el componente sea standalone si usas Angular 17+
})
export class ProfilePageComponent implements OnInit {
  profileForm!: FormGroup; // Formulario para editar el perfil
  passwordForm!: FormGroup; // Formulario para cambiar la contraseña
  userData: any = null; // Datos del usuario obtenidos de Firestore
  isEditing = false; // Estado para controlar el modo edición
  isChangingPassword = false; // Estado para controlar el cambio de contraseña
  errorMessage: string | null = null; // Mensaje de error

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initProfileForm();
    this.initPasswordForm();
    this.loadUserData();
  }

  // Inicializa el formulario de perfil
  private initProfileForm(): void {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      age: [null, [Validators.required, Validators.min(0)]],
    });
  }

  // Inicializa el formulario de cambio de contraseña
  private initPasswordForm(): void {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // Carga los datos del usuario desde Firestore
  private async loadUserData(): Promise<void> {
    try {
      const user = this.authService.auth.currentUser;
      if (user) {
        const userData = await this.authService.getUserData(user.uid);
        this.userData = userData;
        this.profileForm.patchValue(userData); // Rellena el formulario con los datos actuales
      } else {
        this.errorMessage = 'No se encontró ningún usuario autenticado.';
      }
    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
      this.errorMessage = 'Error al cargar los datos del usuario.';
    }
  }

  // Habilita el modo edición
  enableEditing(): void {
    this.isEditing = true;
  }

  // Cancela el modo edición
  cancelEditing(): void {
    this.isEditing = false;
    this.profileForm.patchValue(this.userData); // Restaura los valores originales
  }

  // Guarda los cambios realizados en el perfil
  async saveChanges(): Promise<void> {
    if (this.profileForm.invalid) {
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
      return;
    }

    try {
      const user = this.authService.auth.currentUser;
      if (user) {
        // Actualiza los datos en Firestore
        await this.authService.updateUserData(
          this.profileForm.value.name,
          this.profileForm.value.address,
          this.profileForm.value.age
        );

        // Actualiza los datos locales
        this.userData = { ...this.userData, ...this.profileForm.value };
        this.isEditing = false;
        this.errorMessage = null;
      } else {
        this.errorMessage = 'No se encontró ningún usuario autenticado.';
      }
    } catch (error) {
      console.error('Error al actualizar los datos del usuario:', error);
      this.errorMessage = 'Error al guardar los cambios.';
    }
  }

  // Habilita el modo de cambio de contraseña
  enablePasswordChange(): void {
    this.isChangingPassword = true;
  }

  // Cancela el modo de cambio de contraseña
  cancelPasswordChange(): void {
    this.isChangingPassword = false;
    this.passwordForm.reset(); // Limpia el formulario
  }

  // Cambia la contraseña
  async changePassword(): Promise<void> {
    if (this.passwordForm.invalid) {
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.value;

    try {
      const user = this.authService.auth.currentUser;
      if (user && user.email) {
        // Reautentica al usuario con la contraseña actual
        await this.authService.reauthenticateAndChangePassword(currentPassword, newPassword);

        // Limpia el formulario y desactiva el modo de cambio de contraseña
        this.cancelPasswordChange();
        this.errorMessage = null;
      } else {
        this.errorMessage = 'No se encontró ningún usuario autenticado.';
      }
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      this.errorMessage = 'La contraseña actual es incorrecta o hubo un error al cambiarla.';
    }
  }
}