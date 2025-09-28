from Serializers.OrdersSerializer import order_serializer
from Serializers.UserSerializers import user_serializer
from extensions import ma
from Models.Invoice import Invoice


class InvoiceSerializer(ma.SQLAlchemyAutoSchema):
    creator = ma.Nested(user_serializer, dump_only=True)
    order = ma.Nested(order_serializer, dump_only=True)

    class Meta:
        model = Invoice
        load_instance = True
        include_fk = True


invoice_serializer = InvoiceSerializer()
invoice_serializers = InvoiceSerializer(many=True)
