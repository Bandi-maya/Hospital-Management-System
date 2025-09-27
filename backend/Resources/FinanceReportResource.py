from flask import request
from flask_restful import Resource
from Models.FinanceReport import FinanceReport
from Serializers.FinanceReportSerializer import finance_report_serializer, finance_report_serializers
from extensions import db


class FinanceReports(Resource):
    def get(self):
        return finance_report_serializers.dump(FinanceReport.query.all()), 200

    def post(self):
        json_data = request.get_json(force=True)
        report = FinanceReport(**json_data)
        db.session.add(report)
        db.session.commit()
        return finance_report_serializer.dump(report), 201

    def put(self):
        json_data = request.get_json(force=True)
        report_id = json_data.get("id")
        report = FinanceReport.query.get(report_id)
        if not report:
            return {"error": "FinanceReport not found"}, 404
        for key, value in json_data.items():
            if hasattr(report, key):
                setattr(report, key, value)
        db.session.commit()
        return finance_report_serializer.dump(report), 200

    def delete(self):
        report_id = request.args.get("id")
        report = FinanceReport.query.get(report_id)
        if not report:
            return {"error": "FinanceReport not found"}, 404
        db.session.delete(report)
        db.session.commit()
        return {"message": "FinanceReport deleted successfully"}, 200
