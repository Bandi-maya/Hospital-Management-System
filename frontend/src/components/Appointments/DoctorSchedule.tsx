import { Card, CardContent } from "../UI/Card";

export default function DoctorSchedule() {
  const schedules = [
    { doctor: "Dr. John Doe", day: "Monday", time: "10:00 AM - 2:00 PM" },
    { doctor: "Dr. Emily Carter", day: "Tuesday", time: "9:00 AM - 1:00 PM" },
  ];

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">Doctor Schedule</h2>
      <CardContent>
        <table className="w-full border border-gray-300 rounded-md">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Doctor</th>
              <th className="p-2 text-left">Day</th>
              <th className="p-2 text-left">Available Time</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s, index) => (
              <tr key={index} className="border-t">
                <td className="p-2">{s.doctor}</td>
                <td className="p-2">{s.day}</td>
                <td className="p-2">{s.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
