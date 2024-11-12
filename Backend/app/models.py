from .database import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

class Usuario(db.Model, UserMixin):
    __tablename__ = 'usuarios'
    
    rut_persona = db.Column(db.String(12), nullable=False,primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    apellido_paterno = db.Column(db.String(50), nullable=False)
    apellido_materno = db.Column(db.String(50), nullable=False)
    contrasena = db.Column(db.String(255), nullable=False)  # Cambiado a 255 caracteres
    rol = db.Column(db.String(20), nullable=False, default='usuario')  # 'usuario' o 'administrador'

    def __init__(self, rut_persona, nombre, apellido_paterno, apellido_materno, contrasena, rol='usuario'):
        self.rut_persona = rut_persona
        self.nombre = nombre
        self.apellido_paterno = apellido_paterno
        self.apellido_materno = apellido_materno
        self.set_password(contrasena)
        self.rol = rol

    def set_password(self, contrasena):
        self.contrasena = generate_password_hash(contrasena)

    def check_password(self, contrasena):
        return check_password_hash(self.contrasena, contrasena)

    def get_id(self):
        return self.rut_persona

    def to_dict(self):
        return {
            "rut_persona": self.rut_persona,
            "nombre": self.nombre,
            "apellido_paterno": self.apellido_paterno,
            "apellido_materno": self.apellido_materno,
            "rol": self.rol
            
        }
