from flask import request
from flask_restful import Resource
from Models.Feedback import Feedback
from Serializers.FeedbackSerializer import feedback_serializer, feedback_serializers
from extensions import db

class Feedbacks(Resource):
    def get(self):
        return feedback_serializers.dump(Feedback.query.all()), 200

    def post(self):
        json_data = request.get_json(force=True)
        feedback = Feedback(**json_data)
        db.session.add(feedback)
        db.session.commit()
        return feedback_serializer.dump(feedback), 201

    def put(self):
        json_data = request.get_json(force=True)
        feedback_id = json_data.get("id")
        feedback = Feedback.query.get(feedback_id)
        if not feedback:
            return {"error": "Feedback not found"}, 404
        for key, value in json_data.items():
            if hasattr(feedback, key):
                setattr(feedback, key, value)
        db.session.commit()
        return feedback_serializer.dump(feedback), 200

    def delete(self):
        feedback_id = request.args.get("id")
        feedback = Feedback.query.get(feedback_id)
        if not feedback:
            return {"error": "Feedback not found"}, 404
        db.session.delete(feedback)
        db.session.commit()
        return {"message": "Feedback deleted successfully"}, 200
