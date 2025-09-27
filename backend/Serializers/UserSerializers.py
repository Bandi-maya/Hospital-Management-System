from extensions import ma  # ✅ Assuming ma is Marshmallow() instance
from Models import Users, UserType  # ✅ Import your SQLAlchemy model

class UserSerializer(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Users.User
        load_instance = True  # ✅ For deserialization into User instances
        include_fk = True     # ✅ Includes foreign keys (optional, but often needed)

# Single and multiple instances
user_serializer = UserSerializer()
user_serializers = UserSerializer(many=True)
