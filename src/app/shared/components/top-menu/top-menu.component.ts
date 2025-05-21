import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'top-menu',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './top-menu.component.html',
})
export class TopMenuComponent implements OnInit {
  isLoggedIn: boolean = false; // Define la propiedad
  userProfilePicture: string | null = null; // URL de la foto de perfil

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Suscribirse al observable del usuario actual para saber si está logueado
    this.authService.currentUser.subscribe((user) => {
      if (user) {
        this.isLoggedIn = true;
        // Obtener la URL de la foto de perfil del usuario
        this.userProfilePicture = user.photoURL || null;
      } else {
        this.isLoggedIn = false;
        this.userProfilePicture = null;
      }
    });
  }

  onLogout() {
    this.authService.logout().then(() => {
      console.log('Usuario deslogueado');
      this.isLoggedIn = false; // Actualiza el estado a false
      this.userProfilePicture = null; // Limpia la foto de perfil
    }).catch((error) => {
      console.error('Error al cerrar sesión:', error);
    });
  }
}
