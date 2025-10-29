// Components/Dashboard/Analytics.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

export default function Analytics() {
  // Sample data
  const patientData = [
    { month: "Jan", patients: 200 },
    { month: "Feb", patients: 250 },
    { month: "Mar", patients: 320 },
    { month: "Apr", patients: 280 },
    { month: "May", patients: 350 },
    { month: "Jun", patients: 410 },
  ];

  const revenueData = [
    { month: "Jan", revenue: 4.1 },
    { month: "Feb", revenue: 4.8 },
    { month: "Mar", revenue: 5.2 },
    { month: "Apr", revenue: 4.6 },
    { month: "May", revenue: 5.8 },
    { month: "Jun", revenue: 6.3 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">📊 Analytics & Reports</h1>

      {/* Patient Flow Bar Chart */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Monthly Patient Flow</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={patientData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="patients" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Line Chart */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Monthly Revenue (in Lakhs)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
