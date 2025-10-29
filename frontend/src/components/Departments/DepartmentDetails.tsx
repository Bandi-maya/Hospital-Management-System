import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "../UI/Card";

export default function DepartmentDetails() {
  const { id } = useParams();

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">
        Department Details - {id}
      </h2>
      <CardContent className="space-y-4">
        <p><strong>Name:</strong> Cardiology</p>
        <p><strong>Head:</strong> Dr. John Heart</p>
        <p><strong>Description:</strong> Handles all heart-related cases.</p>

        <div className="flex gap-4">
          <Link
            to={`/departments/${id}/wards`}
            className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
          >
            View Wards
          </Link>
          <Link
            to={`/departments/${id}/edit`}
            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            Edit Department
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
