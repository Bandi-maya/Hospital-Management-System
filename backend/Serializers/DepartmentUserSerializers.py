from Models.DepartmentUsers import DepartmentUser
from extensions import ma


class DepartmentUserSerializers(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = DepartmentUser
        load_instance = True
        include_fk = True


department_user_serializer = DepartmentUserSerializers()
department_user_serializers = DepartmentUserSerializers(many=True)