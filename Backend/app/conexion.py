from pymongo import MongoClient

client = MongoClient()

mdb = client['horariosDB']

collection = db["registros"]