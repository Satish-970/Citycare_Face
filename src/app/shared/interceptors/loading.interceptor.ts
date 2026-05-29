import { Injectable } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  
  // Only show loading for auth requests to avoid too many spinners
  if (req.url.includes('/auth/')) {
    loadingService.show();
  }

  return next(req).pipe(
    finalize(() => {
      if (req.url.includes('/auth/')) {
        loadingService.hide();
      }
    })
  );
};