from extensions import ma
from Models.LabRequest import LabRequest


class LabRequestSerializer(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = LabRequest
        load_instance = True
        include_fk = True


lab_request_serializer = LabRequestSerializer()
lab_request_serializers = LabRequestSerializer(many=True)
