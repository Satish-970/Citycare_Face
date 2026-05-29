import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login',
    loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent) },
  { path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./dashboard/dashboard-shell.component').then(m => m.DashboardShellComponent),
    children: [
      { path: 'citizen',
        canActivate: [roleGuard(['CITIZEN'])],
        loadComponent: () => import('./dashboard/citizen/citizen.component').then(m => m.CitizenComponent) },
      { path: 'doctor',
        canActivate: [roleGuard(['DOCTOR', 'NURSE'])],
        loadComponent: () => import('./dashboard/doctor/doctor.component').then(m => m.DoctorComponent) },
      { path: 'dispatcher',
        canActivate: [roleGuard(['DISPATCHER'])],
        loadComponent: () => import('./dashboard/dispatcher/dispatcher.component').then(m => m.DispatcherComponent) },
      { path: 'admin',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () => import('./dashboard/admin/admin.component').then(m => m.AdminComponent) },
      { path: 'compliance',
        canActivate: [roleGuard(['COMPLIANCE_OFFICER', 'CITY_HEALTH_OFFICER'])],
        loadComponent: () => import('./dashboard/compliance/compliance.component').then(m => m.ComplianceComponent) },
      { path: 'profile',
        canActivate: [authGuard],
        loadComponent: () => import('./dashboard/profile/profile.component').then(m => m.ProfileComponent) },
      { path: '', redirectTo: 'citizen', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
