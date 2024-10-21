# Dockerfile para el frontend
FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY ./public ./public
COPY ./src ./src

RUN npm run build

# Stage de producción
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
