from flask import Flask
from flask_restful import Api

from Resources.AppointmentsResource import Appointments
from Resources.FeedbackResource import Feedbacks
from Resources.FinanceReportResource import FinanceReports
from Resources.InvoiceResource import Invoices
from Resources.LabReportsResource import LabReports
from Resources.LabRequestsResource import LabRequests
from Resources.LabTestsResource import LabTests
from Resources.MedicineResource import Medicines
from Resources.MedicineStockResource import MedicineStocks
from Resources.NotificationResource import Notifications
from Resources.PharmacyResource import Pharmacies
from Resources.PurchaseOrders import PurchaseOrders
from Resources.SupportTicketResource import SupportTickets
from Resources.UserFields import UserFields
from extensions import db, ma

# ---------------- Models / Resources ----------------
from Resources.UserTypes import UserTypes
from Resources.Users import Users
from Resources.Departments import Departments
from Resources.Wards import Wards

# from Resources.Pharmacy import Pharmacy, Medicines, MedicineStock, PurchaseOrders
# from Resources.Laboratory import LabTests, LabRequests, LabReports
# from Resources.Billing import Billing, InvoiceDetails, FinanceReports
# from Resources.Admin import HRManagement, Payroll, Attendance, InventoryManagement, Procurement, RolePermissions
# from Resources.Support import Notifications, SupportTickets, Feedback
# from Resources.Auth import Login, Register, ForgotPassword
# from Resources.Appointments import Appointments, AppointmentForm, DoctorSchedule

# ---------------- App Init ----------------
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:Vignesh@localhost:5432/hms'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
ma.init_app(app)
api = Api(app)

# ---------------- User Management ----------------
api.add_resource(UserTypes, '/user-types')
api.add_resource(Users, '/users')
api.add_resource(UserFields, '/user-fields')

# ---------------- Departments & Wards ----------------
api.add_resource(Departments, '/departments')
api.add_resource(Wards, '/wards')

# ---------------- Pharmacy ----------------
api.add_resource(Pharmacies, '/pharmacy')
api.add_resource(Medicines, '/medicines')
api.add_resource(MedicineStocks, '/medicine-stock')
api.add_resource(PurchaseOrders, '/purchase-orders')

# ---------------- Laboratory ----------------
api.add_resource(LabTests, '/lab-tests')
api.add_resource(LabRequests, '/lab-requests')
api.add_resource(LabReports, '/lab-reports')

# ---------------- Billing ----------------
# api.add_resource(Billing, '/billing')
api.add_resource(Invoices, '/invoice-details')
api.add_resource(FinanceReports, '/finance-reports')

# ---------------- Admin ----------------
# api.add_resource(HRManagement, '/admin/hr')
# api.add_resource(Payroll, '/admin/payroll')
# api.add_resource(Attendance, '/admin/attendance')
# api.add_resource(InventoryManagement, '/admin/inventory')
# api.add_resource(Procurement, '/admin/procurement')
# api.add_resource(RolePermissions, '/admin/roles')

# ---------------- Support ----------------
api.add_resource(Notifications, '/support/notifications')
api.add_resource(SupportTickets, '/support/tickets')
api.add_resource(Feedbacks, '/support/feedback')

# ---------------- Auth ----------------
# api.add_resource(Login, '/auth/login')
# api.add_resource(Register, '/auth/register')
# api.add_resource(ForgotPassword, '/auth/forgot-password')

# ---------------- Appointments ----------------
api.add_resource(Appointments, '/appointments')
# api.add_resource(AppointmentForm, '/appointment-form')
# api.add_resource(DoctorSchedule, '/doctor-schedule')

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
