from datetime import datetime, time

from sqlalchemy.orm import validates

from extensions import db


class Shifts(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    @validates('name')
    def validate_name(self, key, value):
        if not value or not isinstance(value, str) or not value.strip():
            raise ValueError(f"{key} must be a non-empty sting")
        value = value.strip()

        existing_shift = Shifts.query.filter_by(name=value).first()
        if existing_shift:
            raise ValueError("Shift already exists")

        return value

    @validates('start_time', 'end_time')
    def validate_fields(self, key, value):
        if not isinstance(value, time):
            raise ValueError(f"{key} must be a valid datetime object")

        if self.start_time and self.end_time:
            if key == 'start_time' and value >= self.end_time:
                raise ValueError("Start time must be before end time")
            elif key == 'end_time' and value <= self.start_time:
                raise ValueError("End time must be after start time")

        return value

    REQUIRED_FIELDS = ['start_time', 'end_time', 'name']

    def __init__(self, **kwargs):
        missed = [field for field in self.REQUIRED_FIELDS if field not in kwargs]
        if missed:
            raise ValueError(f"Missing required fields: {', '.join(missed)}")

        super().__init__(**kwargs)
