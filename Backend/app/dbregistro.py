from pymongo import MongoClient
import os

client = MongoClient('mongodb://mongo-container:27017/')
mdb  = client['horariosDB']
collection = mdb ['registros']