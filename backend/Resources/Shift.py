from flask import request
from flask_restful import Resource

from Models.Shifts import Shifts
from Serializers.ShiftsSerializers import shifts_serializer, shifts_serializers
from extensions import db


class Shift(Resource):
    def get(self):
        try:
            return shifts_serializers.dump(Shifts.query.all())
        except Exception as e:
            print(e)
            return {"error": "Internal error occurred"}, 500

    def post(self):
        try:
            json_data = request.get_json(force=True)

            if not json_data:
                return {"error": "No data sent"}, 400

            shift = Shifts(**json_data)

            db.session.add(shift)
            db.session.commit()

            return shifts_serializer.load(shift)

        except ValueError as ve:
            print(ve)
            return {"error": str(ve)}, 400

        except Exception as e:
            print(e)
            return {"error": "Internal error occurred"}, 500