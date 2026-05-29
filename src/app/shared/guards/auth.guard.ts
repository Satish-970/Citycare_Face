import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  router.navigate(['/login']);
  return false;
};

const roleRouteMap: Record<string, string> = {
  CITIZEN:             '/dashboard/citizen',
  DOCTOR:              '/dashboard/doctor',
  NURSE:               '/dashboard/doctor',
  DISPATCHER:          '/dashboard/dispatcher',
  ADMIN:               '/dashboard/admin',
  COMPLIANCE_OFFICER:  '/dashboard/compliance',
  CITY_HEALTH_OFFICER: '/dashboard/compliance',
};

export const roleGuard = (allowedRoles: string[]): CanActivateFn => () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) { router.navigate(['/login']); return false; }
  const role = auth.getRole() || '';
  if (allowedRoles.includes(role)) return true;
  router.navigate([roleRouteMap[role] || '/login']);
  return false;
};
