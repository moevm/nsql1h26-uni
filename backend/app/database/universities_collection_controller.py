from bson import ObjectId
from pymongo.collection import Collection
import datetime
import re
from app.database.base_collection_controller import BaseCollectionController


class UniversitiesCollectionController(BaseCollectionController):
    def __init__(self, collection: Collection):
        super().__init__(collection)

    def add_university(self, name: str, city: str, has_dormitory: bool, military_dept: bool,
                       website: str, foundation_year: int, students_count: int, faculties_count: int,
                       phone: str, email: str, comment: str = None, rating: float = None,
                       programs_count: int = None) -> ObjectId | None:
        """Вернет id университета в случае успешного добавление. Иначе - None."""
        if not self._check_collection():
            return None
        try:
            university = {
                "name": name,
                "city": city,
                "has_dormitory": has_dormitory,
                "military_dept": military_dept,
                "website": website,
                "foundation_year": foundation_year,
                "students_count": students_count,
                "faculties_count": faculties_count,
                "phone": phone,
                "email": email,
                "comment": comment if comment else "",
                "rating": rating if rating is not None else 4.5,
                "programs_count": programs_count if programs_count is not None else 0,
                "createdAt": datetime.datetime.now(datetime.timezone.utc),
                "updatedAt": datetime.datetime.now(datetime.timezone.utc)
            }

            resultAdd = self._collection.insert_one(university)
            if resultAdd.acknowledged:
                return resultAdd.inserted_id
            return None
        except Exception as e:
            print("Error add university:", e)
            return None

    def find_university_by_name(self, name: str) -> dict | None:
        """Возвращает все поля найденного университета в виде словаря.
        Или None, если не удалось найти. Name не зависит от регистра."""
        if not self._check_collection():
            return None

        escaped_name = re.escape(name)

        universityFilter = {
            "name": {
                "$regex": f"^{escaped_name}$",
                "$options": "i"
            }
        }
        universityInDB = self._collection.find_one(universityFilter)
        return universityInDB

    def find_university_by_id(self, id_str: str) -> dict | None:
        """Возвращает все поля найденного университета в виде словаря.
        Или None, если не удалось найти."""
        try:
            id_obj = ObjectId(id_str)
        except Exception as e:
            print("Error id:", e)
            return None
        if not self._check_collection():
            return None
        universityFilter = {
            "_id": id_obj
        }
        universityInDB = self._collection.find_one(universityFilter)
        return universityInDB

    def find_universities_by_filters(self, name: str = None, city: str = None, has_dormitory: bool = None,
                                     military_dept: bool = None,
                                     website: str = None, foundation_year: int = None, students_count: int = None,
                                     faculties_count: int = None,
                                     phone: str = None, email: str = None, rating: tuple[float | None, ...] = None,
                                     programs_count: tuple[float | None, ...] = None, comment: str = None) -> list:
        """Возвращает список всех найденных университетов. Элементы списка - словари со всеми полями.
        city, website, email не зависят от регистра."""
        if not self._check_collection():
            return []
        universityFilter = {}
        if name:
            universityFilter["name"] = {
                "name": {
                    "$regex": f"{name}",
                    "$options": "i"
                }
            }
        if city:
            universityFilter["city"] = {
                "$regex": f"{city}",
                "$options": "i"
            }
        if has_dormitory is not None:
            universityFilter["has_dormitory"] = has_dormitory
        if military_dept is not None:
            universityFilter["military_dept"] = military_dept
        if website:
            universityFilter["website"] = {
                "$regex": f"{website}",
                "$options": "i"
            }
        if foundation_year is not None:
            universityFilter["foundation_year"] = foundation_year
        if students_count is not None:
            universityFilter["students_count"] = students_count
        if faculties_count is not None:
            universityFilter["faculties_count"] = faculties_count
        if phone is not None:
            universityFilter["phone"] = phone
        if email is not None:
            universityFilter["email"] = {
                "$regex": f"{email}",
                "$options": "i"
            }
        if rating is not None:
            universityFilter["rating"] = {}
            if rating[0] is not None:
                universityFilter["rating"]["$gte"] = rating[0]
            if rating[1] is not None:
                universityFilter["rating"]["$lte"] = rating[1]
        if programs_count is not None:
            universityFilter["programs_count"] = {}
            if programs_count[0] is not None:
                universityFilter["programs_count"]["$gte"] = programs_count[0]
            if programs_count[1] is not None:
                universityFilter["programs_count"]["$lte"] = programs_count[1]
        if comment is not None:
            universityFilter["comment"] = {
                "$regex": f"{comment}",
                "$options": "i"
            }
        universitiesInDB = self._collection.find(universityFilter)
        result = [university for university in universitiesInDB]
        return result

    def update_university(self, id_str: str, name: str = None, city: str = None, has_dormitory: bool = None,
                          foundation_year: int = None, students_count: int = None,
                          faculties_count: int = None,
                          phone: str = None, email: str = None,
                          rating: float = None, programs_count: int = None,
                          military_dept: bool = None, website: str = None, comment: str = None) -> bool:
        """Вернет true в случае успешного обновления. Иначе - false."""
        if not self._check_collection():
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
            if foundation_year is not None:
                universityNewData["foundation_year"] = foundation_year
            if students_count is not None:
                universityNewData["students_count"] = students_count
            if faculties_count is not None:
                universityNewData["faculties_count"] = faculties_count
            if phone is not None:
                universityNewData["phone"] = phone
            if email is not None:
                universityNewData["email"] = email
            if rating is not None:
                universityNewData["rating"] = rating
            if programs_count is not None:
                universityNewData["programs_count"] = programs_count
            if comment is not None:
                universityNewData["comment"] = comment
            universityNewData["updatedAt"] = datetime.datetime.now(datetime.timezone.utc)
            resultUpdate = self._collection.update_one(universityFilter, {"$set": universityNewData})
            if resultUpdate.acknowledged and resultUpdate.matched_count != 0:
                return True
            return False
        except Exception as e:
            print("Error update university:", e)
            return False

    def delete_university(self, id_str: str) -> bool:
        """Вернет true в случае успешного удаления. Иначе - false."""
        if not self._check_collection():
            return False
        try:
            universityFilter = {
                "_id": ObjectId(id_str)
            }
            resultDelete = self._collection.delete_one(universityFilter)
            if resultDelete.deleted_count:
                return True
            return False
        except Exception as e:
            print("Error delete university:", e)
            return False
