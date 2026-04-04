from bson import ObjectId
from pymongo.collection import Collection
import datetime

class AdminsCollectionController:
    def __init__(self, collection: Collection):
        self.__collection = collection

    def __check_collection(self):
        if not self.__collection:
            print("No collection admins found!")
            return False
        return True

    def create_index(self, field: str) -> bool:
        if not self.__check_collection:
            return False
        try:
            self.__collection.create_index([(field, 1)], unique=True)
            return True
        except Exception as e:
            print("Error create index:", e)
            return False

    def add_admin(self, username: str, password: str) -> ObjectId | None:
        """Возвращает id если удалось добавить админа, иначе None.
        _id возвращается в виде ObjectId, так что необходимо перевести его в str."""
        if not self.__check_collection:
            return None
        try:

            admin = {
                "username": username,
                "password_hash": password,
                "createdAt": datetime.datetime.now(datetime.timezone.utc)
            }

            resultAdd = self.__collection.insert_one(admin)
            if resultAdd.acknowledged:
                return resultAdd.inserted_id
            return None
        except Exception as e:
            print("Error add admin:", e)
            return None

    def find_admin_by_username_password(self, username: str, password: str) -> dict | None:
        """Возвращает все поля найденного админа в виде словаря.
        Или None, если не удалось найти.
        _id возвращается в виде ObjectId, так что необходимо перевести его в str."""
        if not self.__check_collection:
            return None

        adminFilter = {
            "username": username,
            "password_hash": password,
        }
        adminInDB = self.__collection.find_one(adminFilter)
        return adminInDB

    def find_admin_by_id(self, idUser: str) -> dict | None:
        """Возвращает все поля найденного админа в виде словаря. Передавать id в виде str.
        Или None, если не удалось найти.
        _id возвращается в виде ObjectId, так что необходимо перевести его в str."""
        if not self.__check_collection:
            return None

        adminFilter = {
            "_id": ObjectId(idUser)
        }
        adminInDB = self.__collection.find_one(adminFilter)
        return adminInDB