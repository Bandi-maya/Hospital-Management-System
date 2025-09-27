from datetime import datetime
from extensions import db
from Models.Users import User

class SupportTicket(db.Model):
    __tablename__ = 'support_ticket'

    id = db.Column(db.Integer, primary_key=True)
    subject = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), default="open")  # open, in_progress, closed
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    assigned_to = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', foreign_keys=[user_id])
    assignee = db.relationship('User', foreign_keys=[assigned_to])

    REQUIRED_FIELDS = ['subject', 'description', 'user_id']

    def __init__(self, **kwargs):
        missing = [field for field in self.REQUIRED_FIELDS if field not in kwargs]
        if missing:
            raise ValueError(f"Missing required fields: {', '.join(missing)}")
        super().__init__(**kwargs)
