from pymongo import MongoClient

client = MongoClient()

db = client['gestiondb_usuarios']

collection = db["test_collection"]