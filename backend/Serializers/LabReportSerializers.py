from extensions import ma
from Models.LabReport import LabReport


class LabReportSerializer(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = LabReport
        load_instance = True
        include_fk = True


lab_report_serializer = LabReportSerializer()
lab_report_serializers = LabReportSerializer(many=True)
