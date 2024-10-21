from flask import Blueprint, request, jsonify, abort
from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token, check_password_hash, generate_password_hash
from .models import Usuario  # Asegúrate de importar tu modelo Cliente
from flask_login import login_user, logout_user, login_required, current_user
 
auth = Blueprint('auth', __name__)

@auth.route('/api/login', methods=['POST'])
def login():
    rut = request.json.get('rut')
    contrasena = request.json.get('contrasena')
    user = get_user_by_email(email)  # Función que consulta la BD

    if user and check_password_hash(user['contrasena'], contrasena):
        access_token = create_access_token(identity=user['id'])
        return jsonify(access_token=access_token), 200
    return jsonify({"msg": "Credenciales inválidas"}), 401


@auth.route('/api/admin', methods=['GET'])
    @login_required
    def admin():
        if not current_user.is_authenticated:
            abort(403)  # Acceso prohibido si no está autenticado

        if current_user.rol != 'administrador':
            abort(403)  # Acceso prohibido si no es administrador
        
        usuarios = Usuario.query.all()  # Obtener todos los clientes
        return jsonify([usuarios.to_dict() for usuario in usuarios])