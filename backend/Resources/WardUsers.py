from flask import request
from flask_restful import Resource

from Models.WardUsers import WardUser
from Serializers.WardUserSerializers import ward_user_serializers, ward_user_serializer
from extensions import db


class WardUsers(Resource):
    def get(self):
        try:
            return ward_user_serializers.dump(WardUser.query.all()), 200
        except Exception as e:
            print(e)
            return {"error": "Internal error occurred"}, 500

    def post(self):
        try:
            json_data = request.get_json(force=True)

            if not json_data:
                return {"error", "No data sent"}, 400

            ward_user = WardUser(**json_data)

            db.session.add(ward_user)
            db.session.commit()

            return ward_user_serializer.load(ward_user), 201
        except ValueError as ve:
            print(ve)
            return {"error": str(ve)}, 400

        except Exception as e:
            print(e)
            return {"error": "Internal error occurred"}, 500
