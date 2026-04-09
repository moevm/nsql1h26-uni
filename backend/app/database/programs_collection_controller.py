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
                                 budget_places: tuple[int | None, ...] = None,
                                 paid_places: tuple[int | None, ...] = None,
                                 passing_score: tuple[int | None, ...] = None,
                                 form_of_education: str = None, required_subjects: list = None,
                                 comment: str = None) -> list:
        """Возвращает список всех найденных программ. Элементы списка - словари со всеми полями.
        name не зависит от регистра, для полей с tuple первое значение - min, второе - max.
        Если какого-то значения нет, то берется верхняя/нижняя границы."""
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
            programFilter["code"] = {
                "$regex": f"{code}",
                "$options": "i"
            }
        if name:
            programFilter["name"] = {
                "$regex": f"{name}",
                "$options": "i"
            }
        if budget_places is not None:
            programFilter["budget_places"] = {}
            if budget_places[0] is not None:
                programFilter["budget_places"]["$gte"] = budget_places[0]
            if budget_places[1] is not None:
                programFilter["budget_places"]["$lte"] = budget_places[1]
        if paid_places is not None:
            programFilter["paid_places"] = {}
            if paid_places[0] is not None:
                programFilter["paid_places"]["$gte"] = paid_places[0]
            if paid_places[1] is not None:
                programFilter["paid_places"]["$lte"] = paid_places[1]
        if passing_score is not None:
            programFilter["passing_score"] = {}
            if passing_score[0] is not None:
                programFilter["passing_score"]["$gte"] = passing_score[0]
            if passing_score[1] is not None:
                programFilter["passing_score"]["$lte"] = passing_score[1]
        if form_of_education:
            programFilter["form_of_education"] = form_of_education
        if required_subjects is not None:
            programFilter["required_subjects"] = {
                "$all": [
                    {
                        "$elemMatch": {
                            "subject": subject
                        }
                    }
                    for subject in required_subjects
                ]
            }
        if comment is not None:
            programFilter["comment"] = {
                "$regex": f"{comment}",
                "$options": "i"
            }
        programsInDB = self._collection.find(programFilter)
        result = [program for program in programsInDB]
        return result

    def update_program(self, program_id: str, university_id: str = None, code: str = None, name: str = None,
                       budget_places: int = None,
                       paid_places: int = None, passing_score: int = None, form_of_education: str = None,
                       required_subjects: dict = None, comment: str = None) -> bool | None:
        """Вернет true в случае успешного обновления. Иначе - false."""
        if not self._check_collection():
            return False
        try:
            required_subjects_data = []
            if required_subjects:
                for subject, minimum_points in required_subjects.items():
                    required_subjects_data.append({"subject": subject, "minimum_points": minimum_points})
            program_filter = {
                "_id": ObjectId(program_id)
            }
            programNewData = {}
            if university_id:
                programNewData["university_id"] = ObjectId(university_id)
            if code:
                programNewData["code"] = code
            if name:
                programNewData["name"] = name
            if budget_places is not None:
                programNewData["budget_places"] = budget_places
            if paid_places is not None:
                programNewData["paid_places"] = paid_places
            if passing_score is not None:
                programNewData["passing_score"] = passing_score
            if form_of_education:
                programNewData["form_of_education"] = form_of_education
            if required_subjects_data:
                programNewData["required_subjects"] = required_subjects_data
            if comment:
                programNewData["comment"] = comment
            programNewData["updatedAt"] = datetime.datetime.now(datetime.timezone.utc)
            resultUpdate = self._collection.update_one(program_filter, {"$set": programNewData})
            if resultUpdate.acknowledged and resultUpdate.matched_count != 0:
                return True
            return False
        except Exception as e:
            print("Error update program:", e)
            return False

    def delete_program(self, id_str: str) -> bool:
        """Вернет true в случае успешного удаления. Иначе - false."""
        if not self._check_collection():
            return False
        try:
            programFilter = {
                "_id": ObjectId(id_str)
            }
            resultDelete = self._collection.delete_one(programFilter)
            if resultDelete.deleted_count:
                return True
            return False
        except Exception as e:
            print("Error delete program:", e)
            return False