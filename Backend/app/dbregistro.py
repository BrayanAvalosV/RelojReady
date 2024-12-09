from pymongo import MongoClient
import os

mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")  # Valor por defecto
client = MongoClient(mongo_uri)
db = client['horariosDB']
