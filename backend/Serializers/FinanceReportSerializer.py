from extensions import ma
from Models.FinanceReport import FinanceReport


class FinanceReportSerializer(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = FinanceReport
        load_instance = True
        include_fk = True


finance_report_serializer = FinanceReportSerializer()
finance_report_serializers = FinanceReportSerializer(many=True)
