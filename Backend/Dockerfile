# Usar una imagen base de Python
FROM python:3.10-slim

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar los archivos de requerimientos y los archivos de la aplicación
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto de los archivos de la aplicación
COPY . .

# Exponer el puerto 5000 (por defecto en Flask)
EXPOSE 5000

# Establecer la variable de entorno para habilitar el modo de desarrollo
ENV FLASK_ENV=development

# Comando para ejecutar la aplicación
CMD ["flask", "run", "--host=0.0.0.0"]
