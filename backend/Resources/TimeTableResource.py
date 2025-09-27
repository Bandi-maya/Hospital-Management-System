from flask import request
from flask_restful import Resource

from Models.Shifts import Shifts
from Models.TimeTable import TimeTable
from Models.Users import User
from Serializers.TimeTableSerializer import time_table_serializers
from extensions import db


class TimeTableResource(Resource):
    def get(self):
        try:
            return time_table_serializers.dump(TimeTable.query.all())
        except Exception as e:
            print(e)
            return {"error": "Internal error occurred"}, 200

    def post(self):
        try:
            json_data = request.get_json(force=True)

            if not json_data:
                return {"error": "No data sent"}, 400

            # json_data = {
            #     "1-9-2024": {
            #         "time_table": [
            #             {
            #                 "users": [1, 2, 3],
            #                 "shift_id": 1
            #             },
            #             {
            #                 "users": [4, 5, 6],
            #                 "shift_id": 2
            #             },
            #         ]
            #     },"2-9-2024": {
            #         "time_table": [
            #             {
            #                 "users": [1, 2, 3],
            #                 "shift_id": 1
            #             },
            #             {
            #                 "user_ids": [4, 5, 6],
            #                 "shift_id": 2
            #             },
            #         ]
            #     }
            # }

            final_object = []
            for key, values in json_data.items():
                if not values['time_table'] or isinstance(values['time_table'], list):
                    raise ValueError(f"Payload not well formed")

                users_list = []
                shifts = []
                for timetable in values['time_table']:
                    if not timetable['user_ids'] or not isinstance(timetable['user_ids'], dict) or not timetable['shift_id'] or not isinstance(timetable['shift_id'], int):
                        raise ValueError("Payload not well formed")

                    users_list.append(timetable['user_ids'])
                    shifts.append(timetable['shift_id'])
                    for user_id in timetable['user_ids']:
                        final_object.append({
                            "date": key,
                            "user_id": user_id,
                            "shift_id": timetable['shift_id']
                        })

                # if (user_id for user_id in users_list if users_list.count(user_id) > 1):
                #     raise ValueError("Payload not well formed")
                # if (shift_id for shift_id in shifts if users_list.count(shift_id) > 1):
                #     raise ValueError("Payload not well formed")

                users = User.query.filter(User.id.in_(set(users_list))).all()

                if len(users) != len(users_list):
                    raise ValueError("One of the user not found")

                shifts_data = Shifts.query.filter(Shifts.id.in_(set(shifts))).all()

                if len(shifts_data) != len(shifts):
                    raise ValueError("One of the shift not found")

            for record in final_object:
                inserted_record = TimeTable(record)

                db.session.add(inserted_record)

            db.session.commit()

            return {}
        except ValueError as ve:
            db.session.rollback()
            print(ve)
            return {"error": str(ve)}, 400

        except Exception as e:
            db.session.rollback()
            print(e)
            return {"error": "Internal error occurred"}, 500