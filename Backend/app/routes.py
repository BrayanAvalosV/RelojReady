# app/routes.py
from flask import request, jsonify, abort, current_app
from .models import Usuario  # Asegúrate de importar tu modelo USUARIO
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import  generate_password_hash
import os
import pandas as pd
from datetime import datetime
from .sync import obtener_df
from pymongo import MongoClient
from bson import ObjectId

UPLOAD_FOLDER_RELOJ = 'uploads/reloj'
LAST_UPLOAD_FOLDER_RELOJ = 'uploads/ultimo_reloj' 
UPLOAD_FOLDER_HORARIO1 = 'uploads/horario1'
UPLOAD_FOLDER_HORARIO2 = 'uploads/horario2'

os.makedirs(UPLOAD_FOLDER_RELOJ, exist_ok=True)
os.makedirs(LAST_UPLOAD_FOLDER_RELOJ, exist_ok=True)
os.makedirs(UPLOAD_FOLDER_HORARIO1, exist_ok=True)
os.makedirs(UPLOAD_FOLDER_HORARIO2, exist_ok=True)


MONGO_URL= "mongodb://mongo:27017/horariosDB"
client = MongoClient(MONGO_URL)
mdb = client['horariosDB']
collection = mdb['registros']

def get_mongo_collection():
    client = MongoClient("mongodb://mongo:27017/horariosDB")
    return client['horariosDB']['registros']


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
    @login_required
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
    def get_usuarios():
            
        if current_user.rol != 'administrador':
            abort(403)
                
        usuarios = Usuario.query.all()
            
            
        return jsonify([usuario.to_dict() for usuario in usuarios])

    @app.route('/api/admin/usuarios', methods=['GET'])
    @login_required
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


    @app.route('/data', methods=['GET'])
    def obtener_data():
        try:
            obtener_df()
            return jsonify({"message": "Sycronizado correctamente"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/process_data', methods=['GET', 'POST'])
    def process_data():
        registros = list(collection.find())
        updates = []
        for reg in registros:
            modificacion = 0
            duplicado = False
            if all(key in reg for key in ['RUT', 'entrada/salida', 'hora_reloj', 'fecha_reloj']):
                # Busca posibles duplicados
                for other_reg in registros:
                    if (
                        reg != other_reg and
                        all(key in other_reg for key in ['RUT', 'entrada/salida', 'hora_reloj', 'fecha_reloj']) and
                        reg['RUT'] == other_reg['RUT'] and
                        reg['entrada/salida'] == other_reg['entrada/salida']
                    ):
                        diferencia = abs(
                            (datetime.strptime(reg['hora_reloj'], "%H:%M") -
                            datetime.strptime(other_reg['hora_reloj'], "%H:%M")).total_seconds()
                        )
                        if diferencia <= 180 and reg['fecha_reloj'] == other_reg['fecha_reloj']:
                            duplicado = True
                            break

                # Marca como duplicado
                if duplicado:
                    modificacion = 1

                # Marca si `hora_reloj` es "00:00"
                if reg['hora_reloj'] == "00:00":
                    modificacion = 2 if modificacion == 0 else 3

            # Añade el estado si no existe
            if 'Estado' not in reg:
                reg['Estado'] = 'Vivo'

            # Solo actualiza si se requiere una modificación
            if modificacion > 0:
                reg['Modificacion'] = modificacion
                updates.append(reg)

                # Actualiza el registro en la base de datos
                collection.update_one({'_id': reg['_id']}, {'$set': {'Modificacion': modificacion}})

        # Convierte los registros con ObjectId a una versión serializable
        def convert_objectid(obj):
            """Convierte cualquier ObjectId a cadena"""
            if isinstance(obj, ObjectId):
                return str(obj)
            elif isinstance(obj, dict):
                return {k: convert_objectid(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_objectid(i) for i in obj]
            return obj

        # Devuelve la respuesta con los registros actualizados
        return jsonify({'message': 'Datos procesados', 'updates': [convert_objectid(reg) for reg in updates]}), 200


    # Ruta para borrar duplicados
    @app.route('/delete-duplicates', methods=['POST'])
    def delete_duplicates():
        # Obtener todos los registros con estado 'Vivo' y 'Modificado', ordenados por RUT, entrada/salida, fecha_reloj y hora_reloj
        registros = list(collection.find({'Estado': {'$in': ['Vivo', 'Modificado']}}).sort([('RUT', 1), ('entrada/salida', 1), ('fecha_reloj', 1), ('hora_reloj', 1)]))
        
        # Lista para almacenar los duplicados a eliminar
        duplicates_to_delete = []
        
        # Variable para almacenar el primer registro de cada grupo
        last_seen_reg = None
        
        # Recorremos los registros
        for i, reg in enumerate(registros):
            if last_seen_reg is None:
                # Este es el primer registro, lo mantenemos como 'Vivo'
                last_seen_reg = reg
                continue
            
            # Verificamos si el registro tiene el mismo RUT, entrada/salida y fecha_reloj
            if reg['RUT'] == last_seen_reg['RUT'] and reg['entrada/salida'] == last_seen_reg['entrada/salida'] and reg['fecha_reloj'] == last_seen_reg['fecha_reloj']:
                # Comparamos la diferencia de tiempo entre las horas
                diferencia = abs(
                    (datetime.strptime(reg['hora_reloj'], "%H:%M") - datetime.strptime(last_seen_reg['hora_reloj'], "%H:%M")).total_seconds()
                )
                
                # Si la diferencia es menor o igual a 180 segundos (3 minutos), es un duplicado
                if diferencia <= 180:
                    # Antes de eliminar, registramos el cambio
                    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # Hora actual
                    change_record = {
                        'RUT': reg.get('RUT'),
                        'entrada/salida': reg.get('entrada/salida'),
                        'hora_reloj': reg.get('hora_reloj'),
                        'fecha_reloj': reg.get('fecha_reloj'),
                        'Estado Anterior': reg.get('Estado'),
                        'Modificacion': reg.get('Modificacion'),
                        'Fecha Cambio': current_time,  # Fecha y hora actual del cambio
                        'Usuario': 'admin'  # Quién realizó el cambio
                    }
                    
                    # Insertamos el registro en la colección 'registro_cambios' para tener un historial
                    mdb.registro_cambios.insert_one(change_record)
                    
                    # Marcamos este registro como 'Muerto'
                    collection.update_one({'_id': reg['_id']}, {'$set': {'Estado': 'Muerto'}})
                    
                    # Añadimos el registro a la lista de duplicados a eliminar
                    duplicates_to_delete.append(reg)
                else:
                    # Si la diferencia es mayor, significa que ya no es un duplicado, actualizamos el "primer registro"
                    last_seen_reg = reg
            else:
                # Si el RUT, entrada/salida y fecha_reloj son diferentes, actualizamos el "primer registro"
                last_seen_reg = reg

        # Eliminamos los duplicados de la colección original
        #for reg in duplicates_to_delete:
        # collection.delete_one({'_id': reg['_id']})

        # Respuesta
        return jsonify({'message': f'{len(duplicates_to_delete)} duplicados eliminados y registrados'}), 200
    
    # Ruta para ajustar horarios
    @app.route('/adjust-time', methods=['POST'])
    def adjust_time():
        # Obtener registros que tienen Modificacion: 2 y Estado: 'Vivo'
        registros = list(collection.find({'Modificacion': 2, 'Estado': 'Vivo'}))
        
        for reg in registros:
            # Actualizamos la hora_reloj a la Hora Salida
            if 'Hora Salida' in reg:
                collection.update_one(
                    {'_id': reg['_id']}, 
                    {
                        '$set': {
                            'hora_reloj': reg['Hora Salida'],  # Actualizamos la hora_reloj
                            'Estado': 'Modificado'  # Cambiamos el Estado a 'Modificado'
                        }
                    }
                )

        return jsonify({'message': f'{len(registros)} horarios ajustados'}), 200

    # Ruta para obtener registros vivos
    @app.route('/get-records', methods=['GET'])
    def get_records():
        records = list(collection.find({'Estado': {'$in': ['Vivo', 'Modificado']}}, {'_id': 0}))
        return jsonify(records), 200