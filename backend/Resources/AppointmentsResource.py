from flask import request
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError
from Models.Appointments import Appointment
from Serializers.AppointmentSerializer import appointment_serializer, appointment_serializers
from extensions import db

class Appointments(Resource):
    def get(self):
        try:
            return appointment_serializers.dump(Appointment.query.all()), 200
        except Exception as e:
            print(e)
            return {"error": "Internal error occurred"}, 500

    def post(self):
        try:
            data = request.get_json(force=True)
            appointment = Appointment(**data)
            db.session.add(appointment)
            db.session.commit()
            return appointment_serializer.dump(appointment), 201
        except IntegrityError as ie:
            db.session.rollback()
            return {"error": str(ie.orig)}, 400
        except Exception as e:
            db.session.rollback()
            print(e)
            return {"error": "Internal server error"}, 500

    def put(self):
        try:
            data = request.get_json(force=True)
            appointment_id = data.get("id")
            appointment = Appointment.query.get(appointment_id)
            if not appointment:
                return {"error": "Appointment not found"}, 404
            for key, value in data.items():
                if hasattr(appointment, key):
                    setattr(appointment, key, value)
            db.session.commit()
            return appointment_serializer.dump(appointment), 200
        except Exception as e:
            print(e)
            db.session.rollback()
            return {"error": "Internal server error"}, 500

    def delete(self):
        try:
            appointment_id = request.args.get("id")
            appointment = Appointment.query.get(appointment_id)
            if not appointment:
                return {"error": "Appointment not found"}, 404
            db.session.delete(appointment)
            db.session.commit()
            return {"message": "Deleted successfully"}, 200
        except Exception as e:
            print(e)
            db.session.rollback()
            return {"error": "Internal server error"}, 500
