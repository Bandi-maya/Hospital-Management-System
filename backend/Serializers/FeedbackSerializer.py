from extensions import ma
from Models.Feedback import Feedback


class FeedbackSerializer(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Feedback
        load_instance = True
        include_fk = True

feedback_serializer = FeedbackSerializer()
feedback_serializers = FeedbackSerializer(many=True)
