from datetime import datetime
from extensions import db


class LabTest(db.Model):
    __tablename__ = 'lab_test'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    REQUIRED_FIELDS = ['name', 'price']

    def __init__(self, **kwargs):
        missing = [field for field in self.REQUIRED_FIELDS if not kwargs.get(field)]
        if missing:
            raise ValueError(f"Missing required fields: {', '.join(missing)}")
        super().__init__(**kwargs)
