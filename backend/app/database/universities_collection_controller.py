from bson import ObjectId
from pymongo.collection import Collection
import datetime

class UniversitiesCollectionController:
    def __init__(self, collection : Collection):
        self.__collection = collection

    def create_index(self, field: str) -> bool:
        """TODO: видно, что все контроллеры коллекций имеют схожие методы и поля.
        Так что есть смысл в дальнейшем обернуть index и поле collection в один абстрактный класс."""
        if not self.__collection:
            print("No collection admins found!")
            return False
        try:
            self.__collection.create_index([(field, 1)], unique=True)
            return True
        except Exception as e:
            print("Error create index:", e)
            return False

    def add_university(self, name: str, city: str, has_dormitory: bool, military_dept: bool,
                       website: str, comment: str = None) -> str | None:
        """Вернет id университета в случае успешного добавление. Иначе - None."""
        if not self.__collection:
            print("No collection universities found!")
            return None
        try:
            university = {
                "name": name,
                "city": city,
                "has_dormitory": has_dormitory,
                "military_dept": military_dept,
                "website": website,
                "comment": comment if comment else "",
                "createdAt": datetime.datetime.now(datetime.timezone.utc),
                "updatedAt": datetime.datetime.now(datetime.timezone.utc)
            }

            resultAdd = self.__collection.insert_one(university)
            if resultAdd.acknowledged:
                return str(resultAdd.inserted_id)
            return None
        except Exception as e:
            print("Error add university:", e)
            return None

    def find_university_by_name(self, name: str) -> dict | None:
        """Возвращает все поля найденного университета в виде словаря.
        Или None, если не удалось найти."""
        if not self.__collection:
            print("No collection universities found!")
            return None
        universityFilter = {
            "name": name
        }
        universityInDB = self.__collection.find_one(universityFilter)
        return universityInDB

    def find_university_by_id(self, id_str: str) -> dict | None:
        """Возвращает все поля найденного университета в виде словаря.
        Или None, если не удалось найти."""
        try:
            id_obj = ObjectId(id_str)
        except Exception as e:
            print("Error id:", e)
            return None
        if not self.__collection:
            print("No collection universities found!")
            return None
        universityFilter = {
            "_id": id_obj
        }
        universityInDB = self.__collection.find_one(universityFilter)
        return universityInDB

    def find_universities_by_prefix(self, name: str) -> list:
        """Возвращает список всех найденных университетов. Элементы списка - словари со всеми полями."""
        if not self.__collection:
            print("No collection universities found!")
            return []
        universityFilter = {
            "name": {"$regex": f"^{name}"}
        }
        universitiesInDB = self.__collection.find(universityFilter)
        result = [university for university in universitiesInDB]
        return result

    def find_universities_by_filters(self, city: str = None, has_dormitory: bool = None, military_dept: bool = None,
                                     website: str = None, comment: str = None) -> list:
        """Возвращает список всех найденных университетов. Элементы списка - словари со всеми полями."""
        if not self.__collection:
            print("No collection universities found!")
            return []
        universityFilter = {}
        if city:
            universityFilter["city"] = city
        if has_dormitory is not None:
            universityFilter["has_dormitory"] = has_dormitory
        if military_dept is not None:
            universityFilter["military_dept"] = military_dept
        if website:
            universityFilter["website"] = website
        if comment:
            universityFilter["comment"] = comment
        universitiesInDB = self.__collection.find(universityFilter)
        result = [university for university in universitiesInDB]
        return result

    def update_university(self, id_str: str, name: str = None, city: str = None, has_dormitory: bool = None,
                          military_dept: bool = None, website: str = None, comment: str = None) -> bool:
        """Вернет true в случае успешного обновления. Иначе - false."""
        if not self.__collection:
            print("No collection universities found!")
            return False
        try:
            universityFilter = {
                "_id": ObjectId(id_str)
            }
            universityNewData = {}
            if name:
                universityNewData["name"] = name
            if city:
                universityNewData["city"] = city
            if has_dormitory is not None:
                universityNewData["has_dormitory"] = has_dormitory
            if military_dept is not None:
                universityNewData["military_dept"] = military_dept
            if website:
                universityNewData["website"] = website
            if comment:
                universityNewData["comment"] = comment
            universityNewData["updatedAt"] = datetime.datetime.now(datetime.timezone.utc)
            resultUpdate = self.__collection.update_one(universityFilter,{"$set": universityNewData})
            if resultUpdate.acknowledged:
                return True
            return False
        except Exception as e:
            print("Error update university:", e)
            return False

    def delete_university(self, id_str: str) -> bool:
        """Вернет true в случае успешного удаления. Иначе - false."""
        if not self.__collection:
            print("No collection universities found!")
            return False
        try:
            universityFilter = {
                "_id": ObjectId(id_str)
            }
            resultUpdate = self.__collection.delete_one(universityFilter)
            if resultUpdate.deleted_count:
                return True
            return False
        except Exception as e:
            print("Error delete university:", e)
            return False