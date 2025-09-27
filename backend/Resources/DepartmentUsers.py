from flask import request
from flask_restful import Resource

from Models.DepartmentUsers import DepartmentUser
from Serializers.DepartmentUserSerializers import department_user_serializers, department_user_serializer
from extensions import db


class DepartmentUsers(Resource):
    def get(self):
        try:
            return department_user_serializers.dump(DepartmentUser.query.all())
        except Exception as e:
            print(e)
            return {"error": "Internal error occurred"}

    def post(self):
        try:
            json_data = request.get_json(force=True)
            if not json_data:
                return ValueError("error", "No data sent"), 400

            department_user = DepartmentUser(**json_data)

            db.session.add(department_user)
            db.session.commit()

            return department_user_serializer.load(department_user)

        except ValueError as ve:
            print(ve)
            return {"error", str(ve)}

        except Exception as e:
            print(e)
            return {"error", "Internal error occurred"}, 500
        