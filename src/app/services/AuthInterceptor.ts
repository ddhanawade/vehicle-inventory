import { HttpInterceptorFn } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  // const excludedPattern = /^(https:\/\/auth\.fleet-manager\.in\/auth\/[^/]+|https:\/\/inventory-service-prd\.us-east-2\.elasticbeanstalk\.com)/;
  const excludedPattern = /^(https:\/\/auth\.fleet-manager\.in\/[^/]+|https:\/\/fleet-manager\.in\/[^/]+|https:\/\/api\.fleet-manager\.in)/;

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
