from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    rut = data.get('rut')
    password = data.get('password')
    # Aquí puedes agregar la lógica de autenticación
    return jsonify({"message": "Login successful"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
