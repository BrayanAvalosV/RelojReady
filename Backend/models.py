from Backend.config import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

class Usuario(db.Model,UserMixin):
    __tablename__ = 'usuarios'
    
    rut_usuario = db.Column(db.String(12),nullable=False)
    nombre = db.Column(db.String(50),nullable=False)
    apellido = db.Column(db.String(50),nullable=False)
    contrasena = db.Column(db.String(10),nullable=False)
    rol = db.Column(db.String(14),nullable=False)
    
    def __init__(self, rut_usuario, nombre, apellido, contrasena, rol):
        self.rut_usuario = rut_usuario
        self.nombre = nombre
        self.apellido = apellido
        self.contrasena = generate_password_hash(contrasena)
        self.rol = rol
        
    def set_contrasena(self, contrasena):
        self.contrasena = generate_password_hash(contrasena)
        
    def check_contrasena_hash(self, contrasena):
        return check_password_hash(self.contrasena, contrasena)
    
    def to_dict(self):
        return {
            'rut_usuario': self.rut_usuario,
            'nombre': self.nombre,
            'apellido': self.apellido,
            'rol': self.rol
        }