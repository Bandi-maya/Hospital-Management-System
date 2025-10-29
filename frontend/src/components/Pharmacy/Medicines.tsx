import { Link } from "react-router-dom";
import { Card, CardContent } from "../UI/Card";

export default function Medicines() {
  const medicines = [
    { id: 1, name: "Paracetamol", category: "Pain Relief", price: 5 },
    { id: 2, name: "Amoxicillin", category: "Antibiotic", price: 12 },
  ];

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">Medicines</h2>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Link
            to="/pharmacy/medicines/new"
            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            + Add Medicine
          </Link>
        </div>

        <table className="w-full border border-gray-300 rounded-md">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Price</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="p-2">{m.id}</td>
                <td className="p-2">{m.name}</td>
                <td className="p-2">{m.category}</td>
                <td className="p-2">₹{m.price}</td>
                <td className="p-2">
                  <Link
                    to={`/pharmacy/medicines/${m.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    View
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
