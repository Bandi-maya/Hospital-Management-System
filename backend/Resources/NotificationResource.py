from flask import request
from flask_restful import Resource
from Models.Notification import Notification
from Serializers.NotificationSerializer import notification_serializer, notification_serializers
from extensions import db

class Notifications(Resource):
    def get(self):
        return notification_serializers.dump(Notification.query.all()), 200

    def post(self):
        json_data = request.get_json(force=True)
        notification = Notification(**json_data)
        db.session.add(notification)
        db.session.commit()
        return notification_serializer.dump(notification), 201

    def put(self):
        json_data = request.get_json(force=True)
        notification_id = json_data.get("id")
        notification = Notification.query.get(notification_id)
        if not notification:
            return {"error": "Notification not found"}, 404
        for key, value in json_data.items():
            if hasattr(notification, key):
                setattr(notification, key, value)
        db.session.commit()
        return notification_serializer.dump(notification), 200

    def delete(self):
        notification_id = request.args.get("id")
        notification = Notification.query.get(notification_id)
        if not notification:
            return {"error": "Notification not found"}, 404
        db.session.delete(notification)
        db.session.commit()
        return {"message": "Notification deleted successfully"}, 200
