from datetime import datetime
from sqlalchemy.orm import validates
from extensions import db
from Models.Users import User

class Appointment(db.Model):
    __tablename__ = 'appointment'
    id = db.Column(db.Integer, primary_key=True)

    patient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    appointment_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(50), default="Scheduled")
    notes = db.Column(db.Text, nullable=True)

    patient = db.relationship('User', foreign_keys=[patient_id], lazy=True)
    doctor = db.relationship('User', foreign_keys=[doctor_id], lazy=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @validates("status")
    def validate_status(self, key, value):
        allowed = ["Scheduled", "Completed", "Cancelled"]
        if value not in allowed:
            raise ValueError(f"{key} must be one of {allowed}")
        return value

    REQUIRED_FIELDS = ['patient_id', 'doctor_id', 'appointment_date']

    def __init__(self, **kwargs):
        missing = [field for field in self.REQUIRED_FIELDS if not kwargs.get(field)]
        if missing:
            raise ValueError(f"Missing required fields: {', '.join(missing)}")
        super().__init__(**kwargs)
