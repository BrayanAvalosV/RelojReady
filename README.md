
# Proyecto de Aplicación Web con React, Flask y PostgreSQL
## Descripción
Esta aplicación es una arquitectura de microservicios que utiliza React para el frontend, Flask para el backend y PostgreSQL como base de datos para la gestión de usuarios y MongoDB para almacenar datos correspondientes a los registros de cambios en los archivos. La aplicación está diseñada para ser desplegada de manera dockerizada, permitiendo fácil despliegue y administración.

## Tecnologías Utilizadas
*Frontend:* React + Nginx
*Backend:* Flask (Python)
*Base de Datos:* PostgreSQL y MongoDB
*Orquestación:* Docker y Docker Compose
## Requisitos Previos
*Docker:* Asegúrate de tener Docker y Docker Compose instalados en tu máquina. Puedes instalar Docker siguiendo las instrucciones en docker.com.
## Instalación y Configuración
Sigue los pasos a continuación para poner en marcha el proyecto localmente:

1. Clonar el Repositorio

  gh repo clone BrayanAvalosV/gestion-hcoquimbo
cd gestion-hcoquimbo  


2. Construir y Ejecutar los Servicios con Docker

docker-compose up --build
Esto descargará las imágenes de Docker necesarias, construirá los contenedores de React, Flask y PostgreSQL, y luego levantará los servicios.


3. Acceso a la Aplicación

El frontend estará disponible en http://localhost:3000.
El backend estará disponible en http://localhost:5000.
PostgreSQL estará corriendo en el puerto 5432, con las siguientes credenciales por defecto:
Usuario: postgres
Contraseña: password
Base de datos: mydatabase


4. Comandos Útiles
Para detener los contenedores sin eliminar los volúmenes:

docker-compose down
Para reconstruir las imágenes después de cambios en el código:

docker-compose up --build


## Estructura del Proyecto

/myproject
│
├── /frontend        # Código fuente del frontend (React)
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── src/
│
├── /backend         # Código fuente del backend (Flask)
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app.py
│
├── docker-compose.yml   # Archivo de orquestación para Docker
└── README.md            # Documentación del proyecto

## Desarrollo
### Frontend (React)
Para trabajar en el frontend, navega a la carpeta /frontend y ejecuta los comandos de npm. Asegúrate de tener Node.js y npm instalados.

cd frontend
npm install
npm start
Esto lanzará el frontend en localhost:3000.

### Backend (Flask)
Para trabajar en el backend, navega a la carpeta /backend. Asegúrate de tener Python y las dependencias instaladas.

cd backend
pip install -r requirements.txt
flask run
Esto lanzará el backend en localhost:5000.

## Contribuir
1. Haz un fork del proyecto
2. Crea una rama (git checkout -b feature-xyz)
3. Realiza tus cambios y haz commit (git commit -m "Descripción de tu cambio")
4. Envía tus cambios (git push origin feature-xyz)
5. Abre un Pull Request

