import { Routes } from '@angular/router';
import { LandingPageComponent } from '../pages/landing-page/landing-page.component';
import { Login } from '../pages/login/login';

export const routes: Routes = [
    { path: '', component: LandingPageComponent },
    { path: 'login', component: Login },
    { path: '**', redirectTo: '' },
];
