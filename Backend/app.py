from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId
from sync import obtener_df  

app = Flask(__name__)
CORS(app)

client = MongoClient('mongodb://localhost:27017/')
db = client['horariosDB']
collection = db['registros']

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
                db.registro_cambios.insert_one(change_record)
                
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

if __name__ == '__main__':
      app.run(debug=True, port=5020) 