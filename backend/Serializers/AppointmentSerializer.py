from extensions import ma
from Models.Appointments import Appointment

class AppointmentSerializer(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Appointment
        load_instance = True
        include_fk = True

appointment_serializer = AppointmentSerializer()
appointment_serializers = AppointmentSerializer(many=True)
