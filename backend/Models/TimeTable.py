from datetime import datetime

from sqlalchemy.orm import validates

from Models.Shifts import Shifts
from Models.Users import User
from extensions import db


class TimeTable(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    shift_id = db.Column(db.Integer, db.ForeignKey('shifts.id'), nullable=False)
    user_id = db.Column(db.Interger, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.DateTime, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, on_update=datetime.utcnow)

    @validates('shift_id')
    def validate_shift_id(self, key, value):
        if not value or not isinstance(value, int):
            raise ValueError(f"{key} must be a number")

        shift = Shifts.query.get(value)
        if not shift:
            raise ValueError("Shift not found")

        return value

    @validates('user_id')
    def validate_user_id(self, key, value):
        if not value or not isinstance(value, int):
            raise ValueError(f"{key} must be a number")

        user = User.query.get(value)
        if not user:
            raise ValueError("User not found")

        return value

    @validates('data')
    def validate_user_id(self, key, value):
        if not value or not isinstance(value, datetime):
            raise ValueError(f"{key} must be a datetime")

        return value

    REQUIRED_FIELDS = ['shift_id', 'user_id', 'date']

    def __init__(self, **kwargs):
        missed = [field for field in self.REQUIRED_FIELDS if field not in kwargs]
        if missed:
            raise ValueError(f"Missed required fields: {', '.join(missed)}")

        super().__init__(**kwargs)
