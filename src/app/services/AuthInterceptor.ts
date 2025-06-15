import { HttpInterceptorFn } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const excludedPattern = /^(http:\/\/localhost:8082\/auth\/[^/]+|http:\/\/inventory-service-prd\.us-east-2\.elasticbeanstalk\.com)/;

  if (!excludedPattern.test(req.url)) {
    const token = localStorage.getItem('authToken');
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }

  return next(req);
};