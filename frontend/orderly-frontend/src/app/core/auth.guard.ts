import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
        router.navigate(['/login']);
        return false;
    }

    // Check role-based access
    const url = state.url;
    const role = auth.getRole();

    if (url.startsWith('/admin') && role !== 'ADMIN') {
        router.navigate(['/login']);
        return false;
    }

    if (url.startsWith('/livreur') && role !== 'LIVREUR') {
        router.navigate(['/login']);
        return false;
    }

    if (url.startsWith('/client') && role !== 'CLIENT') {
        router.navigate(['/login']);
        return false;
    }

    return true;
};
