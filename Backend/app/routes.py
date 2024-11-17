from flask import Flask, request, jsonify, abort, flash
from .models import Usuario  # Asegúrate de importar tu modelo USUARIO
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import check_password_hash, generate_password_hash
import os

UPLOAD_FOLDER_RELOJ = 'uploads/reloj'
LAST_UPLOAD_FOLDER_RELOJ = 'uploads/ultimo_reloj' 
UPLOAD_FOLDER_HORARIO1 = 'uploads/horario1'
UPLOAD_FOLDER_HORARIO2 = 'uploads/horario2'

os.makedirs(UPLOAD_FOLDER_RELOJ, exist_ok=True)
os.makedirs(LAST_UPLOAD_FOLDER_RELOJ, exist_ok=True)
os.makedirs(UPLOAD_FOLDER_HORARIO1, exist_ok=True)
os.makedirs(UPLOAD_FOLDER_HORARIO2, exist_ok=True)

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
    
    
    @app.route('/api/admin', methods=['GET'])
    def admin():
        if not current_user.is_authenticated:
            abort(403)
            
        if current_user.rol != 'administrador':
            abort(403)
            
        usuarios = Usuario.query.all()
        return jsonify([usuario.to_dict() for usuario in usuarios])
        
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
        
        usuario_existente = Usuario.query.filter_by(rut_persona=rut_persona).first()
        if usuario_existente:
            return jsonify({'message': 'El usuario ya existe'}), 400
        
        nuevo_usuario = Usuario(
            rut_persona=rut_persona,
            nombre=nombre,
            apellido_paterno=apellido_paterno,
            apellido_materno=apellido_materno,
            contrasena= contrasena,
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
                    'message': 'Sesión iniciada exitosamente.',
                    'nombre': usuario.nombre,
                    'role': usuario.rol
                }), 200
                
            else:
                return jsonify({'message': 'Credenciales invalidas.'}), 401
                
        except Exception as e:
            print(f"Error en el login: {e}")  # Debugging
            return jsonify({'message': f'Ocurrió un error al intentar iniciar sesión: {e}'}), 500
        
        
        
    @app.route(('/api/edit_user/<rut_persona>') , methods= ['PUT'])
    @login_required
    
    def edit_user(rut_persona):
        usuario = Usuario.query.filter_by(rut_persona=rut_persona).first()
        if not usuario:
            return jsonify({'message': 'Usuario no encontrado'}), 404
        
        data = request.get_json()
        
        usuario.nombre = data.get('nombre',usuario.nombre)
        usuario.apellido_paterno = data.get('apellido_paterno', usuario.apellido_paterno)
        usuario.apellido_materno = data.get('apellido_materno', usuario.apellido_materno)
        
        nueva_contrasena = data.get('contrasena')
        if nueva_contrasena:
            usuario.contrasena = generate_password_hash('nueva_contrasena')
        
        try:
            db.session.commit()
            return jsonify({'message': 'Usuario actualizado correctamente'}), 200
    
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': f'Hubo un error al actualizar el usuario: {e}'}), 500
        
    @app.route(('/api/delete_user/<rut_persona>') , methods= ['DELETE'])
    @login_required
    def delete_user(rut_persona):
        usuario = Usuario.query.filter_by(rut_persona=rut_persona).first()
        if not usuario:
            return jsonify({'message': 'Usuario no encontrado'}), 404
        
        try:
            db.session.delete(usuario)
            db.session.commit()
            return jsonify({'message': 'Usuario eliminado correctamente'}), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': f'Hubo un error al eliminar el usuario: {e}'}), 500
        
    @app.route(('/api/usuarios'),methods = ['GET'])
    @login_required
    def get_clientes():
            
        if current_user.rol != 'administrador':
            abort(403)
                
        usuarios = Usuario.query.all()
            
            
        return jsonify([usuario.to_dict() for usuario in usuarios])

    @app.route('/api/admin/usuarios', methods=['GET'])
    def obtener_clientes():
        if current_user.rol != 'administrador':
            return jsonify({'message': 'Acceso denegado'}),403
        
        try:
            usuarios = Usuario.query.all()
            return jsonify([usuario.to_dict() for usuario in usuarios])
        
        except Exception as e:
            return jsonify({'message': f'Ocurrio un error: {str(e)}'}),500
        
    @app.route('/api/users', methods=['GET'])
    @login_required
    def obtener_usuarios():
        
        
        user_info = {
            'rut_persona': current_user.rut_persona,
            'nombre': current_user.nombre,
            'apellido_paterno': current_user.apellido_paterno,
            'apellido_materno': current_user.apellido_materno,
            
        }
        return jsonify(user_info)
    
    @app.route('/upload-reloj', methods=['POST'])
    def upload_reloj():
        if 'file' not in request.files:
            return jsonify({'error': 'No se encontró el archivo'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Nombre de archivo vacío'}), 400

        if not file.filename.endswith('.log'):
            return jsonify({'error': 'Solo se permiten archivos .log'}), 400

        content = file.read().decode('utf-8').strip().split('\n')
        for line in content:
            columns = [col.strip() for col in line.split(',')]
            print(f"Línea procesada: {columns}") 
            if len(columns) != 19:  
                return jsonify({'error': f'Línea inválida: {line}, se encontró {len(columns)} columnas.'}), 400

        file_path = os.path.join(UPLOAD_FOLDER_RELOJ, file.filename)
        file.seek(0)  #
        file.save(file_path)

        last_file_path = os.path.join(LAST_UPLOAD_FOLDER_RELOJ, 'ultimo_reloj.log')

        if os.path.exists(last_file_path):
            os.remove(last_file_path)

        file.seek(0) 
        file.save(last_file_path)

        # cargar el archivo a mongo
        
        return jsonify({'message': f'Archivo {file.filename} subido exitosamente a Carga Reloj y guardado en ambas carpetas'}), 200

    @app.route('/upload-horario', methods=['POST'])
    def upload_horario():
        if 'horario1' not in request.files or 'horario2' not in request.files:
            return jsonify({'error': 'No se encontraron ambos archivos'}), 400

        horario1 = request.files['horario1']
        horario2 = request.files['horario2']

        if horario1.filename == '' or horario2.filename == '':
            return jsonify({'error': 'Nombre de archivo vacío'}), 400

        if not horario1.filename.endswith('.csv') or not horario2.filename.endswith('.csv'):
            return jsonify({'error': 'Solo se permiten archivos .csv'}), 400

        horario1.save(os.path.join(UPLOAD_FOLDER_HORARIO1, horario1.filename))
        horario2.save(os.path.join(UPLOAD_FOLDER_HORARIO2, horario2.filename))

        return jsonify({'message': 'Archivos subidos exitosamente a Carga Horario'}), 200      