from datetime import datetime

from sqlalchemy.orm import validates

from Models.Users import User
from Models.Wards import Ward
from extensions import db


class WardUser(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    ward_id = db.Column(db.Integer, db.ForeignKey('ward.id'), nullable=False)

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    @validates('user_id')
    def validate_user_id(self, key, value):
        if not value or not isinstance(value, int):
            raise ValueError(f"{key} must be number")

        user = User.query.get(value)
        if not user:
            raise ValueError(f"User not found")

        return value

    @validates('ward_id')
    def validate_ward_id(self, key, value):
        if not value or not isinstance(value, int):
            raise ValueError(f"{key} must be a number")

        ward = Ward.query.get(value)
        if not ward:
            raise ValueError(f"Ward not found")

        return value

    REQUIRED_FIELDS = ['ward_id', 'user_id']

    def __init__(self, **kwargs):
        missing = [field for field in self.REQUIRED_FIELDS if not kwargs.get(field)]
        if missing:
            raise ValueError(f"Missing required fields: {', '.join(missing)}")

        super().__init__(**kwargs)

