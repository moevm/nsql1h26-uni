from pymongo.collection import Collection
import hashlib
import datetime

class AdminsCollectionController:
    def __init__(self, collection: Collection):
        self.__collection = collection

    def create_index(self, field: str) -> bool:
        if not self.__collection:
            print("No collection admins found!")
            return False
        try:
            self.__collection.create_index([(field, 1)], unique=True)
            return True
        except Exception as e:
            print("Error create index:", e)
            return False

    @staticmethod
    def __get_hash_by_username_password(username: str, password: str) -> str:
        combinedStr = f"{username}:{password}"
        hashPassword = hashlib.sha256(combinedStr.encode('utf-8'))
        return hashPassword.hexdigest()[:60]

    def add_admin(self, username: str, password: str) -> str | None:
        """Возвращает username если удалось добавить админа, иначе None"""
        if not self.__collection:
            print("No collection admins found!")
            return None
        try:
            hashPassword = self.__get_hash_by_username_password(username, password)
            admin = {
                "username": username,
                "password_hash": hashPassword,
                "createdAt": datetime.datetime.now(datetime.timezone.utc)
            }

            resultAdd = self.__collection.insert_one(admin)
            if resultAdd.acknowledged:
                return username
            return None
        except Exception as e:
            print("Error add admin:", e)
            return None

    def find_admin(self, username: str, password: str) -> dict | None:
        """Возвращает все поля найденного админа в виде словаря.
        Или None, если не удалось найти."""
        if not self.__collection:
            print("No collection admins found!")
            return None
        hashPassword = self.__get_hash_by_username_password(username, password)
        adminFilter = {
            "username": username,
            "password_hash": hashPassword,
        }
        adminInDB = self.__collection.find_one(adminFilter)
        return adminInDB