from extensions import ma
from Models.Invoice import Invoice


class InvoiceSerializer(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Invoice
        load_instance = True
        include_fk = True


invoice_serializer = InvoiceSerializer()
invoice_serializers = InvoiceSerializer(many=True)
