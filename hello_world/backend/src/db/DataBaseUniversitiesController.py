from pymongo import MongoClient

class DataBaseUniversitiesController:
    def __init__(self, url_db, name_db):
        self.__client = None
        self.__db = None
        self.__admins = None
        self.__url_db = url_db
        self.__name_db = name_db

    def connect_to_db(self):
        self.__client = MongoClient(self.__url_db)
        self.__db = self.__client[self.__name_db]
        self.__admins = self.__db["admins"]

    def close_db(self):
        self.__client.close()

    def get_admins(self):

        if not self.__admins:
            return []
        admins = []
        for admin in self.__admins.find():
            admin = dict(admin)
            admin['_id'] = str(admin['_id'])
            admins.append(admin)
        return admins

    def is_admin_in_db(self, login):
        if not self.__admins:
            return False
        for admin in self.__admins.find():
            if admin['login'] == login:
                return True
        return False

    def add_admin(self, login, password):
        if not self.__admins:
            return
        if self.is_admin_in_db(login):
            return
        self.__admins.insert_one({"login": login, "password": password})

    def remove_admin(self, login):
        if not self.__admins:
            return
        if not self.is_admin_in_db(login):
            return
        self.__admins.delete_one({"login": login})