from datetime import datetime
from sqlalchemy.orm import validates
from extensions import db
from Models.Medicine import Medicine


class PurchaseOrder(db.Model):
    __tablename__ = 'purchase_order'

    id = db.Column(db.Integer, primary_key=True)
    medicine_id = db.Column(db.Integer, db.ForeignKey('medicine.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    order_date = db.Column(db.Date, nullable=False)
    received_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    medicine = db.relationship('Medicine', backref='purchase_orders', lazy=True)

    REQUIRED_FIELDS = ['medicine_id', 'quantity', 'order_date']

    def __init__(self, **kwargs):
        missing = [f for f in self.REQUIRED_FIELDS if f not in kwargs or kwargs[f] is None]
        if missing:
            raise ValueError(f"Missing required fields: {', '.join(missing)}")
        super().__init__(**kwargs)
