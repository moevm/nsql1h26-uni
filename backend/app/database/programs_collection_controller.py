from pymongo.collection import Collection
from pymongo import MongoClient

class ProgramsCollectionController:
    def __init__(self, collection : Collection):
        self.__collection = collection