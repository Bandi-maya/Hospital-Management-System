from flask import request
from flask_restful import Resource
from Models.Invoice import Invoice
from Models.Users import User
from Serializers.InvoiceSerializer import invoice_serializer, invoice_serializers
from extensions import db


class Invoices(Resource):
    def get(self):
        return invoice_serializers.dump(Invoice.query.all()), 200

    def post(self):
        json_data = request.get_json(force=True)
        if not User.query.get(json_data.get("patient_id")):
            return {"error": "Patient not found"}, 404
        if not User.query.get(json_data.get("created_by")):
            return {"error": "Creator not found"}, 404

        invoice = Invoice(**json_data)
        db.session.add(invoice)
        db.session.commit()
        return invoice_serializer.dump(invoice), 201

    def put(self):
        json_data = request.get_json(force=True)
        invoice_id = json_data.get("id")
        invoice = Invoice.query.get(invoice_id)
        if not invoice:
            return {"error": "Invoice not found"}, 404

        for key, value in json_data.items():
            if hasattr(invoice, key):
                setattr(invoice, key, value)
        db.session.commit()
        return invoice_serializer.dump(invoice), 200

    def delete(self):
        invoice_id = request.args.get("id")
        invoice = Invoice.query.get(invoice_id)
        if not invoice:
            return {"error": "Invoice not found"}, 404
        db.session.delete(invoice)
        db.session.commit()
        return {"message": "Invoice deleted successfully"}, 200
