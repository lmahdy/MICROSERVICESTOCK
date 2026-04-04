import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
        auth.login();
        return false;
    }

    const url = state.url;
    const role = auth.getRole();

    // No role assigned — treat as CLIENT (default for new users)
    if (!role) {
        if (url.startsWith('/admin') || url.startsWith('/livreur')) {
            router.navigate(['/client/stores']);
            return false;
        }
        return true;
    }

    if (url.startsWith('/admin') && role !== 'ADMIN') {
        auth.navigateByRole();
        return false;
    }

    if (url.startsWith('/livreur') && role !== 'LIVREUR') {
        auth.navigateByRole();
        return false;
    }

    if (url.startsWith('/client') && role !== 'CLIENT') {
        auth.navigateByRole();
        return false;
    }

    return true;
};
