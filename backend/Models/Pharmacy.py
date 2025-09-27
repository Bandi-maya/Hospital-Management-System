from datetime import datetime
from sqlalchemy.orm import validates
from extensions import db

class Pharmacy(db.Model):
    __tablename__ = 'pharmacy'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @validates("name")
    def validate_name(self, key, value):
        if not value or not isinstance(value, str) or not value.strip():
            raise ValueError(f"{key} must be a non-empty string")
        return value.strip()
