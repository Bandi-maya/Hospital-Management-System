from extensions import ma
from Models.SupportTicket import SupportTicket

class SupportTicketSerializer(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = SupportTicket
        load_instance = True
        include_fk = True

support_ticket_serializer = SupportTicketSerializer()
support_ticket_serializers = SupportTicketSerializer(many=True)
