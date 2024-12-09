from pymongo import MongoClient

client = MongoClient()

db = client['horariosDB']

collection = db["registros"]