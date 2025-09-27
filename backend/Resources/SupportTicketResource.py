from flask import request
from flask_restful import Resource
from Models.SupportTicket import SupportTicket
from Serializers.SupportTicketSerializer import support_ticket_serializer, support_ticket_serializers
from extensions import db

class SupportTickets(Resource):
    def get(self):
        return support_ticket_serializers.dump(SupportTicket.query.all()), 200

    def post(self):
        json_data = request.get_json(force=True)
        ticket = SupportTicket(**json_data)
        db.session.add(ticket)
        db.session.commit()
        return support_ticket_serializer.dump(ticket), 201

    def put(self):
        json_data = request.get_json(force=True)
        ticket_id = json_data.get("id")
        ticket = SupportTicket.query.get(ticket_id)
        if not ticket:
            return {"error": "Ticket not found"}, 404
        for key, value in json_data.items():
            if hasattr(ticket, key):
                setattr(ticket, key, value)
        db.session.commit()
        return support_ticket_serializer.dump(ticket), 200

    def delete(self):
        ticket_id = request.args.get("id")
        ticket = SupportTicket.query.get(ticket_id)
        if not ticket:
            return {"error": "Ticket not found"}, 404
        db.session.delete(ticket)
        db.session.commit()
        return {"message": "Support ticket deleted successfully"}, 200
