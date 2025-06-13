// import { HttpInterceptorFn } from '@angular/common/http';

// export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
//   const excludedBaseUrl = 'http://localhost:8082/auth/'; // Base URL to exclude

//   // Check if the request URL starts with the excluded base URL
//   if (!req.url.startsWith(excludedBaseUrl)) {
//     const token = localStorage.getItem('authToken'); // Ensure the token is stored in localStorage

//     if (token) {
//       const clonedRequest = req.clone({
//         setHeaders: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       return next(clonedRequest);
//     }
//   }

//   return next(req);
// };

import { HttpInterceptorFn } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const excludedPattern = /^(http:\/\/localhost:8082\/auth\/[^/]+|http:\/\/fleet-manager-prd\.us-east-2\.elasticbeanstalk\.com)$/;

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