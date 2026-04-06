from bson import ObjectId
from pymongo.collection import Collection
import datetime
from app.database.base_collection_controller import BaseCollectionController


class ProgramsCollectionController(BaseCollectionController):
    def __init__(self, collection: Collection):
        super().__init__(collection)

    def add_program(self, university_id: str, code: str, name: str, budget_places: int,
                    paid_places: int, passing_score: int, form_of_education: str, required_subjects: dict,
                    comment: str = None) -> ObjectId | None:
        """Вернет id программы в случае успешного добавление. Иначе - None.
        required_subjects идет в формате словаря: {subject1: points1, subject2: points2}"""
        if not self._check_collection():
            return None
        try:
            required_subjects_data = []
            for subject, minimum_points in required_subjects.items():
                required_subjects_data.append({"subject": subject, "minimum_points": minimum_points})
            program = {
                "university_id": ObjectId(university_id),
                "code": code,
                "name": name,
                "budget_places": budget_places,
                "paid_places": paid_places,
                "passing_score": passing_score,
                "form_of_education": form_of_education,
                "required_subjects": required_subjects_data,
                "comment": comment if comment else "",
                "createdAt": datetime.datetime.now(datetime.timezone.utc),
                "updatedAt": datetime.datetime.now(datetime.timezone.utc)
            }

            resultAdd = self._collection.insert_one(program)
            if resultAdd.acknowledged:
                return resultAdd.inserted_id
            return None
        except Exception as e:
            print("Error add program:", e)
            return None

    def find_programs_by_name_prefix(self, name: str, university_id: str) -> list | None:
        """Возвращает все поля найденного направления конкретного вуза в виде словаря.
        Или None, если не удалось найти. name не зависит от регистра."""
        try:
            if not self._check_collection():
                return None
            programFilter = {
                "university_id": ObjectId(university_id),
                "name": {
                    "$regex": f"^{name}",
                    "$options": "i"
                }
            }
            programInDB = self._collection.find(programFilter)
            result = [program for program in programInDB]
            return result
        except Exception as e:
            print("Error:", e)
            return None

    def find_program_by_id(self, id_str: str) -> dict | None:
        """Возвращает все поля найденного университета в виде словаря.
        Или None, если не удалось найти."""
        try:
            id_obj = ObjectId(id_str)
        except Exception as e:
            print("Error id:", e)
            return None
        if not self._check_collection():
            return None
        programFilter = {
            "_id": id_obj
        }
        programInDB = self._collection.find_one(programFilter)
        return programInDB

    def find_programs_by_filters(self, university_id: str = None, code: str = None, name: str = None,
                                 budget_places: int = None, paid_places: int = None, passing_score: int = None,
                                 form_of_education: str = None, required_subjects: dict = None,
                                 comment: str = None) -> list:
        """Возвращает список всех найденных программ. Элементы списка - словари со всеми полями.
        name, form_of_education не зависит от регистра, ищутся значения меньше или ровно
        budget_places, paid_places, passing_score, required_subjects."""
        if not self._check_collection():
            return []
        programFilter = {}
        try:
            if university_id is not None:
                programFilter["university_id"] = ObjectId(university_id)
        except Exception as e:
            print("Error id:", e)
            return []

        if code is not None:
            programFilter["code"] = code
        if name:
            programFilter["name"] = {
                "$regex": f"^{name}$",
                "$options": "i"
            }
        if budget_places is not None:
            programFilter["budget_places"] = {
                "$lte": budget_places
            }
        if paid_places is not None:
            programFilter["paid_places"] = {
                "$lte": paid_places
            }
        if passing_score is not None:
            programFilter["passing_score"] = {
                "$lte": passing_score
            }
        if passing_score is not None:
            programFilter["passing_score"] = {
                "$lte": passing_score
            }
        if form_of_education:
            programFilter["form_of_education"] = {
                "$regex": f"^{form_of_education}$",
                "$options": "i"
            }
        if required_subjects is not None:
            programFilter["required_subjects"] = {
                "$all": [
                    {
                    "$elemMatch": {
                        "subject": subject,
                        "minimum_points": {"$lte": points}
                    }
                }
                for subject, points in required_subjects.items()
                ]
            }
        if comment is not None:
            programFilter["comment"] = comment
        programsInDB = self._collection.find(programFilter)
        result = [program for program in programsInDB]
        return result
