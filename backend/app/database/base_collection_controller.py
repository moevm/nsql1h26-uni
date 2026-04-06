from pymongo.collection import Collection
from pymongo import MongoClient

class BaseCollectionController:
    def __init__(self, collection : Collection):
        self._collection = collection

    def _check_collection(self):
        if not self._collection:
            print("No collection found!")
            return False
        return True

    def create_index(self, fields: list[tuple[str, int]]) -> bool:
        if not self._check_collection():
            return False
        try:
            self._collection.create_index(fields, unique=True)
            return True
        except Exception as e:
            print("Error create index:", e)
            return False