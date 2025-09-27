from flask_migrate import Migrate

from app import app
from extensions import db
from Models.UserType import UserType
from Models.Shifts import Shifts
from Models.Users import User
from Models.Department import Department
from Models.Wards import Ward
from Models.DepartmentUsers import DepartmentUser
from Models.WardUsers import WardUser
from Models.UserField import UserField
from Models.UserExtraFields import UserExtraFields
from Models.LabTest import LabTest

migrate = Migrate(app, db)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
