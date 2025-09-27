from Models.Shifts import Shifts
from extensions import ma


class ShiftSerializers(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Shifts
        load_instance = True
        include_fk = True


shifts_serializer = ShiftSerializers()
shifts_serializers = ShiftSerializers(many=True)