from sqlalchemy.dialects.postgresql import JSONB
from extensions import db
from Models.UserField import UserField, FieldTypeEnum


class UserExtraFields(db.Model):
    __tablename__ = "user_extra_fields"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete="CASCADE"), nullable=False)
    fields_data = db.Column(JSONB, nullable=True)

    # Relationship to User (optional but recommended)
    user = db.relationship(
        "User",
        backref=db.backref("extra_fields", cascade="all, delete-orphan", lazy=True)
    )

    def validate(self):
        """
        Validate fields_data based on UserField definitions for this user_type.
        Returns (is_valid: bool, errors: dict)
        """
        errors = {}
        valid_fields = {}

        if not isinstance(self.fields_data, dict):
            return False, {"fields_data": "Must be a JSON object"}

        defined_fields = UserField.query.filter_by(user_type=self.user_type).all()
        allowed_field_names = {field.field_name: field for field in defined_fields}

        # 1. Check for unknown fields
        for key in self.fields_data.keys():
            if key not in allowed_field_names:
                errors[key] = f"Field '{key}' is not allowed for this user type"

        # 2. Validate known fields
        for field_name, field in allowed_field_names.items():
            value = self.fields_data.get(field_name)

            if field.is_mandatory and value is None:
                errors[field_name] = "This field is required"
                continue

            if value is not None:
                if field.field_type == FieldTypeEnum.STRING and not isinstance(value, str):
                    errors[field_name] = "Must be a string"
                elif field.field_type == FieldTypeEnum.INTEGER and not isinstance(value, int):
                    errors[field_name] = "Must be an integer"
                elif field.field_type == FieldTypeEnum.JSON and not isinstance(value, dict):
                    errors[field_name] = "Must be a JSON object"
                else:
                    valid_fields[field_name] = value

        return len(errors) == 0, errors
