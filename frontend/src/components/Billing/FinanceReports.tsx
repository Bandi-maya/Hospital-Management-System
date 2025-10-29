import { Card, CardContent } from "../UI/Card";

const FinanceReports = () => {
  const data = {
    totalRevenue: 750000,
    totalPending: 120000,
    monthlyRevenue: [
      { month: "Jan", revenue: 50000 },
      { month: "Feb", revenue: 62000 },
      { month: "Mar", revenue: 70000 },
    ],
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Finance Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent>
            <h3 className="text-xl font-semibold mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600">₹{data.totalRevenue}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3 className="text-xl font-semibold mb-2">Pending Payments</h3>
            <p className="text-3xl font-bold text-red-600">₹{data.totalPending}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent>
          <h3 className="text-xl font-semibold mb-4">Monthly Revenue</h3>
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Month</th>
                <th className="border p-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.monthlyRevenue.map((row, index) => (
                <tr key={index}>
                  <td className="border p-2">{row.month}</td>
                  <td className="border p-2">₹{row.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceReports;
