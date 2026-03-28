from pymongo import MongoClient
from .admins_collection_controller import AdminsCollectionController
from .programs_collection_controller import ProgramsCollectionController
from .universities_collection_controller import UniversitiesCollectionController

class UniversitiesDataBase:
    def __init__(self, urlDB: str, nameDB: str):
        self.__client = None
        self.__db = None
        self.__nameDB = nameDB
        self.__urlDB = urlDB

        self.__adminsCollectionController = None
        self.__universitiesCollectionController = None
        self.__programsCollectionController = None

    def connect_to_db(self) -> bool:
        try:
            if not self.__db:
                self.__client = MongoClient(self.__urlDB)
                self.__db = self.__client[self.__nameDB]

            self.put_collections_from_db()
            return True
        except Exception as e:
            print("Fail connect to db. Error:", e)
            return False

    def create_collections(self, validation_admins_schema : dict, validation_universities_schema : dict,
                           validation_programs_schema : dict):
        if not self.__db:
            print("No connection to db")
            return

        if not self.find_collection("admins"):
            self.__db.create_collection("admins", validator=validation_admins_schema)
        if not self.find_collection("universities"):
            self.__db.create_collection("universities", validator=validation_universities_schema)
        if not self.find_collection("programs"):
            self.__db.create_collection("programs", validator=validation_programs_schema)

        self.put_collections_from_db()

    def get_admins_collection(self) -> AdminsCollectionController | None:
        if not self.__db:
            print("No connect to db!")
            return None
        return self.__adminsCollectionController

    def get_programs_collection(self) -> ProgramsCollectionController | None:
        if not self.__db:
            print("No connect to db!")
            return None
        return self.__programsCollectionController

    def get_universities_collection(self) -> UniversitiesCollectionController | None:
        if not self.__db:
            print("No connect to db!")
            return None
        return self.__universitiesCollectionController

    def find_collection(self, collectionName: str) -> bool:
        if not self.__db:
            print("No connect to db!")
            return False
        listOfCollectionsNames = self.__db.list_collection_names()
        return collectionName in listOfCollectionsNames

    def put_collections_from_db(self):
        if not self.__db:
            print("No connect to db!")
            return

        if self.find_collection("admins"):
            self.__adminsCollectionController = AdminsCollectionController(self.__db["admins"])
            self.__adminsCollectionController.create_index("username")
        if self.find_collection("universities"):
            self.__universitiesCollectionController = UniversitiesCollectionController(self.__db["universities"])
            self.__universitiesCollectionController.create_index("name")
        if self.find_collection("programs"):
            self.__programsCollectionController = ProgramsCollectionController(self.__db["programs"])

    def close_db(self):
        if self.__client:
            self.__client.close()