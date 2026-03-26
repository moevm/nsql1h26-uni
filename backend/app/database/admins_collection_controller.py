from pymongo.collection import Collection
from pymongo import MongoClient

class AdminsCollectionController:
    def __init__(self, collection : Collection):
        self.__collection = collection