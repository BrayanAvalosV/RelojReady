# Usar una imagen ligera de Python
FROM python:3.10-slim

# Instalar dependencias del sistema necesarias para PostgreSQL y psycopg2
RUN apt-get update && apt-get install -y \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar el archivo de requisitos del proyecto
COPY requirements.txt .

# Actualizar pip y luego instalar las dependencias de Python
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código de la aplicación
COPY . .

# Exponer el puerto donde se ejecutará la aplicación
EXPOSE 5000

# Comando para ejecutar la aplicación
CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]

