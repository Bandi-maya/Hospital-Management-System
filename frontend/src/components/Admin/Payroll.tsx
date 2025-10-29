import { Card, CardContent } from "../UI/Card";

const Payroll = () => {
  const payrollData = [
    { id: 1, employee: "Dr. Smith", month: "September", amount: 75000, status: "Paid" },
    { id: 2, employee: "Alice", month: "September", amount: 40000, status: "Pending" },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Payroll</h2>
      <Card>
        <CardContent>
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Employee</th>
                <th className="border p-2">Month</th>
                <th className="border p-2">Amount</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {payrollData.map((row) => (
                <tr key={row.id}>
                  <td className="border p-2">{row.employee}</td>
                  <td className="border p-2">{row.month}</td>
                  <td className="border p-2">₹{row.amount}</td>
                  <td className="border p-2">{row.status}</td>
                  <td className="border p-2">
                    <button className="px-3 py-1 bg-green-500 text-white rounded">
                      Mark Paid
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payroll;
