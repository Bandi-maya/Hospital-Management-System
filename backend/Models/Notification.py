from datetime import datetime
from extensions import db
from Models.Users import User

class Notification(db.Model):
    __tablename__ = 'notification'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    is_read = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User')

    REQUIRED_FIELDS = ['title', 'message', 'user_id']

    def __init__(self, **kwargs):
        missing = [field for field in self.REQUIRED_FIELDS if field not in kwargs]
        if missing:
            raise ValueError(f"Missing required fields: {', '.join(missing)}")
        super().__init__(**kwargs)
