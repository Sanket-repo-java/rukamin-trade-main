import { Routes } from '@angular/router';
import { requireAuthGuard, signedOutGuard } from './core/auth/auth.guard';
import { LoginComponent } from './features/auth/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'login' },
	{ path: 'login', component: LoginComponent, canActivate: [signedOutGuard] },
	{ path: 'trading', component: DashboardComponent, canActivate: [requireAuthGuard] },
	{ path: '**', redirectTo: 'login' }
];
