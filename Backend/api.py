from flask import Flask, jsonify
from sync import obtener_df
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

# Ruta de la API para obtener los datos
@app.route('/api/data', methods=['GET'])
def obtener_data():
    df_final = obtener_df()
    data_json = df_final.to_dict(orient='records')
    return jsonify(data_json)

if __name__ == '__main__':
    app.run(debug=True)
