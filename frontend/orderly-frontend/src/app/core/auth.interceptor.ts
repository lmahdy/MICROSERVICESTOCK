import { HttpInterceptorFn } from '@angular/common/http';

/** Simple pass-through interceptor — no auth tokens needed (auth disabled on backend) */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
