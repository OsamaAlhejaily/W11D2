// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';

// Bootstrap the app with the standalone component as the root
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
  ]
}).catch(err => console.error(err));