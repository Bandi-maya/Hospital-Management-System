from Models.TimeTable import TimeTable
from extensions import ma


class TimeTableSerializer(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = TimeTable
        load_instance = True
        include_fk = True


time_table_serializer = TimeTableSerializer()
time_table_serializers = TimeTableSerializer(many=True)
