from extensions import ma
from Models.Notification import Notification

class NotificationSerializer(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Notification
        load_instance = True
        include_fk = True

notification_serializer = NotificationSerializer()
notification_serializers = NotificationSerializer(many=True)

