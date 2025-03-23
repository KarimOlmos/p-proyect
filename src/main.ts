import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http'; // Importa provideHttpClient

// Añade provideHttpClient() a los providers globales
bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []), // Conserva los providers existentes
    provideHttpClient(), // Provee HttpClient globalmente
  ],
}).catch((err) => console.error(err));
