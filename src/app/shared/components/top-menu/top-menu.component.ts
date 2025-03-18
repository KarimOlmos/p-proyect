import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/services/auth-service.service';
import { CommonModule } from '@angular/common';
 // Importa el servicio

@Component({
  selector: 'top-menu',
  standalone: true,
  imports:[RouterLink,CommonModule],
  templateUrl: './top-menu.component.html',
})
export class TopMenuComponent implements OnInit {
  isLoggedIn: boolean = false;  // Define la propiedad

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Suscribirse al observable del usuario actual para saber si está logueado
    this.authService.currentUser.subscribe(user => {
      this.isLoggedIn = user !== null;  // Si el usuario está logueado, es true
    });
  }

  onLogout() {
    this.authService.logout().then(() => {
      console.log('Usuario deslogueado');
      this.isLoggedIn = false;  // Actualiza el estado a false
    }).catch((error) => {
      console.error('Error al cerrar sesión:', error);
    });
  }
}
