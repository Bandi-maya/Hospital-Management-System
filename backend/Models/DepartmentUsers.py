from datetime import datetime

from sqlalchemy.orm import validates

from Models.Department import Department
from Models.Users import User
from extensions import db


class DepartmentUser(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    department_id = db.Column(db.Integer, db.ForeignKey('department.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    @validates('department_id')
    def validate_department_id(self, key, value):
        if not value or not isinstance(value, int):
            raise ValueError(f"{key} must be a number")

        department = Department.query.get(value)
        if not department:
            raise ValueError(f"Department not found")

        return value

    @validates('user_id')
    def validate_department_id(self, key, value):
        if not value or not isinstance(value, int):
            raise ValueError(f"{key} must be a number")

        user = User.query.get(value)
        if not user:
            raise ValueError(f"User not found")

        return value

    REQUIRED_FIELDS = ['department_id', 'user_id']

    def __init__(self, **kwargs):
        missing_fields = [field for field in self.REQUIRED_FIELDS if field not in kwargs]
        if missing_fields:
            raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")

        super().__init__(**kwargs)
