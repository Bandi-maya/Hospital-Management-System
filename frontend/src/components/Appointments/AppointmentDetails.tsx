import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "../UI/Card";

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock appointment data (replace with API call)
  const appointment = {
    id,
    patient: { name: "John Doe", age: 32, gender: "Male", contact: "9876543210" },
    doctor: { name: "Dr. Smith", department: "Cardiology" },
    date: "2025-09-25",
    time: "10:30 AM",
    status: "Confirmed",
    notes: "Patient complains of chest pain. Bring previous reports."
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      console.log("Cancelling appointment:", id);
      // 🔴 Call API to cancel appointment here
      navigate("/appointments");
    }
  };

  const handleReschedule = () => {
    navigate(`/appointments/${id}/reschedule`);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Appointment Details</h2>

      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Info */}
            <div className="border p-4 rounded-md bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">Patient Information</h3>
              <p><strong>Name:</strong> {appointment.patient.name}</p>
              <p><strong>Age:</strong> {appointment.patient.age}</p>
              <p><strong>Gender:</strong> {appointment.patient.gender}</p>
              <p><strong>Contact:</strong> {appointment.patient.contact}</p>
            </div>

            {/* Doctor Info */}
            <div className="border p-4 rounded-md bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">Doctor Information</h3>
              <p><strong>Doctor:</strong> {appointment.doctor.name}</p>
              <p><strong>Department:</strong> {appointment.doctor.department}</p>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="mt-6 border p-4 rounded-md bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">Schedule & Status</h3>
            <p><strong>Date:</strong> {appointment.date}</p>
            <p><strong>Time:</strong> {appointment.time}</p>
            <p><strong>Status:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-white 
                ${appointment.status === "Confirmed" ? "bg-green-500" : "bg-yellow-500"}`}>
                {appointment.status}
              </span>
            </p>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="mt-6 border p-4 rounded-md bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">Notes</h3>
              <p>{appointment.notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              onClick={handleReschedule}
            >
              Reschedule
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              onClick={handleCancel}
            >
              Cancel Appointment
            </button>
            <button
              className="ml-auto bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
              onClick={() => navigate("/appointments")}
            >
              Back to Appointments
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentDetails;
