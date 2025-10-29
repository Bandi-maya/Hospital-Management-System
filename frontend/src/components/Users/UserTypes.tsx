import { Card, CardContent } from "../UI/Card";
import { Link } from "react-router-dom";

export default function UserTypes() {
  const userTypes = [
    { id: 1, name: "Doctors" },
    { id: 2, name: "Nurses" },
    { id: 3, name: "Patients" },
    { id: 4, name: "Receptionists" },
  ];

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">User Types</h2>
      <CardContent>
        <ul className="space-y-2">
          {userTypes.map((type) => (
            <li key={type.id}>
              <Link
                to={`/user-types/${type.id}`}
                className="block p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
              >
                {type.name}
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
