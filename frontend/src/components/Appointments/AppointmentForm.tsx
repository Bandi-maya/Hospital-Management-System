import { Card, CardContent } from "../UI/Card";

export default function AppointmentForm() {
  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">Book Appointment</h2>
      <CardContent>
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Patient Name"
            className="w-full p-2 border rounded"
          />
          <select className="w-full p-2 border rounded">
            <option>Select Doctor</option>
            <option>Dr. John Doe</option>
            <option>Dr. Emily Carter</option>
          </select>
          <input
            type="date"
            className="w-full p-2 border rounded"
          />
          <input
            type="time"
            className="w-full p-2 border rounded"
          />
          <textarea
            placeholder="Reason for Visit"
            className="w-full p-2 border rounded"
          ></textarea>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            Book Appointment
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
