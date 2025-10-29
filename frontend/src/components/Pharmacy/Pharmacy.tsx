import { Link } from "react-router-dom";
import { Card, CardContent } from "../UI/Card";

export default function Pharmacy() {
  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">Pharmacy</h2>
      <CardContent className="space-y-4">
        <p>Manage all medicines, stock levels, and purchase orders here.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/pharmacy/medicines"
            className="p-4 rounded-lg bg-blue-500 text-white text-center hover:bg-blue-600"
          >
            Medicines
          </Link>
          <Link
            to="/pharmacy/stock"
            className="p-4 rounded-lg bg-green-500 text-white text-center hover:bg-green-600"
          >
            Stock
          </Link>
          <Link
            to="/pharmacy/purchase-orders"
            className="p-4 rounded-lg bg-purple-500 text-white text-center hover:bg-purple-600"
          >
            Purchase Orders
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
