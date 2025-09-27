from Models.Department import Department
from Serializers.UserSerializers import user_serializer
from extensions import ma

class DepartmentSerializer(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Department
        load_instance = True
        include_fk = True

    # Optionally include creator details
    creator = ma.Nested(user_serializer, dump_only=True)

department_serializer = DepartmentSerializer()
department_serializers = DepartmentSerializer(many=True)
