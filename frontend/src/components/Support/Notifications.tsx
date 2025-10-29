import { Card, CardContent } from "../UI/Card";

const Notifications = () => {
  const notifications = [
    { id: 1, title: "New Appointment", message: "John Doe booked a checkup.", date: "2025-09-18" },
    { id: 2, title: "Inventory Alert", message: "Gloves stock is low.", date: "2025-09-17" },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Notifications</h2>
      <Card>
        <CardContent>
          {notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            <ul className="space-y-4">
              {notifications.map((note) => (
                <li key={note.id} className="border p-3 rounded-md">
                  <h3 className="font-semibold text-lg">{note.title}</h3>
                  <p>{note.message}</p>
                  <span className="text-gray-500 text-sm">{note.date}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
