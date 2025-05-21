import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  imports: [ReactiveFormsModule],
  standalone: true,
})
export class ProfilePageComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  userData: any = null;
  isEditing = false;
  isChangingPassword = false;
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.waitForUserAndLoadData();
  }

  private async waitForUserAndLoadData(): Promise<void> {
    try {
      const isAuthenticated = await this.authService.waitForAuthReady();
      if (isAuthenticated) {
        this.initProfileForm();
        this.initPasswordForm();
        await this.loadUserData();
      } else {
        this.errorMessage = 'No se encontró ningún usuario autenticado.';
      }
    } catch (error) {
      console.error('Error al esperar al usuario:', error);
      this.errorMessage = 'Error al verificar el estado del usuario.';
    }
  }

  private initProfileForm(): void {
    this.profileForm = this.fb.group({
      name: [{ value: '', disabled: true }, Validators.required],
      address: [{ value: '', disabled: true }, Validators.required],
      age: [{ value: null, disabled: true }, [Validators.required, Validators.min(0)]],
      gender: [{ value: '', disabled: true }],
      photoURL: [{ value: '', disabled: true }],
    });
  }

  private initPasswordForm(): void {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  private async loadUserData(): Promise<void> {
    try {
      const user = this.authService.auth.currentUser;
      if (user) {
        const userData = await this.authService.getUserData(user.uid);
        this.userData = {
          name: userData.name || '', // Valor predeterminado si no hay nombre
          address: userData.address || '', // Valor predeterminado si no hay dirección
          age: userData.age || null, // Valor predeterminado si no hay edad
          gender: userData.gender || '', // Valor predeterminado si no hay género
          photoURL: userData.photoURL || 'https://i.imgur.com/DfIXxgm.jpg', // Valor predeterminado si no hay foto
        };
        this.profileForm.patchValue(this.userData); // Rellena el formulario con los datos cargados
      } else {
        this.errorMessage = 'No se encontró ningún usuario autenticado.';
      }
    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
      this.errorMessage = 'Error al cargar los datos del usuario.';
    }
  }

  enableEditing(): void {
    this.isEditing = true;
    this.profileForm.enable(); // Habilita todos los campos del formulario
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.profileForm.patchValue(this.userData); // Restaura los valores originales
    this.profileForm.disable(); // Deshabilita todos los campos del formulario
  }

  async saveChanges(): Promise<void> {
    if (this.profileForm.invalid) {
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
      return;
    }

    try {
      const user = this.authService.auth.currentUser;
      if (user) {
        await this.authService.updateUserData(
          this.profileForm.value.name,
          this.profileForm.value.address,
          this.profileForm.value.age,
          this.profileForm.value.gender, // Nuevo campo: género
          this.profileForm.value.photoURL // Nuevo campo: URL de la foto
        );

        this.userData = { ...this.userData, ...this.profileForm.value }; // Actualiza los datos locales
        this.isEditing = false;
        this.profileForm.disable(); // Deshabilita el formulario después de guardar
        this.errorMessage = null;
      } else {
        this.errorMessage = 'No se encontró ningún usuario autenticado.';
      }
    } catch (error) {
      console.error('Error al actualizar los datos del usuario:', error);
      this.errorMessage = 'Error al guardar los cambios.';
    }
  }

  enablePasswordChange(): void {
    this.isChangingPassword = true;
  }

  cancelPasswordChange(): void {
    this.isChangingPassword = false;
    this.passwordForm.reset();
  }

  async changePassword(): Promise<void> {
    if (this.passwordForm.invalid) {
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.value;

    try {
      const user = this.authService.auth.currentUser;
      if (user && user.email) {
        await this.authService.reauthenticateAndChangePassword(currentPassword, newPassword);
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
