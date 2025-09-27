from flask import request
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError
from extensions import db
from Models.Pharmacy import Pharmacy
from Serializers.PharmacySerializer import pharmacy_serializer, pharmacy_serializers\

# Pharmacy Resource
class Pharmacies(Resource):
    def get(self):
        try:
            return pharmacy_serializers.dump(Pharmacy.query.all()), 200
        except Exception as e:
            print(e)
            return {"error": "Internal error occurred"}, 500

    def post(self):
        try:
            data = request.get_json(force=True)
            pharmacy = Pharmacy(**data)
            db.session.add(pharmacy)
            db.session.commit()
            return pharmacy_serializer.dump(pharmacy), 201
        except Exception as e:
            print(e)
            db.session.rollback()
            return {"error": "Internal server error"}, 500
