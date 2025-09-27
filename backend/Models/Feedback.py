from datetime import datetime
from extensions import db
from Models.Users import User

class Feedback(db.Model):
    __tablename__ = 'feedback'

    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, nullable=True)  # optional rating 1-5
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User')

    REQUIRED_FIELDS = ['message', 'user_id']

    def __init__(self, **kwargs):
        missing = [field for field in self.REQUIRED_FIELDS if field not in kwargs]
        if missing:
            raise ValueError(f"Missing required fields: {', '.join(missing)}")
        super().__init__(**kwargs)
