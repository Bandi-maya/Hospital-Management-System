from Models.WardUsers import WardUser
from extensions import ma


class WardUserSerializers(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = WardUser
        load_instance = True
        include_fk = True


ward_user_serializer = WardUserSerializers()
ward_user_serializers = WardUserSerializers(many=True)
