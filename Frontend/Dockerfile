FROM node:18-alpine

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Habilitar polling para cambios en archivos
ENV WATCHPACK_POLLING=true

# Exponer el puerto (el puerto que usa React normalmente es 3000)
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]