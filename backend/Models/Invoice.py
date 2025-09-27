from datetime import datetime
from sqlalchemy.dialects.postgresql import JSONB
from extensions import db
from Models.Users import User


class Invoice(db.Model):
    __tablename__ = 'invoice'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    items = db.Column(JSONB, nullable=False)  # List of items: [{"description": "...", "amount": ...}]
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default="pending")  # pending, paid, cancelled

    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = db.relationship('User', foreign_keys=[patient_id])
    creator = db.relationship('User', foreign_keys=[created_by])

    REQUIRED_FIELDS = ['patient_id', 'items', 'total_amount', 'created_by']

    def __init__(self, **kwargs):
        missing = [field for field in self.REQUIRED_FIELDS if field not in kwargs]
        if missing:
            raise ValueError(f"Missing required fields: {', '.join(missing)}")
        super().__init__(**kwargs)
