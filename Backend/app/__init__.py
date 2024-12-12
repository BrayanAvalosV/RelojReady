# app/__init__.py
from flask import Flask
from .database import db, init_db
from .models import Usuario
from flask_login import LoginManager,logout_user, current_user
from flask_cors import CORS
from werkzeug.security import generate_password_hash
import os
from datetime import timedelta
from pymongo import MongoClient
import shutil

def create_app():
    app = Flask(__name__)
    # Configura CORS para que acepte las cookies
    CORS(app, supports_credentials=True)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:password@user-db:5432/gestiondb_usuarios' # cambiar
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['REMEMBER_COOKIE_DURATION'] = timedelta(minutes=0)
    app.config['SESSION_TYPE'] = 'filesystem'  # Almacena sesiones en el sistema de archivos
    app.config['SESSION_PERMANENT'] = False  # Las sesiones no serán permanentes
    app.secret_key = 'appweb'  # Cambia esto a una clave más segura

    # Inicializar base de datos
    init_db(app)
    
    client = MongoClient('mongodb://mongo-container:27017/')
    mdb = client['horariosDB']
    collection = mdb['registros']

    # Configurar Flask-Login
    login_manager = LoginManager()
    login_manager.init_app(app)

    # Redirigir a la página de inicio de sesión si no está autenticado
    login_manager.login_view = 'login'
    login_manager.login_message = "Por favor, inicia sesión para acceder a esta página."

    # Función para cargar el usuario desde la base de datos
    @login_manager.user_loader
    def load_user(rut_persona):  # Cambiado a rut persona
        return Usuario.query.filter_by(rut_persona=rut_persona).first()  # Ahora usa rut
    
    # Forzar el cierre de sesión de cualquier usuario al iniciar el servidor
    def force_logout_on_start():
        session_folder = app.config.get('SESSION_FILE_DIR', '/tmp/flask_session')
        try:
            shutil.rmtree(session_folder)  # Borra todas las sesiones activas
            print("Sesiones previas eliminadas.")
        except FileNotFoundError:
            pass
    
    with app.app_context():
        try:
            db.create_all()
            print("Tablas creadas exitosamente.")

            # Crear el administrador solo si no existe
            # esta funcion solo es para probar en esta fase, luego deberia implementarse la funcion para crear nuevo admin
            if not Usuario.query.filter_by(rut_persona='12345678-9').first():
                admin = Usuario(
                    rut_persona='12345678-9',
                    nombre='Admin',
                    apellido_paterno='AdminP',
                    apellido_materno='AdminM',
                    contrasena='admin123',  # La contraseña será hasheada automáticamente
                    rol='administrador'
                )
                
                db.session.add(admin)
                db.session.commit()
                print("Administrador y usuario creado exitosamente.")
            else:
                print("El administrador ya existe.")
   
        except Exception as e:
            print(f"Error al crear tablas o al insertar el administrador: {e}")
        # Llamar a la función para invalidar las sesiones
        force_logout_on_start()
    
    
    from .routes import load_routes
    load_routes(app, db)

    return app