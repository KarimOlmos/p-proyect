import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideHttpClient } from '@angular/common/http'; // Importa provideHttpClient
import { environment } from '../environments/environments';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // Usa las rutas definidas en app.routes.ts
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)), // 🔥 Inicializar Firebase
    provideAuth(() => getAuth()), // 🔥 Proveer Auth
    provideFirestore(() => getFirestore()), // 🔥 Proveer Firestore
    provideHttpClient(), // 🔧 Proveer HttpClient globalmente
  ],
};
