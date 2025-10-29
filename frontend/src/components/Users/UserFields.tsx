import { useParams } from "react-router-dom";
import { Card, CardContent } from "../UI/Card";

export default function UserFields() {
  const { id } = useParams();

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">
        Custom Fields for User Type {id}
      </h2>
      <CardContent>
        <p>Here you can define fields like specialization, department, etc.</p>
      </CardContent>
    </Card>
  );
}
