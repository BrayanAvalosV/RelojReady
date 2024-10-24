from flask import Flask, request, jsonify, abort, flash
from .models import Usuario  # Asegúrate de importar tu modelo Cliente
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import check_password_hash, generate_password_hash

def load_routes(app,db):
    
    @app.route('/', methods=['GET'])
    def home():
        return jsonify(message='Esta es la api')
    
    @app.route('/api/register', methods=['POST'])
    def register():
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'No se recibieron datos'}), 400
        rut_persona = data.get('rut_persona')
        nombre = data.get('nombre')
        apellido_paterno = data.get('apellido_paterno')
        apellido_materno = data.get('apellido_materno')
        contrasena = data.get('contrasena')
        
        usuario_existente = Usuario.query.filterby(rut_persona=rut_persona).first()
        if usuario_existente:
            return jsonify({'message': 'El usuario ya existe'}), 400
        
        nuevo_usuario = Usuario(
            rut_persona=rut_persona,
            nombre=nombre,
            apellido_paterno=apellido_paterno,
            apellido_materno=apellido_materno,
            contrasena= contrasena
        )
        
        try:
            db.session.add(nuevo_usuario)
            db.session.commit()
            
            login_user(nuevo_usuario)
            
            return jsonify({'message': 'Usuario creado exitosamente'}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': 'Hubo un error al crear el usuario'}), 500
        
        
    @app.route('/api/logout', methods=['POST'])
    @login_required
    def logout():
        logout_user()
        return jsonify({'message': 'Sesión finalizada'}), 200
    
    def admin():
        if not current_user.is_authenticated:
            abort(403)
            
        if current_user.rol != 'administrador':
            abort(403)
            
            usuarios = Usuario.query.all()
            return jsonify([usuario.todict() for usuario in usuarios])
        
    @app.route(('/api/create_user'), methods=['POST'])
    @login_required
    def create_user():
        data = request.get_json()
        
        rut_persona = data.get('rut_persona')
        nombre = data.get('nombre')
        apellido_paterno = data.get('apellido_paterno')
        apellido_materno = data.get('apellido_materno')
        contrasena = data.get('contrasena')
        rol = data.get('rol')
        
        usuario_existente = Usuario.query.filterby(rut_persona=rut_persona).first()
        if usuario_existente:
            return jsonify({'message': 'El usuario ya existe'}), 400
        
        nuevo_usuario = Usuario(
            rut_persona=rut_persona,
            nombre=nombre,
            apellido_paterno=apellido_paterno,
            apellido_materno=apellido_materno,
            contrasena=generate_password_hash(contrasena),
            rol=rol
        )
        
        try:
            db.session.add(nuevo_usuario)
            db.session.commit()
            
            return jsonify({'message': 'Usuario creado exitosamente'}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': 'Hubo un error al crear el usuario'}), 500
        
    @app.route(('/api/login'), methods=['POST'])
    def login():
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'No se recibieron datos'}), 400
        
        rut_persona = data.get('rut_persona')
        contrasena = data.get('contrasena')
        try:
            
            usuario = Usuario.query.filter_by(rut_persona=rut_persona).first()
            if usuario and usuario.check_password(contrasena):
                login_user(usuario)
                return jsonify({
                    'message': 'Sesión iniciada exitosamente',
                    'nombre': usuario.nombre,
                    'role': usuario.rol
                }), 200
                
                return jsonify({'message': 'Credenciales invalidas.'}), 401
                
        except Exception as e:
            return jsonify({'message': f'Ocurrió un error al intentar iniciar sesión: {e}'}), 500
        
        
        
    @app.route(('/api/edit_user/<rut_persona>') , methods= ['PUT'])
    @login_required
    
    def edit_user(rut_persona):
        usuario = Usuario.query.filter_by(rut_persona=rut_persona).first()
        if not usuario:
            return jsonify({'message': 'Usuario no encontrado'}), 404
        
        data = request.get_json()
        
        