import { useParams } from "react-router-dom";
import { Card, CardContent } from "../UI/Card";

export default function Wards() {
  const { id } = useParams();

  const wards = [
    { id: 1, name: "Ward A", capacity: 10 },
    { id: 2, name: "Ward B", capacity: 15 },
  ];

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">
        Wards in Department {id}
      </h2>
      <CardContent>
        <table className="w-full border border-gray-300 rounded-md">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Ward ID</th>
              <th className="p-2 text-left">Ward Name</th>
              <th className="p-2 text-left">Capacity</th>
            </tr>
          </thead>
          <tbody>
            {wards.map((ward) => (
              <tr key={ward.id} className="border-t">
                <td className="p-2">{ward.id}</td>
                <td className="p-2">{ward.name}</td>
                <td className="p-2">{ward.capacity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
