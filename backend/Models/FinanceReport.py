from datetime import datetime
from sqlalchemy.dialects.postgresql import JSONB
from extensions import db


class FinanceReport(db.Model):
    __tablename__ = 'finance_report'

    id = db.Column(db.Integer, primary_key=True)
    report_date = db.Column(db.DateTime, nullable=False)
    summary = db.Column(JSONB, nullable=False)  # {"total_invoices": ..., "total_amount": ...}

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    REQUIRED_FIELDS = ['report_date', 'summary']

    def __init__(self, **kwargs):
        missing = [field for field in self.REQUIRED_FIELDS if field not in kwargs]
        if missing:
            raise ValueError(f"Missing required fields: {', '.join(missing)}")
        super().__init__(**kwargs)
