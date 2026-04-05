from pymongo.collection import Collection
from pymongo import MongoClient

class ProgramsCollectionController:
    def __init__(self, collection : Collection):
        self.__collection = collection

    def __check_collection(self):
        if not self.__collection:
            print("No collection programs found!")
            return False
        return True

    def create_index(self, field: str) -> bool:
        """TODO: видно, что все контроллеры коллекций имеют схожие методы и поля.
        Так что есть смысл в дальнейшем обернуть index и поле collection в один абстрактный класс."""
        if not self.__check_collection():
            return False
        try:
            self.__collection.create_index([(field, 1)], unique=True)
            return True
        except Exception as e:
            print("Error create index:", e)
            return False
