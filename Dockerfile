 # Build stage
 FROM node:18 as builder
 WORKDIR /app

 # Copy package files
 COPY package*.json ./
 RUN npm install

 # Copy source code
 COPY . .
 # Build the application
 RUN npm run build --configuration=production

 # Production stage
 FROM nginx:alpine

 # Remove default nginx website
 RUN rm -rf /usr/share/nginx/html/*

 # Copy built app and nginx config
 COPY --from=builder /app/dist/vehicle-inventory/* /usr/share/nginx/html/
 COPY nginx.conf /etc/nginx/conf.d/default.conf

 # Set permissions and create required directories
 RUN chown -R nginx:nginx /var/cache/nginx && \
     chown -R nginx:nginx /var/log/nginx && \
     chown -R nginx:nginx /usr/share/nginx/html && \
     chmod -R 755 /usr/share/nginx/html && \
     mkdir -p /run/nginx && \
     touch /run/nginx.pid && \
     chown -R nginx:nginx /run/nginx && \
     chmod -R 755 /run/nginx

 EXPOSE 80
 CMD ["nginx", "-g", "daemon off;"]

## Stage 1: Build
#FROM node:19 AS build
#WORKDIR /app
#COPY package.json package-lock.json ./
#RUN npm install
#COPY . .
#RUN npm run build --prod
#
## Stage 2: Production
#FROM nginx:alpine
#COPY --from=build /app/dist/angular-app /usr/share/nginx/html
#EXPOSE 80
#CMD ["nginx", "-g", "daemon off;"]
