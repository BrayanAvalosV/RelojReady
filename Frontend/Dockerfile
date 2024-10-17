# Etapa de construcción
FROM node:18-alpine as build

WORKDIR /app

# Copiar los archivos package.json y package-lock.json para instalar las dependencias
COPY package.json package-lock.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto de la aplicación React al contenedor
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM nginx:alpine

# Copiar la build de React desde la etapa de construcción
COPY --from=build /app/build /usr/share/nginx/html

# Copiar archivo de configuración de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
