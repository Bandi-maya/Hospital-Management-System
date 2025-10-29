import { Card, CardContent } from "../UI/Card";

const HRManagement = () => {
  const employees = [
    { id: 1, name: "Dr. Smith", role: "Doctor", department: "Cardiology" },
    { id: 2, name: "Alice", role: "Nurse", department: "ICU" },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">HR Management</h2>
      <Card>
        <CardContent>
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Employee</th>
                <th className="border p-2">Role</th>
                <th className="border p-2">Department</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td className="border p-2">{emp.name}</td>
                  <td className="border p-2">{emp.role}</td>
                  <td className="border p-2">{emp.department}</td>
                  <td className="border p-2">
                    <button className="px-3 py-1 bg-blue-500 text-white rounded">
                      Edit
                    </button>
                    <button className="ml-2 px-3 py-1 bg-red-500 text-white rounded">
                      Remove
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

export default HRManagement;
