import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environments';
import { routes } from './app.routes';  // Asegúrate de importar las rutas

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // Usa las rutas que has definido en app.routes.ts
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)), // 🔥 Inicializar Firebase
    provideAuth(() => getAuth()), // 🔥 Proveer Auth
    provideFirestore(() => getFirestore()) // 🔥 Proveer Firestore
  ]
};
