from pymongo import MongoClient
import os

mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/tu_basededatos")  # Valor por defecto
client = MongoClient(mongo_uri)
db = client['registros']
