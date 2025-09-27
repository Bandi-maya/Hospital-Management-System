from extensions import ma
from Models.Pharmacy import Pharmacy

class PharmacySerializer(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Pharmacy
        load_instance = True

pharmacy_serializer = PharmacySerializer()
pharmacy_serializers = PharmacySerializer(many=True)
