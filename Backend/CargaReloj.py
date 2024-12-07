from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER_RELOJ = 'uploads/reloj'
LAST_UPLOAD_FOLDER_RELOJ = 'uploads/ultimo_reloj' 
UPLOAD_FOLDER_HORARIO1 = 'uploads/horario1'
UPLOAD_FOLDER_HORARIO2 = 'uploads/horario2'

os.makedirs(UPLOAD_FOLDER_RELOJ, exist_ok=True)
os.makedirs(LAST_UPLOAD_FOLDER_RELOJ, exist_ok=True)
os.makedirs(UPLOAD_FOLDER_HORARIO1, exist_ok=True)
os.makedirs(UPLOAD_FOLDER_HORARIO2, exist_ok=True)

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

if __name__ == '__main__':
    app.run(debug=True)