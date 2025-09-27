import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { Badge } from "@/components/ui/badge";

interface Appointment {
  id: string;
  patient: string;
  doctor: string;
  date: string; // format YYYY-MM-DD
  time: string;
  status: "Pending" | "Confirmed" | "Completed";
}

const LOCAL_STORAGE_KEY = "appointments";

export default function CalendarView() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Load appointments from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) setAppointments(JSON.parse(stored));
  }, []);

  // Get appointments for the selected date
  const dailyAppointments = appointments.filter(
    app => app.date === selectedDate.toISOString().split("T")[0]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Appointment Management</h1>
        <p className="text-muted-foreground">Calendar View</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Calendar */}
        <div className="md:w-1/3">
          <Calendar
            onChange={(value) => {
              if (value instanceof Date) {
                setSelectedDate(value);
              } else if (Array.isArray(value) && value[0] instanceof Date) {
                setSelectedDate(value[0]);
              }
            }}
            value={selectedDate}
          />
        </div>

        {/* Appointments List */}
        <div className="md:w-2/3 space-y-4">
          <h2 className="text-xl font-semibold">
            Appointments for {selectedDate.toDateString()}
          </h2>
          {dailyAppointments.length === 0 ? (
            <p className="text-gray-500">No appointments scheduled for this day.</p>
          ) : (
            <div className="space-y-2">
              {dailyAppointments.map(app => (
                <div
                  key={app.id}
                  className="p-4 border rounded-lg flex justify-between items-center"
                >
                  <div className="space-y-1">
                    <p><strong>Patient:</strong> {app.patient}</p>
                    <p><strong>Doctor:</strong> {app.doctor}</p>
                    <p><strong>Time:</strong> {app.time}</p>
                  </div>
                  <Badge
                    variant={
                      app.status === "Completed"
                        ? "default"
                        : app.status === "Confirmed"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {app.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
