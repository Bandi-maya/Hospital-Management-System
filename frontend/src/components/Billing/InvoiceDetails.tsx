import { Card, CardContent } from "../UI/Card";

const InvoiceDetails = () => {
  // Example invoice data
  const invoice = {
    id: 101,
    patient: "John Doe",
    date: "2025-09-15",
    items: [
      { id: 1, name: "Consultation Fee", price: 500 },
      { id: 2, name: "Blood Test", price: 800 },
      { id: 3, name: "Medicines", price: 1200 },
    ],
    tax: 100,
  };

  const total = invoice.items.reduce((sum, item) => sum + item.price, 0) + invoice.tax;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Invoice #{invoice.id}</h2>
      <Card>
        <CardContent>
          <p className="mb-2"><strong>Patient:</strong> {invoice.patient}</p>
          <p className="mb-4"><strong>Date:</strong> {invoice.date}</p>

          <table className="w-full border mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Item</th>
                <th className="border p-2">Price</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="border p-2">{item.name}</td>
                  <td className="border p-2">₹{item.price}</td>
                </tr>
              ))}
              <tr>
                <td className="border p-2 text-right font-bold">Tax</td>
                <td className="border p-2">₹{invoice.tax}</td>
              </tr>
              <tr>
                <td className="border p-2 text-right font-bold">Total</td>
                <td className="border p-2 font-bold">₹{total}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex gap-4">
            <button className="px-4 py-2 bg-green-500 text-white rounded">
              Mark as Paid
            </button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded">
              Download PDF
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceDetails;
