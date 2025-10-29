import { Card, CardContent } from "../UI/Card";
import { Link } from "react-router-dom";

export default function Users() {
  const users = [
    { id: 101, name: "Dr. John Doe", type: "Doctor" },
    { id: 102, name: "Sarah Lee", type: "Nurse" },
  ];

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">All Users</h2>
      <CardContent>
        <table className="w-full border border-gray-300 rounded-md">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.id}</td>
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.type}</td>
                <td className="p-2">
                  <Link
                    to={`/users/${u.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    View Profile
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
